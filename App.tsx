import React, { useState } from 'react';
import { AppView, CareerSuggestion, AppLanguage } from './types';
import CareerPathfinder from './components/CareerPathfinder';
import ResumeBuilder from './components/ResumeBuilder';
import ResourceFinder from './components/ResourceFinder';
import { Compass, FileText, GraduationCap, LayoutDashboard, ChevronRight, Zap, Languages } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [careerSuggestions, setCareerSuggestions] = useState<CareerSuggestion[]>([]);
  const [language, setLanguage] = useState<AppLanguage>('English');

  const handleCareerFound = (suggestions: CareerSuggestion[]) => {
    setCareerSuggestions(suggestions);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.PATHFINDER:
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <CareerPathfinder onCareerFound={handleCareerFound} language={language} />
                
                {/* Results Section */}
                {careerSuggestions.length > 0 && (
                    <div className="space-y-6 animate-fade-in">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-current" /> 
                            Recommended Career Paths
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {careerSuggestions.map((career, idx) => (
                                <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-indigo-500 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="text-xl font-bold text-indigo-300">{career.title}</h4>
                                        <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs font-bold">
                                            {career.matchScore}% Match
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-4 leading-relaxed">{career.reasoning}</p>
                                    
                                    <div className="mb-4">
                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Roadmap</h5>
                                        <ul className="space-y-1">
                                            {career.roadmap.slice(0, 3).map((step, sIdx) => (
                                                <li key={sIdx} className="text-sm text-slate-400 flex items-start gap-2">
                                                    <ChevronRight size={14} className="mt-1 text-indigo-500 shrink-0"/> 
                                                    {step}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setCurrentView(AppView.LEARNING_HUB)}
                                        className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Find Resources
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
      case AppView.RESUME_BUILDER:
        return <ResumeBuilder language={language} />;
      case AppView.LEARNING_HUB:
        return <ResourceFinder language={language} />;
      default:
        return (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-8 group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-900 ring-1 ring-slate-900/5 rounded-full p-4">
                    <Compass size={64} className="text-indigo-400" />
                </div>
            </div>
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6">
              CareerForge AI
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
              Unlock your potential with the world's most advanced AI career counselor. 
              Discover your path, master the skills, and build the perfect resume in minutes.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
              <button onClick={() => setCurrentView(AppView.PATHFINDER)} className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-indigo-500/50 transition-all text-left">
                <div className="bg-indigo-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Compass className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Career Pathfinder</h3>
                <p className="text-sm text-slate-400">Deep AI analysis of your profile to find your ideal career.</p>
              </button>

              <button onClick={() => setCurrentView(AppView.RESUME_BUILDER)} className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-purple-500/50 transition-all text-left">
                <div className="bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Resume Architect</h3>
                <p className="text-sm text-slate-400">Build ATS-optimized resumes with generative AI enhancements.</p>
              </button>

              <button onClick={() => setCurrentView(AppView.LEARNING_HUB)} className="group bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:bg-slate-750 hover:border-teal-500/50 transition-all text-left">
                <div className="bg-teal-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap className="text-teal-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Skill Nexus</h3>
                <p className="text-sm text-slate-400">Find real-time courses and docs using AI search grounding.</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col no-print shrink-0 transition-all duration-300">
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
             <span className="font-bold text-white">CF</span>
          </div>
          <span className="font-bold text-xl hidden lg:block tracking-tight">CareerForge</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
            { id: AppView.PATHFINDER, label: 'Pathfinder', icon: Compass },
            { id: AppView.RESUME_BUILDER, label: 'Resume', icon: FileText },
            { id: AppView.LEARNING_HUB, label: 'Learn', icon: GraduationCap },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Language Selector */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3">
             <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Languages size={16} />
                <span className="text-xs font-bold uppercase tracking-wider hidden lg:block">Language</span>
             </div>
             <div className="flex flex-col gap-2">
                {(['English', 'Hinglish', 'Hindi'] as AppLanguage[]).map((lang) => (
                   <button
                     key={lang}
                     onClick={() => setLanguage(lang)}
                     className={`text-xs font-medium py-1.5 px-3 rounded-lg transition-colors text-left ${
                        language === lang 
                          ? 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                     }`}
                   >
                     {lang}
                   </button>
                ))}
             </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 hidden lg:block">
            <div className="bg-slate-800/50 rounded-xl p-4 text-xs text-slate-500">
                <p>Powered by Gemini 2.5 Flash & 3.0 Pro</p>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden relative">
        <div className="h-full overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;