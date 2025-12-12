export type AppLanguage = 'English' | 'Hinglish' | 'Hindi';

export interface Message {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  education: EducationItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  id: string;
  degree: string;
  school: string;
  year: string;
}

export interface CareerSuggestion {
  title: string;
  matchScore: number;
  reasoning: string;
  roadmap: string[];
  keySkills: string[];
  videoSearchQueries: string[];
}

export interface LearningResource {
  title: string;
  url: string;
  source: string;
  description?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PATHFINDER = 'PATHFINDER',
  RESUME_BUILDER = 'RESUME_BUILDER',
  LEARNING_HUB = 'LEARNING_HUB'
}