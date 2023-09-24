import { Gyroscope } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import storage from '../../storage/Storage';

export default function GyroscopeTab() {
  const [subscription, setSubscription] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [lost, setLost] = useState(false);
  const [highestScore, setHighestScore] = useState(0);
  const [score, setScore] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(null);
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData) => {
        setData(gyroscopeData);
      })
    );
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const persistScore = (score: number) => {
    storage.save({
      key: 'gyroScore',
      data: score,
    });
  };

  const startGame = () => {
    setPlaying(true);
    subscribe();
  };

  const stopGame = () => {
    if (score > highestScore) {
      setHighestScore(score);
      persistScore(score);
    }
    setPlaying(false);
    setLost(true);
    unsubscribe();
  };

  const calculateCoordPercentage = (value) => {
    const v = Math.round(Math.abs(value) * 100) / 100;
    return v > 1 ? 1 : v;
  };

  const calculateDiviation = () => {
    return (
      calculateCoordPercentage(x) +
      calculateCoordPercentage(y) +
      calculateCoordPercentage(z)
    );
  };

  useEffect(() => {
    if (storage) {
      storage
        .load({
          key: 'gyroScore',
          autoSync: false,
          syncInBackground: false,
        })
        .then((data) => {
          setHighestScore(data);
        });
    }
  });

  useEffect(() => {
    if (playing) {
      if (calculateDiviation() < 1) {
        setScore(score + 1);
      } else if (calculateDiviation() > 2) {
        stopGame();
      }
    }
  }, [x, y, z, playing]);

  Gyroscope.isAvailableAsync().then((data) => {
    setSensorAvailable(data);
  });

  return (
    <View>
      {!playing ? (
        <View style={styles.background}>
          <Text>{highestScore}</Text>
          <Text variant="displaySmall">
            {lost ? 'You lost' : 'Keep your balance!'}
          </Text>
          <Text variant="labelMedium">
            In this game, you have to keep your phone as still as possible.
          </Text>
          <Text>
            If the light is green, that means your points are being counted. If
            the light turns to red, your points pause. If the lights gets TOO
            red, you lose.
          </Text>
          <Button
            mode="contained"
            dark={true}
            disabled={!sensorAvailable}
            onPress={startGame}
          >
            {sensorAvailable ? 'Start' : 'No Gyroscope available'}
          </Button>
        </View>
      ) : (
        <View
          style={{
            ...styles.background,
            backgroundColor: `rgb(${157 + 95 * calculateDiviation()},${
              252 - 164 * calculateDiviation()
            }, ${88 + 11 * calculateDiviation()})`,
          }}
        >
          <Text variant="displayLarge">{score}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
