export interface SpeechRecognitionListener {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export const isSpeechAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
};

export const startListening = (listener: SpeechRecognitionListener): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    listener.onError?.('Speech recognition not supported in this browser');
    return () => {};
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      listener.onResult(transcript);
    };

    recognition.onerror = (event: any) => {
      listener.onError?.(event.error);
    };

    recognition.onend = () => {
      listener.onEnd?.();
    };

    recognition.start();

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    };
  } catch (err) {
    listener.onError?.((err as Error).message);
    return () => {};
  }
};
