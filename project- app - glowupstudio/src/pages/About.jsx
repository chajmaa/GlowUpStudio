import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
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
        className="max-w-2xl mx-auto"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center"
        >
          Over GlowUpStudio
        </motion.h1>

        <motion.div 
          variants={itemVariants}
          className="prose dark:prose-invert mx-auto"
        >
          <p>
            GlowUpStudio is een creatieve app ontwikkeld speciaal voor examenleerlingen (16-18 jaar) 
            die hun prestaties willen vieren met unieke, gepersonaliseerde selfies.
          </p>
          
          <p>
            Met onze app kun je eenvoudig selfies maken, kiezen uit prachtige filters en je eigen 
            persoonlijke boodschap toevoegen. Het resultaat kun je direct downloaden of delen via email.
          </p>
          
          <h2>Hoe werkt het?</h2>
          
          <ol>
            <li>Neem een selfie met de camera in onze app</li>
            <li>Kies uit onze selectie van feestelijke filters zoals "Geslaagd 2025"</li>
            <li>Voeg je eigen tekst of quote toe (maximaal 60 tekens)</li>
            <li>Download je creatie of deel deze direct via e-mail</li>
          </ol>
          
          <h2>Privacy</h2>
          
          <p>
            We vinden je privacy belangrijk. Alle foto's die je maakt worden alleen lokaal 
            op je apparaat opgeslagen en worden niet naar externe servers verzonden, tenzij je 
            ervoor kiest om je creatie via e-mail te delen.
          </p>
          
          <p>
            Voor vragen of opmerkingen kun je contact met ons opnemen via de contactpagina.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default About;