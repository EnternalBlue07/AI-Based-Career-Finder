import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CareerSuggestion, LearningResource, AppLanguage } from "../types";

// Initialize the API client
// CRITICAL: Using named parameter as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * PATHFINDER SERVICE
 * Uses conversational AI to interview the user.
 */
export const createCareerChat = (language: AppLanguage) => {
  let langInstruction = "Respond in English.";
  if (language === 'Hinglish') {
    langInstruction = "Respond in Hinglish (a natural, conversational blend of Hindi and English). Use Roman script for Hindi words. Keep the tone friendly and relatable.";
  } else if (language === 'Hindi') {
    langInstruction = "Respond in Hindi (Devanagari script).";
  }

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are an expert Career Counselor AI. Your goal is to help the user discover their ideal career path.
      1. ${langInstruction}
      2. Ask short, probing questions one by one about their interests, strengths, preferred working environment, and hobbies.
      3. Do not give long lectures. Keep it conversational.
      4. After gathering enough info (usually 4-5 turns), offer to generate a "Final Career Report".`,
    },
  });
};

/**
 * CAREER REPORT GENERATION
 * Uses Thinking Config for deep reasoning about career compatibility.
 */
export const generateCareerReport = async (chatHistory: string, language: AppLanguage): Promise<CareerSuggestion[]> => {
  const langContext = language === 'Hinglish' ? "in Hinglish (or English where technical terms apply)" : `in ${language}`;
  
  const prompt = `Based on the following conversation history, analyze the user's profile deeply and suggest top 3 ideal career paths.
  
  Conversation History:
  ${chatHistory}
  
  Provide the output in JSON format. The 'reasoning' and 'roadmap' fields should be written ${langContext}.
  Also generate 2 specific YouTube search queries (e.g., "Day in the life of a Data Scientist", "React JS Roadmap 2025") for each career to help the user learn more.
  `;

  const responseSchema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        matchScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating fit" },
        reasoning: { type: Type.STRING, description: "Why this fits the user based on the chat" },
        roadmap: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING },
          description: "Step-by-step learning path"
        },
        keySkills: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        videoSearchQueries: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Specific search queries to find good YouTube videos about this career."
        }
      },
      required: ["title", "matchScore", "reasoning", "roadmap", "keySkills", "videoSearchQueries"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High intelligence model for synthesis
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 4096 } // Moderate thinking budget for reasoning
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as CareerSuggestion[];
  } catch (error) {
    console.error("Error generating career report:", error);
    return [];
  }
};

/**
 * RESUME ENHANCEMENT
 * Rewrites resume content to be more professional.
 */
export const enhanceResumeText = async (currentText: string, type: 'summary' | 'bullet', language: AppLanguage): Promise<string> => {
  const instruction = type === 'summary' 
    ? "Rewrite this professional summary to be impactful, concise, and keyword-rich for a resume."
    : "Rewrite this experience description into strong, action-oriented bullet points quantifying achievements where possible.";

  // For resumes, Standard English is usually preferred even for Hinglish speakers, 
  // but if the user explicitly selects Hindi, we provide Hindi.
  let langInstruction = "Output in Professional English.";
  if (language === 'Hindi') langInstruction = "Output in formal Hindi.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${instruction}\n\n${langInstruction}\n\nInput Text:\n"${currentText}"`,
    });
    return response.text || currentText;
  } catch (error) {
    console.error("Resume enhancement failed", error);
    return currentText;
  }
};

/**
 * SKILL SUGGESTION
 * Suggests skills based on the user's resume context.
 */
export const suggestSkills = async (context: string, language: AppLanguage): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following professional profile summary and experience, list 5 to 7 relevant hard and soft skills that would improve this resume. Return only the skills as a JSON array of strings.
      
      Context:
      ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Skill suggestion failed", error);
    return [];
  }
};

/**
 * LEARNING HUB (Grounding)
 * Uses Google Search to find real courses and tutorials.
 */
export const findLearningResources = async (query: string, language: AppLanguage): Promise<LearningResource[]> => {
  try {
    const langQuery = language === 'Hinglish' || language === 'Hindi' 
      ? `Find resources for learning "${query}". If available, include resources in Hindi or Hinglish, otherwise English.`
      : `Find the best and most recent online courses, tutorials, or documentation to learn: "${query}". Return a list of specific URLs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using flash for speed + tool use
      contents: langQuery,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract grounding chunks
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const resources: LearningResource[] = [];

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web?.uri && chunk.web?.title) {
          resources.push({
            title: chunk.web.title,
            url: chunk.web.uri,
            source: new URL(chunk.web.uri).hostname,
            description: "Found via Google Search Grounding"
          });
        }
      });
    }
    
    // Deduplicate based on URL
    return Array.from(new Map(resources.map(item => [item.url, item])).values());

  } catch (error) {
    console.error("Search grounding failed", error);
    return [];
  }
};

/**
 * VIDEO FINDER
 * Uses Google Search to find YouTube videos.
 */
export const findVideoResources = async (query: string): Promise<LearningResource[]> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find the best YouTube videos for: "${query}". Return 2-3 specific video URLs from youtube.com.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
  
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const resources: LearningResource[] = [];
  
      if (chunks) {
        chunks.forEach((chunk) => {
          if (chunk.web?.uri && chunk.web?.title && chunk.web.uri.includes('youtube.com')) {
            resources.push({
              title: chunk.web.title.replace(' - YouTube', ''),
              url: chunk.web.uri,
              source: 'YouTube',
              description: "Recommended Video"
            });
          }
        });
      }
      return Array.from(new Map(resources.map(item => [item.url, item])).values()).slice(0, 3);
    } catch (error) {
      console.error("Video search failed", error);
      return [];
    }
  };