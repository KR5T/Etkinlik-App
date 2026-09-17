import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../supabase';

export default function HomeScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // YENİ: Bildirim sayısı state'i
  const router = useRouter();

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

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

  // YENİ: Okunmamış (bekleyen) davet sayısını çeken fonksiyon
  const fetchUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('event_invitations')
        .select('*', { count: 'exact', head: true }) // Sadece sayıyı (count) getirir, veriyi indirmez (Çok hızlıdır)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Bildirim sayısı çekilirken hata:", error);
    }
  };

  // Sayfa ilk açıldığında etkinlikleri getir
  useEffect(() => {
    fetchEvents();
  }, []);

  // YENİ: Kullanıcı bu sekmeye her geri döndüğünde bildirim sayısını güncelle
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
    fetchUnreadCount(); // Yenilerken bildirimleri de tazele
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Yaklaşan Etkinlikler</Text>
        
        {/* BİLDİRİM ZİLİ VE ROZET (BADGE) */}
        <TouchableOpacity 
          onPress={() => router.push('/notifications')} 
          style={styles.iconButton}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
          
          {/* Eğer okunmamış bildirim varsa kırmızı daireyi göster */}
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={events}
        keyExtractor={(item) => item.event_id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ff6b6b']} />
        }
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
  
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginHorizontal: 20, 
    marginTop: 20,
    marginBottom: 10
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  iconButton: {
    padding: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    position: 'relative', // Rozetin (badge) zilin üzerine oturması için gerekli
  },
  
  // YENİ: Kırmızı Rozet Tasarımı
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#ff4757', // Şık bir kırmızı
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0', // Arka planla uyumlu çerçeve
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },

  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3, 
    shadowColor: '#000', 
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