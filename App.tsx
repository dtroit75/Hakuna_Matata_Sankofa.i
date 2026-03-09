import React, { useState } from 'react';
import { View } from './types';
import Navigation from './components/Navigation';
import ImageAnalyzer from './components/ImageAnalyzer';
import KnowledgeBase from './components/KnowledgeBase';
import Designer from './components/Designer';
import OralTradition from './components/OralTradition';
import Transcription from './components/Transcription';
import WisdomQuest from './components/WisdomQuest';
import About from './components/About';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case View.ANALYZER:
        return <ImageAnalyzer />;
      case View.KNOWLEDGE:
        return <KnowledgeBase />;
      case View.DESIGNER:
        return <Designer />;
      case View.ORAL_TRADITION:
        return <OralTradition />;
      case View.TRANSCRIBE:
        return <Transcription />;
      case View.LEARNING:
        return <WisdomQuest />;
      case View.ABOUT:
        return <About />;
      case View.HOME:
      default:
        return (
          <div className="max-w-5xl mx-auto p-4 md:p-10">
            {/* Hero Section */}
            <div className="text-center mb-16 relative mt-4 md:mt-0">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-amber-500/50 rounded-full blur-sm"></div>
              <h1 className="text-4xl md:text-6xl font-cinzel text-amber-900 mb-6 drop-shadow-md font-bold">Hakuna Matata Sankofa.i</h1>
              <p className="text-lg md:text-2xl text-stone-900 font-light mb-12 max-w-3xl mx-auto leading-relaxed glass-card p-6 rounded-xl">
                "Go back and fetch it."<br/>
                <span className="text-base md:text-lg opacity-80 mt-2 block font-sans">
                  Bridge ancestral wisdom with future intelligence. Explore the art, oral history, and symbols of African heritage.
                </span>
              </p>
            </div>

            {/* Adinkra Carousel / Symbol Strip */}
            <div className="mb-16 overflow-hidden relative">
               <div className="flex justify-between items-center gap-4 md:gap-8 opacity-80 overflow-x-auto pb-4 md:pb-0">
                  <div className="text-center transform hover:scale-110 transition-transform duration-300 min-w-[80px]">
                    <span className="text-4xl md:text-6xl mb-2 block">🦾</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-700">Gye Nyame</span>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-transform duration-300 min-w-[80px]">
                    <span className="text-4xl md:text-6xl mb-2 block">🦢</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-700">Sankofa</span>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-transform duration-300 min-w-[80px]">
                    <span className="text-4xl md:text-6xl mb-2 block">⚔️</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-700">Akoben</span>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-transform duration-300 min-w-[80px]">
                    <span className="text-4xl md:text-6xl mb-2 block">🕸️</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-700">Ananse</span>
                  </div>
                  <div className="text-center transform hover:scale-110 transition-transform duration-300 min-w-[80px]">
                    <span className="text-4xl md:text-6xl mb-2 block">🐢</span>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-stone-700">Denkyem</span>
                  </div>
               </div>
               <p className="text-center text-xs text-stone-500 mt-6 font-mono uppercase tracking-widest hidden md:block">Symbols of Wisdom & Strength</p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div 
                onClick={() => setCurrentView(View.ANALYZER)}
                className="glass-panel p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:bg-white/60"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">📸</span>
                  <h3 className="text-xl md:text-2xl font-bold text-stone-900 font-cinzel">Analyze Artifacts</h3>
                </div>
                <p className="text-stone-800 text-sm md:text-base">Decode hidden meanings from cloths, carvings, and ancient symbols using computer vision.</p>
              </div>

              <div 
                 onClick={() => setCurrentView(View.DESIGNER)}
                 className="glass-panel p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:bg-white/60"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">🎨</span>
                  <h3 className="text-xl md:text-2xl font-bold text-stone-900 font-cinzel">Cloth Designer</h3>
                </div>
                <p className="text-stone-800 text-sm md:text-base">Create modern textile designs inspired by heritage. Mockup your own fashion line.</p>
              </div>

               <div 
                 onClick={() => setCurrentView(View.LEARNING)}
                 className="glass-panel p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:bg-white/60"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">🏆</span>
                  <h3 className="text-xl md:text-2xl font-bold text-stone-900 font-cinzel">Wisdom Quest</h3>
                </div>
                <p className="text-stone-800 text-sm md:text-base">Challenge yourself with quizzes on proverbs, history, and symbols.</p>
              </div>

               <div 
                 onClick={() => setCurrentView(View.ORAL_TRADITION)}
                 className="glass-panel p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer group hover:bg-white/60"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl md:text-4xl group-hover:scale-110 transition-transform">🗣️</span>
                  <h3 className="text-xl md:text-2xl font-bold text-stone-900 font-cinzel">Oral Tradition</h3>
                </div>
                <p className="text-stone-800 text-sm md:text-base">Speak directly with an AI Elder. Preserve and learn from oral histories.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen font-lato overflow-x-hidden">
      <Navigation 
        currentView={currentView} 
        setView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        closeMobileMenu={() => setIsMobileMenuOpen(false)}
      />
      
      <main 
        className={`
          flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
          ml-0 w-full
        `}
      >
        {/* Mobile Header with Hamburger */}
        <div className="md:hidden flex justify-between items-center mb-6 glass-panel p-4 rounded-xl sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏺</span>
            <span className="font-cinzel font-bold text-amber-900">Sankofa.i</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-3xl text-stone-800 hover:text-amber-700 transition-colors"
          >
            ☰
          </button>
        </div>

        {renderView()}
      </main>
    </div>
  );
};

export default App;
