"use client"

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

// Load API key from environment variables
const genAI = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""});
console.log("Gemini API Key:", process.env.NEXT_PUBLIC_GOOGLE_API_KEY);

interface TripPreferences {
  days: string; // in days
  startPoint?: string;
  destinationPoint?: string;
  interests?: string[];
  includeMeals?: boolean;
  lunchPref?: string;
  dinnerPref?: string;
  budget?: string;
  notes?: string;
}

export interface LocationI {
  name: string
  longitude: string
  latitude: string
}

interface UseGeminiRoutePlannerReturn {
  loading: boolean;
  error: string | null;
  route: { start: LocationI | null, destination: LocationI | null, stops: LocationI[] }
  getRouteSuggestions: (prefs: TripPreferences) => Promise<void>;
}

export default function useRoutePlanner(): UseGeminiRoutePlannerReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<{ start: LocationI | null, destination: LocationI | null, stops: LocationI[] }>({ start: null, destination: null, stops: []});

  const getRouteSuggestions = async (prefs: TripPreferences) => {
    setLoading(true);
    setError(null);

    try {

      // Build the prompt
      const prompt = `
      You are a travel route planner.
      Based on these preferences:
      - Length of trip: ${prefs.days} days
      - Start point: ${prefs.startPoint || "Not specified"}
      - Destination point: ${prefs.destinationPoint || "Not specified"}
      - Interests: ${prefs.interests?.join(", ") || "Not specified"}
      - Accommodate meals: ${prefs.includeMeals ? "Yes" : "No"}
      ${prefs.includeMeals ? `Lunch: ${prefs.lunchPref || "No preference"}, Dinner: ${prefs.dinnerPref || "No preference"}` : ""}
      - Budget range: ${prefs.budget || "Not specified"}
      - Additional notes: ${prefs.notes || "Not specified"}

      Please return ONLY a JSON response with the following format for the trip route.
      Example:
      {
        "start": { name: "Golden Gate Bridge, San Francisco, CA", longitude: 142.819827, latitude: 132.38881 },
          "destination": { name: "Chinatown, Stockton St, San Francisco, CA 94108", longitude: 144.1278127, latitude: 139.187281 },
        "day-1": {
          stops: [{ name: "Fisherman's Wharf, 505 Beach St, San Francisco, CA 94133", longitude: 138.127893, latitude: 124.187217 }]
        },
        "day-2": {
          stops: [{ name: "Lombard Street, San Francisco, CA", longitude: 122.419415, latitude: 37.802074 }]
        }
      }
      `;

      console.log(prompt)

      const response = await genAI.models.generateContent({ model: "gemini-2.5-pro", contents: prompt});

      // Extract and parse JSON safely
      const text = response.text?.trim();
      if(!text) {
        console.error("Gemini ran into some error")
        return;
      }
      const cleanedText = text.replace(/```json|```/g, "").trim();

      try {
        const locations = JSON.parse(cleanedText);
        console.log("Locations: ", locations)
        setRoute(locations)
      } catch (err) {
        console.error(err)
        throw new Error("Failed to parse AI response");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, route, getRouteSuggestions };
}
