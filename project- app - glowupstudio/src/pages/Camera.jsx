import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCamera, HiOutlineArrowLeft } from 'react-icons/hi';

const Camera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        }
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
    
    canvas.width = 1080;
    canvas.height = 1080;
    
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
    
    const photoData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Stop camera stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
    
    navigate('/filters', { state: { photoData } });
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
            Neem je selfie
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="aspect-square w-full bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          {isCameraReady && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-4 left-0 right-0 flex justify-center"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
              >
                <div className="w-14 h-14 rounded-full border-2 border-primary-500 flex items-center justify-center">
                  <HiCamera className="text-2xl text-primary-500" />
                </div>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Camera;