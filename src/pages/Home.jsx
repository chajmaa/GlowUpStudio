import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCamera } from 'react-icons/hi';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: [0.2, 0.8, 0.2, 1] // Apple-like easing
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 py-12">
      <motion.div
        className="text-center max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-4">
          <img
            src="/1.png"
            alt="Studio Glow Up"
            className="w-64 mx-auto"
          />
        </motion.div>
        
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-300 mb-8"
          variants={itemVariants}
        >
          Maak de perfecte foto met leuke filters en jouw eigen quote!
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Link 
            to="/camera" 
            className="btn btn-primary group w-full max-w-xs mx-auto flex items-center justify-center"
          >
            <HiCamera className="mr-2 text-xl group-hover:scale-110 transition-transform" />
            Start je foto
            <motion.span 
              className="absolute right-4"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.3 }}
            >
              →
            </motion.span>
          </Link>
        </motion.div>

        <motion.div 
          className="mt-16 p-6 glass rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
            Hoe werkt het?
          </h3>
          <ul className="text-left space-y-2 text-gray-600 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-2 bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                1
              </span>
              Neem een selfie
            </li>
            <li className="flex items-start">
              <span className="mr-2 bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                2
              </span>
              Kies een leuke filter
            </li>
            <li className="flex items-start">
              <span className="mr-2 bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                3
              </span>
              Voeg je eigen tekst toe
            </li>
            <li className="flex items-start">
              <span className="mr-2 bg-primary-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                4
              </span>
              Download of deel je creatie
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;