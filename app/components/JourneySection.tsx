"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const EXPERIENCE_DATA = [
  {
    role: "B.Tech CSE (AI & ML)",
    location: "UEM, Jaipur",
    period: "2023 - 2027",
    description: "Currently in my 2nd Year of Computer Science engineering, focusing on Artificial Intelligence and Machine Learning applications.",
    rating: 5,
    image: "/certificate/Software engineering.png"
  },
  {
    role: "ACM Student Member",
    location: "ACM Student Chapter",
    period: "2024",
    description: "Active member of the ACM Student Chapter, participating in technical workshops and research-based initiatives.",
    rating: 5,
    image: "/certificate/Graphic-design.png"
  },
  {
    role: "Full-Stack Developer",
    location: "Freelance",
    period: "NOW",
    description: "Building comprehensive web platforms using React, Node.js, and Supabase, with a strong emphasis on AI integration.",
    rating: 5,
    image: "/certificate/mongodb.png"
  }
];


import { Star } from "lucide-react";

interface CareerItemProps {
  role: string;
  location: string;
  period: string;
  description: string;
  rating: number;
  image: string;
  index: number;
}

const CareerCard = ({ role, rating, image, index }: CareerItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex items-center gap-6 bg-white rounded-3xl p-4 w-full max-w-xl group hover:scale-[1.02] transition-transform duration-300"
    >
      {/* Image Section */}
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 relative overflow-hidden rounded-2xl">
        <img 
          src={image} 
          alt={role}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
          {role}
        </h4>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              className={`${
                i < rating ? "fill-orange-400 text-orange-400" : "text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="journey" ref={containerRef} className="relative w-full py-24 md:py-32 bg-black overflow-hidden px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative border border-white/20 rounded-[3rem] p-8 md:p-16 flex flex-col items-center gap-12 bg-zinc-950/50 backdrop-blur-sm"
        >
          {/* Top Circle Icon */}
          <div className="w-4 h-4 rounded-full border border-white/40 mb-[-2rem]" />
          
          {/* Title Area */}
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="text-gray-500">Career</span>
              <span className="text-white ml-2">Explorer</span>
            </h2>
          </div>

          {/* Cards List */}
          <div className="flex flex-col gap-6 w-full items-center">
            {EXPERIENCE_DATA.map((item, index) => (
              <CareerCard key={index} {...item} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

