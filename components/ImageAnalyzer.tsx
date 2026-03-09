import React, { useState, useRef, useEffect } from 'react';
import { analyzeArtifact } from '../services/geminiService';

interface ExpandableTextProps {
  text: string;
  limit?: number;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, limit = 400 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollHeight > 300);
    }
  }, [text]);

  return (
    <div className="relative">
      <div 
        ref={textRef}
        className={`prose prose-stone text-stone-900 whitespace-pre-wrap font-medium leading-relaxed transition-all duration-500 ease-in-out overflow-hidden ${
          !isExpanded ? 'max-h-[300px]' : 'max-h-[2000px]'
        }`}
      >
        {text}
      </div>
      
      {isTruncated && (
        <div className="flex flex-col items-center">
          {!isExpanded && (
            <div className="absolute bottom-12 left-0 right-0 h-24 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none z-10"></div>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 px-6 py-2 rounded-full bg-amber-100/80 text-amber-900 font-bold hover:bg-amber-200 transition-all flex items-center gap-2 group shadow-sm border border-amber-200/50 z-20"
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <>
                <span>Condense Wisdom</span>
                <span className="transform rotate-180 transition-transform group-hover:-translate-y-1">↑</span>
              </>
            ) : (
              <>
                <span>Read Full Revelation</span>
                <span className="transform transition-transform group-hover:translate-y-1">↓</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const ImageAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; groundingMetadata?: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'fast' | 'deep'>('deep');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setResult(null);
    try {
      // Extract base64 and mime type
      const [mimePrefix, base64Data] = image.split(',');
      const mimeType = mimePrefix.match(/:(.*?);/)?.[1] || 'image/jpeg';
      
      const data = await analyzeArtifact(base64Data, mimeType, mode);
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ text: "Error analyzing the artifact. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-amber-900 font-cinzel text-shadow">Artifact Analyzer</h2>
          <p className="text-stone-800 font-medium">Decode meanings from cloths, carvings, and symbols.</p>
        </div>
        
        {/* Mode Selector */}
        <div className="mt-4 md:mt-0 bg-white/50 p-1 rounded-lg flex shadow-sm border border-amber-200">
          <button
            onClick={() => setMode('fast')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
              mode === 'fast' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-600 hover:bg-white/50'
            }`}
          >
            <span>⚡</span> Fast Scan
          </button>
          <button
            onClick={() => setMode('deep')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${
              mode === 'deep' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-600 hover:bg-white/50'
            }`}
          >
            <span>🧠</span> Deep Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {/* Input Section */}
        <div className="glass-panel p-6 rounded-2xl shadow-xl flex flex-col">
          <label className="flex-1 w-full min-h-[300px] border-2 border-dashed border-stone-400/50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 hover:border-amber-500 transition-all bg-white/10 relative overflow-hidden group">
            {image ? (
              <img src={image} alt="Artifact" className="absolute inset-0 w-full h-full object-contain p-4 transition-transform group-hover:scale-105" />
            ) : (
              <div className="text-center p-4">
                <span className="text-6xl block mb-4 opacity-50">📸</span>
                <span className="text-stone-700 font-bold text-lg">Click to Upload Image</span>
                <p className="text-xs text-stone-500 mt-2">Supports JPG, PNG, WEBP</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
          
          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className={`w-full mt-6 py-4 rounded-lg font-bold text-lg text-white transition-all shadow-lg transform active:scale-95 flex items-center justify-center gap-3 ${
              !image || loading
                ? 'bg-stone-500 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {mode === 'deep' ? 'Consulting Elders...' : 'Scanning...'}
              </>
            ) : (
              <>
                <span>🔍</span> Decode Artifact
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        <div className="glass-card p-6 md:p-8 rounded-2xl shadow-inner h-fit max-h-[80vh] overflow-y-auto min-h-[400px] relative">
          <h3 className="text-xl font-bold text-amber-900 mb-4 border-b border-stone-300/50 pb-2 flex justify-between items-center sticky top-0 bg-white/40 backdrop-blur-sm z-30 -mx-4 px-4 py-2 -mt-2">
            <span>Wisdom Revealed</span>
            {result?.groundingMetadata && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">Verified ✓</span>}
          </h3>
          
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4 py-12">
                <div className="text-6xl animate-bounce">⏳</div>
                <p className="animate-pulse font-medium">Analyzing patterns and history...</p>
             </div>
          ) : result ? (
            <div className="animate-fade-in space-y-6">
              <ExpandableText text={result.text} />
              
              {/* Citations / Sources */}
              {result.groundingMetadata?.groundingChunks && (
                <div className="mt-8 pt-4 border-t border-stone-300/30">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-3">Knowledge Sources</h4>
                  <ul className="space-y-2">
                    {result.groundingMetadata.groundingChunks.map((chunk: any, index: number) => {
                      if (chunk.web?.uri) {
                        return (
                          <li key={index} className="flex items-start gap-2 text-sm bg-white/40 p-2 rounded hover:bg-white/60 transition-colors">
                            <span className="mt-1">🔗</span>
                            <a 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-amber-800 hover:underline hover:text-amber-600 break-all"
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 opacity-60">
                <span className="text-6xl mb-4 grayscale opacity-50">👁️</span>
                <p className="italic text-lg">Upload an image to reveal its secrets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;