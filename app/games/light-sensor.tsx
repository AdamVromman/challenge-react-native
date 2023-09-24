import { LightSensor } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import storage from '../../storage/Storage';

export default function lightSensorTab() {
  const [subscription, setSubscription] = useState(null);
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [randomIlluminance] = useState(Math.round(Math.random() * 10));

  const [sensorAvailable, setSensorAvailable] = useState(null);

  const [playing, setPlaying] = useState(false);
  const [lost, setLost] = useState(false);
  const [highestScore, setHighestScore] = useState(0);

  const [time, setTime] = useState(20);
  const [timer, setTimer] = useState(null);

  const [toWin, setToWin] = useState(null);

  const subscribe = () => {
    setSubscription(LightSensor.addListener(setData));
  };

  const unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  LightSensor.isAvailableAsync().then((data) => {
    setSensorAvailable(data);
  });

  const calculateIlluminance = () => {
    return Math.round(illuminance / 100);
  };

  const calculateDiviation = () => {
    const d = calculateIlluminance() / (randomIlluminance * 2);
    return 1 - (d > 1 ? 1 : d);
  };

  const renderText = () => {
    if (calculateDiviation() > 0.6) {
      return 'lighter';
    }
    if (calculateDiviation() < 0.4) {
      return 'darker';
    }
    return 'hold it';
  };

  const calculateTextColor = () => {
    if (calculateDiviation() < 0.3) {
      return 'white';
    }
    return 'black';
  };

  const persistScore = (score) => {
    storage.save({
      key: 'lightScore',
      data: score,
    });
  };

  const updateScore = () => {
    isWinning(time);
    setTime((time) => {
      if (time <= 0) {
        stopGame(0);
      }
      return Math.round(time * 10 - 1) / 10;
    });
  };

  const startGame = () => {
    subscribe();
    setPlaying(true);
  };

  const stopGame = (score: number) => {
    clearInterval(timer);
    setTimer(null);
    if (score > highestScore) {
      setHighestScore(score);
      persistScore(score);
    }
    setLost(true);
    setPlaying(false);
    unsubscribe();
  };

  const isWinning = (score: number) => {
    console.log(calculateDiviation());
    if (calculateDiviation() < 0.6 && calculateDiviation() > 0.4) {
      if (!toWin) {
        setToWin(setTimeout(() => stopGame(score), 3000));
      }
    }
  };

  useEffect(() => {
    if (playing) {
      setTimer(setInterval(updateScore, 100));
    }
  }, [playing]);

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
        });
    }
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
            backgroundColor: `rgb(${33 + 222 * calculateDiviation()}, ${
              31 + 219 * calculateDiviation()
            }, ${27 + 186 * calculateDiviation()})`,
          }}
        >
          <Text style={{ color: calculateTextColor() }}>
            {calculateDiviation()}
          </Text>
          <Text style={{ color: calculateTextColor() }}>{renderText()}</Text>
          <Text style={{ color: calculateTextColor() }} variant="displayLarge">
            {time.toFixed(1)}
          </Text>
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
