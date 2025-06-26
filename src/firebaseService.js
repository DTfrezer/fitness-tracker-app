// services/firebaseService.js
import firestore from '@react-native-firebase/firestore';

// Fetch User Data from Firestore
export const fetchUserData = async (userUID) => {
  try {
    const userRef = firestore().collection('userGoals').doc(userUID);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
      const userData = snapshot.data();
      console.log('User data:', userData); // steps, calories, water
      return userData;
    } else {
      console.log('No data available for this user');
      return null;
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

// Update User Data in Firestore
export const updateUserData = async (userUID, steps, calories, water) => {
  try {
    const userRef = firestore().collection('userGoals').doc(userUID);
    await userRef.update({
      steps,
      calories,
      water,
    });
    console.log('User data updated');
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};
