# Station Canonicalization

Bu repo, istasyon adlarını canonical station registry'ye normalize eden örnek veri ve pipeline içerir.

## Dosyalar

- `data/stations/canonical_registry.csv`: UIC, ülke kodu, koordinatlar ve alias listesi ile canonical kayıtlar.
- `data/stations/manual_overrides.csv`: sağlayıcıya özgü manual override eşlemeleri.
- `data/stations/city_nodes.csv`: şehir seviyesinde birleşik düğümler (Paris, London, Berlin).
- `src/station_normalize.py`: fuzzy + manual override kullanan normalize pipeline.

## Kullanım

```bash
python3 src/station_normalize.py
```

`normalize_search_results`, tüm ham sonuçlara `canonical_station_id` ve `canonical_city_node` alanlarını ekler.
