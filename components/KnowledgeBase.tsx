import React, { useState } from 'react';
import { searchCulturalKnowledge } from '../services/geminiService';

const KnowledgeBase: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ text: string; groundingMetadata?: any } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchCulturalKnowledge(query);
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ text: "Could not retrieve knowledge at this time." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-amber-900 mb-6 font-cinzel text-shadow">Ancestral Knowledge Base</h2>
      
      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative group">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-5 pl-14 rounded-full glass-panel border border-white/50 shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/30 text-lg placeholder-stone-500 text-stone-900 transition-all"
            placeholder="Search for proverbs, symbols, or history..."
          />
          <span className="absolute left-6 top-1/2 transform -translate-y-1/2 text-2xl opacity-70">🔎</span>
          <button
            type="submit"
            className="absolute right-3 top-2 bottom-2 px-8 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 transition-colors shadow-lg"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {result && (
        <div className="glass-panel p-10 rounded-2xl shadow-2xl animate-fade-in">
          <div className="prose prose-lg text-stone-900 mb-8 whitespace-pre-wrap leading-relaxed">
            {result.text}
          </div>

          {/* Rendering Grounding Sources */}
          {result.groundingMetadata?.groundingChunks && (
            <div className="mt-8 border-t border-stone-300/50 pt-6">
              <h4 className="text-xs font-bold text-stone-600 uppercase tracking-widest mb-4">Sources & References</h4>
              <ul className="space-y-3">
                {result.groundingMetadata.groundingChunks.map((chunk: any, index: number) => {
                  if (chunk.web?.uri) {
                    return (
                      <li key={index} className="flex items-center gap-3 text-sm group">
                        <span className="text-stone-400 group-hover:text-amber-600 transition-colors">🔗</span>
                        <a 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-stone-700 font-bold hover:text-amber-700 hover:underline truncate max-w-lg block transition-colors"
                        >
                          {chunk.web.title || chunk.web.uri}
                        </a>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
