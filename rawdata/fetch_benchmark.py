import json, time, requests

API_KEY = "3404e1cf1a62e868767642793053f28d"
HEADERS = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}
BASE    = "https://api.elsevier.com/content/search/scopus"
YEARS   = list(range(2015, 2026))
BATCH   = 100

with open(r"C:\WORK\scopusclaude\rawdata\discontinued_ids.json") as f:
    all_ids = json.load(f)

batches  = [all_ids[i:i+BATCH] for i in range(0, len(all_ids), BATCH)]
countries = ["Malaysia", "Thailand", "India", "Vietnam"]

results = {}

for country in countries:
    print(f"\n=== {country} ===")
    results[country] = {}
    for year in YEARS:
        year_total = 0
        for b_idx, batch in enumerate(batches):
            src_query = " OR ".join(batch)
            query = f"AFFILCOUNTRY({country}) AND SOURCE-ID({src_query}) AND PUBYEAR = {year}"
            params = {"query": query, "count": 0, "field": "dc:identifier"}
            try:
                r = requests.get(BASE, headers=HEADERS, params=params, timeout=30)
                total = int(r.json().get("search-results", {}).get("opensearch:totalResults", 0))
                year_total += total
            except Exception as e:
                print(f"  ERROR {country} {year} batch {b_idx+1}: {e}")
            time.sleep(0.2)
        results[country][year] = year_total
        print(f"  {year}: {year_total}")

out_path = r"C:\WORK\scopusclaude\rawdata\benchmark_trend.json"
with open(out_path, "w") as f:
    json.dump(results, f, indent=2)
print(f"\nSaved to {out_path}")
