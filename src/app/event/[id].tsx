import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

  // DAVET SİSTEMİ İÇİN YENİ STATE'LER
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
        const { error } = await supabase
          .from('attendees')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);
        
        if (!error) setIsAttending(false);
      } else {
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

  // KULLANICI ARAMA FONKSİYONU
  const handleSearchUsers = async (text: string) => {
    setSearchQuery(text);
    
    // 2 harften azsa boşuna veritabanını yorma
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name, email')
        .ilike('full_name', `%${text}%`) // İsmin içinde geçiyorsa bul
        .neq('user_id', user.id) // Kendimizi listeden çıkaralım
        .limit(10); // Optimizasyon için maksimum 10 kişi getir

      if (error) throw error;
      if (data) setSearchResults(data);
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // DAVET GÖNDERME FONKSİYONU
  const sendInvite = async (invitee_id: string) => {
    try {
      // Önce bu kişiye zaten davet atılmış mı diye kontrol et
      const { data: existingInvite } = await supabase
        .from('event_invitations')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', invitee_id)
        .single();

      if (existingInvite) {
        Alert.alert('Bilgi', 'Bu kişiye zaten davet gönderilmiş.');
        return;
      }

      // Daveti gönder (RLS kuralları gereği sadece etkinliği oluşturan bunu yapabilir)
      const { error } = await supabase
        .from('event_invitations')
        .insert({
          event_id: id,
          user_id: invitee_id,
        });

      if (error) throw error;
      
      Alert.alert('Başarılı', 'Davet gönderildi!');
    } catch (error: any) {
      Alert.alert('Hata', 'Davet gönderilemedi.');
      console.error(error);
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
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text>Etkinlik bulunamadı!</Text>
      </View>
    );
  }

  // Etkinliği görüntüleyen kişi, etkinliği oluşturan kişi mi?
  const isCreator = user && event.creator_id === user.id;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#333" />
        <Text style={styles.backText}>Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{event.title}</Text>

      <View style={styles.infoCard}>
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

      {/* SADECE ETKİNLİĞİ OLUŞTURAN KİŞİ DAVET GÖNDEREBİLİR */}
      {isCreator && (
        <TouchableOpacity 
          style={styles.inviteButton} 
          onPress={() => setIsInviteModalVisible(true)}
        >
          <Ionicons name="person-add" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.joinButtonText}>Kullanıcı Davet Et</Text>
        </TouchableOpacity>
      )}

      {/* DAVET ETME MODALI */}
      <Modal visible={isInviteModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kullanıcı Davet Et</Text>
            <TouchableOpacity onPress={() => setIsInviteModalVisible(false)}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={{ marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="İsim ile kullanıcı ara..."
              value={searchQuery}
              onChangeText={handleSearchUsers}
              autoCapitalize="none"
            />
          </View>

          {isSearching ? (
            <ActivityIndicator size="large" color="#ff6b6b" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.user_id}
              contentContainerStyle={{ padding: 20 }}
              renderItem={({ item }) => (
                <View style={styles.userCard}>
                  <View>
                    <Text style={styles.userName}>{item.full_name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.sendInviteButton} 
                    onPress={() => sendInvite(item.user_id)}
                  >
                    <Text style={styles.sendInviteText}>Davet Et</Text>
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                searchQuery.length >= 2 ? (
                  <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>Kullanıcı bulunamadı.</Text>
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20, color: '#aaa' }}>Aramak için en az 2 harf girin.</Text>
                )
              }
            />
          )}
        </View>
      </Modal>

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
  leaveButton: { backgroundColor: '#6c757d' }, 
  joinButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  // Yeni eklenen stiller
  inviteButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15, flexDirection: 'row', justifyContent: 'center' },
  modalContainer: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 20, paddingHorizontal: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', height: 50 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 3 },
  sendInviteButton: { backgroundColor: '#eef2ff', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#c7d2fe' },
  sendInviteText: { color: '#4f46e5', fontWeight: 'bold' }
});