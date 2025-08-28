import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkouts } from '@/services/WorkoutContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function AddWorkoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { allExerciseNames, addWorkoutToDate } = useWorkouts();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');

  const date = useMemo(() => {
    if (typeof params.date === 'string') {
      return new Date(params.date);
    }
    // Fallback to today if date is not passed
    return new Date();
  }, [params.date]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) {
      return allExerciseNames;
    }
    return allExerciseNames.filter(name =>
      name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allExerciseNames]);

  const handleAddExercise = (name: string) => {
    if (name.trim()) {
      addWorkoutToDate(date, name.trim());
      router.back();
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.suggestionItem, { borderBottomColor: colors.icon }]}
      onPress={() => handleAddExercise(item)}
    >
      <ThemedText>{item}</ThemedText>
    </TouchableOpacity>
  );

  const showCreateButton =
    searchQuery.length > 0 &&
    !allExerciseNames.some(
      ex => ex.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Add Workout' }} />

      <TextInput
        style={[
          styles.searchInput,
          { color: colors.text, borderColor: colors.icon },
        ]}
        placeholder="Search or Create an exercise..."
        placeholderTextColor={colors.icon}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />

      <FlatList
        data={filteredExercises}
        renderItem={renderItem}
        keyExtractor={item => item}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <ThemedText>No exercises match your search.</ThemedText>
          </View>
        }
      />

      {showCreateButton && (
        <View
          style={[styles.createButtonContainer, { borderColor: colors.icon }]}
        >
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.tint }]}
            onPress={() => handleAddExercise(searchQuery)}
          >
            <ThemedText style={[styles.buttonText, { color: colors.background }]}>
              {`Create and add "${searchQuery.trim()}"`}
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    margin: 15,
  },
  suggestionItem: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
  },
  emptyList: {
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonContainer: {
    padding: 15,
    borderTopWidth: 1,
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
