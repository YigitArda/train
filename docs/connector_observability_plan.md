# Connector Observability & Operasyon Planı

Bu doküman, connector bazlı kalite metriklerini izleme, değişim alarmı üretme, düzenli kalite kontrollerini zamanlama ve kapsama görünürlüğünü dashboard'a taşıma planını içerir.

## 1) Connector başına metrik toplama

### Hedef metrikler
- **Başarı oranı (success_rate):** `successful_requests / total_requests`
- **Median latency (p50_latency_ms):** request seviyesinde `latency_ms` medyanı
- **Block rate (block_rate):** `blocked_requests / total_requests`

### Önerilen event şeması
Her istek için aşağıdaki alanlar standartlaştırılmalıdır:
- `timestamp`
- `connector`
- `country`
- `operator`
- `request_id`
- `status` (`success`, `failure`, `blocked`)
- `latency_ms`
- `changed_dom` (bool/int)

### Örnek günlük agregasyon sorgusu
```sql
SELECT
  DATE(timestamp) AS dt,
  connector,
  COUNT(*) AS total_requests,
  AVG(CASE WHEN status = 'success' THEN 1 ELSE 0 END) AS success_rate,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) AS p50_latency_ms,
  AVG(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) AS block_rate
FROM connector_events
GROUP BY 1, 2;
```

## 2) `changed_dom` artış alarmı

### Alarm kuralı
- Ölçüm: connector bazında saatlik `changed_dom_rate = changed_dom_count / total_requests`
- Baseline: son 14 günün aynı saat dilimi medyanı
- Tetik: 
  - `changed_dom_rate > baseline * 2` **ve**
  - `changed_dom_rate > 0.15` **ve**
  - son 30 dakikada en az 100 istek

### Alarm seviyesi
- **Warning:** 10 dakika boyunca koşul sağlanırsa
- **Critical:** 30 dakika boyunca koşul sağlanırsa

### Alarm payload alanları
- `connector`
- `current_changed_dom_rate`
- `baseline_changed_dom_rate`
- `sample_size`
- `top_affected_country_operator`

## 3) Zamanlanmış kalite kontrolleri

### Günlük otomatik smoke run
- Zaman: her gün 06:00 UTC
- Kapsam: her connector için kritik 5 akış
- Geçme kriteri: başarı oranı >= %98, block rate <= %2, p50 latency <= 2000 ms
- Çıktı: CI raporu + Slack #connector-alerts özeti

### Haftalık selector audit
- Zaman: her Pazartesi 07:00 UTC
- Kapsam: yüksek trafik alan ilk %80 connector
- Kontroller:
  - selector kırılma oranı
  - fallback selector kullanım oranı
  - son 7 gündeki `changed_dom` trendi
- Aksiyon:
  - riskli connector için owner ataması
  - 48 saat içinde düzeltme PR'ı

## 4) Dashboard: ülke/operatör kapsama yüzdesi

### KPI tanımı
- **Country coverage %** = `aktif ülke sayısı / hedef ülke sayısı * 100`
- **Operator coverage %** = `aktif operatör sayısı / hedef operatör sayısı * 100`

### Dashboard kırılımları
- Connector -> Country -> Operator hiyerarşisi
- Son 24 saat / 7 gün / 30 gün seçimi
- Isı haritası: düşük kapsama (<%80) alanları kırmızı gösterim

### Yayın kriteri
- Veri güncelliği: maksimum 15 dakika gecikme
- KPI doğrulama: haftalık selector audit çıktısı ile tutarlılık kontrolü

## 5) Uygulama sırası (öneri)
1. Event şemasını tüm connector'lara zorunlu alanlarla uygula.
2. Günlük metrik agregasyon job'unu devreye al.
3. `changed_dom` alarmını warning/critical eşikleri ile yayınla.
4. Günlük smoke + haftalık audit scheduler'larını CI'ya bağla.
5. Dashboard coverage KPI'larını canlıya al ve owner'ları etiketle.
