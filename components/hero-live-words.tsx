"use client";

import { useEffect, useState } from "react";

const words = ["better jobs", "clear matches", "stronger resumes", "next steps"];

export default function HeroLiveWords() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % words.length), 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="mt-5 inline-flex min-h-12 items-center rounded-2xl border border-violet-100 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
      <span className="mr-2 text-sm font-black text-slate-500">JobCraft helps you find</span>
      <span key={words[index]} className="live-word bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-500 bg-clip-text text-lg font-black text-transparent sm:text-xl">{words[index]}</span>
      <style jsx>{`
        @keyframes liveWordIn { from { opacity: 0; transform: translateY(8px); filter: blur(4px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        .live-word { animation: liveWordIn .45s ease both; }
        @media (prefers-reduced-motion: reduce) { .live-word { animation: none !important; } }
      `}</style>
    </div>
  );
}
