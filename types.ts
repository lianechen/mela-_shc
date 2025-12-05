
export interface AudioContextState {
  isInitialized: boolean;
  isPlaying: boolean;
  analyser: AnalyserNode | null;
  dataArray: Uint8Array | null;
  volume: number;
}
