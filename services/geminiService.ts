import { GoogleGenAI, Type } from "@google/genai";
import { CalendarEvent } from '../types';

export const getStudySuggestions = async (classEvents: CalendarEvent[]): Promise<CalendarEvent[]> => {
  if (classEvents.length === 0) {
    return [];
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const eventsForPrompt = classEvents.map(e => ({
    title: e.title,
    day: e.startTime.toLocaleDateString('en-US', { weekday: 'long' }),
    startTime: e.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
    endTime: e.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
  }));
  
  const weekStartDate = new Date(classEvents[0].startTime);
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const prompt = `
    Analyze the following weekly class schedule, which runs from ${weekStartDate.toLocaleDateString()} to ${weekEndDate.toLocaleDateString()}.
    Your task is to suggest 3 to 5 optimal study blocks.
    
    RULES:
    1. Place suggestions in the empty gaps between classes.
    2. All study blocks must be between 90 minutes and 120 minutes long.
    3. Schedule study blocks only between 8:00 AM (08:00) and 10:00 PM (22:00).
    4. Ensure there is at least a 30-minute break before and after any scheduled class. Do not suggest back-to-back sessions.
    5. The title for each suggestion should be specific, like "Review for [Class Name]" or "Work on [Class Name] Assignment".
    6. The description MUST provide a clear, concise reason for the study session. It cannot be empty.
    
    Class Schedule: 
    ${JSON.stringify(eventsForPrompt)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            study_suggestions: {
              type: Type.ARRAY,
              description: "A list of suggested study sessions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { 
                    type: Type.STRING,
                    description: "A concise title for the study session, e.g., 'Study for Math'."
                  },
                  day_of_week: {
                    type: Type.STRING,
                    description: "The day of the week for the study session (e.g., 'Monday', 'Tuesday')."
                  },
                  start_time: { 
                    type: Type.STRING,
                    description: "The start time in 24-hour HH:mm format (e.g., '14:00')."
                  },
                  end_time: { 
                    type: Type.STRING,
                    description: "The end time in 24-hour HH:mm format (e.g., '15:30')."
                  },
                  description: { 
                    type: Type.STRING,
                    description: "A brief reason or focus for this study session. Must not be empty."
                  }
                },
                required: ["title", "day_of_week", "start_time", "end_time", "description"]
              }
            }
          },
          required: ["study_suggestions"]
        }
      }
    });

    const jsonText = response.text?.trim();
    if (!jsonText) {
      console.error("Received empty response from Gemini API");
      throw new Error("The AI returned an empty response.");
    }
    
    const suggestions = JSON.parse(jsonText).study_suggestions;
    
    if (!suggestions || !Array.isArray(suggestions)) {
      console.error("Invalid suggestions format from Gemini API:", jsonText);
      throw new Error("Failed to parse study suggestions from the AI response.");
    }

    const dayNameToIndex: { [key: string]: number } = {
        'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
        'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    // FIX: Add a return type annotation to the map callback to ensure type safety.
    return suggestions.map((s: any, index: number): CalendarEvent | null => {
      const dayIndex = dayNameToIndex[s.day_of_week];
      if (dayIndex === undefined) {
          console.warn(`Invalid day_of_week from AI: ${s.day_of_week}`);
          return null;
      }

      const [startHours, startMinutes] = s.start_time.split(':').map(Number);
      const [endHours, endMinutes] = s.end_time.split(':').map(Number);

      const startTime = new Date(weekStartDate);
      startTime.setDate(weekStartDate.getDate() + dayIndex);
      startTime.setHours(startHours, startMinutes, 0, 0);

      const endTime = new Date(weekStartDate);
      endTime.setDate(weekStartDate.getDate() + dayIndex);
      endTime.setHours(endHours, endMinutes, 0, 0);

      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || startTime >= endTime) {
          console.warn('Skipping invalid study suggestion due to bad time:', s);
          return null;
      }

      return {
        id: `study-${index}-${new Date().getTime()}`,
        title: s.title,
        startTime,
        endTime,
        description: s.description,
        isStudySuggestion: true,
        location: 'AI Suggestion'
      };
    }).filter((s): s is CalendarEvent => s !== null);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && (error.message.includes("AI response") || error.message.includes("AI returned an empty"))) {
      throw error;
    }
    throw new Error("Failed to generate study suggestions from AI.");
  }
};