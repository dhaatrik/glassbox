import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeSentiment(text: string): Promise<"POSITIVE" | "NEGATIVE" | "NEUTRAL"> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the sentiment of the following employee feedback. Categorize it strictly as POSITIVE, NEGATIVE, or NEUTRAL.

Feedback: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"],
              description: "The sentiment of the feedback",
            },
          },
          required: ["sentiment"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return result.sentiment || "NEUTRAL";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "NEUTRAL";
  }
}

export async function generateInsightsReport(feedbacks: any[]): Promise<any> {
  try {
    const feedbackTexts = feedbacks.map(f => `[${f.sentiment}] ${f.classification} - ${f.text}`).join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are an HR data analyst. Analyze the following monthly employee feedback and generate an actionable insights report.
      
Feedback Data:
${feedbackTexts}

Generate a report that includes:
1. Recurring Themes (list of strings)
2. Areas of Concern (list of strings)
3. Areas of Praise (list of strings)
4. Top 3 Takeaways (list of strings)
5. Recommended Actions (list of strings)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tldr: {
              type: Type.STRING,
              description: "A short, Gen Z style TL;DR of the overall company vibe based on the feedback.",
            },
            recurringThemes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Recurring themes in the feedback",
            },
            areasOfConcern: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Areas of concern highlighted in the feedback",
            },
            areasOfPraise: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Areas of praise highlighted in the feedback",
            },
            topTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Top 3 takeaways from the feedback",
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Concrete, actionable steps management can take",
            },
          },
          required: [
            "tldr",
            "recurringThemes",
            "areasOfConcern",
            "areasOfPraise",
            "topTakeaways",
            "recommendedActions",
          ],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating insights report:", error);
    throw error;
  }
}
