import React, { useState, useEffect, useRef } from 'react';
import { createCareerChat, generateCareerReport, findVideoResources } from '../services/geminiService';
import { Message, CareerSuggestion, AppLanguage, LearningResource } from '../types';
import { Send, User, Bot, Sparkles, ArrowRight, Youtube, Loader2, ExternalLink, ChevronRight } from 'lucide-react';
import { Chat } from '@google/genai';

interface CareerPathfinderProps {
  onCareerFound: (suggestions: CareerSuggestion[]) => void;
  language: AppLanguage;
}

const CareerPathfinder: React.FC<CareerPathfinderProps> = ({ onCareerFound, language }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm your AI Career Architect. To find your perfect path, I need to know a bit about you. Shall we start with what subjects or activities you find most engaging?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for suggestions and their videos
  const [suggestions, setSuggestions] = useState<CareerSuggestion[]>([]);
  const [videoResources, setVideoResources] = useState<Record<number, LearningResource[]>>({});
  const [loadingVideos, setLoadingVideos] = useState<Record<number, boolean>>({});

  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentLangRef = useRef<AppLanguage>(language);

  // Initialize chat
  useEffect(() => {
    chatSession.current = createCareerChat(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle dynamic language switching
  useEffect(() => {
    if (currentLangRef.current !== language && chatSession.current) {
        // Send a system message to switch language context
        const instruction = language === 'Hinglish' 
            ? "Please switch to Hinglish (Hindi-English blend) for all future responses."
            : language === 'Hindi'
            ? "Please switch to Hindi for all future responses."
            : "Please switch to English for all future responses.";
            
        chatSession.current.sendMessage({ message: `[System Instruction: ${instruction}]` })
            .catch(err => console.error("Failed to switch lang", err));
            
        currentLangRef.current = language;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await chatSession.current.sendMessage({ message: userMsg.text });
      const botMsg: Message = { role: 'model', text: result.text || "I didn't catch that." };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateReport = async () => {
    setIsAnalyzing(true);
    const history = messages.map(m => `${m.role}: ${m.text}`).join('\n');
    const results = await generateCareerReport(history, language);
    setSuggestions(results);
    onCareerFound(results);
    setIsAnalyzing(false);
  };

  const handleLoadVideos = async (idx: number, query: string) => {
    setLoadingVideos(prev => ({...prev, [idx]: true}));
    const videos = await findVideoResources(query);
    setVideoResources(prev => ({...prev, [idx]: videos}));
    setLoadingVideos(prev => ({...prev, [idx]: false}));
  };

  // If we have results, render them. Otherwise show chat.
  if (suggestions.length > 0) {
      return (
        <div className="space-y-6 animate-fade-in">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                 <Sparkles className="text-yellow-400 fill-current" /> 
                 Your Recommended Career Paths
              </h3>
              <button 
                 onClick={() => setSuggestions([])} 
                 className="text-sm text-slate-400 hover:text-white underline"
              >
                 Back to Chat
              </button>
           </div>
           
           <div className="grid md:grid-cols-3 gap-6">
              {suggestions.map((career, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-indigo-500 transition-all flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-bold text-indigo-300">{career.title}</h4>
                          <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs font-bold">
                              {career.matchScore}% Match
                          </span>
                      </div>
                      <p className="text-slate-300 text-sm mb-4 leading-relaxed flex-1">{career.reasoning}</p>
                      
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

                      {/* Video Recommendations */}
                      <div className="mt-4 pt-4 border-t border-slate-700">
                         <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Youtube size={14} className="text-red-500" />
                            Recommended Videos
                         </h5>
                         
                         {!videoResources[idx] ? (
                            <button 
                              onClick={() => handleLoadVideos(idx, career.videoSearchQueries[0] || career.title)}
                              disabled={loadingVideos[idx]}
                              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                            >
                               {loadingVideos[idx] ? <Loader2 size={14} className="animate-spin" /> : <Youtube size={14} />}
                               Load Video Suggestions
                            </button>
                         ) : (
                            <div className="space-y-2">
                               {videoResources[idx].length > 0 ? (
                                   videoResources[idx].map((vid, vIdx) => (
                                     <a 
                                       key={vIdx} 
                                       href={vid.url} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="block bg-slate-900/50 p-2 rounded border border-slate-700 hover:border-red-500/50 transition-colors group"
                                     >
                                        <div className="flex items-start gap-2">
                                            <Youtube size={16} className="text-red-500 mt-0.5 shrink-0" />
                                            <span className="text-xs text-slate-300 group-hover:text-white line-clamp-2">{vid.title}</span>
                                        </div>
                                     </a>
                                   ))
                               ) : (
                                   <p className="text-xs text-slate-500 italic">No videos found.</p>
                               )}
                            </div>
                         )}
                      </div>
                  </div>
              ))}
           </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-indigo-400" size={24} />
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Pathfinder AI</h2>
            <p className="text-xs text-slate-400">Speaking: {language}</p>
          </div>
        </div>
        {messages.length > 4 && !isAnalyzing && (
          <button 
            onClick={generateReport}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:opacity-90 transition-all animate-pulse"
          >
            <Sparkles size={16} />
            Generate Career Report
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-700 text-slate-200 rounded-tl-none border border-slate-600'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-xs uppercase font-bold tracking-wider">
                {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                {msg.role === 'user' ? 'You' : 'AI'}
              </div>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-slate-700 rounded-2xl rounded-tl-none p-4 border border-slate-600">
               <span className="flex gap-1">
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
               </span>
             </div>
           </div>
        )}
        {isAnalyzing && (
           <div className="flex justify-center my-4">
             <div className="bg-indigo-900/50 text-indigo-200 px-6 py-3 rounded-full flex items-center gap-3 border border-indigo-500/30">
               <Sparkles className="animate-spin-slow" size={20} />
               <span>Deeply analyzing your profile with advanced reasoning...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500"
            placeholder={`Type your answer in ${language === 'Hinglish' ? 'Hinglish' : language}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isAnalyzing}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white p-3 rounded-xl transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerPathfinder;