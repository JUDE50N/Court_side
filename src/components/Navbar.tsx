import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { User, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  accentColor: string;
}

export default function Navbar({ accentColor }: NavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(navRef.current, {
      y: -50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      delay: 0.2,
    });
  }, []);

  return (
    <nav ref={navRef} className="relative z-50 flex items-center justify-between px-6 sm:px-16 py-4 sm:py-10">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
        <div 
          className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white rounded-full flex items-center justify-center transition-colors"
          style={{ borderColor: accentColor }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-colors sm:w-6 sm:h-6" style={{ color: accentColor }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2C12 2 15 7 15 12C15 17 12 22 12 22" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2C12 2 9 7 9 12C9 17 12 22 12 22" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="flex flex-col leading-none font-black text-white transition-colors text-xs sm:text-base">
          <span>COURT</span>
          <span>SIDE</span>
        </div>
      </div>

      {/* Nav Links - Hidden on mobile */}
      <div className="hidden sm:flex items-center gap-12">
        {['Products', 'Customize', 'Contacts'].map((link, i) => (
          <a
            key={link}
            href="#"
            className="relative text-sm font-bold uppercase tracking-widest transition-colors hover:text-white group"
            style={{ color: i === 0 ? accentColor : 'white' }}
          >
            {link}
            <span 
              className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full" 
              style={{ backgroundColor: accentColor }}
            />
          </a>
        ))}
      </div>

      {/* Icons */}
      <div className="flex items-center gap-4 sm:gap-8">
        <button className="text-white hover:opacity-70 transition-colors cursor-pointer">
          <User size={18} className="sm:w-5 sm:h-5" />
        </button>
        <button id="cart-icon" className="text-white hover:opacity-70 transition-all duration-300 cursor-pointer relative cart-icon-target">
          <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
        </button>
      </div>
    </nav>
  );
}
