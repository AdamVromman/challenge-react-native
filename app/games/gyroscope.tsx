import { Gyroscope } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function GyroscopeTab() {
  const [subscription, setSubscription] = useState(null);

  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [score, setScore] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(null);

  Gyroscope.isAvailableAsync().then((data) => {
    setSensorAvailable(data);
  });

  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData) => {
        setData(gyroscopeData);
      })
    );
  };

  //   const calculateCoord = (value) => {
  //     return Math.round(value * 10000) / 100;
  //   };

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

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  // 252, 88, 99

  // 157, 252, 88

  useEffect(() => {
    if (calculateDiviation() < 1) {
      setScore(score + 1);
    } else if (calculateDiviation() > 2) {
      setScore(0);
    }
  }, [x, y, z]);

  return (
    <>
      {sensorAvailable ? (
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
      ) : (
        <Text>no sensor</Text>
      )}
    </>
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
