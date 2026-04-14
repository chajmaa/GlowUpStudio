import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiCheck } from 'react-icons/hi';

const EDIT_FILTERS = [
  { id: 'none', name: 'Origineel', css: 'none', preview: 'none' },
  { id: 'vivid', name: 'Levendig', css: 'saturate(1.8) contrast(1.1) brightness(1.05)' },
  { id: 'warm', name: 'Warm', css: 'sepia(0.3) saturate(1.4) brightness(1.05) hue-rotate(-10deg)' },
  { id: 'cool', name: 'Koel', css: 'saturate(0.9) brightness(1.05) hue-rotate(20deg) contrast(1.05)' },
  { id: 'bw', name: 'Zwart-Wit', css: 'grayscale(1) contrast(1.1)' },
  { id: 'bw_soft', name: 'Z/W Zacht', css: 'grayscale(1) brightness(1.1) contrast(0.9)' },
  { id: 'dramatic', name: 'Dramatisch', css: 'contrast(1.4) saturate(1.2) brightness(0.9)' },
  { id: 'fade', name: 'Fade', css: 'contrast(0.85) saturate(0.8) brightness(1.1)' },
  { id: 'golden', name: 'Gouden Uur', css: 'sepia(0.5) saturate(1.6) brightness(1.1) hue-rotate(-20deg)' },
  { id: 'moody', name: 'Moody', css: 'contrast(1.2) saturate(0.7) brightness(0.85)' },
  { id: 'fresh', name: 'Fris', css: 'saturate(1.3) brightness(1.08) contrast(1.05) hue-rotate(10deg)' },
  { id: 'cinema', name: 'Cinema', css: 'contrast(1.3) saturate(0.85) sepia(0.15) brightness(0.95)' },
];

const PhotoEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photoData, videoData, videoBlob, isVideo, selectedFilter, facingMode } = location.state || {};
  const [selectedEdit, setSelectedEdit] = useState('none');
  const canvasRefs = useRef({});

  useEffect(() => {
    if ((!photoData && !videoData) || !selectedFilter) {
      navigate('/camera');
    }
  }, [photoData, videoData, selectedFilter, navigate]);

  useEffect(() => {
    if (!photoData) return;
    EDIT_FILTERS.forEach(ef => {
      renderThumbnail(ef);
    });
  }, [photoData]);

  const renderThumbnail = (ef) => {
    const canvas = canvasRefs.current[ef.id];
    if (!canvas || !photoData) return;
    const size = 120;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;

      if (ef.css !== 'none') {
        ctx.filter = ef.css;
      }
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      ctx.filter = 'none';

      if (selectedFilter) {
        const overlay = new Image();
        overlay.onload = () => {
          ctx.drawImage(overlay, 0, 0, size, size);
        };
        overlay.src = selectedFilter.imageUrl;
      }
    };
    img.src = photoData;
  };

  const handleContinue = () => {
    navigate('/text', {
      state: {
        photoData,
        videoData,
        videoBlob,
        isVideo,
        selectedFilter,
        facingMode,
        photoEditFilter: selectedEdit === 'none' ? null : EDIT_FILTERS.find(f => f.id === selectedEdit),
      }
    });
  };

  const currentFilterCss = EDIT_FILTERS.find(f => f.id === selectedEdit)?.css || 'none';

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/filters', { state: { photoData, videoData, videoBlob, isVideo, facingMode } })}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-yellow-300"
          >
            <HiOutlineArrowLeft className="mr-1" /> Terug
          </button>
          <h1 className="text-2xl font-semibold ml-4 text-center flex-grow text-gray-800 dark:text-white">
            Foto bewerken
          </h1>
        </div>

        {(photoData || videoData) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative mb-4"
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
                  style={{ filter: currentFilterCss === 'none' ? undefined : currentFilterCss }}
                />
              )}
              {selectedFilter && (
                <img
                  src={selectedFilter.imageUrl}
                  alt={selectedFilter.name}
                  className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                />
              )}
            </div>
          </motion.div>
        )}

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
          Kies een bewerkingsstijl (optioneel)
        </p>

        <div className="grid grid-cols-4 gap-2">
          {EDIT_FILTERS.map((ef) => (
            <button
              key={ef.id}
              onClick={() => setSelectedEdit(ef.id)}
              className={`flex flex-col items-center rounded-xl overflow-hidden transition-all border-2 ${
                selectedEdit === ef.id
                  ? 'border-yellow-300 scale-105 shadow-lg'
                  : 'border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              {photoData ? (
                <canvas
                  ref={el => {
                    canvasRefs.current[ef.id] = el;
                    if (el) renderThumbnail(ef);
                  }}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-300 dark:bg-gray-600" />
              )}
              <span className={`text-[10px] font-bold py-1 w-full text-center truncate px-1 ${
                selectedEdit === ef.id
                  ? 'text-yellow-300 bg-yellow-300/10'
                  : 'text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800'
              }`}>
                {ef.name}
              </span>
            </button>
          ))}
        </div>

        <motion.div
          className="mt-8 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleContinue}
            className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-full flex items-center"
          >
            Volgende <HiCheck className="ml-2" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PhotoEdit;
