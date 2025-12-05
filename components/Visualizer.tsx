
import React, { useRef, useEffect } from 'react';
import { FFT_SIZE, ANIME_FIRE_PALETTE } from '../constants';

interface VisualizerProps {
  analyser: AnalyserNode | null;
  sensitivity: number;
}

// Declare p5 globally for TypeScript
declare global {
  interface Window {
    p5: any;
  }
}

const Visualizer: React.FC<VisualizerProps> = ({ analyser, sensitivity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!window.p5 || !containerRef.current) return;

    const sketch = (p: any) => {
      // Configuration
      const PIXEL_SIZE = 8; // Size of "pixels" for the retro anime look
      let cols: number, rows: number;
      let noiseZ = 0; // Time dimension
      let particles: any[] = [];
      
      // Color objects
      let cBg: any, cDark: any, cMid: any, cLight: any, cCore: any;

      p.setup = () => {
        const w = containerRef.current?.clientWidth || window.innerWidth;
        const h = containerRef.current?.clientHeight || window.innerHeight;
        p.createCanvas(w, h);
        p.noStroke();
        
        // Initialize colors
        cBg = p.color(ANIME_FIRE_PALETTE.bg);
        cDark = p.color(ANIME_FIRE_PALETTE.dark);
        cMid = p.color(ANIME_FIRE_PALETTE.mid);
        cLight = p.color(ANIME_FIRE_PALETTE.light);
        cCore = p.color(ANIME_FIRE_PALETTE.core);

        cols = Math.ceil(w / PIXEL_SIZE);
        rows = Math.ceil(h / PIXEL_SIZE);

        // Init sparks
        for (let i = 0; i < 30; i++) {
          particles.push(createSpark());
        }
      };

      p.windowResized = () => {
        const w = containerRef.current?.clientWidth || window.innerWidth;
        const h = containerRef.current?.clientHeight || window.innerHeight;
        p.resizeCanvas(w, h);
        cols = Math.ceil(w / PIXEL_SIZE);
        rows = Math.ceil(h / PIXEL_SIZE);
      };

      function createSpark() {
        return {
          x: p.random(p.width),
          y: p.random(p.height, p.height + 200),
          size: p.random(4, 12),
          speed: p.random(5, 15),
          wobble: p.random(0, 100)
        };
      }

      p.draw = () => {
        p.background(cBg);

        // 1. Audio Data
        let volume = 0;
        let bass = 0;
        let high = 0;
        
        if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
          volume = sum / bufferLength;

          // Bass (Low freq)
          let bassSum = 0;
          for(let i=0; i<20; i++) bassSum += dataArray[i];
          bass = bassSum / 20;

          // Highs (for sparks)
          let highSum = 0;
          for(let i=100; i<200; i++) highSum += dataArray[i];
          high = highSum / 100;
        }

        // 2. Normalization with Gain (Sensitivity)
        // Gain range is 0.1 to 10. 
        // For quiet rooms, gain is high. For loud inputs, gain is low.
        const volNorm = p.constrain(p.map(volume, 0, 255, 0, 1) * sensitivity, 0, 1.5);
        const bassNorm = p.constrain(p.map(bass, 0, 255, 0, 1) * sensitivity, 0, 1.5);
        
        // Speed of fire increases with volume
        noiseZ -= 0.08 + (volNorm * 0.15);

        // 3. Draw Fire (Pixel Grid)
        // We use nested loops but render distinct rectangles for that "pixel art" feel
        const scaleBase = 0.02; // Noise zoom

        // Optimization: Don't draw pixels that are basically background
        // Vertical gradient mask: bottom is white hot, top is dark
        
        for (let y = 0; y < rows; y++) {
          // Normalize Y (0 at top, 1 at bottom)
          const ny = y / rows; 
          
          // Optimization: Skip top 20% if low volume
          if (ny < 0.2 - (volNorm * 0.1)) continue;

          for (let x = 0; x < cols; x++) {
            const nx = x / cols;
            
            // Horizontal centering mask (shaped like a flame, wide bottom, narrow top)
            // Distance from center 0.5
            const dx = Math.abs(nx - 0.5);
            // Flames are wider at bottom (ny=1)
            const widthAtHeight = p.map(ny, 0, 1, 0.2, 0.8) + (bassNorm * 0.3); 
            
            // If outside the general cone, skip calculation to save FPS
            if (dx > widthAtHeight) continue;

            // Perlin Noise
            // We distort X based on Y to make it look like rising smoke/fire
            const noiseVal = p.noise(
              x * scaleBase, 
              y * scaleBase * 2.5 + noiseZ, // Stretch Y for upward flow
              noiseZ * 0.2
            );

            // Combine Noise + Vertical Gradient + Audio
            // Higher value = hotter color
            // ny * 1.5 makes bottom hotter
            // (1 - dx) makes center hotter
            let heat = (noiseVal * 0.6) + (ny * 0.8) + ((1 - dx) * 0.5);
            
            // Apply Audio boost to heat
            heat += volNorm * 0.8;
            
            // Sharp Thresholds (Cel Shading)
            if (heat < 1.0) {
                // Background (Transparent/Dark)
                continue; 
            } else if (heat < 1.3) {
                p.fill(cDark);
                p.rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            } else if (heat < 1.6) {
                p.fill(cMid);
                p.rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            } else if (heat < 2.0) {
                p.fill(cLight);
                p.rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            } else {
                p.fill(cCore);
                p.rect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
            }
          }
        }

        // 4. Draw Sparks
        // Fast moving particles layered on top
        p.fill(cLight);
        particles.forEach((pt: any) => {
          // Move Up
          pt.y -= pt.speed + (bassNorm * 10);
          // Wiggle
          pt.x += Math.sin(p.millis() * 0.01 + pt.wobble) * 2;

          // Reset if off screen
          if (pt.y < -50) {
            pt.y = p.height + 50;
            pt.x = p.random(p.width * 0.2, p.width * 0.8);
          }

          // Draw Diamond shape for anime feel
          let s = pt.size * (0.5 + bassNorm);
          p.push();
          p.translate(pt.x, pt.y);
          p.rotate(p.PI / 4);
          p.rect(0, 0, s, s);
          p.pop();
        });
      };
    };

    p5InstanceRef.current = new window.p5(sketch, containerRef.current);

    return () => {
      if (p5InstanceRef.current) p5InstanceRef.current.remove();
    };
  }, [analyser, sensitivity]);

  return (
    <div 
      ref={containerRef} 
      className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden bg-[#1a0b0b]"
    />
  );
};

export default Visualizer;
