import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../supabase';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Katılım durumu için state'ler
  const [isAttending, setIsAttending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetailsAndStatus = async () => {
      // 1. O anki kullanıcıyı al
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 2. Etkinlik detaylarını al
      const { data: eventData } = await supabase
        .from('events')
        .select('*, users(full_name)')
        .eq('event_id', id)
        .single();
      
      if (eventData) setEvent(eventData);

      // 3. Kullanıcı bu etkinliğe katılmış mı kontrol et
      if (currentUser && eventData) {
        const { data: attendeeData } = await supabase
          .from('attendees')
          .select('*')
          .eq('event_id', id)
          .eq('user_id', currentUser.id)
          .single();
        
        if (attendeeData) setIsAttending(true);
      }
      
      setLoading(false);
    };

    if (id) fetchDetailsAndStatus();
  }, [id]);

  const toggleAttendance = async () => {
    if (!user) return;
    setActionLoading(true);

    try {
      if (isAttending) {
        // Katılımı İptal Et (Veri tabanından sil)
        const { error } = await supabase
          .from('attendees')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);
        
        if (!error) setIsAttending(false);
      } else {
        // Etkinliğe Katıl (Veri tabanına ekle)
        const { error } = await supabase
          .from('attendees')
          .insert({ event_id: id, user_id: user.id });
        
        if (!error) {
          setIsAttending(true);
          Alert.alert('Başarılı', 'Etkinliğe başarıyla katıldın!');
        } else {
          Alert.alert('Hata', 'Katılım sağlanamadı.');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (!event) {
    <Stack.Screen options={{ headerShown: false }} />
    return <View style={styles.centered}><Text>Etkinlik bulunamadı!</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.infoCard}>
        {/* YENİ EKLENEN KISIM: Oluşturan Kişi Bilgisi */}
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color="#ff6b6b" />
          <Text style={styles.infoText}>Oluşturan: <Text style={{fontWeight: 'bold'}}>{event.users?.full_name || 'Bilinmiyor'}</Text></Text>
        </View>

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

      <Text style={styles.sectionTitle}>Etkinlik Detayı</Text>
      <Text style={styles.description}>
        {event.description || 'Bu etkinlik için bir açıklama girilmemiş.'}
      </Text>

      <TouchableOpacity 
        style={[styles.joinButton, isAttending && styles.leaveButton]} 
        onPress={toggleAttendance}
        disabled={actionLoading}
      >
        {actionLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.joinButtonText}>
            {isAttending ? 'Katılımdan Vazgeç' : 'Etkinliğe Katıl'}
          </Text>
        )}
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
  leaveButton: { backgroundColor: '#6c757d' }, // Katılımdan vazgeç rengi (Gri)
  joinButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});