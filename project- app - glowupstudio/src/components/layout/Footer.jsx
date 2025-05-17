import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 py-6 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
              <span className="text-primary-500">G</span>lowUpStudio
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Maak jouw perfecte foto!
            </p>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} GlowUpStudio. Alle rechten voorbehouden.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;