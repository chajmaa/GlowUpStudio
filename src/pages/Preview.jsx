import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiDownload, HiMail, HiPhotograph } from 'react-icons/hi';

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [finalImageUrl, setFinalImageUrl] = useState(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
  const [finalVideoBlob, setFinalVideoBlob] = useState(null);
  const [email, setEmail] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const { photoData, videoData, videoBlob, isVideo, selectedFilter, textOptions, videoMimeType, facingMode } = location.state || {};

  useEffect(() => {
    if ((!photoData && !videoData) || !selectedFilter || !textOptions) {
      navigate('/camera');
      return;
    }

    if (isVideo && !processingRef.current) {
      processingRef.current = true;
      renderVideoWithFilter();
    } else if (!isVideo) {
      renderFinalImage();
    }
  }, []);

  const renderFinalImage = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 1920;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    const photo = new Image();
    photo.crossOrigin = 'anonymous';
    photo.onload = () => {
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

      const filter = new Image();
      filter.crossOrigin = 'anonymous';
      filter.onload = () => {
        ctx.drawImage(filter, 0, 0, canvas.width, canvas.height);

        if (textOptions.quote) {
          ctx.font = 'bold 86px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFD700';

          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          let textY;
          switch (textOptions.position) {
            case 'top':
              textY = canvas.height * 0.1;
              break;
            case 'bottom':
              textY = canvas.height * 0.9;
              break;
            default:
              textY = canvas.height * 0.9;
          }

          const maxWidth = canvas.width * 0.8;
          const words = textOptions.quote.split(' ');
          let line = '';
          let lineY = textY;

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
              ctx.fillText(line, canvas.width / 2, lineY);
              line = words[i] + ' ';
              lineY += 60;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, canvas.width / 2, lineY);
        }

        const finalImageUrl = canvas.toDataURL('image/jpeg', 1.0);
        setFinalImageUrl(finalImageUrl);
      };
      filter.src = selectedFilter.imageUrl;
    };
    photo.src = photoData;
  };

  const renderVideoWithFilter = async () => {
    setIsProcessing(true);

    try {
      const video = document.createElement('video');
      video.src = videoData;
      video.crossOrigin = 'anonymous';
      video.playsInline = true;
      video.muted = false;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      video.currentTime = 0;
      await new Promise((resolve) => {
        video.onseeked = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      const filterImg = new Image();
      filterImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        filterImg.onload = resolve;
        filterImg.onerror = reject;
        filterImg.src = selectedFilter.imageUrl;
      });

      const shouldMirror = facingMode === 'user';

      const videoStream = canvas.captureStream(30);

      let finalStream = videoStream;
      let audioContext = null;

      if (video.mozHasAudio !== false && video.webkitAudioDecodedByteCount !== 0) {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();
          source.connect(destination);
          source.connect(audioContext.destination);

          const audioTrack = destination.stream.getAudioTracks()[0];
          if (audioTrack) {
            finalStream.addTrack(audioTrack);
          }
        } catch (audioError) {
          console.warn('Audio processing failed:', audioError);
        }
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264,opus')) {
        mimeType = 'video/webm;codecs=h264,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mimeType = 'video/webm;codecs=vp9,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      const mediaRecorder = new MediaRecorder(finalStream, {
        mimeType: mimeType,
        videoBitsPerSecond: 10000000,
        audioBitsPerSecond: 128000
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setFinalVideoUrl(url);
        setFinalVideoBlob(blob);
        setIsProcessing(false);
        if (audioContext) {
          audioContext.close();
        }
      };

      mediaRecorder.start();
      video.currentTime = 0;
      video.play();

      const drawFrame = () => {
        if (video.paused || video.ended) {
          mediaRecorder.stop();
          return;
        }

        ctx.save();

        if (shouldMirror) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        ctx.restore();

        ctx.drawImage(filterImg, 0, 0, canvas.width, canvas.height);

        if (textOptions.quote) {
          ctx.font = 'bold 86px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFD700';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          let textY = textOptions.position === 'top' ? canvas.height * 0.1 : canvas.height * 0.9;

          const maxWidth = canvas.width * 0.8;
          const words = textOptions.quote.split(' ');
          let line = '';
          let lineY = textY;

          for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && i > 0) {
              ctx.fillText(line, canvas.width / 2, lineY);
              line = words[i] + ' ';
              lineY += 60;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, canvas.width / 2, lineY);
        }

        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    } catch (error) {
      console.error('Video processing error:', error);
      setIsProcessing(false);
      processingRef.current = false;
    }
  };

  const handleDownload = async () => {
    if (isVideo && !finalVideoUrl) return;
    if (!isVideo && !finalImageUrl) return;

    setIsDownloading(true);

    try {
      const link = document.createElement('a');
      link.href = isVideo ? finalVideoUrl : finalImageUrl;

      const extension = isVideo ? 'mp4' : 'jpg';
      link.download = isVideo ? `glowupstudio_video.${extension}` : 'glowupstudio_selfie.jpg';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmailToggle = () => {
    setShowEmailForm(!showEmailForm);
    setEmailSent(false);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();

    if (!email || (!finalImageUrl && !finalVideoUrl)) return;

    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      setEmailSent(true);

      setTimeout(() => {
        setShowEmailForm(false);
      }, 3000);
    }, 1500);
  };

  const startOver = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg mx-auto p-4 pb-24">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/text', {
              state: { photoData, videoData, videoBlob, isVideo, selectedFilter, facingMode }
            })}
            className="flex items-center text-yellow-300 hover:text-yellow-400"
          >
            <HiOutlineArrowLeft className="mr-1" /> Terug
          </button>
          <h1 className="text-2xl font-bold ml-4 text-center flex-grow text-yellow-300">
            Resultaat
          </h1>
        </div>

        {isProcessing ? (
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex flex-col items-center justify-center">
            <svg className="animate-spin h-12 w-12 text-yellow-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-yellow-300 font-bold">Video verwerken...</p>
          </div>
        ) : (finalImageUrl || finalVideoUrl) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative mb-6"
          >
            <div className="aspect-square w-full rounded-xl overflow-hidden shadow-lg">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={finalVideoUrl}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={finalImageUrl}
                  alt="Jouw creatie"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </motion.div>
        ) : (
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
            <HiPhotograph className="text-5xl text-yellow-300" />
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <motion.div
          className="mt-8 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleDownload}
              disabled={isProcessing || (!finalImageUrl && !finalVideoUrl) || isDownloading}
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-full flex items-center justify-center flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Bezig...
                </span>
              ) : (
                <span className="flex items-center">
                  <HiDownload className="mr-2" /> Downloaden
                </span>
              )}
            </button>

            <button
              onClick={handleEmailToggle}
              disabled={isProcessing || (!finalImageUrl && !finalVideoUrl)}
              className={`font-bold py-3 px-6 rounded-full flex items-center justify-center flex-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                showEmailForm
                  ? 'bg-yellow-300 text-gray-900'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              <HiMail className="mr-2" /> {showEmailForm ? 'Annuleren' : 'Versturen via e-mail'}
            </button>
          </div>

          {showEmailForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm overflow-hidden"
            >
              {!emailSent ? (
                <form onSubmit={handleSendEmail} className="space-y-3">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-yellow-300 mb-1"
                    >
                      E-mailadres:
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="voorbeeld@email.nl"
                      className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-yellow-300 focus:ring-yellow-300 focus:border-yellow-300"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending || !email}
                    className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold w-full py-3 px-6 rounded-full"
                  >
                    {isSending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Versturen...
                      </span>
                    ) : 'Versturen'}
                  </button>
                </form>
              ) : (
                <div className="flex items-center text-yellow-300 p-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  E-mail succesvol verzonden!
                </div>
              )}
            </motion.div>
          )}

          <button
            onClick={startOver}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold w-full py-3 px-6 rounded-full mt-4"
          >
            Opnieuw beginnen
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Preview;
