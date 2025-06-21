import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { sendWorkoutReminder } from './services/NotificationService';

const WorkoutLog = () => {
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [calories, setCalories] = useState('');

  const handleSaveWorkout = async () => {
    if (!exercise || !sets || !reps || !calories) return;

    await firestore().collection('workouts').add({
      exercise,
      sets: parseInt(sets),
      reps: parseInt(reps),
      calories: parseInt(calories),
      timestamp: firestore.FieldValue.serverTimestamp(),
    });

    // Trigger notification after saving
    sendWorkoutReminder();

    setExercise('');
    setSets('');
    setReps('');
    setCalories('');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Log Your Workout</Text>
      <TextInput
        value={exercise}
        onChangeText={setExercise}
        placeholder="Exercise"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        value={sets}
        onChangeText={setSets}
        placeholder="Sets"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        value={reps}
        onChangeText={setReps}
        placeholder="Reps"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <TextInput
        value={calories}
        onChangeText={setCalories}
        placeholder="Calories Burned"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />
      <Button title="Save Workout" onPress={handleSaveWorkout} />
    </View>
  );
};

export default WorkoutLog;
