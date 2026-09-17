import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../../supabase';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [createdEvents, setCreatedEvents] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  
  // Accordion durumlarını tutan stateler
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);
  const [isJoinedOpen, setIsJoinedOpen] = useState(false);

  // Bio Düzenleme Stateleri
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError;

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (!profileError) {
        setProfile(profileData);
        setBioText(profileData.bio || ''); 
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('creator_id', user.id)
        .order('date', { ascending: false });

      if (!eventsError) setCreatedEvents(eventsData || []);

      const { data: joinedData, error: joinedError } = await supabase
        .from('attendees')
        .select(`
          event_id,
          events ( * )
        `)
        .eq('user_id', user.id);

      if (!joinedError && joinedData) {
        // KURŞUN GEÇİRMEZ (BULLETPROOF) VERİ AYIKLAMA
        const formattedJoinedEvents = joinedData
          .map(item => {
            // Supabase dizi dönerse ilk elemanı al, obje dönerse kendisini al
            let evt = Array.isArray(item.events) ? item.events[0] : item.events;
            
            // Eğer event bulunduysa, asıl item.event_id'yi de içine garanti olarak ekle
            if (evt) {
              evt.event_id = item.event_id || evt.event_id;
            }
            return evt;
          })
          .filter(e => e !== null && e !== undefined); 
          
        setJoinedEvents(formattedJoinedEvents);
      }

    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBio = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({ bio: bioText })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, bio: bioText });
      setIsEditingBio(false);
      Alert.alert("Başarılı", "Biyografin güncellendi.");
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Biyografi kaydedilirken bir sorun oluştu.");
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
          router.replace('/login'); 
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hesabı Sil",
      "Hesabını ve tüm verilerini (oluşturduğun etkinlikler dahil) kalıcı olarak silmek istediğine emin misin? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Evet, Sil", 
          style: "destructive", 
          onPress: async () => {
            try {
              const { error } = await supabase.rpc('delete_user');
              if (error) throw error;
              
              await supabase.auth.signOut();
              router.replace('/login');
            } catch (error: any) {
              Alert.alert("Hata", "Hesap silinirken bir sorun oluştu.");
              console.error(error.message);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') return '';
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
      
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={50} color="#fff" />
        </View>
        <Text style={styles.name}>{profile?.full_name || 'Kullanıcı'}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      <View style={styles.accordionContainer}>
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setIsBioOpen(!isBioOpen)}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="information-circle-outline" size={24} color="#17a2b8" />
            <Text style={styles.accordionTitle}>Biyografim</Text>
          </View>
          <Ionicons name={isBioOpen ? "chevron-up" : "chevron-down"} size={24} color="#555" />
        </TouchableOpacity>
        
        {isBioOpen && (
          <View style={styles.accordionContent}>
            {isEditingBio ? (
              <View>
                <TextInput
                  style={styles.bioInput}
                  multiline
                  numberOfLines={4}
                  value={bioText}
                  onChangeText={setBioText}
                  placeholder="Kendinden kısaca bahset..."
                />
                <View style={styles.bioActionRow}>
                  <TouchableOpacity 
                    style={styles.bioCancelBtn} 
                    onPress={() => {
                      setIsEditingBio(false);
                      setBioText(profile?.bio || ''); 
                    }}
                  >
                    <Text style={styles.bioCancelText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bioSaveBtn} onPress={handleSaveBio}>
                    <Text style={styles.bioSaveText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.bioTextContent}>
                  {profile?.bio || 'Henüz bir biyografi eklenmemiş.'}
                </Text>
                <TouchableOpacity 
                  style={styles.bioEditBtn} 
                  onPress={() => setIsEditingBio(true)}
                >
                  <Ionicons name="pencil" size={16} color="#007bff" />
                  <Text style={styles.bioEditText}>Düzenle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

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
              createdEvents.map((event, index) => (
                <TouchableOpacity 
                  key={event?.event_id || `created-${index}`} 
                  style={styles.eventItem}
                  onPress={() => router.push(`../event/${event.event_id}`)}
                >
                  <Text style={styles.eventTitle}>{event?.title || 'İsimsiz Etkinlik'}</Text>
                  <Text style={styles.eventDate}>{formatDate(event?.date)}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>Henüz hiç etkinlik oluşturmadın.</Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.accordionContainer}>
        <TouchableOpacity 
          style={styles.accordionHeader} 
          onPress={() => setIsJoinedOpen(!isJoinedOpen)}
        >
          <View style={styles.accordionTitleRow}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#28a745" />
            <Text style={styles.accordionTitle}>Katıldığım Etkinlikler ({joinedEvents.length})</Text>
          </View>
          <Ionicons name={isJoinedOpen ? "chevron-up" : "chevron-down"} size={24} color="#555" />
        </TouchableOpacity>
        
        {isJoinedOpen && (
          <View style={styles.accordionContent}>
            {joinedEvents.length > 0 ? (
              joinedEvents.map((event: any, index) => {
                if (!event) return null; 
                
                // Güvenli değerler atayarak çöküşü (crash) %100 engelliyoruz
                const eventId = event.event_id || `joined-${index}`;
                const title = event.title || 'İsimsiz Etkinlik';
                const date = event.date || '';

                return (
                  <TouchableOpacity 
                    key={eventId} 
                    style={styles.eventItem}
                    onPress={() => router.push(`../event/${eventId}`)}
                  >
                    <Text style={styles.eventTitle}>{title}</Text>
                    <Text style={styles.eventDate}>{formatDate(date)}</Text>
                  </TouchableOpacity>
                )
              })
            ) : (
              <Text style={styles.emptyText}>Henüz hiçbir etkinliğe katılmadın.</Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Ionicons name="trash-outline" size={22} color="#dc3545" style={{ marginRight: 8 }} />
        <Text style={styles.deleteText}>Hesabı Sil</Text>
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
  
  bioTextContent: { fontSize: 15, color: '#444', lineHeight: 22, marginTop: 5 },
  bioEditBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 12, alignSelf: 'flex-start' },
  bioEditText: { color: '#007bff', fontWeight: 'bold', marginLeft: 5 },
  bioInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top', fontSize: 15, color: '#333' },
  bioActionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  bioCancelBtn: { paddingVertical: 8, paddingHorizontal: 15, marginRight: 10 },
  bioCancelText: { color: '#666', fontWeight: 'bold' },
  bioSaveBtn: { backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  bioSaveText: { color: '#fff', fontWeight: 'bold' },

  eventItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventTitle: { fontSize: 16, color: '#333', flex: 1 },
  eventDate: { fontSize: 14, color: '#888' },
  emptyText: { color: '#888', fontStyle: 'italic', marginTop: 10 },
  
  logoutButton: { flexDirection: 'row', backgroundColor: '#6c757d', marginHorizontal: 20, marginTop: 20, paddingVertical: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  logoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },

  deleteButton: { flexDirection: 'row', backgroundColor: 'transparent', marginHorizontal: 20, marginTop: 15, paddingVertical: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#dc3545' },
  deleteText: { color: '#dc3545', fontSize: 18, fontWeight: 'bold' }
});