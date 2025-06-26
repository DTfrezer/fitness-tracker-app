import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function (notification) {
    console.log('Notification:', notification);
  },
});

export const sendWorkoutReminder = () => {
  PushNotification.localNotification({
    title: 'Workout Reminder',
    message: 'Time to hit the gym!',
  });
};
