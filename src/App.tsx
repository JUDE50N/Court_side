/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useProductSlider } from './hooks/useProductSlider';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BottomBar from './components/BottomBar';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';
import FlyingBallOverlay from './components/FlyingBallOverlay';
import Preloader from './components/Preloader';

export default function App() {
  const { 
    currentProduct, 
    currentIndex, 
    totalProducts, 
    nextSlide, 
    prevSlide,
    direction
  } = useProductSlider();

  return (
    <div className="h-[100dvh] w-screen relative overflow-hidden font-sans">
      <Preloader />
      
      {/* Outer Orange Frame */}
      <div 
        className="outer-frame transition-colors duration-500" 
        style={{ borderColor: currentProduct.accentColor }}
      />
      
      {/* Page Transition Curtain */}
      <PageTransition />
      
      {/* Custom Cursor */}
      <CustomCursor />

      {/* Main Content Container */}
      <main className="content-container">
        <Navbar accentColor={currentProduct.accentColor} />
        
        <Hero 
          product={currentProduct} 
          currentIndex={currentIndex}
          totalProducts={totalProducts}
          direction={direction}
        />
        
        <BottomBar 
          product={currentProduct}
          onNext={nextSlide}
          onPrev={prevSlide}
        />
      </main>

      {/* Flying Ball Overlay */}
      <FlyingBallOverlay />
    </div>
  );
}

