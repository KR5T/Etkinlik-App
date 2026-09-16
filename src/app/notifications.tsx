import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // useRouter eklendi
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../supabase';

export default function NotificationsScreen() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // router tanımlandı

  // Bekleyen davetleri çek
  const fetchInvitations = async () => {
    setLoading(true);
    try {
      // Aktif kullanıcıyı al
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Kullanıcı bulunamadı");
        setLoading(false);
        return;
      }

      // Davetleri ve ilişkili etkinlik bilgilerini çek
      const { data, error } = await supabase
        .from('event_invitations')
        .select(`
          invite_id,
          event_id,
          status,
          events (
            title,
            date
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Davetler çekilirken hata:', error.message);
      } else {
        setInvitations(data || []);
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  // Daveti Kabul Et
  const handleAccept = async (invite_id: string, event_id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error: inviteError } = await supabase
        .from('event_invitations')
        .update({ status: 'accepted' })
        .eq('invite_id', invite_id);

      if (inviteError) throw inviteError;

      const { error: attendError } = await supabase
        .from('attendees')
        .insert({
          user_id: user.id,
          event_id: event_id
        });

      if (attendError) throw attendError;

      Alert.alert("Başarılı", "Etkinliğe katılım sağladın!");
      fetchInvitations(); 

    } catch (error: any) {
      Alert.alert("Hata", "Davet kabul edilirken bir sorun oluştu.");
      console.error(error.message);
    }
  };

  // Daveti Reddet
  const handleReject = async (invite_id: string) => {
    try {
      const { error } = await supabase
        .from('event_invitations')
        .update({ status: 'rejected' })
        .eq('invite_id', invite_id);

      if (error) throw error;

      fetchInvitations();
    } catch (error: any) {
      Alert.alert("Hata", "Davet reddedilirken bir sorun oluştu.");
      console.error(error.message);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR') + ' ' + date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderInviteItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.events?.title || 'Bilinmeyen Etkinlik'}</Text>
        <View style={styles.dateRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.dateText}>{formatDate(item.events?.date)}</Text>
        </View>
        <Text style={styles.inviteText}>Seni bu etkinliğe davet etti!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.acceptButton]} 
          onPress={() => handleAccept(item.invite_id, item.event_id)}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.buttonText}>Kabul Et</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleReject(item.invite_id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.buttonText}>Reddet</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Yükleme Ekranı
  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  // Ana Ekran Dönüşü
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Özel Geri Butonu (Header Niyetine) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}></Text>
      </View>

      <FlatList
        data={invitations}
        keyExtractor={(item) => item.invite_id}
        renderItem={renderInviteItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Şu an bekleyen bir davetin yok.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Yeni Header Stilleri
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50, // iOS/Android status bar boşluğu için
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
  },

  listContainer: { padding: 15 },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
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
  infoContainer: { marginBottom: 15 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 5 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateText: { fontSize: 14, color: '#666', marginLeft: 6 },
  inviteText: { fontSize: 14, color: '#ff6b6b', fontStyle: 'italic' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    flex: 0.48,
  },
  acceptButton: { backgroundColor: '#4caf50' },
  rejectButton: { backgroundColor: '#f44336' },
  buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 }
});