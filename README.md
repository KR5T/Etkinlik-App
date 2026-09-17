# EtkinlikApp 🎉

Sosyal topluluklar için geliştirilmiş, kullanıcıların kendi etkinliklerini oluşturabileceği, yeni etkinlikler keşfedip katılabileceği ve arkadaşlarını davet edebileceği yeni nesil mobil etkinlik uygulaması. 

Bu proje, "Spec-Driven Development" (Spesifikasyon Odaklı Geliştirme) yaklaşımı kullanılarak baştan uca tasarlanmış ve kodlanmıştır.

## 📱 Ekran Görüntüleri

| Giriş Ekranı | Giriş Yap Ekranı | Kayıt Ekranı | Keşfet |
| :---: | :---: | :---: | :---: |
| ![Giriş Ekranı](./assets/images/GirisEkrani.PNG) | ![Giriş Yap Ekranı](./assets/images/GirişYapEkranı.PNG) | ![Kayıt Ekranı](./assets/images/KaydolEkranı.PNG) | ![Keşfet](././assets/images/KeşfetEkranı.PNG) |

| Etkinlik Oluşturma Ekranı | Profil Ekranı | Bildirimler Ekranı | 
| :---: | :---: | :---: | 
| ![Etkinlik Oluşturma Ekranı](./assets/images/EtkinlikOluşturEkranı.PNG) | ![Profil Ekranı](./assets/images/ProfilEkranı.PNG) | ![Bildirimler Ekranı](./assets/images/BildirimlerEkranı.PNG)|

| Buluşma Detayları | Davet Ekranı |  Ekranı | 
| :---: | :---: | :---: | 
| ![Buluşma Detayları](./assets/images/BuluşmaDetayları.PNG) | ![Davet Ekranı](./assets/images/DavetEtEkranı.PNG) | ![Bildirimler Ekranı](./assets/images/EtkinliğeKatıl.PNG)|



## ✨ Temel Özellikler

* **Kimlik Doğrulama:** Supabase Auth ile güvenli e-posta ve şifre kayıt/giriş işlemleri.
* **Etkinlik Yönetimi:** Yeni etkinlik oluşturma, kapasite, tarih ve konum belirleme.
* **Keşfet & Katıl:** Yaklaşan etkinlikleri listeleme ve tek tıkla katılım sağlama.
* **Davet Sistemi:** Sistemdeki diğer kullanıcıları arama ve etkinliklere özel davet gönderme.
* **Bildirimler:** Gelen davetleri uygulama içi bildirim zili ve rozet (badge) sistemiyle takip edip kabul veya reddetme.
* **Profil Yönetimi:** Kişiselleştirilebilir biyografi, oluşturulan ve katılım sağlanan etkinliklerin geçmişi, hesap silme.

## 🛠️ Kullanılan Teknolojiler

* **Frontend (Mobil):** React Native, Expo, Expo Router
* **Backend & Veritabanı:** Supabase (PostgreSQL)
* **Güvenlik:** Row Level Security (RLS)
* **Tasarım:** React Native StyleSheet, Ionicons
