import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const router = useRouter(); // Yönlendirme motorumuzu çağırıyoruz

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Burası Ana Sayfa (index.tsx)</Text>
      
      {/* Has mobil butonu */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => {
          router.push('/login')
        } }
      >
        <Text style={styles.buttonText}>Giriş Ekranına Git</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  text: { fontSize: 18, marginBottom: 20 },
  button: { 
    backgroundColor: '#007bff', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 8,
    elevation: 3, // Android için hafif gölge
    shadowColor: '#000', // iOS için gölge
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});