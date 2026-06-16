"""
Fix: record sampling for affiliations, authors, keywords, funding
     + Vietnam with correct country name
     + top source titles (all 1142 journals)
"""
import json, time, requests
from collections import Counter

API_KEY = "3404e1cf1a62e868767642793053f28d"
H       = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}
BASE    = "https://api.elsevier.com/content/search/scopus"

with open(r"C:\WORK\scopusclaude\rawdata\discontinued_ids.json") as f:
    all_ids = json.load(f)

with open(r"C:\WORK\scopusclaude\rawdata\all_data.json", encoding="utf-8") as f:
    out = json.load(f)

# ── Helper ────────────────────────────────────────────────────────────────────
def count_q(query):
    try:
        r = requests.get(BASE, headers=H,
                         params={"query": query, "count": 0, "field": "dc:identifier"},
                         timeout=30)
        return int(r.json().get("search-results", {}).get("opensearch:totalResults", 0))
    except:
        return 0

# ══════════════════════════════════════════════════════════════════════════════
# 1. VIETNAM — correct Scopus name is "Viet Nam"
# ══════════════════════════════════════════════════════════════════════════════
print("[1] Viet Nam benchmark")
YEARS   = list(range(2015, 2026))
BATCH   = 100
batches = [all_ids[i:i+BATCH] for i in range(0, len(all_ids), BATCH)]

vn = {}
for yr in YEARS:
    total = 0
    for b in batches:
        q = "AFFILCOUNTRY(\"Viet Nam\") AND SOURCE-ID(" + " OR ".join(b) + f") AND PUBYEAR = {yr}"
        total += count_q(q)
        time.sleep(0.2)
    vn[str(yr)] = total
    print(f"  {yr}: {total}")

out["benchmark"]["Viet Nam"] = vn

# ══════════════════════════════════════════════════════════════════════════════
# 2. RECORD SAMPLING — use individual batch queries, collect field data
# ══════════════════════════════════════════════════════════════════════════════
print("\n[2] Record sampling")
affil_c  = Counter()
author_c = Counter()
kw_c     = Counter()
fund_c   = Counter()

FIELDS = "affilname,authname,authkeywords,fund-sponsor"
SAMPLE_IDS = all_ids[:300]   # first 300 IDs for sampling
PAGE_SIZE  = 200
MAX_RECORDS = 4000

fetched = 0
start   = 0
while fetched < MAX_RECORDS:
    # rotate which 100 IDs we query to get diversity across journals
    offset_ids = SAMPLE_IDS[(start // PAGE_SIZE * 50) % 200 : (start // PAGE_SIZE * 50) % 200 + 100]
    if not offset_ids:
        offset_ids = SAMPLE_IDS[:100]
    q = "AFFILCOUNTRY(Indonesia) AND SOURCE-ID(" + " OR ".join(offset_ids) + ") AND PUBYEAR > 2014"
    try:
        r = requests.get(BASE, headers=H, params={
            "query": q, "count": PAGE_SIZE, "start": start % 4000, "field": FIELDS
        }, timeout=60)
        data    = r.json().get("search-results", {})
        entries = data.get("entry", [])
        if not entries or "error" in data.get("entry", [{}])[0]:
            break
        for e in entries:
            # affiliations
            for af in (e.get("affiliation") or []):
                name = af.get("affilname","").strip()
                if name: affil_c[name] += 1
            # authors
            for au in (e.get("author") or []):
                name = au.get("authname","").strip()
                if name: author_c[name] += 1
            # keywords
            kws = e.get("authkeywords","")
            if kws:
                for kw in str(kws).split("|"):
                    kw = kw.strip().lower()
                    if len(kw) > 2: kw_c[kw] += 1
            # funding
            for fs in (e.get("fund-sponsor") or []):
                fs = str(fs).strip()
                if fs: fund_c[fs] += 1
        fetched += len(entries)
        start   += PAGE_SIZE
        print(f"  Fetched {fetched} records | affils={len(affil_c)} authors={len(author_c)} kws={len(kw_c)}")
        time.sleep(0.3)
        if len(entries) < PAGE_SIZE:
            break
    except Exception as ex:
        print(f"  ERROR: {ex}")
        break

out["topAffiliations"] = [{"name": k, "count": v} for k, v in affil_c.most_common(20)]
out["topAuthors"]      = [{"name": k, "count": v} for k, v in author_c.most_common(20)]
out["topKeywords"]     = [{"word": k, "count": v} for k, v in kw_c.most_common(50)]
out["topFunding"]      = [{"name": k, "count": v} for k, v in fund_c.most_common(20)]

print(f"  Top affil:   {affil_c.most_common(3)}")
print(f"  Top author:  {author_c.most_common(3)}")
print(f"  Top keyword: {kw_c.most_common(5)}")
print(f"  Top funding: {fund_c.most_common(3)}")

# ══════════════════════════════════════════════════════════════════════════════
# 3. TOP SOURCE TITLES — query all 1142 individually
# ══════════════════════════════════════════════════════════════════════════════
import pandas as pd
print("\n[3] Top source titles (all 1142 journals)")

src_df = pd.read_excel(r"C:\WORK\scopusclaude\rawdata\ext_list_May_2026.xlsx",
                       sheet_name="Scopus Sources May 2026")
src_df["Sourcerecord ID"] = src_df["Sourcerecord ID"].astype(str).str.strip().str.split(".").str[0]
disc_ids_set = set(all_ids)
meta = src_df[src_df["Sourcerecord ID"].isin(disc_ids_set)][
    ["Sourcerecord ID","Source Title","Source Type","Publisher"]
].drop_duplicates("Sourcerecord ID").set_index("Sourcerecord ID")

top_sources = []
for sid in all_ids:
    q = f"AFFILCOUNTRY(Indonesia) AND SOURCE-ID({sid})"
    c = count_q(q)
    if c > 0:
        m = meta.loc[sid] if sid in meta.index else None
        top_sources.append({
            "id":        sid,
            "title":     str(m["Source Title"]) if m is not None else sid,
            "type":      str(m["Source Type"])  if m is not None else "Unknown",
            "publisher": str(m["Publisher"])    if m is not None else "",
            "count":     c
        })
    time.sleep(0.15)

top_sources.sort(key=lambda x: -x["count"])
out["topSources"] = top_sources[:30]
print(f"  Found {len(top_sources)} sources. Top 5:")
for s in top_sources[:5]:
    print(f"    {s['count']:>5}  {s['title'][:70]}")

# ══════════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════════
with open(r"C:\WORK\scopusclaude\rawdata\all_data.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print("\nSaved all_data.json")
