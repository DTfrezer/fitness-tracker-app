import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import firestore from '@react-native-firebase/firestore';

const ProgressTracking = () => {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('workouts')
      .orderBy('timestamp', 'desc')
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data());
        setWorkouts(data);
      });

    return unsubscribe;
  }, []);

  const data = {
    labels: workouts.map((workout) => workout.exercise),
    datasets: [
      {
        data: workouts.map((workout) => workout.calories),
      },
    ],
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Your Progress</Text>
      <LineChart
        data={data}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#e26a00',
          backgroundGradientFrom: '#fb8c00',
          backgroundGradientTo: '#ff8e53',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        style={{ marginVertical: 8 }}
      />
    </View>
  );
};

export default ProgressTracking;
