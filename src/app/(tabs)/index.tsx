import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../supabase';

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Veri tabanından etkinlikleri çeken fonksiyon
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true }); // Tarihi yakın olana göre sırala

      if (error) {
        console.error('Etkinlikler çekilirken hata:', error.message);
      } else {
        setEvents(data);
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa ilk açıldığında etkinlikleri getir
  useEffect(() => {
    fetchEvents();
  }, []);

  // Kullanıcı ekranı yukarıdan aşağı çektiğinde çalışacak fonksiyon
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Supabase'den gelen Amerikan tarihini (YYYY-MM-DD) bizim formata (DD.MM.YYYY) çevirir
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // Listedeki her bir etkinlik kartının tasarımı
  const renderEventItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
    onPress={() => router.push(`../event/${item.event_id}`)}
    style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="calendar-outline" size={16} color="#ff6b6b" />
        <Text style={styles.infoText}>{formatDate(item.date)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={16} color="#ff6b6b" />
        <Text style={styles.infoText}>{item.location}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="people-outline" size={16} color="#ff6b6b" />
        <Text style={styles.infoText}>Kapasite: {item.capacity} Kişi</Text>
      </View>
    </TouchableOpacity>
  );

  // Veriler yüklenirken dönecek çember (Spinner)
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Yaklaşan Etkinlikler</Text>
      
      <FlatList
        data={events}
        keyExtractor={(item) => item.event_id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContainer}
        // Aşağı çekerek yenileme mekanizması
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff6b6b']} />
        }
        // Eğer veritabanı boşsa görünecek mesaj
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz hiç etkinlik yok. İlk oluşturan sen ol!</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', margin: 20, color: '#333' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3, // Android gölge
    shadowColor: '#000', // iOS gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  description: { fontSize: 14, color: '#555', marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { fontSize: 14, color: '#666', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 }
});