// @ts-nocheck
import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { SeedData } from '../hooks/useFingerprint';

interface PrismProps {
  seedData: SeedData;
  isLoading: boolean;
}

const GeometricPrism = ({ seedData, isLoading }: PrismProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  const { viewport } = useThree();

  const geometry = useMemo(() => {
    switch (seedData.shape) {
      case 'sphere':
        return new THREE.SphereGeometry(2, 64, 64);
      case 'cube':
        return new THREE.BoxGeometry(3, 3, 3);
      case 'torus':
        return new THREE.TorusGeometry(2, 0.6, 32, 100);
      case 'octahedron':
        return new THREE.OctahedronGeometry(2.5);
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(2.5, Math.floor(seedData.complexity * 3));
      default:
        return new THREE.SphereGeometry(2, 64, 64);
    }
  }, [seedData.shape, seedData.complexity]);

  const wireframeGeometry = useMemo(() => {
    const geo = geometry.clone();
    return new THREE.WireframeGeometry(geo);
  }, [geometry]);

  const color = useMemo(() => {
    return new THREE.Color(`hsl(${seedData.colorHue}, ${seedData.colorSaturation}%, 60%)`);
  }, [seedData.colorHue, seedData.colorSaturation]);

  const emissiveColor = useMemo(() => {
    return new THREE.Color(`hsl(${seedData.colorHue}, ${seedData.colorSaturation}%, 30%)`);
  }, [seedData.colorHue, seedData.colorSaturation]);

  const secondaryColor = useMemo(() => {
    return new THREE.Color(`hsl(${(seedData.colorHue + 180) % 360}, 70%, 60%)`);
  }, [seedData.colorHue]);

  useFrame((state) => {
    if (meshRef.current && !isLoading) {
      meshRef.current.rotation.x += seedData.rotationSpeed;
      meshRef.current.rotation.y += seedData.rotationSpeed * 1.5;

      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      meshRef.current.scale.set(scale, scale, scale);
    }

    if (wireframeRef.current && !isLoading) {
      wireframeRef.current.rotation.x = meshRef.current?.rotation.x || 0;
      wireframeRef.current.rotation.y = meshRef.current?.rotation.y || 0;
    }
  });

  if (isLoading) {
    return (
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>
    );
  }

  return (
    <group>
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        <mesh ref={meshRef} geometry={geometry}>
          <meshStandardMaterial
            color={color}
            emissive={emissiveColor}
            emissiveIntensity={seedData.glowIntensity}
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.9}
          />
        </mesh>

        {seedData.wireframe && (
          <lineSegments ref={wireframeRef} geometry={wireframeGeometry}>
            <lineBasicMaterial color={secondaryColor} linewidth={2} transparent opacity={0.8} />
          </lineSegments>
        )}

        {!seedData.wireframe && (
          <mesh scale={1.05}>
            <primitive object={geometry.clone()} />
            <meshBasicMaterial
              color={secondaryColor}
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        )}
      </Float>

      <pointLight
        position={[5, 5, 5]}
        intensity={2 * seedData.brightness}
        color={color}
        distance={20}
      />
      <pointLight
        position={[-5, -5, -5]}
        intensity={1.5 * seedData.brightness}
        color={secondaryColor}
        distance={20}
      />
      <pointLight
        position={[0, 5, -5]}
        intensity={1 * seedData.brightness}
        color="#38bdf8"
        distance={15}
      />
    </group>
  );
};

const ParticleField = ({ seedData }: { seedData: SeedData }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const particleCount = 500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 8 + Math.random() * 8;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3);
    const color = new THREE.Color(`hsl(${seedData.colorHue}, 80%, 60%)`);
    const secondary = new THREE.Color(`hsl(${(seedData.colorHue + 180) % 360}, 70%, 60%)`);

    for (let i = 0; i < particleCount; i++) {
      const c = Math.random() > 0.5 ? color : secondary;
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    return cols;
  }, [seedData.colorHue]);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0005;
      particlesRef.current.rotation.x += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const PrismCanvas = ({ seedData, isLoading }: PrismProps) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      <Suspense fallback={null}>
        <GeometricPrism seedData={seedData} isLoading={isLoading} />
        <ParticleField seedData={seedData} />
      </Suspense>

      <Stars
        radius={50}
        depth={50}
        count={2000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!isLoading}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />

      <fog attach="fog" args={['#0f172a', 10, 30]} />
    </Canvas>
  );
};
