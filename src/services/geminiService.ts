import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function parseJSONOutput(text: string | null | undefined): any {
  if (!text) return {};
  
  let cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const objectMatch = cleaned.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (innerE) {
        // Ignore and fall through
      }
    }
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (innerE) {
        // Ignore and fall through
      }
    }
    console.error("Failed to parse JSON:", text);
    throw e;
  }
}

export async function analyzeSentiment(text: string): Promise<"POSITIVE" | "NEGATIVE" | "NEUTRAL"> {
  try {
    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: `Act as a specialist in organizational psychology and employee sentiment analysis. 
Your task is to analyze the sentiment of the following employee feedback. 
Carefully consider the tone, context, and underlying emotion of the text. 
Categorize it strictly as POSITIVE, NEGATIVE, or NEUTRAL.

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

    const result = parseJSONOutput(response.text);
    return result.sentiment || "NEUTRAL";
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return "NEUTRAL";
  }
}

export async function generateInsightsReport(feedbacks: any[]): Promise<any> {
  try {
    const feedbackTexts = feedbacks.map(f => `[${f.sentiment}] ${f.text}`).join("\n");

    const response = await ai.models.generateContent({
      model: "gemma-4-31b-it",
      contents: `Act as a specialist in HR Data Analytics and Organizational Behavior.
Your task is to analyze the following monthly employee feedback and generate a comprehensive, actionable insights report for the executive team.

Instructions:
1. Carefully review the provided feedback data, paying attention to sentiment, classification, and specific details.
2. Identify recurring themes and patterns across different departments and feedback types.
3. Highlight critical areas of concern that require immediate attention.
4. Identify areas of praise to reinforce positive company culture.
5. Synthesize the data into the top 3 most important takeaways.
6. Provide concrete, actionable recommended steps that management can take to address the feedback.
7. Include a short, engaging "TL;DR" that summarizes the overall company vibe.

Feedback Data:
${feedbackTexts}`,
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

    return parseJSONOutput(response.text);
  } catch (error) {
    console.error("Error generating insights report:", error);
    throw error;
  }
}
