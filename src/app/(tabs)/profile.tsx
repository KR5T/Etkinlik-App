import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  
  // Accordion durumlarını tutan stateler
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);
  const [isJoinedOpen, setIsJoinedOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 1. O anki aktif kullanıcıyı al
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError;

      // 2. Kullanıcının kendi tablomuzdaki profil verisini çek
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!profileError) setProfile(profileData);

      // 3. Kullanıcının oluşturduğu etkinlikleri çek
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .order('date', { ascending: false });

      if (!eventsError) setCreatedEvents(eventsData || []);

      // 4. Katıldığım etkinlikleri çek (attendees tablosundan event detaylarıyla birlikte)
      const { data: joinedData, error: joinedError } = await supabase
        .from('attendees')
        .select(`
          event_id,
          events ( * )
        `)
        .eq('user_id', user.id);

      if (!joinedError && joinedData) {
        // Gelen karmaşık veriyi temiz bir diziye dönüştürüyoruz
        const formattedJoinedEvents = joinedData
          .map(item => item.events)
          .filter(e => e !== null); // Boş gelenleri temizle
        setJoinedEvents(formattedJoinedEvents);
      }

    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { 
        text: 'Çıkış Yap', 
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login'); // Çıkış yapınca giriş ekranına yolla
        }
      }
    ]);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Üst Profil Kartı */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Mehmet Kürşat Sakarya'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      {/* Accordion 1: Oluşturduğum Etkinlikler */}
      <View style={styles.accordionContainer}>
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setIsCreatedOpen(!isCreatedOpen)}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="add-circle-outline" size={24} color="#007bff" />
            <Text style={styles.accordionTitle}>Oluşturduğum Etkinlikler ({createdEvents.length})</Text>
          </View>
          <Ionicons name={isCreatedOpen ? "chevron-up" : "chevron-down"} size={24} color="#555" />
        </TouchableOpacity>
        
        {isCreatedOpen && (
          <View style={styles.accordionContent}>
            {createdEvents.length > 0 ? (
              createdEvents.map((event) => (
                <TouchableOpacity 
                  key={event.event_id} 
                  style={styles.eventItem}
                  onPress={() => router.push(`../event/${event.event_id}`)}
                >
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Henüz hiç etkinlik oluşturmadın.</Text>
            )}
          </View>
        )}
      </View>

      {/* Accordion 2: Katıldığım Etkinlikler (Gelecek adım için hazır iskelet) */}
      <View style={styles.accordionContainer}>
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setIsJoinedOpen(!isJoinedOpen)}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#28a745" />
            <Text style={styles.accordionTitle}>Katıldığım Etkinlikler</Text>
          </View>
          <Ionicons name={isJoinedOpen ? "chevron-up" : "chevron-down"} size={24} color="#555" />
        </TouchableOpacity>
        
        {isJoinedOpen && (
          <View style={styles.accordionContent}>
            {joinedEvents.length > 0 ? (
              joinedEvents.map((event: any) => (
                <TouchableOpacity 
                  key={event.event_id} 
                  style={styles.eventItem}
                  onPress={() => router.push(`/event/${event.event_id}`)}
                >
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Henüz hiçbir etkinliğe katılmadın.</Text>
            )}
          </View>
        )}
      </View>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  profileHeader: { backgroundColor: '#007bff', paddingVertical: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, marginBottom: 20 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  email: { fontSize: 16, color: '#e0e0e0' },
  
  accordionContainer: { marginHorizontal: 20, marginBottom: 15, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, backgroundColor: '#fff' },
  accordionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  accordionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginLeft: 10 },
  accordionContent: { paddingHorizontal: 18, paddingBottom: 18, backgroundColor: '#fafafa', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  
  eventItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTitle: { fontSize: 16, color: '#333', flex: 1 },
  eventDate: { fontSize: 14, color: '#888' },
  emptyText: { color: '#888', fontStyle: 'italic', marginTop: 10 },
  
  logoutButton: { flexDirection: 'row', backgroundColor: '#dc3545', marginHorizontal: 20, marginTop: 20, paddingVertical: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});