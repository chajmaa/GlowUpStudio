import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCamera, HiOutlineArrowLeft, HiVideoCamera } from 'react-icons/hi';
import { FaUser, FaVideo } from 'react-icons/fa';
import { MdCameraFront } from 'react-icons/md';

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [mode, setMode] = useState('photo'); // 'photo' or 'video'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' or 'environment'

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [facingMode, mode]);

  const startCamera = async () => {
    try {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }

      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }

      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      setIsCameraReady(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: mode === 'video'
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraReady(true);
      }
    } catch (error) {
      console.error("Camera niet beschikbaar:", error);
      alert("Camera niet beschikbaar: " + error.message);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video of canvas ref niet beschikbaar');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video niet klaar');
      return;
    }

    canvas.width = 1920;
    canvas.height = 1920;

    const ctx = canvas.getContext('2d');

    const videoAspect = video.videoWidth / video.videoHeight;
    let sx = 0;
    let sy = 0;
    let sWidth = video.videoWidth;
    let sHeight = video.videoHeight;

    if (videoAspect > 1) {
      sWidth = video.videoHeight;
      sx = (video.videoWidth - sWidth) / 2;
    } else {
      sHeight = video.videoWidth;
      sy = (video.videoHeight - sHeight) / 2;
    }

    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL('image/jpeg', 1.0);

    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }

    navigate('/filters', { state: { photoData } });
  };

  const startRecording = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    recordedChunksRef.current = [];

    const stream = videoRef.current.srcObject;
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000
    };

    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
      options.videoBitsPerSecond = 8000000;
    }

    mediaRecorderRef.current = new MediaRecorder(stream, options);

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);

      // Stop camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }

      navigate('/filters', { state: { videoData: videoUrl, videoBlob: blob, isVideo: true } });
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecordingTime(0);

    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) {
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);

    setRecordingTimer(timer);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const handleCapture = () => {
    if (mode === 'photo') {
      capturePhoto();
    } else {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-white hover:text-yellow-300"
          >
            <HiOutlineArrowLeft className="text-xl" />
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        <canvas ref={canvasRef} className="hidden" />

        {isRecording && (
          <div className="absolute top-16 left-3 bg-red-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-sm z-30">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-bold">{recordingTime}s</span>
          </div>
        )}

        {isCameraReady && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-20 left-0 right-0 flex justify-center z-30"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCapture}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                  isRecording ? 'bg-red-500' : 'bg-white'
                }`}
              >
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center ${
                  isRecording
                    ? 'border-white'
                    : 'border-primary-500'
                }`}>
                  {mode === 'photo' ? (
                    <HiCamera className="text-2xl text-primary-500" />
                  ) : (
                    isRecording ? (
                      <div className="w-6 h-6 bg-white rounded-sm" />
                    ) : (
                      <div className="w-6 h-6 bg-red-500 rounded-full" />
                    )
                  )}
                </div>
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-3 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 z-30"
            >
              <div className="flex justify-center items-center gap-3 px-4">
                <button
                  onClick={() => {
                    setMode('photo');
                    setFacingMode('environment');
                  }}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shadow-lg transition-all ${
                    mode === 'photo' && facingMode === 'environment'
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  <HiCamera className="text-xl mb-0.5" />
                  <span className="text-[10px] font-bold">Foto</span>
                </button>

                <button
                  onClick={() => {
                    setMode('video');
                    setFacingMode('environment');
                  }}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shadow-lg transition-all ${
                    mode === 'video' && facingMode === 'environment'
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  <HiVideoCamera className="text-xl mb-0.5" />
                  <span className="text-[10px] font-bold">Video</span>
                </button>

                <button
                  onClick={() => {
                    setMode('photo');
                    setFacingMode('user');
                  }}
                  className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl shadow-lg transition-all ${
                    mode === 'photo' && facingMode === 'user'
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                  }`}
                >
                  <MdCameraFront className="text-xl mb-0.5" />
                  <span className="text-[10px] font-bold">Selfie</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Camera;