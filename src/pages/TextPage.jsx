import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiCheck } from 'react-icons/hi';

const TextPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photoData, videoData, videoBlob, isVideo, selectedFilter } = location.state || {};
  const [quote, setQuote] = useState('');
  const [textPosition, setTextPosition] = useState('top');
  const [textColor] = useState('yellow');
  const [isLoading, setIsLoading] = useState(false);
  
  const MAX_CHARS = 60;
  
  useEffect(() => {
    if ((!photoData && !videoData) || !selectedFilter) {
      navigate('/camera');
    }
  }, [photoData, videoData, selectedFilter, navigate]);

  const handleQuoteChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARS) {
      setQuote(newValue);
    }
  };

  const handleContinue = () => {
    navigate('/preview', {
      state: {
        photoData,
        videoData,
        videoBlob,
        isVideo,
        selectedFilter,
        textOptions: {
          quote,
          position: textPosition,
          color: textColor
        }
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/filters', { state: { photoData, videoData, videoBlob, isVideo } })}
            className="flex items-center text-yellow-300 hover:text-yellow-400"
          >
            <HiOutlineArrowLeft className="mr-1" /> Terug
          </button>
          <h1 className="text-2xl font-bold ml-4 text-center flex-grow text-yellow-300">
            Voeg tekst toe
          </h1>
        </div>

        {(photoData || videoData) && selectedFilter && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative mb-6"
          >
            <div className="aspect-square w-full rounded-xl overflow-hidden shadow-md relative">
              {isVideo ? (
                <video
                  src={videoData}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={photoData}
                  alt="Je foto"
                  className="w-full h-full object-cover"
                />
              )}

              <img
                src={selectedFilter.imageUrl}
                alt={selectedFilter.name}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              />

              {quote && (
                <div
                  className={`absolute w-full px-6 py-3 text-center ${
                    textPosition === 'top' ? 'top-6' : 'bottom-6'
                  }`}
                >
                  <p className="text-yellow-300 font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                    {quote}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-3 text-yellow-300">
            Jouw tekst:
          </h2>
          
          <div className="mb-4">
            <textarea
              value={quote}
              onChange={handleQuoteChange}
              placeholder="Voeg hier je tekst toe (max 60 tekens)"
              className="w-full rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-700 text-yellow-300 p-3 focus:border-yellow-300 focus:ring-yellow-300 placeholder-yellow-200/50"
              rows={3}
              maxLength={MAX_CHARS}
            />
            <div className="text-sm text-yellow-300 text-right">
              {quote.length}/{MAX_CHARS}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-bold mb-2 text-yellow-300">
              Positie:
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setTextPosition('top')}
                className={`px-3 py-2 rounded-md text-sm font-bold ${
                  textPosition === 'top'
                    ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300'
                    : 'bg-gray-100 text-yellow-300 dark:bg-gray-700'
                }`}
              >
                Boven
              </button>
              <button
                onClick={() => setTextPosition('bottom')}
                className={`px-3 py-2 rounded-md text-sm font-bold ${
                  textPosition === 'bottom'
                    ? 'bg-yellow-300/20 text-yellow-300 border border-yellow-300'
                    : 'bg-gray-100 text-yellow-300 dark:bg-gray-700'
                }`}
              >
                Onder
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <div className="text-sm text-yellow-300 italic">
            Voorbeeldtekst: "Ik deed het op mijn manier"
          </div>
        </div>

        <motion.div
          className="mt-8 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={handleContinue}
            className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-full flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verwerken...
              </span>
            ) : (
              <span className="flex items-center">
                Tekst {isVideo ? 'video' : 'foto'} <HiCheck className="ml-1" />
              </span>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default TextPage;