import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Share, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  PaperProvider,
  Text,
} from 'react-native-paper';

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
        <Text variant="displayMedium">Welcome!</Text>
        <Text>
          Before you, you see two games. These games make use of your device
          sensors to challenge you. Once you get a high score you're proud of,
          share it with your friends and challenge them!
        </Text>
        <View style={styles.cardHolder}>
          <Card style={styles.card}>
            <Card.Title
              titleVariant="headlineMedium"
              title="Keep your balance"
              subtitle={`High score: ${gyroScore ?? '--'}`}
              right={() => <IconButton icon="scale-unbalanced"></IconButton>}
            />
            <Divider></Divider>
            <Card.Content style={styles.cardContent}>
              <Text>
                In this game you will be challenged to keep your phone as still
                as possible. The longer you manage, the higher your score.
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="play"
                onPress={() => router.push('/games/gyroscope')}
              >
                Play
              </Button>
              {gyroScore && (
                <View style={styles.buttonGroup}>
                  <Button
                    mode="contained"
                    icon="share-variant"
                    onPress={() => onShare('gyro')}
                  >
                    Share
                  </Button>
                  <Button
                    mode="text"
                    icon="trash-can"
                    onPress={() => {
                      storage
                        .remove({ key: 'gyroScore' })
                        .then(() => setGyroScore(null));
                    }}
                  >
                    Reset
                  </Button>
                </View>
              )}
            </Card.Actions>
          </Card>
          <Card style={styles.card}>
            <Card.Title
              titleVariant="headlineMedium"
              title="Follow the light"
              subtitle={`High score: ${lightScore ?? '--'}`}
              right={() => <IconButton icon="spotlight-beam"></IconButton>}
            />
            <Divider></Divider>
            <Card.Content style={styles.cardContent}>
              <Text>
                In this game it is key to find the perfect balance between light
                and dark. Keep your device in the right amount of light for long
                enough!
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                icon="play"
                onPress={() => router.push('/games/light-sensor')}
              >
                Play
              </Button>
              {lightScore && (
                <View style={styles.buttonGroup}>
                  <Button
                    mode="contained"
                    icon="share-variant"
                    onPress={() => onShare('light')}
                  >
                    Share
                  </Button>
                  <Button
                    mode="text"
                    icon="trash-can"
                    onPress={() => {
                      storage
                        .remove({ key: 'lightScore' })
                        .then(() => setLightScore(null));
                    }}
                  >
                    Reset
                  </Button>
                </View>
              )}
            </Card.Actions>
          </Card>
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
  cardHolder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '90%',
    justifyContent: 'space-between',
    gap: 20,
    marginTop: 20,
  },
  card: {
    width: '100%',
  },
  cardContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});
