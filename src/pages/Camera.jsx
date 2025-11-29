import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCamera, HiOutlineArrowLeft, HiVideoCamera } from 'react-icons/hi';

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

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
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
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = 1920;
    canvas.height = 1920;

    const ctx = canvas.getContext('2d');

    // Calculate dimensions to maintain aspect ratio
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

    // Stop camera stream
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg p-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
          >
            <HiOutlineArrowLeft className="mr-1" /> Terug
          </button>
          <h1 className="text-2xl font-semibold ml-4 text-center flex-grow text-gray-800 dark:text-white">
            Start je {mode === 'photo' ? 'foto' : 'video'}
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="aspect-video w-full bg-black rounded-xl overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
            {isRecording && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                <span className="font-bold">{recordingTime}s / 30s</span>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {isCameraReady && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute top-4 right-4 flex gap-2"
              >
                <button
                  onClick={() => setMode('photo')}
                  className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
                    mode === 'photo'
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-white/80 text-gray-900'
                  }`}
                >
                  <HiCamera /> Foto
                </button>
                <button
                  onClick={() => setMode('video')}
                  className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
                    mode === 'video'
                      ? 'bg-yellow-300 text-gray-900'
                      : 'bg-white/80 text-gray-900'
                  }`}
                >
                  <HiVideoCamera /> Video
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-4 left-0 right-0 flex justify-center"
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
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Camera;