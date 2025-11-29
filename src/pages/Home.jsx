import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiCamera, HiVideoCamera } from 'react-icons/hi';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.15
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
        ease: [0.2, 0.8, 0.2, 1]
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[calc(100vh-8rem)] px-4 py-8">
      <motion.div
        className="text-center max-w-xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <img
            src="/logo glowupstudio.png"
            alt="Studio Glow Up"
            className="w-80 max-w-full mx-auto"
          />
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-bold mb-6"
          variants={itemVariants}
        >
          <span className="text-blue-600 dark:text-blue-500">Glow</span>
          <span className="text-purple-600 dark:text-purple-500">Up</span>
          <span className="text-pink-600 dark:text-pink-500">Studio</span>
        </motion.h1>

        <motion.p
          className="text-base text-gray-700 dark:text-gray-300 mb-10 px-4"
          variants={itemVariants}
        >
          Maak de perfecte foto of video met onze exclusieve GlowUpStudio filters!
        </motion.p>

        <motion.div variants={itemVariants} className="space-y-4 mb-12">
          <Link
            to="/camera"
            className="btn bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group w-full max-w-md mx-auto flex items-center justify-center text-lg py-4 rounded-full shadow-md hover:shadow-lg transition-all relative"
          >
            <HiVideoCamera className="mr-3 text-xl" />
            Neem een video op
            <span className="ml-auto mr-4">→</span>
          </Link>
        </motion.div>

        <motion.div
          className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700"
          variants={itemVariants}
        >
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-2">✨</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Nieuw: GlowUpStudio Filters!
            </h3>
          </div>
          <ul className="text-left space-y-4 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="mr-3 bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                1
              </span>
              <span className="pt-0.5">Kies tussen foto of video</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 bg-purple-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                2
              </span>
              <span className="pt-0.5">Selecteer je favoriete GlowUpStudio filter</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 bg-pink-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                3
              </span>
              <span className="pt-0.5">Voeg je eigen tekst toe</span>
            </li>
            <li className="flex items-start">
              <span className="mr-3 bg-red-600 text-white rounded-full h-7 w-7 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                4
              </span>
              <span className="pt-0.5">Download of deel je creatie</span>
            </li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;