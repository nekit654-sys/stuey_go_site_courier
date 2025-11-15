import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DayNightCycleProps {
  timeOfDay: number; // 0-24
  onTimeChange: (time: number) => void;
}

export function DayNightCycle({ timeOfDay, onTimeChange }: DayNightCycleProps) {
  const sunRef = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const newTime = timeOfDay + delta * 0.5;
    const wrappedTime = newTime >= 24 ? newTime - 24 : newTime;
    onTimeChange(wrappedTime);

    if (sunRef.current && moonRef.current) {
      const sunAngle = (wrappedTime / 24) * Math.PI * 2 - Math.PI / 2;
      const moonAngle = sunAngle + Math.PI;

      const radius = 150;
      sunRef.current.position.x = Math.cos(sunAngle) * radius;
      sunRef.current.position.y = Math.sin(sunAngle) * radius;
      sunRef.current.position.z = -50;

      moonRef.current.position.x = Math.cos(moonAngle) * radius;
      moonRef.current.position.y = Math.sin(moonAngle) * radius;
      moonRef.current.position.z = -50;

      const isDaytime = wrappedTime >= 6 && wrappedTime <= 18;
      const sunBrightness = isDaytime ? Math.sin((wrappedTime - 6) / 12 * Math.PI) : 0;
      
      if (sunRef.current.material instanceof THREE.MeshStandardMaterial) {
        sunRef.current.material.emissiveIntensity = Math.max(0.8, sunBrightness);
      }
    }
  });

  const skyColor = useMemo(() => {
    const hour = Math.floor(timeOfDay);
    if (hour >= 6 && hour < 8) return new THREE.Color(0.8, 0.5, 0.3); // Рассвет
    if (hour >= 8 && hour < 18) return new THREE.Color(0.5, 0.7, 1.0); // День
    if (hour >= 18 && hour < 20) return new THREE.Color(0.8, 0.4, 0.2); // Закат
    return new THREE.Color(0.1, 0.1, 0.2); // Ночь
  }, [timeOfDay]);

  return (
    <group>
      <mesh ref={sunRef}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshStandardMaterial color="#FDB813" emissive="#FDB813" emissiveIntensity={1.2} />
      </mesh>

      <mesh ref={moonRef}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshStandardMaterial color="#E0E0E0" emissive="#C0C0C0" emissiveIntensity={0.3} />
      </mesh>

      <color attach="background" args={[skyColor.r, skyColor.g, skyColor.b]} />
    </group>
  );
}

interface CloudProps {
  position: [number, number, number];
  speed: number;
}

function Cloud({ position, speed }: CloudProps) {
  const cloudRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (cloudRef.current) {
      cloudRef.current.position.x += speed * delta;
      
      if (cloudRef.current.position.x > 100) {
        cloudRef.current.position.x = -100;
      }
    }
  });

  return (
    <group ref={cloudRef} position={position}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[3, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>
      <mesh position={[2.5, 0.5, 0]}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>
      <mesh position={[-2, 0, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>
      <mesh position={[1, 1, 0]}>
        <sphereGeometry args={[2.8, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

export function Clouds() {
  const cloudPositions: Array<{ pos: [number, number, number]; speed: number }> = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        pos: [
          (i - 4) * 25,
          40 + Math.random() * 20,
          -60 + Math.random() * 40
        ] as [number, number, number],
        speed: 2 + Math.random() * 3
      })),
    []
  );

  return (
    <group>
      {cloudPositions.map((cloud, i) => (
        <Cloud key={i} position={cloud.pos} speed={cloud.speed} />
      ))}
    </group>
  );
}
