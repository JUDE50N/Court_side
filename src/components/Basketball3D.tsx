import { useRef, useState, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, AdaptiveDpr, PerformanceMonitor, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Product } from '../hooks/useProductSlider';

// Optimized Noise function for leather grain
function createNoise(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = 150 + Math.random() * 105;
    data[i] = val;
    data[i + 1] = val;
    data[i + 2] = val;
    data[i + 3] = 255;
  }
  return imageData;
}

function useBasketballTexture(product: Product) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return new THREE.Texture();

    // 1. Base Leather Color with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, product.ballColor);
    const darkerColor = new THREE.Color(product.ballColor).multiplyScalar(0.8).getStyle();
    gradient.addColorStop(1, darkerColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Leather Grain (Noise)
    ctx.globalCompositeOperation = 'overlay';
    ctx.globalAlpha = 0.08; // Reduced from 0.15
    const noiseData = createNoise(ctx, canvas.width, canvas.height);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d')?.putImageData(noiseData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = 'source-over';

    // 3. Realistic Pebbles (Procedural - High Contrast for Bump)
    const spacing = 5;
    for (let y = 0; y < canvas.height; y += spacing) {
      for (let x = 0; x < canvas.width; x += spacing) {
        // Jitter for organic feel
        const jX = (Math.random() - 0.5) * 2.5;
        const jY = (Math.random() - 0.5) * 2.5;
        const size = 1.2 + Math.random() * 0.8; 
        
        // Shadow part
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(x + jX, y + jY, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight part (for bump map peaks)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(x + jX - 0.5, y + jY - 0.5, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Ribs (Lines - Deeper for Bump)
    ctx.strokeStyle = product.ribColor;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#000000';

    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Curved lines
    const curveWidth = canvas.width / 3.2;
    const curveHeight = canvas.height / 5.5;
    
    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, canvas.height / 4, curveWidth, curveHeight, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(canvas.width / 2, (canvas.height * 3) / 4, curveWidth, curveHeight, 0, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, [product.ballColor, product.ribColor]);
}

const Ball = memo(({ product, isHovered, onHover, meshRef }: { product: Product; isHovered: boolean; onHover: (hover: boolean) => void; meshRef: React.RefObject<THREE.Mesh> }) => {
  const texture = useBasketballTexture(product);

  useFrame((state, delta) => {
    if (meshRef.current) {
      const targetRotationSpeed = isHovered ? 2.5 : 0.3;
      meshRef.current.rotation.y += delta * targetRotationSpeed;
      if (isHovered) {
        meshRef.current.rotation.x += delta * 1.5;
        meshRef.current.rotation.z += delta * 1.0;
      }
    }
  });

  // Transform animation on product change
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tl = gsap.timeline();
    
    tl.to(meshRef.current.scale, {
      x: 1.05,
      y: 1.05,
      z: 1.05,
      duration: 0.15,
      ease: "power2.out"
    })
    .to(meshRef.current.rotation, {
      y: "+=3.14",
      duration: 0.4,
      ease: "power2.inOut"
    }, 0)
    .to(meshRef.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: "power2.out"
    });

  }, [product.id]);

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[2.3, 64, 64]} />
      <meshPhysicalMaterial
        map={texture}
        roughness={0.9}
        metalness={0.0}
        bumpMap={texture}
        bumpScale={0.4}
        clearcoat={0.05}
        clearcoatRoughness={0.8}
        envMapIntensity={1.8}
        reflectivity={0.2}
      />
    </mesh>
  );
});

export default function Basketball3D({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [dpr, setDpr] = useState(1.5);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <div className="relative w-[240px] h-[240px] sm:w-[600px] sm:h-[600px] z-20 cursor-grab active:cursor-grabbing">
      <Canvas 
        shadows 
        dpr={dpr}
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
      >
        <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => setDpr(1)} />
        <AdaptiveDpr pixelated />
        
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        
        {/* Environment for realistic reflections and ambient light */}
        <Environment resolution={256}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer form="rect" intensity={2} position={[10, 2, 1]} scale={[10, 2, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={2} position={[-10, 2, 1]} scale={[10, 2, 1]} rotation-y={-Math.PI / 2} />
            <Lightformer form="rect" intensity={10} position={[0, 10, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
          </group>
        </Environment>

        {/* Cinematic Lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Main Key Light */}
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={3} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        />
        
        {/* Fill Light (Product Tint) */}
        <pointLight position={[-10, -5, 5]} intensity={2} color={product.accentColor} />
        
        {/* Rim Light (Backlight to pop silhouette) */}
        <directionalLight position={[0, 5, -10]} intensity={4} color="#ffffff" />
        
        {/* Soft Contact Shadows on the "floor" */}
        <ContactShadows 
          position={[0, -3.5, 0]} 
          opacity={0.6} 
          scale={10} 
          blur={2} 
          far={4} 
          color="#000000"
          resolution={256}
        />
        
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.3}>
          <Ball product={product} isHovered={isHovered} onHover={setIsHovered} meshRef={meshRef} />
        </Float>
      </Canvas>
    </div>
  );
}





