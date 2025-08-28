import { Workout } from "@/services/WorkoutContext";

// Helper to escape CSV fields
const escapeCsvField = (field: any): string => {
  const stringField = String(field ?? '');
  if (/[",\n]/.test(stringField)) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};

export const generateWorkoutCSV = (workouts: Workout[]): string => {
  if (workouts.length === 0) {
    return '';
  }

  // Determine the maximum number of sets for dynamic column generation
  const maxRegularSets = Math.max(0, ...workouts.map(w => w.sets.length));
  const maxDropSets = Math.max(0, ...workouts.map(w => w.dropSets.length));
  const maxRestPauseSets = Math.max(0, ...workouts.map(w => w.restPauseSets.length));

  // --- Create Header Row ---
  const headers = [
    'Date',
    'Exercise Name',
    'Target Sets',
    'Target Reps',
    'Target Rest',
    'Target RIR',
    'Weight Used',
  ];

  for (let i = 1; i <= maxRegularSets; i++) {
    headers.push(`Set ${i} Reps`, `Set ${i} RIR`);
  }
  for (let i = 1; i <= maxDropSets; i++) {
    headers.push(`Drop Set ${i}`);
  }
  for (let i = 1; i <= maxRestPauseSets; i++) {
    headers.push(`Rest-Pause Set ${i}`);
  }

  // --- Create Data Rows ---
  const rows = workouts.map(workout => {
    const row = [
      new Date().toISOString().split('T')[0], // Assuming export is for today
      workout.name,
      '', // Target Sets
      '', // Target Reps
      '', // Target Rest
      '', // Target RIR
      workout.sets.length > 0 ? workout.sets[0].weight : '', // Weight Used
    ];

    // Add regular set data
    for (let i = 0; i < maxRegularSets; i++) {
      const set = workout.sets[i];
      row.push(set ? set.reps : '', set ? set.rir : '');
    }

    // Add drop set data (serialized)
    for (let i = 0; i < maxDropSets; i++) {
      const dropSet = workout.dropSets[i];
      row.push(dropSet ? dropSet.parts.map(p => `${p.weight}kgx${p.reps}`).join(', ') : '');
    }

    // Add rest-pause set data (serialized)
    for (let i = 0; i < maxRestPauseSets; i++) {
      const restPauseSet = workout.restPauseSets[i];
      row.push(restPauseSet ? `${restPauseSet.weight}kg: ${restPauseSet.parts.map(p => p.reps).join('/')}` : '');
    }

    return row.map(escapeCsvField).join(',');
  });

  return [headers.map(escapeCsvField).join(','), ...rows].join('\\n');
};
