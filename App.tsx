
import React, { useState, useEffect, useCallback } from 'react';
import { useAudio } from './hooks/useAudio';
import Visualizer from './components/Visualizer';
import Controls from './components/Controls';

function App() {
  const { audioState, startAudio, error } = useAudio();
  const [sensitivity, setSensitivity] = useState<number>(2.0);
  const [uiVisible, setUiVisible] = useState<boolean>(true);
  
  // Ref for the fullscreen container
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      // Auto hide UI on fullscreen enter
      setUiVisible(false);
    } else {
      document.exitFullscreen();
      setUiVisible(true);
    }
  }, []);

  // Listen for escape key or fullscreen change events to sync UI state
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setUiVisible(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#1a0b0b] overflow-hidden select-none">
      
      {/* Background Visualizer */}
      <Visualizer 
        analyser={audioState.analyser} 
        sensitivity={sensitivity}
      />

      {/* Error Message */}
      {error && (
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-500/80 backdrop-blur-md text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Main Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <Controls
          isPlaying={audioState.isPlaying}
          onStart={startAudio}
          sensitivity={sensitivity}
          setSensitivity={setSensitivity}
          toggleFullscreen={toggleFullscreen}
          onHideUI={() => setUiVisible(false)}
        />
      </div>

      {/* Persistent "Show UI" Toggle (Visible when UI is hidden) */}
      {!uiVisible && (
        <button
          onClick={() => setUiVisible(true)}
          className="absolute bottom-6 right-6 p-3 rounded-full bg-orange-900/40 hover:bg-orange-600/60 backdrop-blur-md border border-orange-500/30 text-orange-100 transition-all z-50 group"
          title="Show Controls"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {/* Exit Fullscreen Button (Only visible in fullscreen if UI is hidden, top right) */}
      {!uiVisible && document.fullscreenElement && (
         <button 
           onClick={() => document.exitFullscreen()}
           className="absolute top-6 right-6 p-2 rounded-lg bg-black/20 text-white/50 hover:text-white hover:bg-black/40 z-50"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
      )}

    </div>
  );
}

export default App;
