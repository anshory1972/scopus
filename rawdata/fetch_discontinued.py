import json, time, requests, os

API_KEY = "3404e1cf1a62e868767642793053f28d"
HEADERS = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}
BASE    = "https://api.elsevier.com/content/search/scopus"
YEARS   = list(range(2015, 2026))
BATCH   = 100   # source IDs per API call

with open(r"C:\WORK\scopusclaude\rawdata\discontinued_ids.json") as f:
    all_ids = json.load(f)

print(f"Total source IDs: {len(all_ids)}")

# Split IDs into batches
batches = [all_ids[i:i+BATCH] for i in range(0, len(all_ids), BATCH)]
print(f"Batches of {BATCH}: {len(batches)}, Years: {YEARS}")

results = {}   # {year: total_count}

for year in YEARS:
    year_total = 0
    for b_idx, batch in enumerate(batches):
        src_query = " OR ".join(batch)
        query = f"AFFILCOUNTRY(Indonesia) AND SOURCE-ID({src_query}) AND PUBYEAR = {year}"
        params = {"query": query, "count": 0, "field": "dc:identifier"}
        try:
            r = requests.get(BASE, headers=HEADERS, params=params, timeout=30)
            data = r.json()
            total = int(data.get("search-results", {}).get("opensearch:totalResults", 0))
            year_total += total
            print(f"  {year} batch {b_idx+1}/{len(batches)}: {total} papers")
        except Exception as e:
            print(f"  ERROR {year} batch {b_idx+1}: {e}")
        time.sleep(0.2)   # stay under rate limit

    results[year] = year_total
    print(f">>> {year} TOTAL: {year_total}")

print("\nFinal results:")
for yr, cnt in results.items():
    print(f"  {yr}: {cnt}")

out_path = r"C:\WORK\scopusclaude\rawdata\discontinued_trend.json"
with open(out_path, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nSaved to {out_path}")
