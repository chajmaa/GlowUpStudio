import React from 'react';
import { motion } from 'framer-motion';

const FilterOption = ({ filter, isSelected, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-lg overflow-hidden aspect-square border-2 ${
        isSelected 
          ? 'border-primary-500 ring-2 ring-primary-500 ring-opacity-50' 
          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
      }`}
    >
      <img 
        src={filter.thumbnailUrl} 
        alt={filter.name} 
        className="w-full h-full object-cover"
      />
      
      {isSelected && (
        <div className="absolute bottom-1 right-1 bg-primary-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-1 text-xs text-center text-white">
        {filter.name}
      </div>
    </motion.div>
  );
};

export default FilterOption;