import { Slot } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { DaysProvider } from '../context/DaysContext';

export default function RootLayout() {
  return (
    <PaperProvider>
      <DaysProvider>
        <Slot />
      </DaysProvider>
    </PaperProvider>
  );
}
