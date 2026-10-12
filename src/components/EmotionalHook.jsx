"use client";

import { useEffect, useRef } from "react";
import { MapPin, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function EmotionalHook() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setTimeout(() => {
            if (video) video.play().catch(() => {});
          }, 500);
        });
      }
    }
  }, []);

  return (
    <section className="w-full bg-[#141916] text-[#FAF8F5] relative overflow-hidden">
      <motion.div
        initial={{ scale: 1.02, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="w-full relative"
      >
        <div className="relative w-full aspect-video sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[21/8] overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.72] contrast-[1.05]"
          >
            <source src="/lib.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-[#141916] via-[#141916]/40 to-black/30" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-6 px-4 w-[94%] sm:w-[88%] md:w-[80%] lg:w-[70%] z-10"
          >
            <div className="bg-transparent p-3 sm:p-5 text-white">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-white/20 pb-3 mb-3">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#A5CDB7] block drop-shadow-md">
                    Public Reading Room &amp; Digital Learning Archive
                  </span>
                  <h2 className="font-serif-lib text-xl sm:text-2xl md:text-3xl font-bold text-white mt-0.5 drop-shadow-lg">
                    A Sanctuary for Focused Study &amp; Intellectual Growth
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-xs border border-white/20 text-white text-xs font-semibold self-start sm:self-auto flex-shrink-0 drop-shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#52D38A] animate-pulse" />
                  <span>Distraction-Free Quiet Zone</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-white drop-shadow-md">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#8FD4AE] drop-shadow-sm" />
                    <span>New Bus Stand Rd, Handwara, J&amp;K</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-[#8FD4AE] drop-shadow-sm" />
                    <span>Open Daily Across Morning &amp; Evening Shifts</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#8FD4AE] drop-shadow-sm" />
                  <span className="font-medium text-white/95 drop-shadow-sm">CCTV Monitored Study Halls</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
