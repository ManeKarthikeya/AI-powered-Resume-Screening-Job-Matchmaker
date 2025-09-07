"use client";
import React, { useState, useEffect } from "react";
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa";
import Spline from "@splinetool/react-spline";

function AboutMe() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 99 ? prev + 1 : prev));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleLoad = () => {
    setIsLoading(false);
    setProgress(100);
  };

  return (
    <div className="relative h-screen overflow-y-hidden">
      {/* Message and Name */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 text-sm sm:text-base md:text-xl font-serif text-right max-w-[80%] sm:max-w-none">
        <p className="text-xs sm:text-sm md:text-base">
          "From dream to destination, AI makes travel simple — designing personalized journeys that fit your style, budget, and time."
        </p>
        <a
          href="mailto:mane.karthikeya.1811@gmail.com"
          aria-label="Send an email to Karthikeya"
          className="mt-1 block text-xs sm:text-sm hover:text-blue-200"
        >
          ~ Mane Karthikeya Rama Chandra Rao ~
        </a>

        {/* Icons just below the name */}
        <div className="mt-2 flex justify-center space-x-4 sm:space-x-6">
          <a
            href="https://www.linkedin.com/in/karthikeya-mane-113914335/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Karthikeya's LinkedIn profile"
          >
            <FaLinkedin className="text-lg sm:text-xl md:text-2xl text-black dark:text-white hover:text-blue-700 transition" />
          </a>
          <a
            href="https://github.com/ManeKarthikeya?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Karthikeya's GitHub profile"
          >
            <FaGithub className="text-lg sm:text-xl md:text-2xl text-black dark:text-white hover:text-gray-600 transition" />
          </a>
          <a
            href="https://www.instagram.com/karthikeya_xo18/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Kathikeya's Instagram profile"
          >
            <FaInstagram className="text-lg sm:text-xl md:text-2xl text-black dark:text-white hover:text-pink-500 transition" />
          </a>
        </div>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute z-10 flex flex-col items-center justify-center w-full h-full bg-white">
          <div className="loader border-4 border-blue-400 border-t-transparent rounded-full w-10 h-10 sm:w-12 sm:h-12 animate-spin"></div>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-blue-500">
            Loading {progress}%
          </p>
        </div>
      )}

      {/* Spline Component */}
      {/* <Spline scene="https://prod.spline.design/nxnLxwEy8LsE6Wtf/scene.splinecode" onLoad={handleLoad} /> */}
      <div className="relative w-full h-[600px] sm:h-[600px] md:h-[600px] lg:h-[600px] overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <Spline
          className="w-full h-full scale-[0.8] sm:scale-100 md:scale-100 lg:scale-100"
          scene="https://prod.spline.design/nxnLxwEy8LsE6Wtf/scene.splinecode" 
          onLoad={handleLoad}
        />
      </div>
    </div>
    </div>
  );
}

export default AboutMe;