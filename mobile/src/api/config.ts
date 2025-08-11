import { Platform } from 'react-native';

// ⚠️ CHANGE THIS to your Windows machine's LAN IP (ipconfig → IPv4)
const LAN = 'http://192.168.1.5:4000';

export const SERVER_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:4000'      // Android emulator loopback to host
    : Platform.OS === 'web'
    ? 'http://localhost:4000'     // Expo web in the same machine
    : LAN;                         // iOS simulator OR real device → your LAN IP
