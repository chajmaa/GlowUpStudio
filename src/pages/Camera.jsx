import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const MODES = ['FOTO', 'VIDEO', 'SELFIE'];

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const countdownTimerRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const streamRef = useRef(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [modeIndex, setModeIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [zoomLevels] = useState([1, 2, 3]);
  const [torchOn, setTorchOn] = useState(false);
  const [captureAnimation, setCaptureAnimation] = useState(false);

  const currentMode = MODES[modeIndex];
  const facingMode = currentMode === 'SELFIE' ? 'user' : 'environment';
  const isVideo = currentMode === 'VIDEO';

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setIsCameraReady(false);
      stopStream();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera wordt niet ondersteund in deze browser.');
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 3840, min: 1280 },
          height: { ideal: 2160, min: 720 },
          frameRate: { ideal: 60, min: 30 },
          aspectRatio: { ideal: 16 / 9 },
        },
        audio: isVideo,
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: isVideo,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      let msg = 'Camera niet beschikbaar';
      if (err.name === 'NotAllowedError') msg = 'Camera toegang geweigerd. Sta toe in browser instellingen.';
      else if (err.name === 'NotFoundError') msg = 'Geen camera gevonden op dit apparaat.';
      else if (err.name === 'NotReadableError') msg = 'Camera is in gebruik door een andere app.';
      else if (err.name === 'SecurityError') msg = 'Camera vereist HTTPS verbinding.';
      else if (err.message) msg = err.message;
      setError(msg);
    }
  }, [facingMode, isVideo, stopStream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [modeIndex]);

  const applyZoom = useCallback(async (level) => {
    setZoom(level);
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities();
      if (caps.zoom) {
        await track.applyConstraints({ advanced: [{ zoom: level }] });
      }
    } catch {}
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const caps = track.getCapabilities();
      if (caps.torch) {
        const newState = !torchOn;
        await track.applyConstraints({ advanced: [{ torch: newState }] });
        setTorchOn(newState);
      }
    } catch {}
  }, [torchOn]);

  const capturePhotoNow = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0) return;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const size = Math.min(vw, vh);
    const sx = (vw - size) / 2;
    const sy = (vh - size) / 2;

    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (currentMode === 'SELFIE') {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, size, size, -size, 0, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    }

    const photoData = canvas.toDataURL('image/jpeg', 0.97);
    setCaptureAnimation(true);
    setTimeout(() => setCaptureAnimation(false), 300);

    stopStream();
    navigate('/filters', { state: { photoData, facingMode } });
  }, [currentMode, facingMode, navigate, stopStream]);

  const capturePhoto = useCallback(() => {
    if (countdown !== null) return;
    setCountdown(3);
    let count = 3;
    countdownTimerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count === 0 ? null : count);
      if (count === 0) {
        clearInterval(countdownTimerRef.current);
        setFlash(true);
        setTimeout(() => setFlash(false), 200);
        capturePhotoNow();
      }
    }, 1000);
  }, [countdown, capturePhotoNow]);

  const startRecordingNow = useCallback(() => {
    if (!streamRef.current) return;
    recordedChunksRef.current = [];

    const mimeTypes = [
      'video/mp4;codecs=h264,aac',
      'video/mp4',
      'video/webm;codecs=h264',
      'video/webm;codecs=vp9',
      'video/webm',
    ];

    let options = { videoBitsPerSecond: 12000000 };
    for (const mt of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mt)) {
        options.mimeType = mt;
        break;
      }
    }

    const recorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) recordedChunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const mimeType = recorder.mimeType || 'video/webm';
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      const videoUrl = URL.createObjectURL(blob);
      stopStream();
      navigate('/filters', { state: { videoData: videoUrl, videoBlob: blob, isVideo: true, videoMimeType: mimeType, facingMode } });
    };

    recorder.start(100);
    setIsRecording(true);
    setRecordingTime(0);

    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
  }, [facingMode, navigate, stopStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const handleCapture = useCallback(() => {
    if (isVideo) {
      isRecording ? stopRecording() : startRecordingNow();
    } else {
      capturePhoto();
    }
  }, [isVideo, isRecording, stopRecording, startRecordingNow, capturePhoto]);

  const cancelCountdown = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(null);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {flash && <div className="absolute inset-0 bg-white z-50 pointer-events-none" />}
      {captureAnimation && <div className="absolute inset-0 border-4 border-white z-50 pointer-events-none rounded-sm" />}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={currentMode === 'SELFIE' ? { transform: 'scaleX(-1)' } : {}}
      />

      <canvas ref={canvasRef} className="hidden" />

      {!isCameraReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/70 text-sm">Camera laden...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20 p-6">
          <div className="bg-white/10 backdrop-blur text-white p-6 rounded-2xl max-w-sm text-center border border-white/20">
            <div className="text-3xl mb-3">📷</div>
            <h2 className="text-lg font-semibold mb-2">Camera probleem</h2>
            <p className="text-white/70 text-sm mb-5">{error}</p>
            <button onClick={startCamera} className="bg-white text-black px-6 py-2 rounded-full font-semibold text-sm hover:bg-white/90 transition-colors">
              Opnieuw proberen
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-safe">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={() => { stopStream(); navigate('/'); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur text-white hover:bg-black/60 transition-colors">
            <HiOutlineArrowLeft className="text-lg" />
          </button>

          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-mono font-medium">{formatTime(recordingTime)}</span>
              </div>
            )}
            {currentMode === 'FOTO' || currentMode === 'SELFIE' ? (
              <button
                onClick={toggleTorch}
                className={`w-9 h-9 flex items-center justify-center rounded-full backdrop-blur transition-colors ${torchOn ? 'bg-yellow-400 text-black' : 'bg-black/40 text-white'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      {isCameraReady && currentMode !== 'SELFIE' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-44 left-0 right-0 flex justify-center z-30"
        >
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur rounded-full px-2 py-1">
            {zoomLevels.map(lvl => (
              <button
                key={lvl}
                onClick={() => applyZoom(lvl)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${zoom === lvl ? 'bg-yellow-400 text-black scale-110' : 'text-white/80 hover:text-white'}`}
              >
                {lvl}x
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Countdown */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            key={countdown}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center z-40"
          >
            <div className="text-white font-bold" style={{ fontSize: '120px', lineHeight: 1, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              {countdown}
            </div>
            <button onClick={cancelCountdown} className="mt-8 bg-white/20 backdrop-blur text-white px-6 py-2 rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-colors">
              Annuleren
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      {isCameraReady && countdown === null && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute bottom-0 left-0 right-0 z-30 pb-safe"
        >
          <div className="px-6 pb-10 pt-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            {/* Mode selector */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-1">
                {MODES.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => !isRecording && setModeIndex(i)}
                    disabled={isRecording}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all ${
                      modeIndex === i
                        ? 'bg-yellow-400 text-black'
                        : 'text-white/60 hover:text-white'
                    } ${isRecording ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Shutter + controls row */}
            <div className="flex items-center justify-between">
              {/* Thumbnail placeholder */}
              <div className="w-14 h-14" />

              {/* Shutter button */}
              <button
                onClick={handleCapture}
                className="relative flex items-center justify-center"
                style={{ width: 80, height: 80 }}
              >
                {isVideo ? (
                  <div className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${isRecording ? 'bg-transparent' : 'bg-transparent'}`}>
                    <div className={`transition-all ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-14 h-14 bg-red-500 rounded-full'}`} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-white/10 backdrop-blur flex items-center justify-center active:scale-95 transition-transform">
                    <div className="w-16 h-16 rounded-full bg-white" />
                  </div>
                )}
              </button>

              {/* Flip camera */}
              <button
                onClick={() => !isRecording && setModeIndex(modeIndex === 2 ? 0 : 2)}
                disabled={isRecording}
                className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white transition-all hover:bg-white/30 active:scale-95 ${isRecording ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Camera;
