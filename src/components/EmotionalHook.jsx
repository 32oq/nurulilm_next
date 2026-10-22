"use client";

import { useEffect, useRef } from "react";
import { MapPin, Clock, ShieldCheck } from "lucide-react";

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
    <section className="w-full bg-slate-950 text-white relative overflow-hidden">
      <div className="w-full relative">
        <div className="relative w-full aspect-video sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[21/8] overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.70] contrast-[1.05]"
          >
            <source src="/lib.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/20" />

          <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-6 px-4 w-[94%] sm:w-[88%] md:w-[80%] lg:w-[70%] z-10">
            <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 sm:p-5 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-700 pb-3 mb-3">
                <div>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-slate-400 block">
                    Public Reading Room
                  </span>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-0.5">
                    Quiet Reading Hall and Academic Carrels
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium self-start sm:self-auto flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Quiet Study Floor</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>New Bus Stand Rd, Handwara, J&amp;K</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-slate-400" />
                    <span>Open Daily • Official Operating Hours</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Monitored Study Environment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
