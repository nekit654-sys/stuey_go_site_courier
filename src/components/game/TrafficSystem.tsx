import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Car {
  id: number;
  position: THREE.Vector3;
  rotation: number;
  speed: number;
  lane: number;
  direction: 'horizontal' | 'vertical';
  color: string;
}

interface TrafficLight {
  position: [number, number, number];
  state: 'red' | 'yellow' | 'green';
  timer: number;
  direction: 'ns' | 'ew';
}

export function TrafficSystem() {
  const carsRef = useRef<Car[]>([]);
  const trafficLightsRef = useRef<TrafficLight[]>([]);
  const timeRef = useRef(0);

  const carColors = ['#ff0000', '#0000ff', '#ffff00', '#00ff00', '#ff00ff', '#00ffff', '#ffa500'];
  
  useMemo(() => {
    for (let i = 0; i < 20; i++) {
      const isHorizontal = Math.random() > 0.5;
      const lane = Math.floor(Math.random() * 6) - 3;
      
      carsRef.current.push({
        id: i,
        position: new THREE.Vector3(
          isHorizontal ? (Math.random() - 0.5) * 300 : lane * 30,
          0.5,
          isHorizontal ? lane * 30 : (Math.random() - 0.5) * 300
        ),
        rotation: isHorizontal ? 0 : Math.PI / 2,
        speed: 3 + Math.random() * 2,
        lane,
        direction: isHorizontal ? 'horizontal' : 'vertical',
        color: carColors[Math.floor(Math.random() * carColors.length)]
      });
    }

    const intersections = [
      { x: 0, z: 0 },
      { x: 60, z: 0 },
      { x: -60, z: 0 },
      { x: 0, z: 60 },
      { x: 0, z: -60 },
      { x: 60, z: 60 },
      { x: -60, z: -60 }
    ];

    intersections.forEach((pos, idx) => {
      trafficLightsRef.current.push({
        position: [pos.x, 4, pos.z],
        state: idx % 2 === 0 ? 'green' : 'red',
        timer: 0,
        direction: idx % 2 === 0 ? 'ns' : 'ew'
      });
    });
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;

    trafficLightsRef.current.forEach(light => {
      light.timer += delta;
      
      if (light.timer > 8) {
        if (light.state === 'green') {
          light.state = 'yellow';
          light.timer = 0;
        } else if (light.state === 'yellow' && light.timer > 2) {
          light.state = 'red';
          light.timer = 0;
        } else if (light.state === 'red' && light.timer > 8) {
          light.state = 'green';
          light.timer = 0;
        }
      }
    });

    carsRef.current.forEach(car => {
      if (car.direction === 'horizontal') {
        car.position.x += car.speed * delta;
        if (car.position.x > 180) car.position.x = -180;
      } else {
        car.position.z += car.speed * delta;
        if (car.position.z > 180) car.position.z = -180;
      }
    });
  });

  return (
    <group>
      {carsRef.current.map((car) => (
        <group key={car.id} position={car.position.toArray()} rotation={[0, car.rotation, 0]}>
          <mesh castShadow>
            <boxGeometry args={[2, 1.2, 4]} />
            <meshStandardMaterial color={car.color} metalness={0.6} roughness={0.4} />
          </mesh>
          
          <mesh position={[0, 0.6, 0.5]} castShadow>
            <boxGeometry args={[1.8, 0.8, 1.5]} />
            <meshStandardMaterial color={car.color} metalness={0.3} roughness={0.6} />
          </mesh>
          
          <mesh position={[0.7, -0.4, 1.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[-0.7, -0.4, 1.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0.7, -0.4, -1.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[-0.7, -0.4, -1.2]}>
            <cylinderGeometry args={[0.3, 0.3, 0.2, 16]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          
          <mesh position={[0, 0.2, 1.9]}>
            <boxGeometry args={[1.5, 0.4, 0.1]} />
            <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.5} />
          </mesh>
          
          <mesh position={[0, 0.2, -1.9]}>
            <boxGeometry args={[1.5, 0.4, 0.1]} />
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.8} />
          </mesh>
        </group>
      ))}

      {trafficLightsRef.current.map((light, idx) => (
        <group key={idx} position={light.position}>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 4, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
          
          <mesh position={[0, 2.5, 0]} castShadow>
            <boxGeometry args={[0.6, 1.8, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          
          <mesh position={[0, 3, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial 
              color={light.state === 'red' ? '#ff0000' : '#330000'}
              emissive={light.state === 'red' ? '#ff0000' : '#000000'}
              emissiveIntensity={light.state === 'red' ? 1.5 : 0}
            />
          </mesh>
          
          <mesh position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial 
              color={light.state === 'yellow' ? '#ffff00' : '#333300'}
              emissive={light.state === 'yellow' ? '#ffff00' : '#000000'}
              emissiveIntensity={light.state === 'yellow' ? 1.5 : 0}
            />
          </mesh>
          
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial 
              color={light.state === 'green' ? '#00ff00' : '#003300'}
              emissive={light.state === 'green' ? '#00ff00' : '#000000'}
              emissiveIntensity={light.state === 'green' ? 1.5 : 0}
            />
          </mesh>

          {light.state === 'red' && (
            <pointLight position={[0, 3, 0]} color="#ff0000" intensity={2} distance={10} />
          )}
          {light.state === 'yellow' && (
            <pointLight position={[0, 2.5, 0]} color="#ffff00" intensity={2} distance={10} />
          )}
          {light.state === 'green' && (
            <pointLight position={[0, 2, 0]} color="#00ff00" intensity={2} distance={10} />
          )}
        </group>
      ))}
    </group>
  );
}
