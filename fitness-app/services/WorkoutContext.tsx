import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export type WorkoutSet = {
  id: string;
  weight: number;
  reps: number;
  rir: number;
};

export type DropSetPart = {
  weight: number;
  reps: number;
};

export type DropSet = {
  id: string;
  parts: DropSetPart[];
};

export type RestPausePart = {
  reps: number;
};

export type RestPauseSet = {
  id: string;
  weight: number;
  parts: RestPausePart[];
};

export type Workout = {
  id: string;
  name: string;
  sets: WorkoutSet[];
  dropSets: DropSet[];
  restPauseSets: RestPauseSet[];
};

type WorkoutContextType = {
  workoutsByDate: Record<string, Workout[]>; // Key: YYYY-MM-DD
  allExerciseNames: string[];
  getWorkoutsForDate: (date: Date) => Workout[];
  addWorkoutToDate: (date: Date, workoutName: string) => void;
  addSetToWorkout: (date: Date, workoutId: string, set: Omit<WorkoutSet, 'id'>) => void;
  addDropSetToWorkout: (date: Date, workoutId: string, parts: DropSetPart[]) => void;
  addRestPauseSetToWorkout: (date: Date, workoutId: string, weight: number, parts: RestPausePart[]) => void;
  getWorkoutById: (date: Date, workoutId: string) => Workout | undefined;
};

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

const WORKOUTS_KEY = 'workoutsByDate_v1';
const EXERCISES_KEY = 'allExerciseNames_v1';

// Helper to get a date string key
const toDateString = (date: Date) => date.toISOString().split('T')[0];

export const WorkoutProvider = ({ children }: { children: ReactNode }) => {
  const [workoutsByDate, setWorkoutsByDate] = useState<Record<string, Workout[]>>({});
  const [allExerciseNames, setAllExerciseNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const workoutsJSON = await AsyncStorage.getItem(WORKOUTS_KEY);
        if (workoutsJSON) {
          setWorkoutsByDate(JSON.parse(workoutsJSON));
        }

        const exercisesJSON = await AsyncStorage.getItem(EXERCISES_KEY);
        if (exercisesJSON) {
          setAllExerciseNames(JSON.parse(exercisesJSON));
        } else {
          setAllExerciseNames(['Bench Press', 'Squat', 'Deadlift']);
        }
      } catch (e) {
        console.error("Failed to load data from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to AsyncStorage on change
  useEffect(() => {
    if (isLoading) return;

    const saveData = async () => {
      try {
        const workoutsJSON = JSON.stringify(workoutsByDate);
        await AsyncStorage.setItem(WORKOUTS_KEY, workoutsJSON);

        const exercisesJSON = JSON.stringify(allExerciseNames);
        await AsyncStorage.setItem(EXERCISES_KEY, exercisesJSON);
      } catch (e) {
        console.error("Failed to save data to storage", e);
      }
    };

    saveData();
  }, [workoutsByDate, allExerciseNames, isLoading]);

  const getWorkoutsForDate = (date: Date) => {
    const dateKey = toDateString(date);
    return workoutsByDate[dateKey] || [];
  };

  const getWorkoutById = (date: Date, workoutId: string) => {
    const dateKey = toDateString(date);
    const workouts = workoutsByDate[dateKey] || [];
    return workouts.find(w => w.id === workoutId);
  };

  const addWorkoutToDate = (date: Date, workoutName: string) => {
    const dateKey = toDateString(date);
    const newWorkout: Workout = {
      id: `${dateKey}-${workoutName.replace(/\s+/g, '-')}-${Date.now()}`,
      name: workoutName,
      sets: [],
      dropSets: [],
      restPauseSets: [],
    };

    setWorkoutsByDate(prev => {
      const existingWorkouts = prev[dateKey] || [];
      return { ...prev, [dateKey]: [...existingWorkouts, newWorkout] };
    });

    if (!allExerciseNames.includes(workoutName)) {
      setAllExerciseNames(prev => [...prev, workoutName].sort());
    }
  };

  const updateWorkout = (date: Date, workoutId: string, updateFn: (workout: Workout) => Workout) => {
    const dateKey = toDateString(date);
    setWorkoutsByDate(prev => {
      const dayWorkouts = prev[dateKey] || [];
      const updatedWorkouts = dayWorkouts.map(workout => {
        if (workout.id === workoutId) {
          return updateFn(workout);
        }
        return workout;
      });
      return { ...prev, [dateKey]: updatedWorkouts };
    });
  };

  const addSetToWorkout = (date: Date, workoutId: string, set: Omit<WorkoutSet, 'id'>) => {
    updateWorkout(date, workoutId, workout => ({
      ...workout,
      sets: [...workout.sets, { ...set, id: `set-${Date.now()}` }],
    }));
  };

  const addDropSetToWorkout = (date: Date, workoutId: string, parts: DropSetPart[]) => {
    updateWorkout(date, workoutId, workout => ({
      ...workout,
      dropSets: [...workout.dropSets, { id: `ds-${Date.now()}`, parts }],
    }));
  };

  const addRestPauseSetToWorkout = (date: Date, workoutId: string, weight: number, parts: RestPausePart[]) => {
    updateWorkout(date, workoutId, workout => ({
      ...workout,
      restPauseSets: [...workout.restPauseSets, { id: `rp-${Date.now()}`, weight, parts }],
    }));
  };

  const value = {
    workoutsByDate,
    allExerciseNames,
    getWorkoutsForDate,
    addWorkoutToDate,
    addSetToWorkout,
    addDropSetToWorkout,
    addRestPauseSetToWorkout,
    getWorkoutById,
  };

  if (isLoading) {
    return null; // Or render a loading indicator
  }

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkouts = () => {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
};
