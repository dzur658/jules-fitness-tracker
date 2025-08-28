import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Text,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useWorkouts, WorkoutSet, DropSet, RestPauseSet, DropSetPart, RestPausePart } from '@/services/WorkoutContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { DropSetModal } from '@/components/DropSetModal';
import { RestPauseSetModal } from '@/components/RestPauseSetModal';

export default function WorkoutDetailScreen() {
  const { id, date: dateString } = useLocalSearchParams<{ id: string; date: string }>();
  const { getWorkoutById, addSetToWorkout, addDropSetToWorkout, addRestPauseSetToWorkout } = useWorkouts();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');

  const [isDropSetModalVisible, setDropSetModalVisible] = useState(false);
  const [isRestPauseModalVisible, setRestPauseModalVisible] = useState(false);

  const date = useMemo(() => new Date(dateString), [dateString]);
  const workout = getWorkoutById(date, id);

  const handleAddSet = () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const rirNum = parseInt(rir, 10);

    if (isNaN(weightNum) || isNaN(repsNum) || isNaN(rirNum)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all fields.');
      return;
    }
    addSetToWorkout(date, id, { weight: weightNum, reps: repsNum, rir: rirNum });
    setWeight(''); setReps(''); setRir('');
  };

  const handleSaveDropSet = (parts: DropSetPart[]) => {
    addDropSetToWorkout(date, id, parts);
  };

  const handleSaveRestPauseSet = (weight: number, parts: RestPausePart[]) => {
    addRestPauseSetToWorkout(date, id, weight, parts);
  };

  if (!workout) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <ThemedText>Workout not found.</ThemedText>
        <Button title="Go Back" onPress={() => router.back()} />
      </ThemedView>
    );
  }

  const renderSetItem = ({ item, index }: { item: WorkoutSet; index: number }) => (
    <View style={[styles.setItem, { borderBottomColor: colors.icon }]}>
      <ThemedText style={styles.setNumber}>Set {index + 1}</ThemedText>
      <ThemedText>{item.weight} kg</ThemedText>
      <ThemedText>{item.reps} reps</ThemedText>
      <ThemedText>RIR: {item.rir}</ThemedText>
    </View>
  );

  const renderDropSetItem = ({ item, index }: { item: DropSet; index: number }) => (
    <View style={[styles.setItem, { borderBottomColor: colors.icon, flexDirection: 'column', alignItems: 'flex-start' }]}>
      <ThemedText style={styles.setNumber}>Drop Set {index + 1}</ThemedText>
      <View style={styles.partsContainer}>
        {item.parts.map((part, partIndex) => (
          <Text key={partIndex} style={{color: colors.text, marginLeft: 10}}>- {part.weight} kg x {part.reps} reps</Text>
        ))}
      </View>
    </View>
  );

  const renderRestPauseSetItem = ({ item, index }: { item: RestPauseSet; index: number }) => (
    <View style={[styles.setItem, { borderBottomColor: colors.icon }]}>
      <ThemedText style={styles.setNumber}>Rest-Pause {index + 1}</ThemedText>
      <ThemedText>{item.weight} kg</ThemedText>
      <ThemedText>{item.parts.map(p => p.reps).join(' / ')} reps</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: workout.name }} />

      <DropSetModal
        visible={isDropSetModalVisible}
        onClose={() => setDropSetModalVisible(false)}
        onSave={handleSaveDropSet}
      />
      <RestPauseSetModal
        visible={isRestPauseModalVisible}
        onClose={() => setRestPauseModalVisible(false)}
        onSave={handleSaveRestPauseSet}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedText style={styles.listHeader}>Regular Sets</ThemedText>
        <FlatList
          data={workout.sets}
          renderItem={renderSetItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<ThemedText style={styles.emptyList}>No regular sets logged.</ThemedText>}
          scrollEnabled={false}
        />

        <ThemedText style={styles.listHeader}>Drop Sets</ThemedText>
        <FlatList
          data={workout.dropSets}
          renderItem={renderDropSetItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<ThemedText style={styles.emptyList}>No drop sets logged.</ThemedText>}
          scrollEnabled={false}
        />

        <ThemedText style={styles.listHeader}>Rest-Pause Sets</ThemedText>
        <FlatList
          data={workout.restPauseSets}
          renderItem={renderRestPauseSetItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={<ThemedText style={styles.emptyList}>No rest-pause sets logged.</ThemedText>}
          scrollEnabled={false}
        />
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.formContainer, { backgroundColor: colors.background, borderTopColor: colors.icon }]}
      >
        <View style={styles.addSetContainer}>
          <View style={styles.inputRow}>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.icon }]} placeholder="Weight (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} />
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.icon }]} placeholder="Reps" keyboardType="numeric" value={reps} onChangeText={setReps} />
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.icon }]} placeholder="RIR" keyboardType="numeric" value={rir} onChangeText={setRir} />
          </View>
          <Button title="Add Set" onPress={handleAddSet} color={colors.tint} />
        </View>
        <View style={styles.specialButtonsRow}>
          <Button title="Add Drop Set" onPress={() => setDropSetModalVisible(true)} color={colors.tint} />
          <Button title="Add Rest-Pause Set" onPress={() => setRestPauseModalVisible(true)} color={colors.tint} />
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 250 },
  listHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  setItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  setNumber: { fontWeight: 'bold' },
  partsContainer: { marginTop: 5 },
  emptyList: { textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  formContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, padding: 10 },
  addSetContainer: { marginBottom: 10 },
  inputRow: { flexDirection: 'row', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginHorizontal: 5, flex: 1 },
  specialButtonsRow: { flexDirection: 'row', justifyContent: 'space-around' }
});
