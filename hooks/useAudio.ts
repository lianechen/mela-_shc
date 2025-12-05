import { useState, useRef, useCallback } from 'react';
import { FFT_SIZE } from '../constants';
import { AudioContextState } from '../types';

export const useAudio = () => {
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const [audioState, setAudioState] = useState<AudioContextState>({
    isInitialized: false,
    isPlaying: false,
    analyser: null,
    dataArray: null,
    volume: 0,
  });

  const startAudio = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.85; // Makes the visuals smoother

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      // We do NOT connect to ctx.destination to avoid feedback loops

      sourceRef.current = source;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      setAudioState({
        isInitialized: true,
        isPlaying: true,
        analyser: analyser,
        dataArray: dataArray,
        volume: 0,
      });

      setError(null);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied or not available. Please allow permissions to use the visualizer.");
      setAudioState(prev => ({ ...prev, isInitialized: false, isPlaying: false }));
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
    }
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  return { audioState, startAudio, stopAudio, error };
};
