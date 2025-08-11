import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Note } from '../types';
import { notesStore } from '../store/notesStore';

type RootStackParamList = {
  Notes: undefined;
  Edit: { id: string };
};

export default function EditNoteScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Edit'>) {
  const { id } = route.params;

  const [snapVersion, setSnapVersion] = useState(0);
  useEffect(() => {
    const unsub = notesStore.subscribe(() => setSnapVersion(v => v + 1));
    return () => {
    unsub(); // ensure cleanup returns void
  };
  }, []);

  const note: Note | undefined = useMemo(() => {
    return notesStore.snapshot().notes.find(n => n.id === id);
  }, [snapVersion, id]);

  if (!note) {
    return (
      <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
        <Text>Note not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 10, backgroundColor: "#aeadc4ff" }}>
      <TextInput
        value={note.title}
        onChangeText={t => notesStore.update(id, { title: t })}
        placeholder="Title"
        style={{ borderWidth: 1, borderColor: '#08316eff',  borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#dbe9f4', fontSize: 16 }}
      />
      <TextInput
        value={note.body}
        onChangeText={t => notesStore.update(id, { body: t })}
        placeholder="Start typing..."
        multiline
        style={{ flex:1, borderWidth: 1, borderColor: '#0c51b9ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#dbe9f4', textAlignVertical: 'top' }}
      />
    </View>
  );
}
