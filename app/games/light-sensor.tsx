import { LightSensor } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

import storage from '../../storage/Storage';

const getRandomValue = () => {
  return Math.round(Math.random() * 10);
};

export default function lightSensorTab() {
  const [subscription, setSubscription] = useState(null);
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [randomIlluminance] = useState(getRandomValue());
  const [diviation, setDiviation] = useState(0);

  const [sensorAvailable, setSensorAvailable] = useState(null);

  const [playing, setPlaying] = useState(false);
  const [lost, setLost] = useState(null);
  const [highestScore, setHighestScore] = useState(0);

  const [time, setTime] = useState(20);

  const interval = useRef<NodeJS.Timeout | null>();

  const [timeToWin, setTimeToWin] = useState(3);
  const [winning, setWinning] = useState('');

  const subscribe = () => {
    setSubscription(LightSensor.addListener(setData));
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    LightSensor.isAvailableAsync().then((data) => {
      setSensorAvailable(data);
    });
  });

  const calculateIlluminance = () => {
    return Math.round(illuminance / 100);
  };

  useEffect(() => {
    const d = calculateIlluminance() / (randomIlluminance * 2);
    setDiviation(1 - (d > 1 ? 1 : d));
  }, [illuminance]);

  const calculateTextColor = () => {
    if (diviation < 0.3) {
      return 'rgb(255,255,255)';
    }
    return 'rgb(0,0,0)';
  };

  const persistScore = (score) => {
    storage.save({
      key: 'lightScore',
      data: score,
    });
  };

  const startGame = () => {
    subscribe();
    setPlaying(true);
  };

  const stopGame = () => {
    if (time > highestScore && time !== 20) {
      setHighestScore(time);
      persistScore(time);
    }
    clearInterval(interval.current);
    setLost(time <= 0);
    setTime(20);
    setTimeToWin(3);

    setPlaying(false);
    unsubscribe();
  };

  useEffect(() => {
    const updateScore = () => {
      if (playing) {
        interval.current = setInterval(
          () => setTime((t) => Math.round(t * 10 - 1) / 10),
          100
        );
      }
    };
    if (time <= 0 && interval.current) {
      stopGame();
    }

    if (time === 20) {
      updateScore();
    }
  }, [playing, time]);

  useEffect(() => {
    if (diviation > 0.6) {
      setWinning('lighter');
      setTimeToWin(3);
    } else if (diviation < 0.4) {
      setWinning('darker');
      setTimeToWin(3);
    } else {
      setWinning('hold it');
      setTimeToWin((t) => t - 0.1);
    }
  }, [time]);

  useEffect(() => {
    if (storage) {
      storage
        .load({
          key: 'lightScore',
          autoSync: false,
          syncInBackground: false,
        })
        .then((data) => {
          setHighestScore(data);
        })
        .catch(() => setHighestScore(0));
    }
  });

  useEffect(() => {
    if (timeToWin <= 0) {
      stopGame();
    }
  }, [timeToWin]);

  return (
    <SafeAreaView>
      <View style={styles.wrapper}>
        {!playing ? (
          <View style={styles.background}>
            <Chip icon="trophy">High score: {highestScore ?? '--'}</Chip>
            <Text variant="displaySmall">
              {lost == null
                ? 'Follow the light'
                : lost
                ? 'You lost'
                : 'you won!'}
            </Text>
            <Text variant="labelMedium">
              In this game, you have to find a spot with the perfect amount of
              light
            </Text>
            <Text>
              The game will tell you whether you need more light, less light or
              keep it like that. Keep it in the perfect light for long enough
              and you win the game
            </Text>
            <Button
              mode="contained"
              dark={true}
              disabled={!sensorAvailable}
              onPress={startGame}
            >
              {sensorAvailable ? 'Start' : 'No Light sensor available'}
            </Button>
          </View>
        ) : (
          <View
            style={{
              ...styles.game,
              backgroundColor: `rgb(${33 + 222 * diviation}, ${
                31 + 219 * diviation
              }, ${27 + 186 * diviation})`,
            }}
          >
            <Text
              variant="displaySmall"
              style={{ color: calculateTextColor() }}
            >
              {winning}
            </Text>
            <Text
              style={{ color: calculateTextColor() }}
              variant="displayLarge"
            >
              {time.toFixed(1)}
            </Text>
            <Progress.Bar
              color={calculateTextColor()}
              progress={timeToWin / 3}
              width={200}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: '90%',
    height: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 50,
    gap: 20,
  },
  game: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});
