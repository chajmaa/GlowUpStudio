import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowLeft, HiCheck } from 'react-icons/hi';
import FilterOption from '../components/filters/FilterOption';
import filterData from '../data/filterData';

const FilterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { photoData, videoData, videoBlob, isVideo } = location.state || {};
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  useEffect(() => {
    if (!photoData && !videoData) {
      navigate('/camera');
    } else if (photoData) {
      setPreviewImage(photoData);
    }
  }, [photoData, videoData, navigate]);

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
  };

  const handleContinue = () => {
    if (selectedFilter) {
      navigate('/text', {
        state: {
          photoData,
          videoData,
          videoBlob,
          isVideo,
          selectedFilter
        }
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-lg mx-auto p-4">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate('/camera')}
            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
          >
            <HiOutlineArrowLeft className="mr-1" /> Terug
          </button>
          <h1 className="text-2xl font-semibold ml-4 text-center flex-grow text-gray-800 dark:text-white">
            Kies een filter
          </h1>
        </div>

        {(previewImage || videoData) && (
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
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={previewImage}
                  alt="Je foto"
                  className="w-full h-full object-cover"
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

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            Beschikbare filters:
          </h2>
          
          <div className="grid grid-cols-3 gap-3">
            {filterData.map((filter) => (
              <FilterOption
                key={filter.id}
                filter={filter}
                isSelected={selectedFilter?.id === filter.id}
                onSelect={() => handleFilterSelect(filter)}
              />
            ))}
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
            disabled={!selectedFilter}
            className={`btn ${selectedFilter ? 'btn-primary' : 'btn-secondary opacity-50'} flex items-center`}
          >
            Volgende
            {selectedFilter && <HiCheck className="ml-2" />}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default FilterPage;