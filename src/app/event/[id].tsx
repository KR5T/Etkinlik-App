import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../supabase';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams(); // URL'den (yönlendirmeden) gelen etkinliğin ID'si
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetails = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('event_id', id)
        .single(); // Sadece tek bir kayıt getir

      if (!error) {
        setEvent(data);
      }
      setLoading(false);
    };

    if (id) fetchEventDetails();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
        <Text>Etkinlik bulunamadı!</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <Stack.Screen options={{ headerShown: false }}></Stack.Screen>
      {/* Geri Butonu */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color="#ff6b6b" />
          <Text style={styles.infoText}>{formatDate(event.date)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#ff6b6b" />
          <Text style={styles.infoText}>{event.location}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people" size={20} color="#ff6b6b" />
          <Text style={styles.infoText}>Kapasite: {event.capacity} Kişi</Text>
        </View>
      </View>

      {/* Açıklama burada detaylıca görünüyor */}
      <Text style={styles.sectionTitle}>Etkinlik Detayı</Text>
      <Text style={styles.description}>
        {event.description || 'Bu etkinlik için bir açıklama girilmemiş.'}
      </Text>

      {/* İleride aktif edilecek butonlar (Spec'e uygun) */}
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Etkinliğe Katıl</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  backText: { fontSize: 16, marginLeft: 5, color: '#333' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 20 },
  infoCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { fontSize: 16, color: '#444', marginLeft: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  description: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 30 },
  joinButton: { backgroundColor: '#ff6b6b', padding: 15, borderRadius: 10, alignItems: 'center' },
  joinButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});