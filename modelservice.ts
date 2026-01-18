// This service now uses a local Ollama instance instead of the Gemini API.
import { NewsArticle, ReportType } from '../types';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

// --- Ollama Model Configuration ---
// IMPORTANT: Set these to the exact names of the models on your local system.
// You can check the correct model names by running `ollama list` in your terminal.
const OLLAMA_VISION_MODEL = 'llava'; 
const OLLAMA_TEXT_MODEL = 'granite3.1-dense:2b';

// --- Helper Functions ---

/**
 * Converts a File object to a plain Base64 string for Ollama.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};


/**
 * Generates a specific prompt for the TEXT-ONLY Ollama model (Granite).
 */
const getPromptForReportType = (reportType: ReportType, description: string): string => {
  const baseInstruction = `You are an AI assistant for an animal rescue organization. Your task is to analyze a text description of an incident and assign a priority level. Respond ONLY with a valid JSON object containing two keys: "priority" and "justification". Do not include any other text, explanations, or markdown formatting. The priority must be one of: "High", "Medium", "Low", "Info", or "Manual Review". The justification should be a single, brief sentence.`;

  let contextInstruction = '';
  switch (reportType) {
    case ReportType.Emergency:
      contextInstruction = `The report is for a "Medical Emergency". Assess urgency based on keywords like "bleeding", "unconscious", "unable to move", "seizures", "hit by vehicle". Severe injury implies "High" priority.`;
      break;
    case ReportType.Abuse:
      contextInstruction = `The report is for "Abuse or Neglect". Intentional cruelty warrants "High" priority. Signs of long-term neglect (very skinny, matted fur) should be "Medium".`;
      break;
    default:
      contextInstruction = `This is a routine request or informational report. Assign "Low" or "Info" priority.`;
  }
  
  return `${baseInstruction} ${contextInstruction} The user's report is: "${description}"`;
};

// --- Fallback Data ---

export const defaultNews: NewsArticle[] = [
    { 
      title: 'The Hidden Threats: Understanding Diseases That Affect Dogs Health', 
      summary: 'Learn about common diseases affecting street dogs and how community efforts can help in prevention and treatment.', 
      image_query: '',
      imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=788&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    { 
      title: 'Rabies in Dogs: What You Need to Know to Keep Them Safe and Healthy', 
      summary: 'Understand the importance of vaccination and how to identify signs of rabies to protect both dogs and humans.', 
      image_query: '',
      imageUrl: 'https://images.unsplash.com/photo-1619239533200-5bbf4ec5bcf1?q=80&w=1740&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
    { 
      title: 'Canine Parvovirus (Parvo): Every Dog Lover Needs to Know', 
      summary: 'A guide to understanding Parvovirus, its symptoms, and the critical need for vaccination, especially for puppies.', 
      image_query: '',
      imageUrl: 'https://images.unsplash.com/photo-1544568100-847a948585b9?q=80&w=1548&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
];

// --- AI Service Functions ---

/**
 * Assesses an animal case using a local Ollama model.
 * Uses a vision model if an image is provided, otherwise falls back to a text model.
 * @param description The text description of the incident.
 * @param reportType The type of report being filed.
 * @param imageFile The (optional) image file for vision analysis.
 * @returns A promise that resolves with the priority and justification.
 */
export const assessAnimalPriority = async (
    description: string, 
    reportType: ReportType,
    imageFile: File | null
): Promise<{priority: string, justification: string}> => {
  
  // Guard clause for empty inputs
  if (!imageFile && !description.trim()) {
      return { priority: 'Manual Review', justification: 'No information provided.' };
  }

  try {
    let requestBody;

    if (imageFile) {
        // --- VISION MODEL LOGIC (Llava) ---
        const base64Image = await fileToBase64(imageFile);
        const visionPrompt = `Analyze this image of a street animal, considering the user's description: "${description}". Based on visible signs of injury, distress, or illness, assess the medical urgency. Respond with ONLY a JSON object with two keys: "priority" (must be "High", "Medium", or "Low") and "justification" (a brief, one-sentence explanation).`;
        
        requestBody = {
            model: OLLAMA_VISION_MODEL,
            prompt: visionPrompt,
            images: [base64Image],
            format: "json",
            stream: false
        };
    } else {
        // --- TEXT MODEL LOGIC (IBM Granite) ---
        const textPrompt = getPromptForReportType(reportType, description);
        requestBody = {
            model: OLLAMA_TEXT_MODEL,
            prompt: textPrompt,
            format: 'json',
            stream: false,
        };
    }
    
    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        throw new Error(`Ollama API request failed with status ${response.status}.`);
    }

    const data = await response.json();
    const content = JSON.parse(data.response);
    
    return {
        priority: content.priority || 'Manual Review',
        justification: content.justification || 'Analysis incomplete. Manual review required.'
    };

  } catch (error) {
    const modelUsed = imageFile ? OLLAMA_VISION_MODEL : OLLAMA_TEXT_MODEL;
    console.error(`[Karunya Kripa] Ollama API error (assessAnimalPriority with ${modelUsed}):`, error);
    return {
        priority: 'Manual Review',
        justification: `AI analysis will not be done for video. Video will be manually assessed`
    };
  }
};


/**
 * Refines a raw location string using a local Ollama text model.
 * @param rawInput The raw location string from the user.
 * @returns A refined, more searchable location string.
 */
export const refineLocationQuery = async (rawInput: string): Promise<string> => {
  if (!rawInput.trim()) {
    return rawInput;
  }
  try {
    const prompt = `Given the user-provided location in Mangalore, India: "${rawInput}". Refine it into a precise, searchable address like "Landmark, Area, Mangalore". Remove ambiguous terms. If it's already a good address, return it. Respond with only the refined address.`;

    const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_TEXT_MODEL,
            prompt: prompt,
            stream: false,
        }),
    });

    if (!response.ok) {
        throw new Error(`Ollama API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const refinedLocation = data.response?.trim().replace(/"/g, ''); 
    
    if (refinedLocation) {
        return refinedLocation;
    }
    return rawInput;
  } catch (error) {
    console.error(`[Karunya Kripa] Ollama API error (refineLocationQuery):`, error);
    return rawInput; 
  }
};