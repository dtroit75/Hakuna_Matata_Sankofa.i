import React from 'react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobileMenu: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  setView, 
  isCollapsed, 
  toggleCollapse,
  isMobileOpen,
  closeMobileMenu
}) => {
  const navItems = [
    { id: View.HOME, label: 'Sankofa Home', icon: '🏛️' },
    { id: View.ANALYZER, label: 'Artifact Analyzer', icon: '🔍' },
    { id: View.KNOWLEDGE, label: 'Knowledge Base', icon: '📚' },
    { id: View.DESIGNER, label: 'Cloth Designer', icon: '🎨' },
    { id: View.LEARNING, label: 'Wisdom Quest', icon: '🏆' },
    { id: View.TRANSCRIBE, label: 'Field Recorder', icon: '🎙️' },
    { id: View.ORAL_TRADITION, label: 'Oral Tradition', icon: '🗣️' },
    { id: View.ABOUT, label: 'About Us', icon: 'ℹ️' },
  ];

  const handleNavClick = (view: View) => {
    setView(view);
    closeMobileMenu();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar Container */}
      <nav 
        className={`
          glass-panel text-stone-900 h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-64
        `}
      >
        {/* Header */}
        <div className={`p-6 border-b border-stone-300/50 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
             <div className="overflow-hidden whitespace-nowrap">
               <h1 className="text-xl font-bold tracking-tight text-amber-700 drop-shadow-sm font-cinzel">Hakuna Matata</h1>
               <p className="text-xs text-stone-600 mt-1 uppercase tracking-wider font-bold">Sankofa.i</p>
             </div>
          ) : (
             <span className="text-2xl">🏺</span>
          )}
          
          {/* Mobile Close Button */}
          <button onClick={closeMobileMenu} className="md:hidden text-stone-600 hover:text-red-600">
            ✕
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full text-left transition-all duration-200 flex items-center font-medium group relative
                ${isCollapsed ? 'justify-center px-2 py-4' : 'px-6 py-4 gap-3'}
                ${currentView === item.id
                  ? 'bg-amber-100/60 text-amber-900 border-r-4 border-amber-600 backdrop-blur-sm'
                  : 'hover:bg-white/40 text-stone-700'
                }
              `}
              title={isCollapsed ? item.label : ''}
            >
              <span className={`text-xl filter drop-shadow-sm transition-transform group-hover:scale-110 ${isCollapsed ? 'text-2xl' : ''}`}>
                {item.icon}
              </span>
              
              {!isCollapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}

              {/* Tooltip for collapsed mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer / Collapse Toggle */}
        <div className="p-4 border-t border-stone-300/50 text-xs text-stone-600 font-semibold flex flex-col gap-3">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <a 
              href="https://t.me/+SqG0K1GULydlNWNk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-sm"
              title="Join our Telegram"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.462 8.816l-1.144 5.891c-.09.406-.33.505-.669.314l-1.74-1.283-1.419 1.365c-.156.156-.288.287-.588.287l.211-3.001 5.46-4.932c.237-.21-.051-.328-.368-.116l-6.747 4.248-2.907-.908c-.632-.197-.644-.632.132-.934l11.36-4.377c.526-.191.986.124.812.945z"/>
              </svg>
            </a>
            {!isCollapsed && (
              <a 
                href="https://hakuna-matata-nft-safari-marketplac.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-amber-600 text-white py-2 px-3 rounded-lg text-center hover:bg-amber-700 transition-colors shadow-sm font-bold uppercase tracking-wider"
              >
                Shop
              </a>
            )}
            {isCollapsed && (
              <a 
                href="https://hakuna-matata-nft-safari-marketplac.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors shadow-sm"
                title="Visit Shop"
              >
                🛒
              </a>
            )}
          </div>

          {!isCollapsed && <p className="px-2">Powered by Google AI Studio</p>}
          
          {/* Desktop Collapse Button */}
          <button 
            onClick={toggleCollapse}
            className="hidden md:flex items-center justify-center w-full py-2 hover:bg-black/5 rounded-lg transition-colors text-stone-500"
          >
            {isCollapsed ? '➤' : '◀ Collapse'}
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
