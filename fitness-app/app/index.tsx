import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRouter, Link } from 'expo-router';
import { useWorkouts, Workout } from '@/services/WorkoutContext';
import { generateWorkoutCSV } from '@/utils/csv';
import { sendWorkoutData } from '@/services/api';

export default function HomeScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { getWorkoutsForDate } = useWorkouts();
  const workouts = getWorkoutsForDate(currentDate);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleAddWorkout = () => {
    router.push({ pathname: '/add-workout', params: { date: currentDate.toISOString() } });
  };

  const handleGetSuggestions = async () => {
    if (workouts.length === 0) {
      Alert.alert('No Workouts', 'There are no workouts to send for suggestions.');
      return;
    }
    setIsSubmitting(true);
    try {
      const csv = generateWorkoutCSV(workouts);
      console.log('--- SENDING CSV ---');
      console.log(csv);

      const suggestions = await sendWorkoutData(csv);

      console.log('--- RECEIVED SUGGESTIONS ---');
      console.log(suggestions);

      const suggestionsText = suggestions.map(s => `${s.exerciseName}: ${s.suggestedWeight} kg`).join('\\n');
      Alert.alert('Suggestions Received', `The model suggests the following weights for your next session:\\n\\n${suggestionsText}`);

    } catch (error) {
      Alert.alert('API Error', `Failed to get suggestions. Make sure the local Python server is running. Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = useMemo(() => {
    const today = new Date();
    if (currentDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    return currentDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [currentDate]);

  const renderWorkoutItem = ({ item }: { item: Workout }) => (
    <Link
      href={{
        pathname: `/workout/${item.id}`,
        params: { date: currentDate.toISOString() },
      }}
      asChild
    >
      <TouchableOpacity style={[styles.workoutItem, { borderBottomColor: colors.icon }]}>
        <ThemedText style={styles.workoutName}>{item.name}</ThemedText>
        <ThemedText style={{ color: colors.icon }}>
          {item.sets.length} set{item.sets.length !== 1 ? 's' : ''}
        </ThemedText>
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.icon }]}>
          <TouchableOpacity onPress={handlePrevDay} style={styles.arrowButton}>
            <Text style={[styles.arrowText, { color: colors.tint }]}>{'<'}</Text>
          </TouchableOpacity>
          <ThemedText style={styles.dateText}>{formattedDate}</ThemedText>
          <TouchableOpacity onPress={handleNextDay} style={styles.arrowButton}>
            <Text style={[styles.arrowText, { color: colors.tint }]}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exportContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={handleGetSuggestions}
            disabled={isSubmitting}
          >
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>
              {isSubmitting ? "Getting Suggestions..." : "Get Weight Suggestions"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <ThemedText>No workouts for today.</ThemedText>
              <ThemedText>Add one to get started!</ThemedText>
            </View>
          }
        />

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.tint }]}
          onPress={handleAddWorkout}
        >
          <Text style={[styles.fabText, { color: colors.background }]}>+</Text>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exportContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  listContent: {
    paddingBottom: 80,
  },
  workoutItem: {
    padding: 20,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutName: {
    fontSize: 18,
  },
  emptyListContainer: {
    flex: 1,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    lineHeight: 30,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});
