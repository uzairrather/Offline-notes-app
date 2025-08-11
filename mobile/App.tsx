import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { Text, TextInput, Platform } from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";

import NotesListScreen from "./src/screens/NotesListScreen";
import EditNoteScreen from "./src/screens/EditNoteScreen";

type RootStackParamList = {
  Notes: undefined;
  Edit: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) return null;

  // (Works in RN 0.7x+; set both because they don't share styles)
  if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
  if ((Text as any).defaultProps.style == null)
    (Text as any).defaultProps.style = {};
  (Text as any).defaultProps.style.fontFamily = "Poppins_400Regular";

  if ((TextInput as any).defaultProps == null)
    (TextInput as any).defaultProps = {};
  if ((TextInput as any).defaultProps.style == null)
    (TextInput as any).defaultProps.style = {};
  (TextInput as any).defaultProps.style.fontFamily = "Poppins_400Regular";

  return (
    <NavigationContainer theme={DefaultTheme}>
      <StatusBar style={Platform.OS === "ios" ? "dark" : "auto"} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0a0823" },
          headerTitleStyle: { color: "#fff" },
          headerTintColor: "#fff", // ← arrow color
        }}
      >
        <Stack.Screen
          name="Notes"
          component={NotesListScreen}
          options={{
            title: "Offline-First Notes(Mob)",
            headerStyle: { backgroundColor: "#0a0823ff" },
            headerTitleStyle: { color: "#fff" },
            headerTitleAlign: "center",
          }}
        />

        <Stack.Screen
          name="Edit"
          component={EditNoteScreen}
          options={{
            title: "Edit Note",
            headerStyle: { backgroundColor: "#0a0823ff" },
            headerTitleStyle: { color: "#fff" },
            headerTitleAlign: "center",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
