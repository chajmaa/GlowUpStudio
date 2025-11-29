import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Projects = () => {
  // Sample projects
  const projects = [
    {
      id: 1,
      title: 'Geslaagden Galerij 2024',
      description: 'Bekijk een collectie van de mooiste geslaagden-selfies van vorig jaar!',
      imageUrl: 'https://via.placeholder.com/600x400/0077ED/FFFFFF?text=Geslaagden+2024',
      link: '/camera'
    },
    {
      id: 2,
      title: 'Schoolfeest Memories',
      description: 'Foto\'s van het eindejaarsgala met onze speciale feestfilters.',
      imageUrl: 'https://via.placeholder.com/600x400/34C759/FFFFFF?text=Schoolfeest',
      link: '/camera'
    },
    {
      id: 3,
      title: 'Retro Yearbook',
      description: 'Een verzameling van vintage-stijl portretten voor het jaarboek.',
      imageUrl: 'https://via.placeholder.com/600x400/FF2D55/FFFFFF?text=Retro+Yearbook',
      link: '/camera'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
    <div className="container mx-auto px-4 py-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center"
        >
          Inspiratie Projecten
        </motion.h1>
        
        <motion.p
          variants={itemVariants} 
          className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto"
        >
          Bekijk enkele voorbeeldprojecten en laat je inspireren voordat je je eigen selfie maakt!
        </motion.p>
        
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              variants={itemVariants}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <Link 
                  to={project.link}
                  className="inline-flex items-center text-primary-500 hover:text-primary-600"
                >
                  Bekijk project
                  <svg 
                    className="ml-1 w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          variants={itemVariants}
          className="text-center mt-12"
        >
          <Link 
            to="/camera"
            className="btn btn-primary inline-flex items-center"
          >
            Maak je eigen foto
            <svg 
              className="ml-2 w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Projects;