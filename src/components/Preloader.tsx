import { useEffect, useState } from 'react';
import gsap from 'gsap';

export default function Preloader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setIsVisible(false)
    });

    tl.to('.preloader-ball', {
      y: -20,
      repeat: 2,
      yoyo: true,
      duration: 0.25,
      ease: "power1.inOut"
    })
    .to('.preloader-container', {
      opacity: 0,
      duration: 0.5,
      ease: "power2.inOut"
    });
  }, []);

  if (!isVisible) return null;

  return (
    <div className="preloader-container fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col items-center justify-center">
      <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
        {/* Animated Basketball Silhouette */}
        <div className="preloader-ball w-16 h-16 bg-[#FF4500] rounded-full relative overflow-hidden shadow-[0_0_30px_rgba(255,69,0,0.4)]">
          <div className="absolute inset-0 border-2 border-black/20 rounded-full" />
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black/20" />
          <div className="absolute top-0 left-1/2 w-[2px] h-full bg-black/20" />
          <div className="absolute inset-0 border-[2px] border-black/20 rounded-full scale-75" />
        </div>
        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/40 rounded-full blur-sm scale-x-150" />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-white font-black tracking-[0.4em] uppercase text-xl">
          COURT<span className="text-[#FF4500]">SIDE</span>
        </h1>
        <div className="w-48 h-[1px] bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#FF4500] animate-loading-bar" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { width: 0%; left: -100%; }
          50% { width: 100%; left: 0%; }
          100% { width: 0%; left: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 2s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
