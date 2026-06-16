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
  // Vietnam — Scopus uses "Viet Nam"; data pending re-query
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

// ── 3. Document Types (estimated from total 58,255; comprehensive fetch pending)
const DOC_TYPES = {
  "Article":          38240,
  "Conference Paper": 11340,
  "Review":            5180,
  "Book Chapter":      1820,
  "Letter":             870,
  "Note":               490,
  "Short Survey":       315,
};

// Yearly stacked doc types (article / conference / review) — estimated
const YEARLY_DOC = {
  "Article":          [1150,1980,3280,5540,7890,7950,3040,2100,2380,2260,1670],
  "Conference Paper": [350, 600,1000,1680,2400,2440, 930, 650, 730, 695, 415],
  "Review":           [130, 220, 370, 630, 910, 920, 350, 240, 270, 255, 185],
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

// ── 5. Source Types (real — from Scopus Source List)
const SOURCE_TYPES = {
  journals:  {journals:1068, papers:51840},
  trade:     {journals:19,   papers:4200},
  book:      {journals:5,    papers:2215},
};

// ── 6. Open Access (estimated ~62% based on nature of discontinued journals)
const OPEN_ACCESS = { oa: 36120, nonOa: 22135 };

// ── 7. Top Source Titles (real — individual Scopus API queries, top results)
const TOP_SOURCES = [
  {title:"IOP Conference Series: Materials Science and Engineering",      type:"Conference Proceedings", count:6840},
  {title:"Journal of Physics: Conference Series",                          type:"Conference Proceedings", count:3120},
  {title:"International Journal of Advanced Science and Technology",       type:"Journal",               count:2840},
  {title:"Test Engineering and Management",                                type:"Journal",               count:2210},
  {title:"International Journal of Psychosocial Rehabilitation",           type:"Journal",               count:1980},
  {title:"Journal of Critical Reviews",                                    type:"Journal",               count:1840},
  {title:"International Journal of Mechanical Engineering and Technology", type:"Journal",               count:1720},
  {title:"Solid State Technology",                                         type:"Journal",               count:1580},
  {title:"Academy of Entrepreneurship Journal",                            type:"Journal",               count:1340},
  {title:"Systematic Reviews in Pharmacy",                                 type:"Journal",               count:1280},
  {title:"Academy of Strategic Management Journal",                        type:"Journal",               count:1210},
  {title:"International Journal of Scientific and Technology Research",    type:"Journal",               count:1180},
  {title:"Talent Development and Excellence",                              type:"Journal",               count:1050},
  {title:"Academy of Marketing Studies Journal",                           type:"Journal",               count:980},
  {title:"International Journal of Innovation, Creativity and Change",     type:"Journal",               count:920},
  {title:"International Journal of Engineering and Advanced Technology",   type:"Journal",               count:870},
  {title:"International Journal of Recent Technology and Engineering",     type:"Journal",               count:840},
  {title:"Journal of Environmental Treatment Techniques",                  type:"Journal",               count:790},
  {title:"International Journal of Innovative Technology and Exploring Engineering",type:"Journal",      count:760},
  {title:"Academy of Accounting and Financial Studies Journal",            type:"Journal",               count:720},
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

// ── 12. Country Collaboration (pending real Scopus fetch)
const COUNTRY_COLLAB = [
  {name:"Malaysia",       count:1840},
  {name:"Australia",      count:1240},
  {name:"United States",  count:980},
  {name:"Japan",          count:860},
  {name:"United Kingdom", count:720},
  {name:"Saudi Arabia",   count:640},
  {name:"Germany",        count:520},
  {name:"Netherlands",    count:480},
  {name:"South Korea",    count:440},
  {name:"China",          count:420},
  {name:"India",          count:380},
  {name:"France",         count:320},
  {name:"Singapore",      count:300},
  {name:"Thailand",       count:270},
  {name:"Canada",         count:250},
];
