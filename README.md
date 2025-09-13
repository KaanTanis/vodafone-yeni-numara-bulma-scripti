# Vodafone Numara Tarayıcı

Vodafone özel numara API'sini kullanarak sistemli numara taraması yapan Node.js scripti.

## 🚀 Özellikler

- **Esnek Numara Üretimi**: İlk 3 hane, son 4 hane veya tamamen rastgele numara taraması
- **Progress Takibi**: Tarama kaldığınız yerden devam edebilir
- **Rate Limit Koruması**: API limitlerini aşmamak için otomatik gecikme
- **Detaylı Raporlama**: GOLD ve PLAIN numaralar için ayrı kategorilendirme
- **Hata Yönetimi**: API hatalarında otomatik bekleme ve yeniden deneme
- **Canlı İlerleme**: Gerçek zamanlı tarama durumu takibi

## 📋 Gereksinimler

- Node.js (v14 veya üzeri)
- NPM paketleri: `axios`, `fs`

## 🛠️ Kurulum

1. Repoyu klonlayın veya dosyayı indirin
2. Gerekli paketleri yükleyin:

```bash
npm install axios
```

## ⚙️ Konfigürasyon

Script başında bulunan `config` objesi ile ayarları yapabilirsiniz:

```javascript
const config = {
    threeDigits: null,    // İlk 3 hane (örn: "555") - null ise otomatik
    fourDigits: "0033",   // Son 4 hane (örn: "0033") - null ise otomatik  
    limit: 1000,          // Kaç numara taransın
    delay: 800,           // İstekler arası bekleme süresi (ms)
    startFrom: 0,         // Hangi numaradan başlasın
};
```

### Numara Üretim Modları

1. **Sabit Numara**: `threeDigits` ve `fourDigits` ikisi de dolu ise aynı numara tekrar tekrar sorgulanır
2. **Son 4 Hane Sabit**: Sadece `fourDigits` dolu ise ilk 3 hane 000'dan başlayarak artırılır
3. **İlk 3 Hane Sabit**: Sadece `threeDigits` dolu ise son 4 hane 0000'dan başlayarak artırılır
4. **Tamamen Rastgele**: Her ikisi de `null` ise 7 haneli rastgele numara üretilir

## 🎯 Kullanım

### Temel Kullanım
```bash
node vodafone.js
```

### Kaldığınız Yerden Devam Etme
```bash
node vodafone.js --devam
```

### Yardım
```bash
node vodafone.js --help
```

## 📊 Çıktı Dosyaları

### `numaralar.txt`
Tüm tarama sonuçlarının detaylı kaydı:
- Bulunan numaralar (GOLD 💎 / PLAIN 📱)
- Fiyat bilgileri
- Numara durumu
- Tarama özeti

### `progress.json`
İlerleme durumu ve ayarların kaydı:
- Son taranan numara indeksi
- Zaman damgası
- Kullanılan konfigürasyon

## 🔍 Örnek Çıktı

```
🔍 Taranıyor: 5550033 (1/1000)
✅ 2 numara bulundu:
   💎 05550033 (150₺)
   📱 05550033 (50₺)

📊 İlerleme: 10/1000 | Bulunan: 3 (1 GOLD) | Başarı: 90.0% | Hata: 1
```

## ⚠️ Önemli Notlar

- **Rate Limiting**: Script API limitlerini korumak için istekler arası bekleme yapar
- **Hata Yönetimi**: API hatalarında 5-10 dakika bekleyebilir
- **Progress Kaydetme**: Her 10 taramada bir ilerleme kaydedilir
- **Yasal Sorumluluk**: Script'i sorumlu bir şekilde kullanın

## 🚨 Hata Durumları

- **429 (Too Many Requests)**: 10 saniye bekleme
- **Genel API Hatası**: 5 dakika bekleme
- **Timeout**: 10 saniye timeout süresi

## 📈 Performans İpuçları

1. **Delay Ayarı**: Daha hızlı tarama için `delay`'i azaltın (risk: rate limit)
2. **Batch İşleme**: Büyük taramalar için `limit`'i bölerek çalıştırın
3. **Progress Takibi**: `--devam` parametresi ile kesintisiz çalışma

## 🤝 Katkıda Bulunma

Hata raporları ve öneriler için issue açabilirsiniz.

## 📝 Lisans

Bu proje kişisel ve eğitim amaçlı kullanım içindir. Ticari kullanım öncesi gerekli izinleri alınız.

---

**Not**: Bu script yalnızca halka açık Vodafone API'sini kullanır. Herhangi bir güvenlik açığından yararlanmaz.