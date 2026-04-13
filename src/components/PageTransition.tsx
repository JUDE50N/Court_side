import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function PageTransition() {
  const curtainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.to(curtainRef.current, {
      yPercent: -100,
      duration: 0.8,
      ease: "expo.inOut",
      delay: 0.1,
    });
  }, []);

  return (
    <div 
      ref={curtainRef} 
      className="fixed inset-0 bg-orange-accent z-[1000] pointer-events-none"
    />
  );
}
