import React, { useState } from 'react';
import { ResumeData, ExperienceItem, EducationItem, AppLanguage } from '../types';
import { enhanceResumeText, suggestSkills } from '../services/geminiService';
import { Sparkles, Plus, Trash2, Download, Printer, X, GraduationCap, Briefcase, User as UserIcon, List } from 'lucide-react';

interface ResumeBuilderProps {
  language: AppLanguage;
}

const initialResume: ResumeData = {
  fullName: "Alex Rivera",
  email: "alex.rivera@example.com",
  phone: "(555) 123-4567",
  summary: "Motivated professional looking for new opportunities to leverage skills in technology and problem solving.",
  skills: ["Communication", "Teamwork", "Project Management"],
  experience: [
    {
      id: '1',
      role: "Junior Associate",
      company: "TechCorp Inc.",
      duration: "2021 - Present",
      description: "Worked on various projects and helped the team achieve goals."
    }
  ],
  education: [
    {
      id: '1',
      degree: "B.S. Computer Science",
      school: "University of Tech",
      year: "2021"
    }
  ]
};

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ language }) => {
  const [data, setData] = useState<ResumeData>(initialResume);
  const [loadingField, setLoadingField] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);

  const updateField = (field: keyof ResumeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleEnhance = async (text: string, fieldPath: string, type: 'summary' | 'bullet') => {
    setLoadingField(fieldPath);
    const enhanced = await enhanceResumeText(text, type, language);
    
    if (fieldPath === 'summary') {
      updateField('summary', enhanced);
    } else if (fieldPath.startsWith('exp-')) {
      const id = fieldPath.split('-')[1];
      const newExp = data.experience.map(e => e.id === id ? { ...e, description: enhanced } : e);
      updateField('experience', newExp);
    }
    setLoadingField(null);
  };

  const handleSuggestSkills = async () => {
    setIsSuggestingSkills(true);
    // Construct context from summary and experience
    const context = `Summary: ${data.summary}\n\nExperience:\n` + 
        data.experience.map(e => `${e.role} at ${e.company}: ${e.description}`).join('\n');
    
    const suggestions = await suggestSkills(context, language);
    
    // Add new suggestions that aren't already present
    const newSkills = suggestions.filter(s => !data.skills.includes(s));
    if (newSkills.length > 0) {
        updateField('skills', [...data.skills, ...newSkills]);
    }
    setIsSuggestingSkills(false);
  };

  // --- Experience Handlers ---
  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: Date.now().toString(),
      role: "",
      company: "",
      duration: "",
      description: ""
    };
    updateField('experience', [...data.experience, newExp]);
  };

  const removeExperience = (id: string) => {
    updateField('experience', data.experience.filter(e => e.id !== id));
  };

  // --- Education Handlers ---
  const addEducation = () => {
    const newEdu: EducationItem = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      year: ""
    };
    updateField('education', [...data.education, newEdu]);
  };

  const removeEducation = (id: string) => {
    updateField('education', data.education.filter(e => e.id !== id));
  };

  const updateEducationItem = (id: string, field: keyof EducationItem, value: string) => {
      const newEdu = data.education.map(e => e.id === id ? { ...e, [field]: value } : e);
      updateField('education', newEdu);
  };

  // --- Skills Handlers ---
  const addSkill = () => {
    if (skillInput.trim()) {
      if (!data.skills.includes(skillInput.trim())) {
        updateField('skills', [...data.skills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateField('skills', data.skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-full gap-6">
      {/* EDITOR - SCROLLABLE ON DESKTOP, STACKED ON MOBILE */}
      <div className="w-full lg:w-1/2 lg:overflow-y-auto pr-0 lg:pr-2 pb-10 lg:pb-20 no-print order-2 lg:order-1">
        <div className="space-y-6">
          
          {/* Personal Info */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 mb-4 text-slate-300">
               <UserIcon size={20} />
               <h3 className="text-xl font-bold text-white">Personal Info</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                placeholder="Full Name" 
                value={data.fullName}
                onChange={e => updateField('fullName', e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input 
                placeholder="Email" 
                value={data.email}
                onChange={e => updateField('email', e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input 
                placeholder="Phone" 
                value={data.phone}
                onChange={e => updateField('phone', e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none md:col-span-2"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg relative group">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                <List size={20} />
                <h3 className="text-xl font-bold text-white">Professional Summary</h3>
              </div>
              <button 
                onClick={() => handleEnhance(data.summary, 'summary', 'summary')}
                disabled={!!loadingField}
                className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full transition-all"
              >
                {loadingField === 'summary' ? <span className="animate-spin">⟳</span> : <Sparkles size={12} />}
                AI Enhance
              </button>
            </div>
            <textarea 
              rows={4}
              value={data.summary}
              onChange={e => updateField('summary', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Experience */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                 <Briefcase size={20} />
                 <h3 className="text-xl font-bold text-white">Experience</h3>
              </div>
              <button onClick={addExperience} className="text-indigo-400 hover:text-indigo-300"><Plus size={20}/></button>
            </div>
            
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 relative">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <input 
                      placeholder="Job Title" 
                      value={exp.role} 
                      onChange={e => {
                        const newExp = data.experience.map(x => x.id === exp.id ? {...x, role: e.target.value} : x);
                        updateField('experience', newExp);
                      }}
                      className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                    />
                    <input 
                      placeholder="Company" 
                      value={exp.company}
                      onChange={e => {
                        const newExp = data.experience.map(x => x.id === exp.id ? {...x, company: e.target.value} : x);
                        updateField('experience', newExp);
                      }}
                      className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                    />
                    <input 
                      placeholder="Duration" 
                      value={exp.duration}
                      onChange={e => {
                        const newExp = data.experience.map(x => x.id === exp.id ? {...x, duration: e.target.value} : x);
                        updateField('experience', newExp);
                      }}
                      className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm md:col-span-2"
                    />
                  </div>
                  <div className="relative">
                    <textarea 
                      placeholder="Describe your responsibilities..."
                      rows={3}
                      value={exp.description}
                      onChange={e => {
                        const newExp = data.experience.map(x => x.id === exp.id ? {...x, description: e.target.value} : x);
                        updateField('experience', newExp);
                      }}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                    />
                    <button 
                      onClick={() => handleEnhance(exp.description, `exp-${exp.id}`, 'bullet')}
                      disabled={!!loadingField}
                      className="absolute bottom-2 right-2 text-indigo-400 hover:text-white bg-slate-900/80 p-1.5 rounded-full hover:bg-indigo-600 transition-colors"
                    >
                       {loadingField === `exp-${exp.id}` ? <span className="animate-spin block w-4 h-4">⟳</span> : <Sparkles size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-slate-300">
                 <GraduationCap size={20} />
                 <h3 className="text-xl font-bold text-white">Education</h3>
              </div>
              <button onClick={addEducation} className="text-indigo-400 hover:text-indigo-300"><Plus size={20}/></button>
            </div>
            
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-600 relative">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-2 right-2 text-slate-500 hover:text-red-400"><Trash2 size={16}/></button>
                  <div className="grid grid-cols-1 gap-2">
                    <input 
                      placeholder="School / University" 
                      value={edu.school} 
                      onChange={e => updateEducationItem(edu.id, 'school', e.target.value)}
                      className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                        placeholder="Degree / Certificate" 
                        value={edu.degree}
                        onChange={e => updateEducationItem(edu.id, 'degree', e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                        />
                        <input 
                        placeholder="Year (e.g. 2020 - 2024)" 
                        value={edu.year}
                        onChange={e => updateEducationItem(edu.id, 'year', e.target.value)}
                        className="bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm"
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

           {/* Skills Section */}
           <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles size={20} />
                    <h3 className="text-xl font-bold text-white">Skills</h3>
                 </div>
                 <button 
                    onClick={handleSuggestSkills}
                    disabled={isSuggestingSkills}
                    className="flex items-center gap-1 text-xs bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded-full transition-all"
                 >
                    {isSuggestingSkills ? <span className="animate-spin">⟳</span> : <Sparkles size={12} />}
                    AI Suggest
                 </button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <input 
                placeholder="Add a skill (e.g. React, Python)" 
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button 
                onClick={addSkill}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-600 text-slate-200 px-3 py-1.5 rounded-full text-sm flex items-center gap-2 group">
                  <span>{skill}</span>
                  <button 
                    onClick={() => removeSkill(skill)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* PREVIEW - FIXED ON DESKTOP, STACKED BELOW EDITOR ON MOBILE */}
      <div className="w-full lg:w-1/2 flex flex-col h-auto lg:h-full order-1 lg:order-2">
         <div className="mb-4 flex justify-between lg:justify-end gap-2 no-print items-center">
             <span className="lg:hidden text-sm text-slate-400 font-bold uppercase">Resume Preview</span>
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Printer size={18} /> Print / Save PDF
            </button>
         </div>
         <div id="resume-preview" className="flex-1 bg-white text-slate-900 p-8 rounded shadow-2xl overflow-y-auto min-h-[500px] lg:min-h-0">
            {/* Resume Preview HTML */}
            <div className="max-w-[800px] mx-auto">
               <header className="border-b-2 border-slate-800 pb-4 mb-6">
                 <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-slate-900">{data.fullName}</h1>
                 <div className="flex gap-4 text-sm text-slate-600 font-medium">
                   <span>{data.email}</span>
                   <span>•</span>
                   <span>{data.phone}</span>
                 </div>
               </header>

               {data.summary && (
                   <section className="mb-6">
                     <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">Professional Summary</h2>
                     <p className="text-slate-800 leading-relaxed text-sm">{data.summary}</p>
                   </section>
               )}

               {data.experience.length > 0 && (
                   <section className="mb-6">
                     <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">Experience</h2>
                     <div className="space-y-5">
                       {data.experience.map(exp => (
                         <div key={exp.id}>
                           <div className="flex justify-between items-baseline mb-1">
                             <h3 className="font-bold text-lg text-slate-900">{exp.role}</h3>
                             <span className="text-sm font-medium text-slate-500">{exp.duration}</span>
                           </div>
                           <div className="text-indigo-700 font-medium text-sm mb-2">{exp.company}</div>
                           <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                         </div>
                       ))}
                     </div>
                   </section>
               )}

               {data.education.length > 0 && (
                   <section className="mb-6">
                     <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">Education</h2>
                     <div className="space-y-3">
                       {data.education.map(edu => (
                         <div key={edu.id}>
                           <div className="flex justify-between items-baseline">
                             <h3 className="font-bold text-slate-900">{edu.school}</h3>
                             <span className="text-sm text-slate-500">{edu.year}</span>
                           </div>
                           <div className="text-sm text-slate-700">{edu.degree}</div>
                         </div>
                       ))}
                     </div>
                   </section>
               )}

               {data.skills.length > 0 && (
                   <section>
                     <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3 border-b border-slate-200 pb-1">Skills</h2>
                     <div className="flex flex-wrap gap-2">
                       {data.skills.map((skill, idx) => (
                         <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                           {skill}
                         </span>
                       ))}
                     </div>
                   </section>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;