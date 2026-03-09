import { GoogleGenAI, Modality, Type, FunctionDeclaration } from "@google/genai";
import { base64ToUint8Array, decodeAudioData } from "../utils/audioUtils";

const apiKey = process.env.API_KEY || '';

// For features requiring user-selected keys (Veo/Pro Image)
const getClientWithUserKey = async () => {
  // @ts-ignore
  if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
     // The SDK automatically picks up the key from the environment/context in this mode
     return new GoogleGenAI({ apiKey: 'ignored-in-this-context' }); 
  }
  // Fallback or error if not selected, but we usually check before calling this
  return new GoogleGenAI({ apiKey }); 
};

const getClient = () => new GoogleGenAI({ apiKey });

// Helper: Retry logic for 429 Errors and transient 500 errors
const withRetry = async <T>(operation: () => Promise<T>, retries = 5, delay = 3000): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Extract status code and message safely from various error structures
    const status = error.status || error.code || error?.error?.code || error?.error?.status;
    const message = error.message || error?.error?.message || JSON.stringify(error);
    
    const isRetryable = 
      status === 429 || 
      status === 503 || 
      status === 500 || 
      message.includes('429') || 
      message.includes('Quota') || 
      message.includes('RESOURCE_EXHAUSTED') ||
      message.includes('Internal Server Error') ||
      message.includes('Overloaded') ||
      message.includes('503') ||
      message.includes('500');

    if (isRetryable && retries > 0) {
      console.warn(`AI Error (${status || 'Unknown Status'}). Retrying in ${delay}ms...`, message);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Exponential backoff
      return withRetry(operation, retries - 1, delay * 2);
    }
    
    if (status === 429 || message.includes('Quota') || message.includes('RESOURCE_EXHAUSTED')) {
      throw new Error("AI Quota exceeded. Please try again later.");
    }
    
    throw error;
  }
};

// 1. Analyze Artifact (Vision)
export const analyzeArtifact = async (base64Image: string, mimeType: string, mode: 'fast' | 'deep' = 'deep') => {
  return withRetry(async () => {
    const ai = getClient();
    // Use Flash for speed, Pro for deep reasoning. Both use Search for accuracy.
    const model = mode === 'fast' ? "gemini-3-flash-preview" : "gemini-3-pro-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: `You are an expert cultural anthropologist and art historian specializing in African artifacts, textiles (Kente, Adinkra, Leso, Ankara, Bogolanfini), and symbolism. 
          
          Analyze this image in detail.
          
          Structure your response with these sections:
          1. **Identification**: Specific name of the object, mask, sculpture, or textile pattern (e.g., "Nsubura" Kente pattern, "Benin Bronze Head").
          2. **Cultural Origin**: The ethnic group, country, or region (e.g., "Ashanti people of Ghana", "Yoruba of Nigeria").
          3. **Symbolism & Meaning**: Interpret the colors, motifs, and symbols. If there is text (like on a Leso/Kanga), transcribe and translate it.
          4. **Usage & Context**: How is this used? (e.g., funerals, weddings, royalty, daily wear).
          
          Use Google Search to verify specific pattern names or obscure artifacts if needed.` }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }], // Enable grounding for high accuracy
        thinkingConfig: mode === 'deep' ? { thinkingBudget: 2048 } : undefined, // Light thinking for deep mode if supported by model version, otherwise ignored
      }
    });
    
    return {
      text: response.text || "No analysis generated.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  });
};

// 2. Knowledge Base Search (Grounding)
export const searchCulturalKnowledge = async (query: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  });
};

// 3. Image Generation (Pro Image - High Quality)
export const generateDesign = async (prompt: string, size: '1K' | '2K' | '4K') => {
  return withRetry(async () => {
    // Use client with user selected key
    const ai = await getClientWithUserKey();
    const model = "gemini-3-pro-image-preview";
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: `A traditional African textile design. ${prompt}` }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1"
        }
      }
    });

    // Extract images
    const images: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }
    return images;
  });
};

// 4. Image Editing (Flash Image)
export const editDesign = async (imageBase64: string, mimeType: string, prompt: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-2.5-flash-image"; // Nano Banana

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: imageBase64 } },
          { text: prompt }
        ]
      }
    });

    const images: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          images.push(`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
        }
      }
    }
    return images;
  });
};

// 5. Transcribe Audio
export const transcribeAudio = async (audioBase64: string, mimeType: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: "Transcribe this audio. If it contains Swahili or other African languages, detect and translate the gist into English as well." }
        ]
      }
    });
    return response.text;
  });
};

// 6. Live API Connection helper
export const getLiveClient = () => {
    return new GoogleGenAI({ apiKey });
}

// 7. Generate Quiz Question (JSON Schema)
export const generateQuizQuestion = async (category: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-3-flash-preview";

    const response = await ai.models.generateContent({
      model,
      contents: `Generate a unique and challenging multiple-choice question about ${category}. Do not repeat common general knowledge. Focus on specific proverbs, historical events, or symbol meanings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctIndex", "explanation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to generate quiz");
  });
};

// 8. Generate Story
export const generateStory = async (topic: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-3-pro-preview"; // Using Pro for creative writing

    const response = await ai.models.generateContent({
      model,
      contents: `You are an expert African Storyteller (Griot). 
      Generate a short, engaging folktale or story (approx 200 words) based on the theme or symbol: "${topic}". 
      Include a moral or proverb at the end.`
    });
    return response.text;
  });
};

// 9. Generate Speech
export const generateSpeech = async (text: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-2.5-flash-preview-tts";

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } 
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    
    // Decode logic for browser playback
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioData = base64ToUint8Array(base64Audio);
    const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
    
    return audioBuffer;
  });
};

// 10. Moderate Content
export const moderateContent = async (text: string, imageBase64?: string) => {
  return withRetry(async () => {
    const ai = getClient();
    const model = "gemini-3-flash-preview";
    
    const parts: any[] = [];
    if (imageBase64) {
      const [mimePrefix, base64Data] = imageBase64.split(',');
      const mimeType = mimePrefix.match(/:(.*?);/)?.[1] || 'image/png';
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }
    parts.push({ text: `Task: Review this content for a Cultural Heritage Community Board.
    1. Safety Check: Is it free of hate speech, nudity, or offensive content?
    2. Relevance: Is it related to culture, history, art, or personal stories?
    
    If UNSAFE or IRRELEVANT: Return "UNSAFE".
    If SAFE: Return a short, encouraging "Curator Note" (1 sentence) appreciating the share or adding a fun fact.
    
    Content: "${text}"` });

    const response = await ai.models.generateContent({
      model,
      contents: { parts }
    });

    const result = response.text?.trim() || "UNSAFE";
    if (result.includes("UNSAFE")) return "UNSAFE";
    return result;
  });
};