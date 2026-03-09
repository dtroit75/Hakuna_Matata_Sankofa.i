import React, { useState } from 'react';
import { generateStory, generateSpeech } from '../services/geminiService';

const Storyteller: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setStory('');
    try {
      const result = await generateStory(topic);
      setStory(result || "The spirits were silent this time.");
    } catch (error) {
      console.error(error);
      setStory("Error retrieving the story.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = async () => {
    if (!story) return;
    setAudioLoading(true);
    try {
      const audioBuffer = await generateSpeech(story.slice(0, 1000)); // Limit length for demo
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (error) {
      console.error(error);
      alert("Could not generate speech. Please try again.");
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-amber-800 mb-2">The Storyteller</h2>
      <p className="text-stone-600 mb-8">Invoke the oral traditions. Provide a symbol or theme, and receive a story.</p>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., The meaning of Sankofa, The Clever Tortoise..."
            className="flex-1 p-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Weaving...' : 'Tell Story'}
          </button>
        </div>
      </div>

      {story && (
        <div className="bg-orange-50 p-8 rounded-xl border border-orange-200 shadow-sm relative">
          <button 
            onClick={handleSpeak}
            disabled={audioLoading}
            className="absolute top-4 right-4 bg-amber-800 text-white p-2 rounded-full hover:bg-amber-900 disabled:opacity-50 transition-colors"
            title="Listen to Story"
          >
            {audioLoading ? '⏳' : '🔊'}
          </button>
          <div className="prose prose-lg text-stone-800 font-serif leading-relaxed whitespace-pre-wrap">
            {story}
          </div>
        </div>
      )}
    </div>
  );
};

export default Storyteller;
