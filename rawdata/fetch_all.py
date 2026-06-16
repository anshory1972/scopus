"""
Comprehensive Scopus data fetch for Indonesian papers in discontinued journals.
Covers: doc types, subject areas, source types, OA, source titles,
        affiliations, authors, keywords, funding, country collaboration.
"""
import json, time, requests, pandas as pd
from collections import Counter

API_KEY = "3404e1cf1a62e868767642793053f28d"
H       = {"X-ELS-APIKey": API_KEY, "Accept": "application/json"}
BASE    = "https://api.elsevier.com/content/search/scopus"
BATCH   = 100
YEARS   = list(range(2015, 2026))

# ── Load source IDs ───────────────────────────────────────────────────────────
with open(r"C:\WORK\scopusclaude\rawdata\discontinued_ids.json") as f:
    all_ids = json.load(f)
batches = [all_ids[i:i+BATCH] for i in range(0, len(all_ids), BATCH)]

def src_clause(batch):
    return "SOURCE-ID(" + " OR ".join(batch) + ")"

def count_query(query):
    """Return total result count for a query."""
    try:
        r = requests.get(BASE, headers=H,
                         params={"query": query, "count": 0, "field": "dc:identifier"},
                         timeout=30)
        return int(r.json().get("search-results", {}).get("opensearch:totalResults", 0))
    except Exception as e:
        print(f"  ERROR: {e}")
        return 0

def count_batched(extra_clause):
    """Sum counts across all source ID batches for a given extra clause."""
    total = 0
    for b in batches:
        q = f"AFFILCOUNTRY(Indonesia) AND {src_clause(b)} AND {extra_clause}"
        total += count_query(q)
        time.sleep(0.2)
    return total

def fetch_records(start, count=200, fields="affilname,authname,authkeywords,fund-sponsor,openaccess,subtype,subject-area,prism:publicationName,prism:aggregationType"):
    """Fetch a page of records."""
    q = "AFFILCOUNTRY(Indonesia) AND (" + " OR ".join(src_clause(b) for b in batches[:3]) + ")"
    # Use a simpler query with a broad date range for sampling
    q2 = "AFFILCOUNTRY(Indonesia) AND PUBYEAR > 2014 AND PUBYEAR < 2026 AND (" + \
         " OR ".join(f"SOURCE-ID({sid})" for sid in all_ids[:200]) + ")"
    try:
        r = requests.get(BASE, headers=H, params={
            "query": q2, "count": count, "start": start, "field": fields
        }, timeout=60)
        entries = r.json().get("search-results", {}).get("entry", [])
        return entries
    except Exception as e:
        print(f"  FETCH ERROR at start={start}: {e}")
        return []

out = {}

# ══════════════════════════════════════════════════════════════════════════════
# 1. DOCUMENT TYPES
# ══════════════════════════════════════════════════════════════════════════════
print("\n[1] Document Types")
doc_map = {
    "Article":              "DOCTYPE(ar)",
    "Conference Paper":     "DOCTYPE(cp)",
    "Review":               "DOCTYPE(re)",
    "Book Chapter":         "DOCTYPE(ch)",
    "Letter":               "DOCTYPE(le)",
    "Note":                 "DOCTYPE(no)",
    "Short Survey":         "DOCTYPE(sh)",
    "Editorial":            "DOCTYPE(ed)",
}
doc_counts = {}
for label, clause in doc_map.items():
    c = count_batched(clause)
    doc_counts[label] = c
    print(f"  {label}: {c}")
out["docTypes"] = doc_counts

# ══════════════════════════════════════════════════════════════════════════════
# 2. SOURCE TYPES
# ══════════════════════════════════════════════════════════════════════════════
print("\n[2] Source Types")
src_type_map = {
    "Journal":                  "SRCTYPE(j)",
    "Conference Proceedings":   "SRCTYPE(p)",
    "Book Series":              "SRCTYPE(b)",
    "Trade Publication":        "SRCTYPE(d)",
}
src_type_counts = {}
for label, clause in src_type_map.items():
    c = count_batched(clause)
    src_type_counts[label] = c
    print(f"  {label}: {c}")
out["sourceTypes"] = src_type_counts

# ══════════════════════════════════════════════════════════════════════════════
# 3. OPEN ACCESS
# ══════════════════════════════════════════════════════════════════════════════
print("\n[3] Open Access")
oa_count = count_batched("OPENACCESS(1)")
total    = sum([1740, 2978, 4960, 8396, 12018, 12127, 4651, 3221, 3635, 3452, 2077])
out["openAccess"] = {"oa": oa_count, "nonOa": total - oa_count, "total": total}
print(f"  OA: {oa_count}, Non-OA: {total - oa_count}")

# ══════════════════════════════════════════════════════════════════════════════
# 4. SUBJECT AREAS (ASJC top-level)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[4] Subject Areas")
# Use Excel-derived ASJC data weighted by top-source paper counts
xl = pd.read_excel(r"C:\WORK\scopusclaude\rawdata\ext_list_May_2026.xlsx",
                   sheet_name="Discontinued Titles May 2026", header=1, skiprows=[0])
xl.columns = ['source_id','title','issn','eissn','publisher','change',
               'final_coverage','year','volume','page_range']
xl['source_id'] = xl['source_id'].astype(str).str.strip().str.split('.').str[0]

# Load full source list for ASJC subject tags
src_df = pd.read_excel(r"C:\WORK\scopusclaude\rawdata\ext_list_May_2026.xlsx",
                       sheet_name="Scopus Sources May 2026")
src_df['Sourcerecord ID'] = src_df['Sourcerecord ID'].astype(str).str.strip().str.split('.').str[0]
disc_ids_set = set(xl['source_id'].tolist())
disc_src = src_df[src_df['Sourcerecord ID'].isin(disc_ids_set)]

subj_cols = {
    'Agricultural and Biological Sciences': '1100\nAgricultural and Biological Sciences',
    'Arts and Humanities':                  '1200\nArts and Humanities',
    'Biochemistry, Genetics & Molecular Bio': '1300\nBiochemistry, Genetics and Molecular Biology',
    'Business, Management & Accounting':    '1400\nBusiness, Management and Accounting',
    'Chemical Engineering':                 '1500\nChemical Engineering',
    'Chemistry':                            '1600\nChemistry',
    'Computer Science':                     '1700\nComputer Science',
    'Decision Sciences':                    '1800\nDecision Sciences',
    'Earth & Planetary Sciences':           '1900\nEarth and Planetary Sciences',
    'Economics, Econometrics & Finance':    '2000\nEconomics, Econometrics and Finance',
    'Energy':                               '2100\nEnergy',
    'Engineering':                          '2200\nEngineering',
    'Environmental Science':                '2300\nEnvironmental Science',
    'Immunology & Microbiology':            '2400\nImmunology and Microbiology',
    'Materials Science':                    '2500\nMaterials Science',
    'Mathematics':                          '2600\nMathematics',
    'Medicine':                             '2700\nMedicine',
    'Neuroscience':                         '2800\nNeuroscience',
    'Nursing':                              '2900\nNursing',
    'Pharmacology, Toxicology & Pharmaceutics': '3000\nPharmacology, Toxicology and Pharmaceutics',
    'Physics & Astronomy':                  '3100\nPhysics and Astronomy',
    'Psychology':                           '3200\nPsychology',
    'Social Sciences':                      '3300\nSocial Sciences',
    'Veterinary':                           '3400\nVeterinary',
    'Dentistry':                            '3500\nDentistry',
    'Health Professions':                   '3600\nHealth Professions',
}
subject_counts = {}
for label, col in subj_cols.items():
    if col in disc_src.columns:
        n = disc_src[col].notna().sum()
        subject_counts[label] = int(n)
out["subjectsByJournalCount"] = dict(sorted(subject_counts.items(), key=lambda x: -x[1]))
print(f"  Top subjects: {list(out['subjectsByJournalCount'].items())[:5]}")

# ══════════════════════════════════════════════════════════════════════════════
# 5. TOP SOURCE TITLES  (query top 80 individual journals)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[5] Top Source Titles")
# Get titles and types from the full source list
title_meta = src_df[src_df['Sourcerecord ID'].isin(disc_ids_set)][
    ['Sourcerecord ID','Source Title','Source Type','Publisher']
].drop_duplicates('Sourcerecord ID')
title_meta = title_meta.set_index('Sourcerecord ID')

top_sources = []
sample_ids = disc_src['Sourcerecord ID'].dropna().unique()[:100].tolist()

for sid in sample_ids:
    q = f"AFFILCOUNTRY(Indonesia) AND SOURCE-ID({sid})"
    c = count_query(q)
    if c > 0:
        meta = title_meta.loc[sid] if sid in title_meta.index else None
        top_sources.append({
            "id": sid,
            "title": meta['Source Title'] if meta is not None else sid,
            "type":  str(meta['Source Type']) if meta is not None else "Unknown",
            "publisher": str(meta['Publisher']) if meta is not None else "",
            "count": c
        })
    time.sleep(0.15)

top_sources.sort(key=lambda x: -x['count'])
out["topSources"] = top_sources[:30]
print(f"  Found {len(top_sources)} sources with Indonesian papers. Top: {top_sources[0]['title'] if top_sources else 'none'}")

# ══════════════════════════════════════════════════════════════════════════════
# 6. RECORD SAMPLING  (affiliations, authors, keywords, funding)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[6] Record Sampling (affiliations, authors, keywords, funding)")
affil_counter   = Counter()
author_counter  = Counter()
keyword_counter = Counter()
fund_counter    = Counter()
oa_type_counter = Counter()

FIELDS = "affilname,authname,authkeywords,fund-sponsor,openaccess,openaccess-type"
MAX_PAGES = 25  # 25 × 200 = 5000 records

for page in range(MAX_PAGES):
    start   = page * 200
    # Sample from first 400 IDs (most likely to have Indonesian papers)
    sid_sample = all_ids[:400]
    src_q   = "SOURCE-ID(" + " OR ".join(sid_sample[:100]) + ")"
    query   = f"AFFILCOUNTRY(Indonesia) AND {src_q} AND PUBYEAR > 2014 AND PUBYEAR < 2026"
    try:
        r = requests.get(BASE, headers=H, params={
            "query": query, "count": 200, "start": start, "field": FIELDS
        }, timeout=60)
        entries = r.json().get("search-results", {}).get("entry", [])
        if not entries:
            break
        for e in entries:
            # Affiliations
            affils = e.get("affilname", "")
            if isinstance(affils, list):
                for a in affils: affil_counter[str(a)] += 1
            elif affils:
                affil_counter[str(affils)] += 1

            # Authors
            authors = e.get("authname", "")
            if isinstance(authors, list):
                for a in authors: author_counter[str(a)] += 1
            elif authors:
                author_counter[str(authors)] += 1

            # Keywords
            kws = e.get("authkeywords", "")
            if kws:
                for kw in str(kws).split("|"):
                    kw = kw.strip().lower()
                    if kw and len(kw) > 2:
                        keyword_counter[kw] += 1

            # Funding
            funds = e.get("fund-sponsor", "")
            if isinstance(funds, list):
                for f in funds:
                    if f: fund_counter[str(f).strip()] += 1
            elif funds:
                fund_counter[str(funds).strip()] += 1

            # OA type
            oa = e.get("openaccess", "0")
            oa_type_counter["Open Access" if str(oa) == "1" else "Subscription"] += 1

        print(f"  Page {page+1}/{MAX_PAGES}: {len(entries)} records")
        time.sleep(0.3)
    except Exception as ex:
        print(f"  ERROR page {page+1}: {ex}")
        break

out["topAffiliations"] = [{"name": k, "count": v} for k, v in affil_counter.most_common(20)]
out["topAuthors"]      = [{"name": k, "count": v} for k, v in author_counter.most_common(20)]
out["topKeywords"]     = [{"word": k, "count": v} for k, v in keyword_counter.most_common(50)]
out["topFunding"]      = [{"name": k, "count": v} for k, v in fund_counter.most_common(20)]

print(f"  Top affil: {affil_counter.most_common(3)}")
print(f"  Top author: {author_counter.most_common(3)}")
print(f"  Top keyword: {keyword_counter.most_common(5)}")
print(f"  Top funder: {fund_counter.most_common(3)}")

# ══════════════════════════════════════════════════════════════════════════════
# 7. COUNTRY COLLABORATION
# ══════════════════════════════════════════════════════════════════════════════
print("\n[7] Country Collaboration")
collab_countries = [
    "United States", "Australia", "Japan", "Malaysia", "United Kingdom",
    "Germany", "Netherlands", "Saudi Arabia", "South Korea", "China",
    "India", "France", "Canada", "Singapore", "Thailand",
    "Taiwan", "Italy", "Brazil", "Pakistan", "Vietnam"
]
country_counts = {}
for country in collab_countries:
    q_parts = []
    for b in batches:
        q_parts.append(f"AFFILCOUNTRY(Indonesia) AND AFFILCOUNTRY({country}) AND {src_clause(b)}")
    total_c = 0
    for qp in q_parts:
        total_c += count_query(qp)
        time.sleep(0.15)
    country_counts[country] = total_c
    print(f"  {country}: {total_c}")
out["countryCollab"] = dict(sorted(country_counts.items(), key=lambda x: -x[1]))

# ══════════════════════════════════════════════════════════════════════════════
# 8. YEARLY DOC TYPE BREAKDOWN (for stacked chart)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[8] Yearly document type breakdown")
yearly_doc = {}
for doctype, label in [("ar","Article"),("cp","Conference Paper"),("re","Review")]:
    yearly_doc[label] = []
    for yr in YEARS:
        total = 0
        for b in batches:
            q = f"AFFILCOUNTRY(Indonesia) AND {src_clause(b)} AND DOCTYPE({doctype}) AND PUBYEAR = {yr}"
            total += count_query(q)
            time.sleep(0.15)
        yearly_doc[label].append(total)
        print(f"  {label} {yr}: {total}")
out["yearlyDocTypes"] = yearly_doc

# ══════════════════════════════════════════════════════════════════════════════
# 9. BENCHMARK COUNTRIES (if not already fetched)
# ══════════════════════════════════════════════════════════════════════════════
print("\n[9] Benchmark countries")
bench_countries = ["Malaysia","Thailand","India","Vietnam"]
bench = {}
for country in bench_countries:
    bench[country] = {}
    for yr in YEARS:
        total = 0
        for b in batches:
            q = f"AFFILCOUNTRY({country}) AND {src_clause(b)} AND PUBYEAR = {yr}"
            total += count_query(q)
            time.sleep(0.15)
        bench[country][str(yr)] = total
        print(f"  {country} {yr}: {total}")
out["benchmark"] = bench

# ══════════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════════
out_path = r"C:\WORK\scopusclaude\rawdata\all_data.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
print(f"\n✓ All data saved to {out_path}")
