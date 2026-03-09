import React, { useState, useRef } from 'react';
import { transcribeAudio } from '../services/geminiService';

const Transcription: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
           setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleTranscribe = async () => {
    if (!audioBase64) return;
    setLoading(true);
    try {
      // Extract base64 and mime
      const [mimePrefix, base64Data] = audioBase64.split(',');
      const mimeType = mimePrefix.match(/:(.*?);/)?.[1] || 'audio/webm';
      
      const result = await transcribeAudio(base64Data, mimeType);
      setTranscription(result || "Could not transcribe audio.");
    } catch (error) {
      console.error(error);
      setTranscription("Error during transcription.");
    } finally {
      setLoading(false);
    }
  };

  const downloadText = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "sankofa-transcription.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const element = document.createElement("a");
      element.href = audioUrl;
      element.download = "sankofa-recording.webm";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-amber-900 mb-2 font-cinzel text-shadow">Field Recorder</h2>
      <p className="text-stone-800 font-medium mb-8">Record elders or oral histories and transcribe them using AI.</p>

      <div className="glass-panel p-8 rounded-2xl shadow-xl flex flex-col items-center mb-8">
        <div className="relative">
            {recording && (
                <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></div>
            )}
            <button
            onClick={recording ? stopRecording : startRecording}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all transform hover:scale-105 ${
                recording ? 'bg-red-600 text-white' : 'bg-stone-900 text-red-500 hover:bg-stone-800'
            }`}
            >
            {recording ? '⏹' : '⏺'}
            </button>
        </div>
        
        <p className="mt-6 font-mono text-stone-700 font-bold tracking-wider">
          {recording ? 'RECORDING IN PROGRESS...' : 'PRESS TO RECORD'}
        </p>

        {audioUrl && (
          <div className="w-full mt-8 bg-white/40 p-6 rounded-xl border border-white/50 backdrop-blur-sm">
            <audio src={audioUrl} controls className="w-full mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={handleTranscribe}
                    disabled={loading}
                    className="w-full py-3 bg-amber-700 text-white font-bold rounded-lg hover:bg-amber-800 disabled:opacity-50 shadow-lg"
                >
                    {loading ? 'Transcribing...' : '✨ Transcribe Recording'}
                </button>
                <button
                    onClick={downloadAudio}
                    className="w-full py-3 bg-stone-700 text-white font-bold rounded-lg hover:bg-stone-800 shadow-lg"
                >
                    💾 Download Audio
                </button>
            </div>
          </div>
        )}
      </div>

      {transcription && (
        <div className="glass-panel p-8 rounded-2xl animate-fade-in">
          <div className="flex justify-between items-center mb-4 border-b border-stone-300/50 pb-4">
            <h3 className="font-bold text-amber-900 text-xl font-cinzel">Transcription</h3>
            <button 
                onClick={downloadText}
                className="text-sm bg-white/60 hover:bg-white px-3 py-1 rounded-md text-stone-700 font-bold transition-colors"
            >
                ⬇ Export Text
            </button>
          </div>
          <p className="text-stone-800 whitespace-pre-wrap leading-relaxed">{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default Transcription;
