import { useRef, useState, useEffect, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, AdaptiveDpr, PerformanceMonitor, ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { Product } from '../hooks/useProductSlider';

function useBasketballTextures(product: Product) {
  return useMemo(() => {
    const width = 512;
    const height = 256;
    
    const albedoCanvas = document.createElement('canvas');
    albedoCanvas.width = width;
    albedoCanvas.height = height;
    const aCtx = albedoCanvas.getContext('2d', { alpha: false });
    
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = width;
    bumpCanvas.height = height;
    const bCtx = bumpCanvas.getContext('2d', { alpha: false });

    if (!aCtx || !bCtx) return { map: new THREE.Texture(), bumpMap: new THREE.Texture(), roughnessMap: new THREE.Texture() };

    // --- PRE-RENDER PEBBLE DOME ---
    const pebbleSize = 2;
    const pebbleCanvas = document.createElement('canvas');
    pebbleCanvas.width = pebbleSize * 2;
    pebbleCanvas.height = pebbleSize * 2;
    const pCtx = pebbleCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(pebbleSize, pebbleSize, 0, pebbleSize, pebbleSize, pebbleSize);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#888888');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, pebbleSize * 2, pebbleSize * 2);
    }

    // --- DRAW BASE ---
    const gradient = aCtx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, product.ballColor);
    const darkerColor = new THREE.Color(product.ballColor).multiplyScalar(0.7).getStyle();
    gradient.addColorStop(1, darkerColor);
    aCtx.fillStyle = gradient;
    aCtx.fillRect(0, 0, width, height);

    bCtx.fillStyle = '#888888';
    bCtx.fillRect(0, 0, width, height);

    // --- ADD LEATHER GRAIN (Micro-pores) ---
    aCtx.globalAlpha = 0.05;
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      aCtx.fillStyle = '#000000';
      aCtx.fillRect(x, y, 1, 1);
    }
    aCtx.globalAlpha = 1.0;

    // --- DRAW PEBBLES (Tactile Domes) - Optimized with drawImage ---
    const spacing = 6;
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        const jX = (Math.random() - 0.5) * 2;
        const jY = (Math.random() - 0.5) * 2;
        
        // Albedo shadow
        aCtx.fillStyle = 'rgba(0,0,0,0.1)';
        aCtx.fillRect(x + jX, y + jY, 1.5, 1.5);

        // Bump dome
        bCtx.drawImage(pebbleCanvas, x + jX - pebbleSize, y + jY - pebbleSize);
      }
    }

    // --- DRAW RIBS ---
    [aCtx, bCtx].forEach((ctx, idx) => {
      ctx.strokeStyle = idx === 0 ? product.ribColor : '#000000';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      const curveWidth = width / 3.2;
      const curveHeight = height / 5.5;
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 4, curveWidth, curveHeight, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(width / 2, (height * 3) / 4, curveWidth, curveHeight, 0, 0, Math.PI * 2);
      ctx.stroke();
    });

    const map = new THREE.CanvasTexture(albedoCanvas);
    const bumpMap = new THREE.CanvasTexture(bumpCanvas);
    
    map.anisotropy = 4;
    bumpMap.anisotropy = 4;
    
    return { map, bumpMap, roughnessMap: bumpMap };
  }, [product.ballColor, product.ribColor]);
}

const Ball = memo(({ product, isInteracting, meshRef }: { product: Product; isInteracting: boolean; meshRef: React.RefObject<THREE.Mesh> }) => {
  const { map, bumpMap, roughnessMap } = useBasketballTextures(product);

  useFrame((state, delta) => {
    if (meshRef.current && !isInteracting) {
      // Smooth auto-rotation when not interacting
      meshRef.current.rotation.y += delta * 0.25;
    }
  });

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
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[2.3, 48, 48]} />
      <meshPhysicalMaterial
        map={map}
        bumpMap={bumpMap}
        bumpScale={0.12}
        roughnessMap={roughnessMap}
        roughness={1.0}
        metalness={0.0}
        clearcoat={0.1}
        clearcoatRoughness={0.5}
        envMapIntensity={1.5}
        reflectivity={0.2}
        sheen={0.8}
        sheenRoughness={0.5}
        sheenColor={new THREE.Color(product.ballColor).multiplyScalar(1.2)}
      />
    </mesh>
  );
});

export default function Basketball3D({ product }: { product: Product }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [dpr, setDpr] = useState(1.5);
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <div className="relative w-[280px] h-[280px] sm:w-[600px] sm:h-[600px] z-20 cursor-grab active:cursor-grabbing">
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
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          rotateSpeed={0.8}
          makeDefault
          onStart={() => setIsInteracting(true)}
          onEnd={() => setIsInteracting(false)}
        />

        <Environment resolution={128}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer form="rect" intensity={2} position={[10, 2, 1]} scale={[10, 2, 1]} rotation-y={Math.PI / 2} />
            <Lightformer form="rect" intensity={2} position={[-10, 2, 1]} scale={[10, 2, 1]} rotation-y={-Math.PI / 2} />
            <Lightformer form="rect" intensity={10} position={[0, 10, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
          </group>
        </Environment>

        <ambientLight intensity={0.2} />
        
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={3} 
          castShadow 
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0001}
        />
        
        <pointLight position={[-10, -5, 5]} intensity={2} color={product.accentColor} />
        <directionalLight position={[0, 5, -10]} intensity={4} color="#ffffff" />
        
        <ContactShadows 
          position={[0, -3.5, 0]} 
          opacity={0.6} 
          scale={10} 
          blur={2.5} 
          far={4} 
          color="#000000"
          resolution={128}
        />
        
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.2}>
          <Ball product={product} isInteracting={isInteracting} meshRef={meshRef} />
        </Float>
      </Canvas>
    </div>
  );
}





