import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RestPausePart } from '@/services/WorkoutContext';

type RestPauseSetModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (weight: number, parts: RestPausePart[]) => void;
};

export const RestPauseSetModal = ({ visible, onClose, onSave }: RestPauseSetModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [weight, setWeight] = useState('');
  const [parts, setParts] = useState<Array<{ reps: string }>>([
    { reps: '' },
  ]);

  const handlePartChange = (index: number, value: string) => {
    const newParts = [...parts];
    newParts[index].reps = value;
    setParts(newParts);
  };

  const addPart = () => {
    setParts([...parts, { reps: '' }]);
  };

  const handleSave = () => {
    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid weight.');
      return;
    }

    const numericParts: RestPausePart[] = [];
    for (const part of parts) {
      const repsNum = parseInt(part.reps, 10);
      if (isNaN(repsNum) || repsNum <= 0) {
        Alert.alert('Invalid Input', 'Please fill all rep fields with valid numbers.');
        return;
      }
      numericParts.push({ reps: repsNum });
    }
    onSave(weightNum, numericParts);
    setWeight('');
    setParts([{ reps: '' }]); // Reset for next time
    onClose();
  };

  const resetState = () => {
    setWeight('');
    setParts([{ reps: '' }]);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <ThemedView style={[styles.modalContent, { borderColor: colors.icon }]}>
          <ThemedText style={styles.title}>Log Rest-Pause Set</ThemedText>
          <TextInput
            style={[styles.input, styles.weightInput, { color: colors.text, borderColor: colors.icon }]}
            placeholder="Weight (kg)"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          <ScrollView>
            {parts.map((part, index) => (
              <View key={index} style={styles.partRow}>
                <ThemedText style={{alignSelf: 'center'}}>Part {index + 1}:</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={part.reps}
                  onChangeText={val => handlePartChange(index, val)}
                />
              </View>
            ))}
          </ScrollView>
          <Button title="Add Part" onPress={addPart} color={colors.tint} />
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={resetState} color={'red'} />
            <Button title="Save" onPress={handleSave} color={colors.tint} />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  weightInput: {
      marginBottom: 15,
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});
