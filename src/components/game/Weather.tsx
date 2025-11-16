import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WeatherProps {
  type: 'clear' | 'rain' | 'snow' | 'fog';
}

function RainParticle({ startPos }: { startPos: [number, number, number] }) {
  const particleRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (particleRef.current) {
      particleRef.current.position.y -= 0.5;
      
      if (particleRef.current.position.y < 0) {
        particleRef.current.position.y = 30 + Math.random() * 10;
        particleRef.current.position.x = (Math.random() - 0.5) * 100;
        particleRef.current.position.z = (Math.random() - 0.5) * 100;
      }
    }
  });

  return (
    <mesh ref={particleRef} position={startPos}>
      <cylinderGeometry args={[0.02, 0.02, 0.8]} />
      <meshStandardMaterial color="#60A5FA" transparent opacity={0.6} />
    </mesh>
  );
}

function SnowParticle({ startPos }: { startPos: [number, number, number] }) {
  const particleRef = useRef<THREE.Mesh>(null);
  const driftRef = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (particleRef.current) {
      const time = state.clock.getElapsedTime();
      particleRef.current.position.y -= 0.1;
      particleRef.current.position.x += Math.sin(time + driftRef.current) * 0.02;
      particleRef.current.position.z += Math.cos(time + driftRef.current) * 0.02;
      
      if (particleRef.current.position.y < 0) {
        particleRef.current.position.y = 30 + Math.random() * 10;
        particleRef.current.position.x = (Math.random() - 0.5) * 100;
        particleRef.current.position.z = (Math.random() - 0.5) * 100;
      }
    }
  });

  return (
    <mesh ref={particleRef} position={startPos}>
      <sphereGeometry args={[0.1, 6, 6]} />
      <meshStandardMaterial color="#FFFFFF" transparent opacity={0.9} />
    </mesh>
  );
}

function Cloud({ position, size }: { position: [number, number, number], size: number }) {
  const cloudRef = useRef<THREE.Group>(null);
  const speedRef = useRef(0.01 + Math.random() * 0.02);

  useFrame(() => {
    if (cloudRef.current) {
      cloudRef.current.position.x += speedRef.current;
      
      if (cloudRef.current.position.x > 80) {
        cloudRef.current.position.x = -80;
      }
    }
  });

  return (
    <group ref={cloudRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[size * 0.8, 0.2, 0]}>
        <sphereGeometry args={[size * 0.7, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-size * 0.8, -0.1, 0]}>
        <sphereGeometry args={[size * 0.6, 8, 8]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

export function Weather({ type }: WeatherProps) {
  const rainParticles = useMemo(() => {
    if (type !== 'rain') return [];
    return Array.from({ length: 50 }, () => ({
      pos: [
        (Math.random() - 0.5) * 60,
        Math.random() * 20,
        (Math.random() - 0.5) * 60
      ] as [number, number, number]
    }));
  }, [type]);

  const snowParticles = useMemo(() => {
    if (type !== 'snow') return [];
    return Array.from({ length: 40 }, () => ({
      pos: [
        (Math.random() - 0.5) * 60,
        Math.random() * 20,
        (Math.random() - 0.5) * 60
      ] as [number, number, number]
    }));
  }, [type]);

  const clouds = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 80,
        22 + Math.random() * 5,
        (Math.random() - 0.5) * 80
      ] as [number, number, number],
      size: 2 + Math.random() * 2
    }));
  }, []);

  return (
    <group>
      {type === 'rain' && rainParticles.map((particle, i) => (
        <RainParticle key={i} startPos={particle.pos} />
      ))}
      
      {type === 'snow' && snowParticles.map((particle, i) => (
        <SnowParticle key={i} startPos={particle.pos} />
      ))}
      
      {(type === 'rain' || type === 'snow' || type === 'fog') && clouds.map((cloud, i) => (
        <Cloud key={i} position={cloud.pos} size={cloud.size} />
      ))}
      
      {type === 'fog' && (
        <fog attach="fog" args={['#E5E7EB', 10, 60]} />
      )}
    </group>
  );
}