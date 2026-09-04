import { Alert, Button, StyleSheet, Text, View } from 'react-native';
// src/screens içinden ana dizindeki supabase.js'e çıkıyoruz
import { supabase } from '../../supabase';

export default function HomeScreen() {
  const baglantiTesti = async () => {
    // Supabase paneline eklediğimiz kullanıcıyla direkt giriş yapmayı deniyoruz
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'kursat@etkinlikapp.com',
      password: 'supergizlisifre123',
    });

    if (error) {
      Alert.alert("Bağlantı Hatası", error.message);
    } else {
      Alert.alert("Harika!", "Bağlantı başarılı, sisteme giriş yapıldı.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Ana Sayfa - Etkinlik Listesi</Text>
      <Button title="Supabase Bağlantısını Test Et" onPress={baglantiTesti} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginBottom: 20, fontSize: 16, fontWeight: 'bold' }
});