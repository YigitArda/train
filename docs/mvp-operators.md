# MVP Operatör Önceliklendirme (Karayolu Biletleme)

Bu doküman, **ilk fazda entegre edilecek otobüs operatörlerini** seçmek için pratik bir skor modeli sunar.

## 1) Puanlama Modeli

Her operatör 4 ana kriterde 1–5 arasında puanlanır:

- **Ülke Önceliği (1–5):** Hedef pazardaki stratejik önem (Türkiye=5, yakın genişleme ülkeleri=3–4, uzun vadeli=1–2).
- **Pazar Payı / Ağ Etkisi (1–5):** Marka bilinirliği, hat yoğunluğu, sefer frekansı.
- **Sınır-Ötesi Kapsama (1–5):** Uluslararası/çok-ülkeli rota çeşitliliği.
- **Scraping Zorluğu (1–5):** 1=kolay, 5=çok zor (WAF, dinamik token, anti-bot, yoğun JS akışı vb.).

> **Öncelik skoru (0–5)** için önerilen formül:
>
> `Öncelik = 0.35*Ülke + 0.35*PazarPayı + 0.20*SınırÖtesi + 0.10*(6-ScrapingZorluğu)`
>
> Bu sayede yüksek etki + uygulanabilirlik dengesi korunur.

---

## 2) İlk Faz için Önerilen Operatörler (10 adet)

Aşağıdaki liste, Türkiye merkezli MVP için **8–12** hedef aralığında, teknik ve ticari denge gözetilerek seçilmiştir.

| # | Operatör | Ana Ülke | Ülke Önceliği | Pazar Payı | Sınır-Ötesi Kapsama | Scraping Zorluğu | Öncelik Skoru |
|---|---|---|---:|---:|---:|---:|---:|
| 1 | Metro Turizm | Türkiye | 5 | 5 | 3 | 3 | **4.50** |
| 2 | Kamil Koç (FlixBus TR) | Türkiye | 5 | 5 | 4 | 4 | **4.40** |
| 3 | Pamukkale Turizm | Türkiye | 5 | 4 | 2 | 3 | **3.95** |
| 4 | Nilüfer Turizm | Türkiye | 5 | 4 | 2 | 2 | **4.05** |
| 5 | Varan Turizm | Türkiye | 5 | 3 | 2 | 3 | **3.60** |
| 6 | Anadolu Ulaşım | Türkiye | 5 | 3 | 1 | 2 | **3.60** |
| 7 | FlixBus (DACH/CEE) | Almanya/AB | 4 | 5 | 5 | 5 | **4.00** |
| 8 | Alsa | İspanya | 3 | 4 | 3 | 4 | **3.25** |
| 9 | Rede Expressos | Portekiz | 3 | 3 | 2 | 3 | **2.95** |
|10| BlaBlaCar Bus | Fransa/AB | 3 | 3 | 4 | 4 | **3.10** |

---

## 3) Operatör Bazında Alanlar (MVP Tablosu)

İstenen alanlar: **resmi site URL**, **arama akışı**, **bot koruması seviyesi**, **fiyat/koltuk tipi ayrımı**.

| Operatör | Resmi site URL | Arama akışı | Bot koruması seviyesi | Fiyat / koltuk tipi ayrımı |
|---|---|---|---|---|
| Metro Turizm | https://www.metroturizm.com.tr | Kalkış-varış-tarih + sefer listesi + koltuk seçimi + ödeme | Orta | Genelde sefer/fiyat bazlı; koltuk tipi sınırlı veya hat bazlı |
| Kamil Koç (FlixBus TR) | https://www.kamilkoc.com.tr | Kalkış-varış-tarih + sonuç sayfası + yolcu bilgisi + ödeme | Orta-Yüksek | Dinamik fiyatlama güçlü; koltuk/konfor sınıfı hatta göre değişebilir |
| Pamukkale Turizm | https://pamukkale.com.tr | Arama formu + sefer saatleri + koltuk + ödeme | Orta | Promosyonlu/standart fiyat ayrımı; koltuk tercih ekranı mevcut |
| Nilüfer Turizm | https://www.nilufer.com.tr | Lokasyon/tarih arama + sefer listesi + koltuk | Düşük-Orta | Temel ücret farklılaşması; koltuk tipi daha sınırlı |
| Varan Turizm | https://www.varan.com.tr | Rota/tarih + sefer + koltuk + ödeme | Orta | Sefer/hat bazlı fiyat; koltuk konforu sınırlı varyant |
| Anadolu Ulaşım | https://www.anadolulasim.com.tr | Arama + sefer kartları + koltuk seçimi | Düşük-Orta | Fiyat sınıfı ayrımı sınırlı; koltuk düzeni mevcut |
| FlixBus | https://www.flixbus.com | Kaynak-hedef-tarih + çok adımlı sonuç/upsell + ödeme | Yüksek | Fiyat katmanı (Basic/Flex vb.) ve ek hizmet ayrımları belirgin |
| Alsa | https://www.alsa.com | Çok adımlı arama + tarife seçimi + yolcu tipi + ödeme | Orta-Yüksek | Tarife sınıfı + koltuk yeri + esneklik paketleri |
| Rede Expressos | https://rede-expressos.pt | Basit arama + sefer listesi + ödeme | Orta | Fiyat farklılaşması var; koltuk tipi sınırlı |
| BlaBlaCar Bus | https://www.blablacar.com/bus | Arama + sefer + ücret/kurallar + ödeme | Yüksek | Dinamik ücret ve kurala bağlı bilet sınıfı ayrımları |

---

## 4) Neden Bu 10 Operatör?

1. **Türkiye çekirdek kapsamı hızla kapanır** (Metro, Kamil Koç, Pamukkale, Nilüfer, Varan, Anadolu Ulaşım):
   - Hızlı rota kapsaması,
   - Yüksek yerel talep,
   - MVP’de erken doğrulama için yeterli veri hacmi.

2. **AB genişleme kapısı açılır** (FlixBus, Alsa, Rede Expressos, BlaBlaCar Bus):
   - Sınır-ötesi rota testleri,
   - Çok para birimi / çok dil senaryoları,
   - Dinamik fiyatlama ve farklı tarife yapılarını erken modelleme.

3. **Teknik risk dağıtılır**:
   - Düşük/orta zorluktaki sitelerle hızlı başlangıç,
   - Yüksek anti-bot siteler için paralel PoC hattı,
   - Parser ve anti-bot dayanıklılığı iteratif geliştirilir.

---

## 5) Fazlama Önerisi

- **Faz 1A (hızlı kazanım, 4–6 hafta):** Metro, Pamukkale, Nilüfer, Anadolu Ulaşım.
- **Faz 1B (ölçekleme, +4 hafta):** Kamil Koç, Varan, Rede Expressos.
- **Faz 1C (karmaşık anti-bot, +4–6 hafta):** FlixBus, Alsa, BlaBlaCar Bus.

Bu sıralama ile ekip, önce veri akışını stabilize eder; ardından karmaşık akışlara geçer.

