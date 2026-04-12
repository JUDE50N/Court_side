import { useState, useCallback } from 'react';

export interface Product {
  id: number;
  brand: string;
  watermark: string;
  description: string;
  price: string;
  size: string;
  type: string;
  image: string;
  accentColor: string;
  ribColor: string;
  ballColor: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    brand: 'SPALDING',
    watermark: 'SPALDING',
    description: 'The legendary official game ball. Engineered for professional performance with premium composite leather and superior grip.',
    price: '$34.99',
    size: '29.5"',
    type: 'OFFICIAL',
    image: '',
    accentColor: '#FF4500',
    ballColor: '#FF4500',
    ribColor: '#111111',
  },
  {
    id: 2,
    brand: 'VERTEX',
    watermark: 'VERTEX',
    description: 'A high-performance indoor/outdoor hybrid. Features advanced moisture-wicking technology for ultimate control in any condition.',
    price: '$49.99',
    size: '29.5"',
    type: 'OFFICIAL',
    image: '',
    accentColor: '#00FF41',
    ballColor: '#004d1a',
    ribColor: '#00FF41',
  },
  {
    id: 3,
    brand: 'NEBULA',
    watermark: 'NEBULA',
    description: 'Deep space aesthetics meet elite performance. Designed with a unique textured surface for enhanced spin and flight stability.',
    price: '$59.99',
    size: '29.5"',
    type: 'OFFICIAL',
    image: '',
    accentColor: '#00CCFF',
    ballColor: '#003366',
    ribColor: '#00CCFF',
  },
  {
    id: 4,
    brand: 'INFERNO',
    watermark: 'INFERNO',
    description: 'Built for the heat of the game. High-durability rubber core with a soft-touch exterior for maximum comfort and power.',
    price: '$64.99',
    size: '29.5"',
    type: 'OFFICIAL',
    image: '',
    accentColor: '#FF0000',
    ballColor: '#4d0000',
    ribColor: '#FF0000',
  },
  {
    id: 5,
    brand: 'STEALTH',
    watermark: 'STEALTH',
    description: 'Sleek, silent, and precise. A minimalist design focused on pure mechanics and consistent bounce response.',
    price: '$79.99',
    size: '29.5"',
    type: 'OFFICIAL',
    image: '',
    accentColor: '#FF007F',
    ballColor: '#FF007F',
    ribColor: '#000000',
  },
  {
    id: 6,
    brand: 'AURORA',
    watermark: 'AURORA',
    description: 'Vibrant visuals paired with professional-grade materials. A statement piece that performs as good as it looks.',
    price: '$89.99',
    size: '29.5"',
    type: 'OFFICIAL',
    image: '',
    accentColor: '#8A2BE2',
    ballColor: '#2e0854',
    ribColor: '#00FFFF',
  },
];

export function useProductSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % PRODUCTS.length);
    setTimeout(() => {
      setIsTransitioning(false);
      setDirection(0);
    }, 1000);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + PRODUCTS.length) % PRODUCTS.length);
    setTimeout(() => {
      setIsTransitioning(false);
      setDirection(0);
    }, 1000);
  }, [isTransitioning]);

  return {
    currentProduct: PRODUCTS[currentIndex],
    currentIndex,
    totalProducts: PRODUCTS.length,
    nextSlide,
    prevSlide,
    isTransitioning,
    direction,
  };
}
