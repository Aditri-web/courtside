export interface SpeechRecognitionListener {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export const isSpeechAvailable = (): boolean => {
  return false;
};

export const startListening = (_listener: SpeechRecognitionListener): (() => void) => {
  console.log('[Speech] Native voice recognition not supported in this runtime. Fallback to on-screen chips/keyboard.');
  return () => {};
};
