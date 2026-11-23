'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { resolveWebIntent } from '@/lib/intent-resolver';

type VoiceState = 'idle' | 'listening-wake' | 'responding' | 'listening-command' | 'processing';

interface DevisVoiceProps {
  onCommand?: (command: string, targetUrl?: string | null) => void;
}

/**
 * Wake words regex:
 * Matches: "hay", "hey", "hi", "hello", "hay devis", "hey devis", "hay baby", "hey devesh", "devis", "devesh", etc.
 */
const WAKE_REGEX = /\b(hay\s*devis|hey\s*devis|hay\s*baby|hey\s*baby|hay\s*devesh|hey\s*devesh|hi\s*devis|hello\s*devis|hai\s*devis|devis|devesh|davis|hay|hey|hi|hello)\b/i;

function cleanCommandText(raw: string): string {
  let cleaned = raw.trim();
  // Strip wake words at start
  cleaned = cleaned.replace(new RegExp(`^${WAKE_REGEX.source}\\s*`, 'i'), '');
  // Strip common conversational fillers
  cleaned = cleaned.replace(/^(?:please\s+|can\s+you\s+(?:please\s+)?|could\s+you\s+(?:please\s+)?)/i, '');
  cleaned = cleaned.replace(/^(?:create\s+(?:a\s+)?task\s+(?:for\s+me\s+)?(?:to\s+)?)/i, '');
  cleaned = cleaned.replace(/^(?:add\s+(?:a\s+)?task\s+(?:to\s+)?)/i, '');
  cleaned = cleaned.trim();
  return cleaned.length > 0 ? cleaned : raw.trim();
}

export function DevisVoice({ onCommand }: DevisVoiceProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const [lastWords, setLastWords] = useState('');

  // Synchronous refs to prevent stale closure bugs & multiple submissions
  const stateRef = useRef<VoiceState>('idle');
  const isEnabledRef = useRef(false);
  const isFinalizingRef = useRef(false);
  const isSpeakingRef = useRef(false);

  const wakeRecogRef = useRef<any>(null);
  const cmdRecogRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const wakeRestartTimerRef = useRef<any>(null);
  const transcriptRef = useRef('');

  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  const updateState = (newState: VoiceState) => {
    stateRef.current = newState;
    setState(newState);
  };

  // ── Text-to-Speech ────────────────────────────────────────────────────
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      utt.pitch = 1.05;
      utt.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('natural')
      );
      if (preferred) utt.voice = preferred;

      isSpeakingRef.current = true;
      utt.onend = () => {
        isSpeakingRef.current = false;
        resolve();
      };
      utt.onerror = () => {
        isSpeakingRef.current = false;
        resolve();
      };

      window.speechSynthesis.speak(utt);
    });
  }, []);

  // ── Stop All Instances Cleanly ────────────────────────────────────────
  const stopAll = useCallback(() => {
    isEnabledRef.current = false;
    isFinalizingRef.current = false;
    isSpeakingRef.current = false;

    if (wakeRestartTimerRef.current) {
      clearTimeout(wakeRestartTimerRef.current);
      wakeRestartTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      wakeRecogRef.current?.abort();
    } catch {}
    try {
      cmdRecogRef.current?.abort();
    } catch {}

    wakeRecogRef.current = null;
    cmdRecogRef.current = null;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    transcriptRef.current = '';
    updateState('idle');
    setTranscript('');
    setLastWords('');
  }, []);

  // ── Start Wake Listening (Declared as ref function to prevent circular closures) ──
  const startWakeListeningRef = useRef<() => void>(() => {});
  const startCommandListeningRef = useRef<() => void>(() => {});

  // ── Command Listening (captures command, human silence term, single finalize) ─────
  startCommandListeningRef.current = () => {
    if (!isEnabledRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    // Clean up any existing instances
    try {
      wakeRecogRef.current?.abort();
    } catch {}
    try {
      cmdRecogRef.current?.abort();
    } catch {}

    isFinalizingRef.current = false;
    transcriptRef.current = '';
    updateState('listening-command');
    setTranscript('');

    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.continuous = true;
    recog.maxAlternatives = 1;
    cmdRecogRef.current = recog;

    const finalizeCommand = async () => {
      // Guard against double invocation!
      if (isFinalizingRef.current || !isEnabledRef.current) return;
      isFinalizingRef.current = true;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Stop recognition and clear transcript ref immediately
      const rawText = transcriptRef.current.trim();
      transcriptRef.current = '';

      try {
        recog.stop();
      } catch {}

      if (!rawText) {
        // Nothing was captured -> return to wake listening safely
        if (isEnabledRef.current) {
          isFinalizingRef.current = false;
          updateState('listening-wake');
          startWakeListeningRef.current();
        }
        return;
      }

      const finalCmd = cleanCommandText(rawText);
      updateState('processing');

      // Resolve intent (e.g. YouTube search, Google search)
      const intent = resolveWebIntent(finalCmd);

      // Immediately auto-redirect / open URL in new tab
      if (intent.targetUrl) {
        try {
          window.open(intent.targetUrl, '_blank');
        } catch (e) {
          console.warn('Popup blocked, target URL:', intent.targetUrl);
        }

        if (intent.searchQuery) {
          await speak(`Opening ${intent.siteName} and searching for ${intent.searchQuery}`);
        } else {
          await speak(`Opening ${intent.siteName}`);
        }
      } else {
        await speak(`Got it. Processing: ${finalCmd}`);
      }

      // Fire single task creation to parent
      if (onCommandRef.current) {
        onCommandRef.current(finalCmd, intent.targetUrl);
      }

      // Resume wake listening after execution so user can speak again!
      setTimeout(() => {
        if (isEnabledRef.current) {
          isFinalizingRef.current = false;
          setTranscript('');
          transcriptRef.current = '';
          updateState('listening-wake');
          startWakeListeningRef.current();
        }
      }, 1500);
    };

    recog.onresult = (e: any) => {
      if (!isEnabledRef.current || isFinalizingRef.current || isSpeakingRef.current) return;

      const current = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join(' ')
        .trim();

      transcriptRef.current = current;
      setTranscript(current);

      // Human-like pause detection: 1.4s silence finishes command
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      silenceTimerRef.current = setTimeout(() => {
        finalizeCommand();
      }, 1400);
    };

    recog.onerror = (e: any) => {
      if (e.error === 'no-speech' && transcriptRef.current.trim()) {
        finalizeCommand();
      }
    };

    recog.onend = () => {
      if (!isEnabledRef.current || isFinalizingRef.current) return;
      if (transcriptRef.current.trim()) {
        finalizeCommand();
      } else if (stateRef.current === 'listening-command') {
        // Restart command listener or revert to wake listening
        startWakeListeningRef.current();
      }
    };

    try {
      recog.start();
    } catch (err) {
      console.warn('Command recognition start error:', err);
    }
  };

  // ── Wake Word Recognition Loop ───────────────────────────────────────
  startWakeListeningRef.current = () => {
    if (!isEnabledRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    try {
      wakeRecogRef.current?.abort();
    } catch {}

    const recog = new SR();
    recog.lang = 'en-US';
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;
    wakeRecogRef.current = recog;

    updateState('listening-wake');

    recog.onresult = async (e: any) => {
      if (!isEnabledRef.current || isSpeakingRef.current || isFinalizingRef.current) return;

      const text = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript.toLowerCase())
        .join(' ')
        .trim();

      setLastWords(text.slice(-50));

      const match = text.match(WAKE_REGEX);
      if (match) {
        try {
          recog.stop();
        } catch {}

        // Check if command was spoken alongside wake word in same utterance
        const afterWake = text.slice(text.indexOf(match[0]) + match[0].length).trim();
        const cleanedQuick = cleanCommandText(afterWake);

        if (cleanedQuick.length > 3) {
          // Command spoken in same breath!
          isFinalizingRef.current = true;
          updateState('processing');

          const intent = resolveWebIntent(cleanedQuick);

          if (intent.targetUrl) {
            try {
              window.open(intent.targetUrl, '_blank');
            } catch {}
            if (intent.searchQuery) {
              await speak(`Opening ${intent.siteName} for ${intent.searchQuery}`);
            } else {
              await speak(`Opening ${intent.siteName}`);
            }
          } else {
            await speak(`Sure! Creating task for ${cleanedQuick}`);
          }

          if (onCommandRef.current) {
            onCommandRef.current(cleanedQuick, intent.targetUrl);
          }

          setTimeout(() => {
            if (isEnabledRef.current) {
              isFinalizingRef.current = false;
              setTranscript('');
              transcriptRef.current = '';
              updateState('listening-wake');
              startWakeListeningRef.current();
            }
          }, 1500);
          return;
        }

        // Just wake word -> conversational greeting
        updateState('responding');
        await speak('Hey! DeVis here. What task should I create for you?');

        if (isEnabledRef.current) {
          startCommandListeningRef.current();
        }
      }
    };

    recog.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Wake recognition error:', e.error);
      }
    };

    recog.onend = () => {
      if (!isEnabledRef.current || stateRef.current !== 'listening-wake') return;

      if (wakeRestartTimerRef.current) {
        clearTimeout(wakeRestartTimerRef.current);
      }
      wakeRestartTimerRef.current = setTimeout(() => {
        if (isEnabledRef.current && stateRef.current === 'listening-wake') {
          startWakeListeningRef.current();
        }
      }, 300);
    };

    try {
      recog.start();
    } catch (err) {
      console.warn('Wake recognition start error:', err);
    }
  };

  // ── Init & Cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR && 'speechSynthesis' in window) {
      setSupported(true);
    }
    return () => {
      stopAll();
    };
  }, [stopAll]);

  // ── Toggle Mic Button ─────────────────────────────────────────────────
  const toggle = () => {
    if (!isEnabledRef.current) {
      isEnabledRef.current = true;
      startWakeListeningRef.current();
    } else {
      stopAll();
    }
  };

  // State display labels
  const stateLabel: Record<VoiceState, string> = {
    idle: 'Click mic to activate DeVis',
    'listening-wake': 'Listening… say "Hey Devis", "Hi", "Hey Baby", or "Hey Devesh"',
    responding: 'Devis is replying…',
    'listening-command': 'Listening to your command… (speak naturally)',
    processing: 'Processing task with DeVis agent…',
  };

  const pulseRing: Record<VoiceState, string> = {
    idle: '',
    'listening-wake': 'bg-primary animate-ping opacity-25',
    responding: 'bg-primary-purple animate-pulse opacity-30',
    'listening-command': 'bg-primary-blue animate-ping opacity-30',
    processing: 'bg-gradient-ai animate-spin opacity-40',
  };

  if (!supported) {
    return (
      <p className="text-xs text-text-muted mt-2">
        ⚠️ Voice recognition not supported in this browser — recommend Chrome, Edge, or Brave.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Mic button */}
      <div className="relative">
        <button
          onClick={toggle}
          type="button"
          title={state === 'idle' ? 'Activate DeVis' : 'Turn off microphone'}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 cursor-pointer ${
            state === 'idle'
              ? 'bg-surface-input hover:bg-surface border border-border hover:border-primary/50 text-primary shadow-sm hover:shadow-[0_0_20px_rgba(56,224,248,0.2)]'
              : 'bg-gradient-ai text-background border-none shadow-[0_0_30px_rgba(56,224,248,0.4)] scale-105'
          }`}
        >
          {state !== 'idle' && (
            <span className={`absolute inset-0 rounded-full ${pulseRing[state]} pointer-events-none`} />
          )}
          <span className="relative z-10 select-none">
            {state === 'processing' ? '⏳' : state === 'responding' ? '🗣️' : state === 'listening-command' ? '🎙️' : '🎤'}
          </span>
        </button>

        {/* Small Active Badge when listening */}
        {state !== 'idle' && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-background" />
          </span>
        )}
      </div>

      {/* Status label */}
      <div className="flex flex-col items-center gap-1">
        <p className={`text-xs text-center transition-colors font-semibold ${
          state === 'idle' ? 'text-text-muted' : 'text-primary'
        }`}>
          {stateLabel[state]}
        </p>

        {state !== 'idle' && (
          <button
            onClick={stopAll}
            type="button"
            className="text-[11px] text-rose-400 hover:text-rose-300 transition-colors underline cursor-pointer mt-0.5"
          >
            Turn off mic
          </button>
        )}
      </div>

      {/* Live transcript feedback */}
      {(transcript || lastWords) && (
        <div className="max-w-md w-full px-4 py-2.5 bg-surface-input/90 border border-primary/20 rounded-xl text-xs text-text-primary text-center shadow-inner backdrop-blur-sm animate-in fade-in duration-200">
          <span className="text-text-muted mr-1.5 font-medium">
            {state === 'listening-command' ? '🗣️ You:' : 'Heard:'}
          </span>
          <span className="text-foreground font-medium">
            {state === 'listening-command' ? (transcript || 'Listening...') : lastWords}
          </span>
        </div>
      )}
    </div>
  );
}
