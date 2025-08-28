const API_URL = 'http://localhost:5000/predict';

export type WeightSuggestion = {
  exerciseName: string;
  suggestedWeight: number;
};

export const sendWorkoutData = async (csvData: string): Promise<WeightSuggestion[]> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/csv',
      },
      body: csvData,
    });

    if (!response.ok) {
      // Throw an error with the status text to be caught by the caller
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const suggestions: WeightSuggestion[] = await response.json();
    return suggestions;
  } catch (error) {
    console.error('Error sending workout data:', error);
    // Re-throw the error to be handled by the UI layer
    throw error;
  }
};
