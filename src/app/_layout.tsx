import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { supabase } from '../../supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Uygulama açılır açılmaz mevcut session'ı al
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setIsLoading(false);
    };

    initializeAuth();

    // Login / logout olduğunda session'ı güncelle
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Session henüz okunmadıysa hiçbir şey yapma
    if (isLoading) return;

    const firstSegment = segments[0];

    const isLoginScreen = firstSegment === 'login';
    const isRegisterScreen = firstSegment === 'register';
    const isTabsScreen = firstSegment === '(tabs)';
    const isEventScreen = firstSegment === 'event';

    const isPublicScreen =
      isLoginScreen ||
      isRegisterScreen ||
      firstSegment === undefined;

    const isProtectedScreen =
      isTabsScreen ||
      isEventScreen;

    // Kullanıcı giriş yapmış.
    // Login/register/ana karşılama ekranında ise uygulamanın içine gönder.
    if (session && isPublicScreen) {
      router.replace('/(tabs)');
      return;
    }

    // Kullanıcı giriş yapmamış.
    // Korunan bir sayfaya girmeye çalışıyorsa login'e gönder.
    if (!session && isProtectedScreen) {
      router.replace('/login');
      return;
    }
  }, [session, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="login"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="register"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="event/[id]"
          options={{ headerShown: false }}
        />
      </Stack>
    </ThemeProvider>
  );
}
//test122@test.com