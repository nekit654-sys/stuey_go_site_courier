import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Центральный игровой движок - единственный useFrame для всей игры
 * Управляет всеми системами из одного места для максимальной производительности
 */

interface GameEngineProps {
  vehicles: Array<{
    position: THREE.Vector3;
    rotation: number;
    speed: number;
    direction: 'n' | 's' | 'e' | 'w';
    stopped: boolean;
  }>;
  pedestrians: Array<{
    position: THREE.Vector3;
    direction: 'n' | 's' | 'e' | 'w';
    speed: number;
    stopped: boolean;
  }>;
  trafficLights: Array<{
    id: string;
    state: 'red' | 'yellow' | 'green';
    timer: number;
    direction: 'ns' | 'ew';
  }>;
  playerPosition: { x: number; z: number };
  onTrafficUpdate?: (lights: any[]) => void;
  onVehicleUpdate?: (vehicles: any[]) => void;
  onPedestrianUpdate?: (pedestrians: any[]) => void;
}

export function GameEngine({
  vehicles,
  pedestrians,
  trafficLights,
  playerPosition,
  onTrafficUpdate,
  onVehicleUpdate,
  onPedestrianUpdate
}: GameEngineProps) {
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // 1. Обновление светофоров (каждые 0.1 сек)
    if (timeRef.current % 0.1 < delta) {
      const updatedLights = trafficLights.map(light => {
        let newTimer = light.timer - delta;
        let newState = light.state;
        
        if (newTimer <= 0) {
          if (light.state === 'green') {
            newState = 'yellow';
            newTimer = 2;
          } else if (light.state === 'yellow') {
            newState = 'red';
            newTimer = 8;
          } else {
            newState = 'green';
            newTimer = 10;
          }
        }
        
        return { ...light, state: newState, timer: newTimer };
      });
      
      onTrafficUpdate?.(updatedLights);
    }
    
    // 2. Обновление транспорта
    const updatedVehicles = vehicles.map(vehicle => {
      if (vehicle.stopped) return vehicle;
      
      let dx = 0, dz = 0;
      
      switch (vehicle.direction) {
        case 'n': dz = -vehicle.speed * delta; break;
        case 's': dz = vehicle.speed * delta; break;
        case 'e': dx = vehicle.speed * delta; break;
        case 'w': dx = -vehicle.speed * delta; break;
      }
      
      vehicle.position.x += dx;
      vehicle.position.z += dz;
      
      // Телепорт за границы
      if (vehicle.position.x > 80) vehicle.position.x = -80;
      if (vehicle.position.x < -80) vehicle.position.x = 80;
      if (vehicle.position.z > 80) vehicle.position.z = -80;
      if (vehicle.position.z < -80) vehicle.position.z = 80;
      
      return vehicle;
    });
    
    onVehicleUpdate?.(updatedVehicles);
    
    // 3. Обновление пешеходов
    const updatedPedestrians = pedestrians.map(ped => {
      if (ped.stopped) return ped;
      
      let dx = 0, dz = 0;
      
      switch (ped.direction) {
        case 'n': dz = -ped.speed * delta; break;
        case 's': dz = ped.speed * delta; break;
        case 'e': dx = ped.speed * delta; break;
        case 'w': dx = -ped.speed * delta; break;
      }
      
      ped.position.x += dx;
      ped.position.z += dz;
      
      return ped;
    });
    
    onPedestrianUpdate?.(updatedPedestrians);
  });
  
  return null;
}
