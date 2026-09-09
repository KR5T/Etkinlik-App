import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../../../supabase';

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(''); // Şimdilik metin olarak alıyoruz (YYYY-MM-DD HH:MM)
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    // 1. Basit bir boş alan kontrolü
    if (!title || !date || !location || !capacity) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları (Başlık, Tarih, Konum, Kapasite) doldurun.');
      return;
    }

    setLoading(true);

    try {
      // 2. O an giriş yapmış kullanıcının bilgilerini alıyoruz
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        Alert.alert('Hata', 'Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
        setLoading(false);
        return;
      }

      // 3. Etkinliği veri tabanına yazıyoruz
      const { error: insertError } = await supabase.from('events').insert({
        creator_id: user.id, // Kullanıcının ID'sini events tablosuna bağlıyoruz
        title: title,
        description: description,
        date: date, // PostreSQL tarih formatına uygun girilmesi lazım
        location: location,
        capacity: parseInt(capacity), // Kapasiteyi metinden tam sayıya çeviriyoruz
      });

      if (insertError) {
        Alert.alert('Etkinlik Oluşturulamadı', insertError.message);
      } else {
        Alert.alert('Harika!', 'Etkinlik başarıyla oluşturuldu.');
        // Başarılı olursa ana sayfaya veya listeye geri döndürebiliriz
        router.replace('../(tabs)'); 
      }
    } catch (err) {
      Alert.alert('Beklenmeyen Hata', 'Bir şeyler ters gitti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Yeni Etkinlik Oluştur</Text>

      <TextInput
        style={styles.input}
        placeholder="Etkinlik Başlığı *"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Etkinlik Açıklaması"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TextInput
        style={styles.input}
        placeholder="Tarih ve Saat * (Örn: 2026-10-25 14:00)"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Konum *"
        value={location}
        onChangeText={setLocation}
      />

      <TextInput
        style={styles.input}
        placeholder="Kapasite (Kişi Sayısı) *"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric" // Sadece sayı klavyesi açılır
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateEvent} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Etkinliği Paylaş</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#ff6b6b', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});