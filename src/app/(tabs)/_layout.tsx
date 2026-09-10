import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Keşfet',
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => <Entypo name="magnifying-glass" size={24} color="grey" />
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: 'Yeni Etkinlik',
          tabBarLabel: 'Oluştur',
          tabBarIcon: ({ color }) => <Entypo name="squared-plus" size={24} color="grey" />
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <FontAwesome6 name="user-large" size={24} color="grey" />
        }}
      />
    </Tabs>
  );
}