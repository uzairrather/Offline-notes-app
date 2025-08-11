import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Note } from '../types';
import { notesStore } from '../store/notesStore';

type RootStackParamList = {
  Notes: undefined;
  Edit: { id: string };
};

export default function EditNoteScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'Edit'>) {
  const { id } = route.params;

  const [snapVersion, setSnapVersion] = useState(0);
  useEffect(() => {
    const unsub = notesStore.subscribe(() => setSnapVersion(v => v + 1));
    return () => {
      unsub();
    };
  }, []);

  const note: Note | undefined = useMemo(() => {
    return notesStore.snapshot().notes.find(n => n.id === id);
  }, [snapVersion, id]);

  if (!note) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Note not found.</Text>
      </View>
    );
  }

  const handleSave = () => {
    // Note content is already saved on each keystroke via notesStore.update
    navigation.goBack(); // back to home/list
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#aeadc4ff' }}>
      <TextInput
        value={note.title}
        onChangeText={t => notesStore.update(id, { title: t })}
        placeholder="Title"
        style={{
          borderWidth: 1,
          borderColor: '#08316eff',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: '#dbe9f4',
          fontSize: 16,
          marginBottom: 10,
        }}
      />
      <TextInput
        value={note.body}
        onChangeText={t => notesStore.update(id, { body: t })}
        placeholder="Start typing..."
        multiline
        style={{
          flex: 1,
          borderWidth: 1,
          borderColor: '#0c51b9ff',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: '#dbe9f4',
          textAlignVertical: 'top',
        }}
      />

      {/* Save button */}
<View style={{ marginTop: 12, alignItems: 'flex-end' }}>
  <TouchableOpacity
    onPress={handleSave}
    style={{
      backgroundColor: '#2563eb',
      paddingVertical: 10,
      paddingHorizontal: 20,   // like web: smaller button
      borderRadius: 8,
      alignItems: 'center',
      // optional fixed size:
      // minWidth: 96,
    }}
  >
    <Text style={{ color: 'white', fontWeight: '700' }}>Save</Text>
  </TouchableOpacity>
</View>

    </View>
  );
}
