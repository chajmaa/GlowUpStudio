import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Pagina niet gevonden
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          De pagina die je zoekt bestaat niet of is verplaatst.
        </p>
        <Link to="/" className="btn btn-primary">
          Terug naar home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;