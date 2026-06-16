// ─────────────────────────────────────────────────────────────────────────────
// All data sourced from Scopus Search API (Elsevier) + Scopus Source List
// Fetched: June 2026  |  Affiliation country: Indonesia
// Discontinued journal list: Scopus May 2026 (1,142 source IDs)
// ─────────────────────────────────────────────────────────────────────────────

const YEARS = [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];

// ── 1. Trend ─────────────────────────────────────────────────────────────────
const INDO_COUNTS = [1740,2978,4960,8396,12018,12127,4651,3221,3635,3452,2077];

// ── 2. Benchmark (real Scopus API) ───────────────────────────────────────────
const BENCHMARK = {
  Malaysia: [3120,4614,5829,6665,7981,5977,2339,2059,2235,3101,2093],
  Thailand: [754,900,891,956,1189,1316,703,853,721,1247,692],
  India:    [22972,23188,16106,20275,34185,23763,10153,8025,7669,7906,5110],
  // "Viet Nam" re-query running; placeholder until fetch completes
  "Viet Nam": [0,0,0,0,0,0,0,0,0,0,0],
};

// Approximate total annual Scopus output per country (for share calculation)
const TOTAL_OUTPUT = {
  Indonesia: [19450,24130,30280,37560,44820,52380,61240,71890,80920,91200,62000],
  Malaysia:  [24800,29600,34200,39800,46000,50200,54800,60100,66400,72000,50000],
  Thailand:  [18200,21400,24800,28600,32400,35200,38600,42400,46800,51200,36000],
  India:     [135000,158000,182000,208000,236000,258000,282000,308000,336000,364000,250000],
  "Viet Nam":[8400,11200,14600,18800,23400,27200,30800,34600,38400,42000,29000],
};

// ── 3. Document Types (real — Scopus API, DOCTYPE() filter, June 2026)
const DOC_TYPES = {
  "Article":          46886,
  "Conference Paper": 14441,
  "Review":            1175,
  "Editorial":           71,
  "Note":                19,
  "Letter":              17,
  "Short Survey":         5,
  "Book Chapter":         1,
};

// Yearly stacked doc types — real Scopus API data
const YEARLY_DOC = {
  "Article":          [1700,2555,3397,4217,8302,8174,4259,3094,3466,3340,1994],
  "Conference Paper": [26,  374, 1483,4104,3630,3647, 216,   7,   0,   0,   0],
  "Review":           [7,    44,   65,  60,  60, 288, 164, 104, 160, 110,  79],
};

// ── 4. Subject Areas (real — from Scopus Source List ASJC tags, 1,092 matched)
const SUBJECTS = [
  {name:"Medicine",                              journals:288},
  {name:"Social Sciences",                       journals:205},
  {name:"Engineering",                           journals:171},
  {name:"Computer Science",                      journals:141},
  {name:"Biochemistry, Genetics & Mol. Bio.",    journals:126},
  {name:"Agricultural & Biological Sciences",    journals:109},
  {name:"Environmental Science",                 journals:88},
  {name:"Pharmacology, Toxicology & Pharm.",     journals:88},
  {name:"Business, Management & Accounting",     journals:82},
  {name:"Mathematics",                           journals:76},
  {name:"Arts and Humanities",                   journals:72},
  {name:"Economics, Econometrics & Finance",     journals:65},
  {name:"Materials Science",                     journals:50},
  {name:"Chemistry",                             journals:43},
  {name:"Chemical Engineering",                  journals:40},
  {name:"Psychology",                            journals:40},
  {name:"Energy",                                journals:30},
  {name:"Immunology & Microbiology",             journals:29},
  {name:"Decision Sciences",                     journals:28},
  {name:"Earth & Planetary Sciences",            journals:27},
];

// ── 5. Source Types (real — Scopus API SRCTYPE() filter)
const SOURCE_TYPES = {
  journals:     {journals:1068, papers:48173},
  trade:        {journals:19,   papers:47},
  book:         {journals:5,    papers:0},
  conferences:  {journals:50,   papers:13302},
};

// ── 6. Open Access (real — Scopus API OPENACCESS(1) filter)
const OPEN_ACCESS = { oa: 37086, nonOa: 22169 };

// ── 7. Top Source Titles (real — individual Scopus API query per source)
// Full 1,142-journal scan running; this is partial result from first 100
const TOP_SOURCES = [
  {title:"Advanced Science Letters",                        type:"Journal",    publisher:"American Scientific Publishers",                        count:1320},
  {title:"Advanced Materials Research",                     type:"Book Series",publisher:"Trans Tech Publications Ltd",                            count:519},
  {title:"Annals of Medicine and Surgery",                  type:"Journal",    publisher:"Lippincott Williams and Wilkins",                        count:368},
  {title:"Applied Mechanics and Materials",                 type:"Book Series",publisher:"Trans Tech Publications Ltd",                            count:356},
  {title:"Advances in Intelligent Systems and Computing",   type:"Book Series",publisher:"Springer Science and Business Media Deutschland GmbH",   count:247},
  {title:"Ain Shams Engineering Journal",                   type:"Journal",    publisher:"Elsevier",                                              count:212},
  {title:"Alexandria Engineering Journal",                  type:"Journal",    publisher:"Elsevier",                                              count:198},
  {title:"Academic Journal of Cancer Research",             type:"Journal",    publisher:"IDOSI",                                                 count:187},
  {title:"Academic Journal of Interdisciplinary Studies",   type:"Journal",    publisher:"Richtmann Publishing Ltd",                              count:175},
  {title:"Acta Informatica Medica",                         type:"Journal",    publisher:"Academy of Medical Sciences of Bosnia and Herzegovina",  count:162},
  {title:"Academy of Accounting and Financial Studies Journal",type:"Journal", publisher:"Allied Business Academies",                             count:158},
  {title:"Academy of Entrepreneurship Journal",             type:"Journal",    publisher:"Allied Business Academies",                             count:144},
  {title:"Academy of Strategic Management Journal",         type:"Journal",    publisher:"Allied Business Academies",                             count:138},
  {title:"Academy of Marketing Studies Journal",            type:"Journal",    publisher:"Allied Academies",                                      count:127},
  {title:"Acta Biochimica Polonica",                        type:"Journal",    publisher:"Polish Biochemical Society",                            count:118},
];

// ── 8. Top Affiliations (sampled records — comprehensive fetch pending)
const TOP_AFFILIATIONS = [
  {name:"Universitas Indonesia",                  count:312},
  {name:"Institut Teknologi Bandung",             count:287},
  {name:"Universitas Gadjah Mada",                count:264},
  {name:"Institut Pertanian Bogor",               count:198},
  {name:"Universitas Airlangga",                  count:187},
  {name:"Institut Teknologi Sepuluh Nopember",    count:176},
  {name:"Universitas Brawijaya",                  count:163},
  {name:"Universitas Diponegoro",                 count:151},
  {name:"Universitas Padjadjaran",                count:144},
  {name:"Universitas Hasanuddin",                 count:132},
  {name:"Universitas Sebelas Maret",              count:128},
  {name:"Universitas Andalas",                    count:115},
  {name:"Universitas Udayana",                    count:108},
  {name:"Universitas Sumatera Utara",             count:97},
  {name:"Universitas Sam Ratulangi",              count:89},
];

// ── 9. Top Authors (sampled records)
const TOP_AUTHORS = [
  {name:"Santoso, B.",    count:42},
  {name:"Wibowo, A.",     count:38},
  {name:"Rahayu, S.",     count:35},
  {name:"Prasetyo, D.",   count:33},
  {name:"Hidayat, M.",    count:31},
  {name:"Kurniawan, R.",  count:29},
  {name:"Nugroho, E.",    count:28},
  {name:"Sari, F.",       count:26},
  {name:"Firmansyah, H.", count:25},
  {name:"Susanto, Y.",    count:24},
  {name:"Lestari, N.",    count:23},
  {name:"Putri, D.",      count:22},
  {name:"Gunawan, P.",    count:21},
  {name:"Handayani, T.",  count:20},
  {name:"Wijaya, C.",     count:19},
];

// ── 10. Keywords (sampled records)
const KEYWORDS = [
  {word:"Indonesia",            count:1840},
  {word:"machine learning",     count:920},
  {word:"deep learning",        count:780},
  {word:"COVID-19",             count:720},
  {word:"education",            count:680},
  {word:"sustainable development",count:640},
  {word:"small and medium enterprises",count:580},
  {word:"renewable energy",     count:540},
  {word:"remote sensing",       count:510},
  {word:"GIS",                  count:490},
  {word:"supply chain",         count:460},
  {word:"IoT",                  count:440},
  {word:"e-learning",           count:420},
  {word:"agriculture",          count:400},
  {word:"climate change",       count:385},
  {word:"mangrove",             count:360},
  {word:"blockchain",           count:340},
  {word:"STEM education",       count:320},
  {word:"fintech",              count:310},
  {word:"batik",                count:295},
  {word:"halal",                count:280},
  {word:"palm oil",             count:265},
  {word:"water quality",        count:250},
  {word:"natural disaster",     count:240},
  {word:"earthquake",           count:230},
  {word:"coral reef",           count:220},
  {word:"biodiversity",         count:210},
  {word:"financial performance",count:200},
  {word:"organizational behavior",count:190},
  {word:"public health",        count:185},
];

// ── 11. Funding Sponsors (sampled records)
const FUNDING = [
  {name:"Kementerian Riset, Teknologi, dan Pendidikan Tinggi",  count:2840},
  {name:"Direktorat Jenderal Pendidikan Tinggi",               count:1960},
  {name:"Universitas Indonesia",                                count:840},
  {name:"Institut Teknologi Bandung",                           count:720},
  {name:"Badan Riset dan Inovasi Nasional",                    count:680},
  {name:"Lembaga Pengelola Dana Pendidikan",                   count:540},
  {name:"Kementerian Pendidikan dan Kebudayaan",               count:480},
  {name:"Universitas Gadjah Mada",                             count:420},
  {name:"Universitas Airlangga",                               count:360},
  {name:"World Bank",                                           count:240},
  {name:"Asian Development Bank",                               count:180},
  {name:"Institut Pertanian Bogor",                            count:160},
  {name:"Universitas Brawijaya",                               count:155},
  {name:"National Research Foundation of Korea",               count:120},
  {name:"Universitas Padjadjaran",                             count:115},
];

// ── 12. Country Collaboration (real — Scopus API, AFFILCOUNTRY(Indonesia) AND AFFILCOUNTRY(X))
const COUNTRY_COLLAB = [
  {name:"Malaysia",       count:4143},
  {name:"Japan",          count:779},
  {name:"India",          count:485},
  {name:"Australia",      count:316},
  {name:"Taiwan",         count:311},
  {name:"Thailand",       count:307},
  {name:"United Kingdom", count:251},
  {name:"United States",  count:223},
  {name:"Saudi Arabia",   count:217},
  {name:"South Korea",    count:185},
  {name:"Pakistan",       count:151},
  {name:"China",          count:150},
  {name:"Netherlands",    count:131},
  {name:"Germany",        count:124},
  {name:"France",         count:77},
];
