import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Note } from '../types';
import { notesStore } from '../store/notesStore';
import { initialHydrate, syncNow } from '../api/sync';
 import { SERVER_URL } from '../api/config';

type RootStackParamList = {
  Notes: undefined;
  Edit: { id: string };
};

export default function NotesListScreen({}: NativeStackScreenProps<RootStackParamList, 'Notes'>) {
  const navigation = useNavigation();
  const [snapVersion, setSnapVersion] = useState(0);
  const [online, setOnline] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);



useEffect(() => {
  (async () => {
    try {
      const res = await fetch(`${SERVER_URL}/health`);
      const j = await res.json();
      console.log('[MOBILE] /health OK:', j);
    } catch (e: any) {
      console.log('[MOBILE] /health ERR:', e?.message || e);
    }
  })();
}, []);

  // subscribe to store
useEffect(() => {
  const unsub = notesStore.subscribe(() => setSnapVersion(v => v + 1));
  return () => {
    unsub(); // ensure cleanup returns void
  };
}, []);


  // hydrate once
  useEffect(() => {
    initialHydrate();
  }, []);

  // online status
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected && !!state.isInternetReachable);
    });
    return () => unsub();
  }, []);

  const all = useMemo(() => notesStore.getAllActive(), [snapVersion]);
  const q = search.trim().toLowerCase();
  const filtered = useMemo(
    () => (!q ? all : all.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))),
    [all, q]
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const ts = await syncNow();
      setLastSync(ts);
    } catch (e) {
      // ignore for demo
    } finally {
      setRefreshing(false);
    }
  }, []);

  const createNote = () => {
    const id = notesStore.create();
    // @ts-ignore
    navigation.navigate('Edit', { id });
  };

  const deleteNote = (id: string) => {
    notesStore.softDelete(id);
  };

  const goEdit = (id: string) => {
    // @ts-ignore
    navigation.navigate('Edit', { id });
  };

  const renderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => goEdit(item.id)}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        marginBottom: 10,
        backgroundColor: '#feffffff',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text numberOfLines={1} style={{ fontWeight: '600', fontSize: 16, maxWidth: '75%' }}>
          {item.title || 'Untitled'}
        </Text>
        <TouchableOpacity onPress={() => deleteNote(item.id)}>
          <Text style={{ color: '#b91c1c' }}>Delete</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ color: '#6b7280', marginTop: 4, fontSize: 12 }}>
        {new Date(item.updatedAt).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, backgroundColor: "#aeadc4ff"  }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '700',  }}>Notes</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 10, height: 10, borderRadius: 5,
              backgroundColor: online ? '#22c55e' : '#ef4444', marginRight: 8
            }}
          />
          <Text style={{ color: '#374151', marginRight: 12 }}>{online ? 'Online' : 'Offline'}</Text>
          <TouchableOpacity
            onPress={onRefresh}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff' }}
          >
            <Text >Sync</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Last sync */}
      <Text style={{ color: '#092d76ff', marginBottom: 8, fontSize: 12 }}>
        {lastSync ? `Last sync: ${new Date(lastSync).toLocaleString()}` : 'Never synced'}
      </Text>

      {/* Search */}
      <TextInput
        placeholder="Search notes..."
        value={search}
        onChangeText={setSearch}
        style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', marginBottom: 12 }}
      />

      {/* New */}
      <TouchableOpacity
        onPress={createNote}
        style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#fff', marginBottom: 12 }}
      >
        <Text>+ New</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={{ color: '#6b7280' }}>No notes yet.</Text>}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
