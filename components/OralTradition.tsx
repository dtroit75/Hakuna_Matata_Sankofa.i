import React, { useRef, useState, useEffect } from 'react';
import { getLiveClient } from '../services/geminiService';
import { createPcmBlob, decodeAudioData } from '../utils/audioUtils';
import { LiveServerMessage, Modality } from '@google/genai';
import { ChatMessage } from '../types';

const OralTradition: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Transcription state
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  // Refs
  const sessionRef = useRef<any>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, currentInput, currentOutput]);

  const cleanupAudio = () => {
    // Stop all playing sources
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourcesRef.current.clear();

    // Close contexts
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      outputContextRef.current.close();
      outputContextRef.current = null;
    }
    
    // Stop mic stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const disconnect = () => {
    cleanupAudio();
    setConnected(false);
    setStatus('Disconnected');
    setIsSpeaking(false);
    setMessages(prev => [...prev, {
      role: 'model',
      text: '[Session Ended]',
      timestamp: new Date()
    }]);
  };

  const connect = async () => {
    setStatus('Connecting to Ancestral Spirits...');
    setMessages([]);
    
    try {
      const ai = getLiveClient();
      
      // Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // Resume contexts immediately (needed for some browsers)
      await inputCtx.resume();
      await outputCtx.resume();

      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('Connected. Speak freely.');
            setConnected(true);
            
            // Setup Audio Input Stream Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!inputContextRef.current) return; // Stop processing if disconnected
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // 1. Handle Interruption
            if (msg.serverContent?.interrupted) {
              console.log("Interrupted!");
              // Stop all currently playing audio immediately
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              // Reset timing cursor to now
              nextStartTimeRef.current = outputCtx.currentTime;
              setIsSpeaking(false);
              return; 
            }

            // 2. Handle Transcription
            if (msg.serverContent?.outputTranscription) {
              setCurrentOutput(prev => prev + msg.serverContent?.outputTranscription?.text);
            } else if (msg.serverContent?.inputTranscription) {
              setCurrentInput(prev => prev + msg.serverContent?.inputTranscription?.text);
            }

            if (msg.serverContent?.turnComplete) {
              if (currentInput.trim()) {
                 setMessages(prev => [...prev, { role: 'user', text: currentInput, timestamp: new Date() }]);
                 setCurrentInput('');
              }
              if (currentOutput.trim()) {
                 setMessages(prev => [...prev, { role: 'model', text: currentOutput, timestamp: new Date() }]);
                 setCurrentOutput('');
              }
              setIsSpeaking(false);
            }

            // 3. Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               try {
                 setIsSpeaking(true);
                 
                 // Decode
                 const audioBuffer = await decodeAudioData(
                   Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)), 
                   outputCtx,
                   24000,
                   1
                 );

                 // Scheduling Logic to prevent overlap or gaps
                 // Ensure we don't schedule in the past
                 if (nextStartTimeRef.current < outputCtx.currentTime) {
                    nextStartTimeRef.current = outputCtx.currentTime;
                 }

                 const source = outputCtx.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(outputNode);
                 
                 source.onended = () => {
                   sourcesRef.current.delete(source);
                   if (sourcesRef.current.size === 0) {
                     // Small delay before turning off visualizer to smooth out gaps between chunks
                     setTimeout(() => {
                        if (sourcesRef.current.size === 0) setIsSpeaking(false);
                     }, 200);
                   }
                 };
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;
                 sourcesRef.current.add(source);
                 
               } catch (err) {
                 console.error("Error decoding audio chunk", err);
               }
            }
          },
          onclose: () => {
            if (connected) { // Only update if we didn't initiate disconnect
               setStatus('Session Closed');
               setConnected(false);
            }
          },
          onerror: (err) => {
            console.error(err);
            setStatus('Connection Error. Please retry.');
            setConnected(false);
            cleanupAudio();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Enable transcription by passing empty objects. Do NOT pass 'model' inside.
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
          },
          systemInstruction: "You are a wise African elder and keeper of the oral traditions of the Swahili and Akan peoples. You speak with warmth, wisdom, and use proverbs where appropriate. You are teaching a younger generation about their heritage. Keep your answers relatively short and conversational."
        }
      });

      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus('Failed to connect. Check permissions.');
      cleanupAudio();
    }
  };

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 h-[85vh] flex flex-col md:flex-row gap-6">
      {/* Visualizer Panel */}
      <div className="md:w-1/3 flex flex-col items-center justify-center glass-panel rounded-2xl p-8 relative overflow-hidden transition-all duration-500">
        {/* Adinkra Background Watermark */}
        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
             <span className="text-[200px]">🗣️</span>
        </div>

        <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-all duration-300 border-4 border-amber-500/30 ${
          connected 
            ? isSpeaking 
              ? 'bg-amber-500/80 shadow-[0_0_60px_rgba(245,158,11,0.8)] scale-110 animate-pulse' 
              : 'bg-amber-700/80 shadow-[0_0_30px_rgba(180,83,9,0.4)]'
            : 'bg-stone-300/50 backdrop-blur-sm'
        }`}>
          <span className={`text-6xl drop-shadow-md transition-transform duration-300 ${isSpeaking ? 'scale-125' : 'scale-100'}`}>
            {connected ? (isSpeaking ? '🗣️' : '👂') : '🦗'}
          </span>
        </div>

        <h2 className="text-3xl font-cinzel font-bold text-amber-900 mb-2 drop-shadow-sm">Oral Tradition</h2>
        
        <div className="flex gap-2 items-center mb-6 bg-white/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
          <div className={`h-3 w-3 rounded-full transition-colors duration-500 ${connected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-red-500'}`}></div>
          <span className="font-mono text-sm text-stone-700 font-bold">{status}</span>
        </div>

        <button
          onClick={connected ? disconnect : connect}
          className={`px-8 py-4 rounded-full font-bold text-lg shadow-xl transition-all transform hover:scale-105 ${
            connected 
              ? 'bg-red-600/90 hover:bg-red-700 text-white backdrop-blur-sm' 
              : 'bg-stone-900/90 hover:bg-black text-amber-500 backdrop-blur-sm'
          }`}
        >
          {connected ? 'End Conversation' : 'Begin Commune'}
        </button>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 bg-amber-900/10 border-b border-amber-900/10 backdrop-blur-sm">
          <h3 className="font-bold text-amber-900">Conversation History</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={chatContainerRef}>
          {messages.length === 0 && !currentInput && !currentOutput && (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 opacity-60">
              <span className="text-4xl mb-2">📜</span>
              <p>The scrolls are empty. Speak to start.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-amber-600/90 text-white rounded-tr-none' 
                  : 'bg-white/80 text-stone-800 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Real-time Streaming Bubbles */}
          {currentInput && (
             <div className="flex justify-end opacity-70">
              <div className="max-w-[80%] p-4 rounded-2xl bg-amber-600/50 text-white rounded-tr-none animate-pulse">
                <p>{currentInput}...</p>
              </div>
            </div>
          )}
          {currentOutput && (
             <div className="flex justify-start opacity-70">
              <div className="max-w-[80%] p-4 rounded-2xl bg-white/50 text-stone-800 rounded-tl-none animate-pulse">
                <p>{currentOutput}...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OralTradition;