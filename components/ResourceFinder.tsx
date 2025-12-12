import React, { useState } from 'react';
import { findLearningResources } from '../services/geminiService';
import { LearningResource, AppLanguage } from '../types';
import { Search, ExternalLink, BookOpen, Loader2 } from 'lucide-react';

interface ResourceFinderProps {
  language: AppLanguage;
}

const ResourceFinder: React.FC<ResourceFinderProps> = ({ language }) => {
  const [query, setQuery] = useState('');
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const results = await findLearningResources(query, language);
    setResources(results);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 mb-2">
          Skill Nexus
        </h2>
        <p className="text-slate-400">Discover top-rated courses and documentation tailored to your goal.</p>
        <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">Searching in: {language}</p>
      </div>

      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder={`What do you want to learn? (Type in ${language})`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-6 pr-14 text-lg text-white shadow-xl focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-gradient-to-br from-teal-500 to-indigo-600 hover:opacity-90 text-white p-3 rounded-xl transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {resources.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-48 text-slate-600">
             <BookOpen size={48} className="mb-4 opacity-50" />
             <p>Enter a topic above to start learning.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
          {resources.map((res, idx) => (
            <a 
              key={idx} 
              href={res.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-teal-500/50 hover:bg-slate-750 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{res.source}</span>
                  <ExternalLink size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-teal-300 transition-colors line-clamp-2">{res.title}</h3>
                <p className="text-slate-400 text-sm line-clamp-3">{res.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResourceFinder;