
import React from 'react';

interface ControlsProps {
  isPlaying: boolean;
  onStart: () => void;
  sensitivity: number;
  setSensitivity: (s: number) => void;
  toggleFullscreen: () => void;
  onHideUI: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  onStart,
  sensitivity,
  setSensitivity,
  toggleFullscreen,
  onHideUI
}) => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-orange-500/30 shadow-[0_0_30px_rgba(255,100,0,0.2)] text-orange-50 z-50 transition-all duration-300">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-wider uppercase text-orange-500 drop-shadow-sm">Anime Fire</h1>
        <button 
          onClick={onHideUI}
          className="text-white/70 hover:text-orange-400 transition-colors"
          title="Hide UI"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Start Button Area */}
      {!isPlaying ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <p className="text-white/80 text-center text-sm mb-2">
            Click start to ignite the visualizer.
          </p>
          <button
            onClick={onStart}
            className="group relative px-8 py-3 rounded-full bg-orange-600 hover:bg-orange-500 border border-orange-400/50 transition-all duration-300 shadow-lg hover:shadow-orange-500/40"
          >
             <span className="relative text-lg font-bold tracking-wider text-white">IGNITE</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Mic Gain Slider */}
          <div className="space-y-3">
             <div className="flex justify-between items-end text-orange-100/80 px-1">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest font-bold text-orange-500">Mic Gain</span>
                  <span className="text-[10px] text-white/40">Quiet Room &harr; Loud Club</span>
                </div>
                <span className="text-xl font-mono text-orange-400">{sensitivity.toFixed(1)}x</span>
             </div>
             
             {/* Logarithmic-feeling slider mapping handled visually */}
             <div className="relative w-full h-8 flex items-center">
                <input
                  type="range"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 z-10"
                />
                {/* Scale markers */}
                <div className="absolute top-1/2 left-0 w-full transform -translate-y-1/2 flex justify-between px-1 pointer-events-none">
                  <div className="w-0.5 h-3 bg-white/20"></div>
                  <div className="w-0.5 h-2 bg-white/10"></div>
                  <div className="w-0.5 h-2 bg-white/10"></div>
                  <div className="w-0.5 h-2 bg-white/10"></div>
                  <div className="w-0.5 h-3 bg-white/20"></div>
                </div>
             </div>
             <p className="text-[10px] text-center text-white/40 pt-1">
               Adjust down for loud noise (90dB+), up for silence.
             </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-center">
             <button
               onClick={toggleFullscreen}
               className="flex items-center space-x-2 text-sm text-orange-100/80 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-6 py-2 rounded-lg border border-white/5"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span>Fullscreen</span>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Controls;
