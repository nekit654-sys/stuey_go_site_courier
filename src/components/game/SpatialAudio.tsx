import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpatialAudioProps {
  enabled: boolean;
  volume: number;
}

export function SpatialAudio({ enabled, volume }: SpatialAudioProps) {
  const { camera } = useThree();
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioListenerRef = useRef<THREE.AudioListener | null>(null);
  const ambientSoundsRef = useRef<Map<string, THREE.Audio>>(new Map());
  const soundBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (!audioListenerRef.current) {
      audioListenerRef.current = new THREE.AudioListener();
      camera.add(audioListenerRef.current);
    }

    const loadSound = async (name: string, url: string) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        soundBuffersRef.current.set(name, audioBuffer);
      } catch (error) {
        console.error(`Failed to load sound ${name}:`, error);
      }
    };

    const ambientSounds = {
      cityAmbience: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      traffic: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
      birds: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA='
    };

    Object.entries(ambientSounds).forEach(([name, url]) => {
      loadSound(name, url);
    });

    (window as any).create3DSound = (
      position: THREE.Vector3,
      soundType: 'car' | 'horn' | 'traffic_light' | 'footsteps',
      distance: number = 20
    ) => {
      if (!enabled || !audioListenerRef.current) return null;

      const sound = new THREE.PositionalAudio(audioListenerRef.current);
      sound.setRefDistance(distance);
      sound.setRolloffFactor(1);
      sound.setDistanceModel('exponential');
      sound.setVolume(volume);

      return sound;
    };

    return () => {
      ambientSoundsRef.current.forEach(sound => {
        if (sound.isPlaying) sound.stop();
      });
      ambientSoundsRef.current.clear();
      
      if (audioListenerRef.current && camera) {
        camera.remove(audioListenerRef.current);
      }
    };
  }, [camera, enabled, volume]);

  useFrame(() => {
    if (!enabled || !audioListenerRef.current) return;
    
    ambientSoundsRef.current.forEach((sound, name) => {
      if (sound && !sound.isPlaying && enabled) {
        sound.play();
      }
      if (sound) {
        sound.setVolume(volume);
      }
    });
  });

  return null;
}

export const create3DSound = (
  position: THREE.Vector3,
  soundType: 'car' | 'horn' | 'traffic_light' | 'footsteps',
  distance: number = 20
) => {
  if ((window as any).create3DSound) {
    return (window as any).create3DSound(position, soundType, distance);
  }
  return null;
};
