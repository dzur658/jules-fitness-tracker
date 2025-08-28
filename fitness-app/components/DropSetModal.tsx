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
import { DropSetPart } from '@/services/WorkoutContext';

type DropSetModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (parts: DropSetPart[]) => void;
};

export const DropSetModal = ({ visible, onClose, onSave }: DropSetModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [parts, setParts] = useState<Array<{ weight: string; reps: string }>>([
    { weight: '', reps: '' },
  ]);

  const handlePartChange = (index: number, field: 'weight' | 'reps', value: string) => {
    const newParts = [...parts];
    newParts[index][field] = value;
    setParts(newParts);
  };

  const addPart = () => {
    setParts([...parts, { weight: '', reps: '' }]);
  };

  const handleSave = () => {
    const numericParts: DropSetPart[] = [];
    for (const part of parts) {
      const weightNum = parseFloat(part.weight);
      const repsNum = parseInt(part.reps, 10);
      if (isNaN(weightNum) || isNaN(repsNum) || weightNum <= 0 || repsNum <= 0) {
        Alert.alert('Invalid Input', 'Please fill all fields with valid numbers.');
        return;
      }
      numericParts.push({ weight: weightNum, reps: repsNum });
    }
    onSave(numericParts);
    setParts([{ weight: '', reps: '' }]); // Reset for next time
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <ThemedView style={[styles.modalContent, { borderColor: colors.icon }]}>
          <ThemedText style={styles.title}>Log Drop Set</ThemedText>
          <ScrollView>
            {parts.map((part, index) => (
              <View key={index} style={styles.partRow}>
                <ThemedText style={{alignSelf: 'center'}}>Part {index + 1}:</ThemedText>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
                  placeholder="Weight"
                  keyboardType="numeric"
                  value={part.weight}
                  onChangeText={val => handlePartChange(index, 'weight', val)}
                />
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.icon }]}
                  placeholder="Reps"
                  keyboardType="numeric"
                  value={part.reps}
                  onChangeText={val => handlePartChange(index, 'reps', val)}
                />
              </View>
            ))}
          </ScrollView>
          <Button title="Add Part" onPress={addPart} color={colors.tint} />
          <View style={styles.buttonRow}>
            <Button title="Cancel" onPress={onClose} color={'red'} />
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
