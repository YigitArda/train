# Source Policy Matrix

> Amaç: MVP kapsamında değerlendirilen kaynak operatörleri için ToS/robots/rate-limit/veri yayınlama risklerini tek yerde toplamak.
>
> Not: Bu matris teknik ve ürün kararlarını yönlendirmek içindir; nihai hukuki yorum değildir.

## Risk etiketleri

- **Düşük**: Açık API/TOS izni, robots ve rate-limit net, yayın/saklama kuralları uygulanabilir.
- **Orta**: Kısmi belirsizlik veya kısıt var; kontrollü kullanım gerekir.
- **Yüksek**: ToS veya teknik kurallar scraping’i açıkça yasaklıyor ya da ciddi kısıtlıyor.

## Operatör bazlı politika matrisi

| Operatör | ToS scraping maddeleri | robots.txt durumu | Rate-limit ve erişim kuralları | Veri saklama / publishing kısıtları | Risk | MVP kararı |
|---|---|---|---|---|---|---|
| **Resmî Açık Veri Portalları** (örn. data.gov benzeri) | Genelde izinli; lisans koşullarına uyum şart. | Çoğunlukla erişime açık; endpoint bazlı değişebilir. | Portal/API dokümantasyonunda belirtilen kota uygulanır. | Lisans atfı zorunlu olabilir; kişisel veri ve yeniden dağıtım lisansı kontrol edilmeli. | **Düşük** | **MVP’de aktif ingest** |
| **Wikimedia / Wikipedia** | CC BY-SA/GFDL çerçevesinde kullanım mümkün; scraping yerine dumps/API tercih edilir. | Çoğu içerik erişilebilir; agresif tarama istenmez. | İsteklerde User-Agent ve makul hız beklenir; API önerilir. | Atıf + share-alike yükümlülüğü; içerik değişiklik geçmişi korunmalı. | **Düşük** | **MVP’de aktif ingest (API/dump öncelikli)** |
| **Reddit** | ToS/API şartlarına bağlı; izinsiz yoğun scraping risklidir. | Bazı path’lerde kısıt olabilir; robots tek başına izin anlamına gelmez. | API kotası ve kimlik doğrulama gereksinimleri geçerlidir. | Kullanıcı içeriği yeniden yayınlamada platform şartları ve gizlilik sınırları geçerlidir. | **Orta** | **MVP’de sınırlı ingest (yalnız API, cache süresi kontrollü)** |
| **X (Twitter)** | ToS, izinsiz scraping’e karşı katıdır; resmi API şartları geçerlidir. | Robots erişim sinyali verir ama ToS kısıtlarını geçersiz kılmaz. | API katmanına göre sıkı kota/erişim kuralları bulunur. | İçeriğin depolanması, yeniden dağıtımı ve gösterimi sözleşmeye bağlıdır. | **Yüksek** | **MVP dışı** (yalnız resmi link/redirect) |
| **LinkedIn** | ToS, otomatik scraping’e güçlü kısıtlar uygular. | robots sınırlayıcı olabilir; hukuki risk ToS kaynaklıdır. | Anti-bot önlemleri ve erişim sınırlamaları yüksektir. | Profil verisi kişisel veri niteliğinde; yayınlama ve saklama riski yüksek. | **Yüksek** | **MVP dışı** (yalnız redirect modeli) |
| **Instagram / Meta** | ToS, otomasyon ve izinsiz veri çekimine ciddi kısıt getirir. | robots sınırlı/engelleyici olabilir. | API erişimi izin ve uygulama incelemesine bağlı; scraping engellenir. | Medya ve kullanıcı verilerinde lisans + gizlilik kısıtları yüksek. | **Yüksek** | **MVP dışı** (yalnız redirect modeli) |
| **Haber siteleri (publisher web)** | Site bazlı değişir; çoğunda izinsiz tam içerik scraping ve yeniden yayın kısıtlıdır. | robots çoğunlukla crawl kurallarını belirtir, ihlal riski doğabilir. | Yayıncıya göre farklı; agresif istekler engellenebilir. | Telif nedeniyle tam metin depolama/yayınlama sınırlı; özet + kaynak link tercih edilmeli. | **Orta** | **MVP’de yalnız meta/özet + kaynak link** |

## MVP için uygulanacak guardrail’ler

1. **Yüksek riskli kaynaklar ingest pipeline dışında** tutulur.
2. Yüksek riskli kaynaklarda yalnızca **redirect modeli** uygulanır (kullanıcıyı orijinal kaynağa yönlendirme).
3. Orta risk kaynaklarda yalnızca **resmî API + düşük hacim + kısa TTL cache** yaklaşımı kullanılır.
4. Yayınlanan tüm çıktılarda **kaynak atfı** ve mümkünse canonical URL zorunludur.
5. Telif/personal-data riski olan içeriklerde **ham içerik saklama kapalı**, yalnız türetilmiş sinyal/özet saklama açılır.

## Redirect modeli (yüksek risk kaynaklar için)

- Uygulama, yüksek riskli platformdan ham içerik ingest etmez.
- Arama/öneri sonucu yalnız şu alanları taşır:
  - platform adı
  - içerik başlığı (varsa kullanıcıdan veya açık metadata’dan)
  - dış bağlantı (canonical URL)
- İçerik görüntüleme, yorumlama ve medya sunumu kaynak platformda kalır.
- Tıklama analitiği kullanıcı gizliliğini koruyacak şekilde toplulaştırılır.

## Periyodik gözden geçirme

- Bu matris **aylık** gözden geçirilir.
- ToS/robots/API değişikliği algılandığında ilgili satırın risk seviyesi güncellenir.
- Risk seviyesi **Yüksek**e çıkan bir kaynak için ingest job’ları otomatik durdurulur.
