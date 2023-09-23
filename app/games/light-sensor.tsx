import { LightSensor } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function lightSensorTab() {
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [randomIlluminance] = useState(Math.round(Math.random() * 10));
  const [score, setScore] = useState(0);

  useEffect(() => {
    _subscribe();
    return () => {
      _unsubscribe();
    };
  }, []);

  // 255, 250, 214

  //  33, 31, 27

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

  const _subscribe = () => {
    this._subscription = LightSensor.addListener(setData);
  };

  const _unsubscribe = () => {
    this._subscription && this._subscription.remove();
    this._subscription = null;
  };
  return (
    <View
      style={{
        ...styles.background,
        backgroundColor: `rgb(${33 + 222 * calculateDiviation()}, ${
          31 + 219 * calculateDiviation()
        }, ${27 + 186 * calculateDiviation()})`,
      }}
    >
      {/* <Text>{randomIlluminance}</Text>
      <Text>{calculateIlluminance()}</Text>
      <Text>{calculateDiviation()}</Text> */}
      <Text style={{ color: calculateTextColor() }}>{renderText()}</Text>
      <Text style={{ color: calculateTextColor() }} variant="displayLarge">
        {score}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    marginTop: 200,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
