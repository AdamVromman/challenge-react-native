import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';
import { Button, PaperProvider, Text } from 'react-native-paper';

import storage from '../storage/Storage';

export interface Games {
  GYRO: 'gyro';
  LIGHT: 'light';
}

export default function App() {
  const [gyroScore, setGyroScore] = useState(null);
  const [lightScore, setLightScore] = useState(null);

  useEffect(() => {
    if (storage) {
      storage
        .load({
          key: 'gyroScore',
          autoSync: false,
          syncInBackground: false,
        })
        .then((data) => {
          setGyroScore(data);
        })
        .catch(() => setGyroScore(null));

      storage
        .load({
          key: 'lightScore',
          autoSync: false,
          syncInBackground: false,
        })
        .then((data) => {
          setLightScore(data);
        })
        .catch(() => setLightScore(null));
    }
  });

  const onShare = async (game: 'gyro' | 'light') => {
    try {
      const result = await Share.share({
        message: `I just got a high score of ${
          game === 'gyro' ? gyroScore : lightScore
        } in the ${
          game === 'gyro' ? 'KEEP YOUR BALANCE' : 'FOLLOW THE LIGHT'
        }! You want to try and get better?`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Text>High Scores</Text>
        <View style={styles.highscore}>
          <Text>Keep your balance: {gyroScore ? gyroScore : '--'}</Text>
          {lightScore && (
            <Button
              mode="contained"
              icon="share-variant"
              compact={true}
              onPress={() => onShare('gyro')}
            >
              Share
            </Button>
          )}
        </View>
        <View style={styles.highscore}>
          <Text>Follow the light: {lightScore ? lightScore : '--'}</Text>
          {lightScore && (
            <Button
              mode="contained"
              icon="share-variant"
              compact={true}
              onPress={() => onShare('light')}
            >
              Share
            </Button>
          )}
        </View>
      </View>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 32,
    right: 0,
    bottom: 0,
  },
  highscore: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'space-between',
    gap: 20,
  },
});
