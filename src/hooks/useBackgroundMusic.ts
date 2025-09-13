import { useCallback, useRef, useEffect } from 'react';

export const useBackgroundMusic = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const nextNoteTimeRef = useRef(0);
  const currentNoteRef = useRef(0);
  const tempoRef = useRef(120); // BPM
  
  // Простая мелодия для фоновой музыки (частоты нот)
  const melody = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    659.25, // E5
    698.46, // F5
    659.25, // E5
    587.33, // D5
    523.25, // C5
  ];
  
  const scheduleNote = useCallback((time: number) => {
    if (!audioContextRef.current || !isPlayingRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const noteGain = audioContextRef.current.createGain();
    
    oscillator.connect(noteGain);
    noteGain.connect(gainNodeRef.current!);
    
    const frequency = melody[currentNoteRef.current % melody.length];
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Настройка громкости ноты
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.15, time + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
    
    oscillator.start(time);
    oscillator.stop(time + 0.5);
    
    currentNoteRef.current++;
  }, [melody]);
  
  const scheduler = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return;
    
    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
      scheduleNote(nextNoteTimeRef.current);
      const secondsPerBeat = 60.0 / tempoRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
    }
    
    if (isPlayingRef.current) {
      requestAnimationFrame(scheduler);
    }
  }, [scheduleNote]);
  
  const startMusic = useCallback(async () => {
    if (isPlayingRef.current) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = 0.3; // Тихая фоновая музыка
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      isPlayingRef.current = true;
      nextNoteTimeRef.current = audioContextRef.current.currentTime;
      currentNoteRef.current = 0;
      
      scheduler();
    } catch (error) {
      console.warn('Background music failed to start:', error);
    }
  }, [scheduler]);
  
  const stopMusic = useCallback(async () => {
    if (!isPlayingRef.current) return;
    
    isPlayingRef.current = false;
    
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
      audioContextRef.current = null;
      gainNodeRef.current = null;
    }
  }, []);
  
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);
  
  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);
  
  return {
    startMusic,
    stopMusic,
    setVolume,
    isPlaying: isPlayingRef.current
  };
};