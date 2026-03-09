import React, { useState } from 'react';
import { generateDesign, editDesign } from '../services/geminiService';

const Designer: React.FC = () => {
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check for API key selection for Veo/Pro
  const checkKey = async () => {
    // @ts-ignore
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setGeneratedImages([]);
    try {
      await checkKey(); // Ensure key is selected for Pro Image
      const results = await generateDesign(prompt, size);
      setGeneratedImages(results);
    } catch (e) {
      console.error(e);
      alert("Failed to generate design. Ensure you have selected a valid API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!uploadImage) return;
    setLoading(true);
    setGeneratedImages([]);
    try {
      // Extract base64 and mime
      const [mimePrefix, base64Data] = uploadImage.split(',');
      const mimeType = mimePrefix.match(/:(.*?);/)?.[1] || 'image/png';
      
      const results = await editDesign(base64Data, mimeType, prompt);
      setGeneratedImages(results);
    } catch (e) {
      console.error(e);
      alert("Failed to edit design.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="glass-panel p-8 rounded-2xl mb-8 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-amber-900 mb-2 font-cinzel text-shadow">Cloth Designer</h2>
          <p className="text-stone-800 font-medium text-lg max-w-2xl mx-auto">
            "Wear your story." <br/>
            Transform ancient symbols into modern fashion. Create a unique design today and see it come to life on a garment you'd be proud to wear.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-xl">
             <div className="flex bg-stone-200/50 rounded-lg p-1 mb-6">
              <button
                onClick={() => setMode('create')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${mode === 'create' ? 'bg-white shadow text-amber-800' : 'text-stone-600 hover:bg-white/30'}`}
              >
                Create New
              </button>
              <button
                onClick={() => setMode('edit')}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${mode === 'edit' ? 'bg-white shadow text-amber-800' : 'text-stone-600 hover:bg-white/30'}`}
              >
                Edit Existing
              </button>
            </div>

            {mode === 'create' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-2">Design Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full p-3 bg-white/60 border border-white/40 rounded-lg h-32 focus:ring-2 focus:ring-amber-500 placeholder-stone-500"
                    placeholder="e.g. A geometric pattern featuring the Gye Nyame symbol in gold and maroon..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-800 mb-2">Resolution</label>
                  <select 
                    value={size}
                    onChange={(e) => setSize(e.target.value as any)}
                    className="w-full p-3 bg-white/60 border border-white/40 rounded-lg"
                  >
                    <option value="1K">1K (Standard)</option>
                    <option value="2K">2K (High)</option>
                    <option value="4K">4K (Ultra)</option>
                  </select>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={loading || !prompt}
                  className="w-full py-4 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                >
                  {loading ? 'Weaving Pattern...' : 'Generate Design'}
                </button>
                <p className="text-xs text-stone-600 text-center mt-2">Requires paid API key selection.</p>
              </div>
            ) : (
              <div className="space-y-4">
                 <label className="block border-2 border-dashed border-stone-400/50 bg-white/30 rounded-lg h-48 flex items-center justify-center cursor-pointer hover:bg-white/50 transition-colors">
                    {uploadImage ? (
                      <img src={uploadImage} className="h-full w-full object-contain p-2" alt="Source" />
                    ) : (
                      <span className="text-stone-600 font-medium">Upload Image to Edit</span>
                    )}
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                 </label>
                 <div>
                    <label className="block text-sm font-bold text-stone-800 mb-2">Edit Instruction</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full p-3 bg-white/60 border border-white/40 rounded-lg h-32 focus:ring-2 focus:ring-amber-500 placeholder-stone-500"
                      placeholder="e.g. Change the background color to indigo..."
                    />
                 </div>
                 <button
                   onClick={handleEdit}
                   disabled={loading || !prompt || !uploadImage}
                   className="w-full py-4 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                 >
                   {loading ? 'Modifying...' : 'Apply Edits'}
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2 space-y-8">
           {generatedImages.length > 0 ? (
             generatedImages.map((img, idx) => (
               <div key={idx} className="glass-panel p-6 rounded-2xl animate-fade-in">
                 <h3 className="text-xl font-bold text-stone-800 mb-4 text-center">Your Custom Collection</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Black T-Shirt Mockup */}
                   <div className="relative group">
                     <div className="aspect-[3/4] bg-stone-900 rounded-lg shadow-2xl relative overflow-hidden flex items-center justify-center">
                        {/* Simple CSS T-Shirt shape approximation via clip-path or overlay */}
                        <div className="absolute inset-2 border-2 border-stone-800 rounded opacity-50"></div>
                        <img 
                          src={img} 
                          alt="Design" 
                          className="w-48 h-48 object-cover mix-blend-overlay opacity-90"
                          style={{ maskImage: 'radial-gradient(circle, black 60%, transparent 100%)' }}
                        />
                        <div className="absolute bottom-4 left-0 right-0 text-center text-stone-500 text-xs uppercase tracking-widest">Black Tee Mockup</div>
                     </div>
                   </div>

                   {/* White T-Shirt Mockup */}
                   <div className="relative group">
                     <div className="aspect-[3/4] bg-white rounded-lg shadow-2xl relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-2 border-2 border-stone-100 rounded opacity-50"></div>
                        <img 
                          src={img} 
                          alt="Design" 
                          className="w-48 h-48 object-cover mix-blend-multiply opacity-90"
                          style={{ maskImage: 'radial-gradient(circle, black 60%, transparent 100%)' }}
                        />
                         <div className="absolute bottom-4 left-0 right-0 text-center text-stone-400 text-xs uppercase tracking-widest">White Tee Mockup</div>
                     </div>
                   </div>
                 </div>

                 <div className="mt-6 flex justify-center">
                   <a 
                     href={img} 
                     download={`sankofa-design-${idx}.png`} 
                     className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold hover:bg-stone-800 shadow-lg transition-transform hover:-translate-y-1"
                   >
                     Download Pattern
                   </a>
                 </div>
               </div>
             ))
           ) : (
             <div className="h-full flex flex-col items-center justify-center glass-card rounded-2xl p-12 text-stone-500">
               <div className="text-6xl mb-4 opacity-50">👕</div>
               <p className="text-xl font-medium">Your fashion line starts here.</p>
               <p className="text-sm opacity-70">Generate a pattern to see it on a mockup.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Designer;
