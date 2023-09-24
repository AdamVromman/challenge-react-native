import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { FAB, PaperProvider, Portal } from 'react-native-paper';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const [FABOpen, setFABOpen] = useState(false);

  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}></Stack>
        <Portal>
          <FAB.Group
            open={FABOpen}
            visible
            icon={FABOpen ? 'close' : 'gamepad-square-outline'}
            actions={[
              {
                icon: 'arrow-left-top-bold',
                label: 'Back',
                color: 'white',
                size: 'small',
                style: { backgroundColor: 'grey' },
                onPress: () => {
                  setFABOpen(false);
                  router.push('/');
                },
              },

              {
                icon: 'scale-unbalanced',
                label: 'Gyroscope',
                size: 'medium',
                onPress: () => {
                  setFABOpen(false);
                  router.push('/games/gyroscope');
                },
              },
              {
                icon: 'spotlight-beam',
                label: 'Light sensor',
                size: 'medium',
                onPress: () => {
                  setFABOpen(false);
                  router.push('/games/light-sensor');
                },
              },
            ]}
            onStateChange={() => console.log('state changed')}
            onPress={() => {
              if (FABOpen) {
                setFABOpen(false);
              } else {
                setFABOpen(true);
              }
            }}
          />
        </Portal>
      </ThemeProvider>
    </PaperProvider>
  );
}
