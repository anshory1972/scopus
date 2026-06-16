// Mock data — will be replaced by live Scopus API responses

const MOCK = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],

  publications: [12340, 15820, 19450, 24130, 30280, 37560, 44820, 52380, 61240, 71890, 80920],

  citations: [48000, 65000, 88000, 122000, 178000, 248000, 318000, 402000, 498000, 612000, 762560],

  growthRate: [null, 28.2, 22.9, 24.1, 25.5, 24.0, 19.3, 16.9, 16.9, 17.4, 12.6],

  docTypes: {
    labels: ['Journal Article', 'Conference Paper', 'Review', 'Book Chapter', 'Letter', 'Note', 'Erratum'],
    values: [58.2, 28.4, 7.1, 3.6, 1.4, 0.8, 0.5]
  },

  subjects: [
    { name: 'Engineering',                 pubs: 58420 },
    { name: 'Computer Science',            pubs: 47810 },
    { name: 'Mathematics',                 pubs: 29340 },
    { name: 'Agricultural & Bio. Sciences',pubs: 26750 },
    { name: 'Physics & Astronomy',         pubs: 22180 },
    { name: 'Chemistry',                   pubs: 21430 },
    { name: 'Medicine',                    pubs: 20340 },
    { name: 'Environmental Science',       pubs: 18920 },
    { name: 'Social Sciences',             pubs: 17650 },
    { name: 'Materials Science',           pubs: 16280 },
    { name: 'Economics',                   pubs: 14230 },
    { name: 'Biochemistry',                pubs: 12540 },
    { name: 'Energy',                      pubs: 11870 },
    { name: 'Earth & Planetary Sciences',  pubs: 10420 },
    { name: 'Business Management',         pubs: 9840  },
  ],

  institutions: [
    { name: 'Universitas Indonesia',                   city: 'Jakarta',    pubs: 18420, cites: 128340, hindex: 62, spark: [60,65,72,78,84,90,95] },
    { name: 'Institut Teknologi Bandung',              city: 'Bandung',    pubs: 17840, cites: 115820, hindex: 58, spark: [55,60,65,72,78,86,93] },
    { name: 'Universitas Gadjah Mada',                 city: 'Yogyakarta', pubs: 16950, cites: 108620, hindex: 55, spark: [52,58,63,70,76,84,90] },
    { name: 'Institut Pertanian Bogor',                city: 'Bogor',      pubs: 14380, cites: 92140,  hindex: 50, spark: [48,53,58,65,70,78,86] },
    { name: 'Universitas Airlangga',                   city: 'Surabaya',   pubs: 13240, cites: 84560,  hindex: 47, spark: [44,49,55,62,67,74,82] },
    { name: 'Institut Teknologi Sepuluh Nopember',     city: 'Surabaya',   pubs: 12810, cites: 79820,  hindex: 45, spark: [42,47,52,59,65,72,80] },
    { name: 'Universitas Brawijaya',                   city: 'Malang',     pubs: 11640, cites: 68340,  hindex: 42, spark: [39,44,49,56,62,69,76] },
    { name: 'Universitas Diponegoro',                  city: 'Semarang',   pubs: 10920, cites: 62180,  hindex: 40, spark: [37,42,47,53,59,66,74] },
    { name: 'Universitas Padjadjaran',                 city: 'Bandung',    pubs: 10280, cites: 58420,  hindex: 38, spark: [35,40,45,51,57,64,72] },
    { name: 'Badan Riset dan Inovasi Nasional',        city: 'Jakarta',    pubs: 9840,  cites: 55680,  hindex: 37, spark: [33,38,43,49,55,62,70] },
    { name: 'Universitas Hasanuddin',                  city: 'Makassar',   pubs: 8920,  cites: 48340,  hindex: 34, spark: [30,35,40,46,52,58,66] },
    { name: 'Universitas Sebelas Maret',               city: 'Surakarta',  pubs: 8640,  cites: 45820,  hindex: 33, spark: [28,33,38,44,50,57,64] },
    { name: 'Universitas Andalas',                     city: 'Padang',     pubs: 7840,  cites: 40120,  hindex: 31, spark: [26,31,36,42,48,54,62] },
    { name: 'Universitas Udayana',                     city: 'Bali',       pubs: 7420,  cites: 37560,  hindex: 30, spark: [24,29,34,40,46,52,60] },
    { name: 'Universitas Sumatera Utara',              city: 'Medan',      pubs: 6980,  cites: 34820,  hindex: 29, spark: [22,27,32,38,44,50,58] },
    { name: 'Universitas Lampung',                     city: 'Bandar Lampung', pubs: 5840, cites: 28340, hindex: 26, spark: [20,24,29,34,40,46,54] },
    { name: 'Universitas Jember',                      city: 'Jember',     pubs: 5620,  cites: 26180,  hindex: 25, spark: [18,22,27,32,38,44,52] },
    { name: 'Universitas Sam Ratulangi',               city: 'Manado',     pubs: 4980,  cites: 22840,  hindex: 23, spark: [16,20,25,30,36,42,50] },
    { name: 'Universitas Mulawarman',                  city: 'Samarinda',  pubs: 4640,  cites: 20560,  hindex: 22, spark: [14,18,23,28,34,40,48] },
    { name: 'Universitas Syiah Kuala',                 city: 'Banda Aceh', pubs: 4280,  cites: 18340,  hindex: 21, spark: [12,16,21,26,32,38,46] },
  ],

  authors: [
    { name: 'Wibowo, A.',       affil: 'Universitas Indonesia',          docs: 284, cites: 4820, hindex: 28, subject: 'Engineering' },
    { name: 'Santoso, B.',      affil: 'Institut Teknologi Bandung',     docs: 261, cites: 4340, hindex: 26, subject: 'Physics' },
    { name: 'Rahayu, S.',       affil: 'Universitas Gadjah Mada',        docs: 248, cites: 4120, hindex: 25, subject: 'Agriculture' },
    { name: 'Prasetyo, D.',     affil: 'Institut Pertanian Bogor',       docs: 236, cites: 3980, hindex: 24, subject: 'Biology' },
    { name: 'Kurniawan, R.',    affil: 'Universitas Airlangga',          docs: 224, cites: 3740, hindex: 23, subject: 'Medicine' },
    { name: 'Hidayat, M.',      affil: 'ITB',                            docs: 218, cites: 3620, hindex: 22, subject: 'Computer Science' },
    { name: 'Nugroho, E.',      affil: 'Universitas Diponegoro',         docs: 207, cites: 3480, hindex: 21, subject: 'Chemistry' },
    { name: 'Sari, F.',         affil: 'Universitas Brawijaya',          docs: 198, cites: 3280, hindex: 20, subject: 'Environmental Sci.' },
    { name: 'Firmansyah, H.',   affil: 'ITS Surabaya',                   docs: 189, cites: 3120, hindex: 20, subject: 'Engineering' },
    { name: 'Lestari, N.',      affil: 'Universitas Padjadjaran',        docs: 182, cites: 2980, hindex: 19, subject: 'Biochemistry' },
    { name: 'Putra, K.',        affil: 'BRIN',                           docs: 174, cites: 2840, hindex: 19, subject: 'Materials Science' },
    { name: 'Handayani, T.',    affil: 'Universitas Indonesia',          docs: 168, cites: 2720, hindex: 18, subject: 'Social Sciences' },
    { name: 'Gunawan, P.',      affil: 'Universitas Hasanuddin',         docs: 162, cites: 2580, hindex: 18, subject: 'Agriculture' },
    { name: 'Susanto, Y.',      affil: 'Universitas Sebelas Maret',      docs: 156, cites: 2440, hindex: 17, subject: 'Economics' },
    { name: 'Wijaya, C.',       affil: 'Universitas Andalas',            docs: 149, cites: 2320, hindex: 17, subject: 'Engineering' },
  ],

  journals: [
    { name: 'Heliyon',                                          publisher: 'Elsevier',        papers: 4820, citeScore: 4.0, sjr: 0.64, quartile: 'Q2' },
    { name: 'PLOS ONE',                                         publisher: 'PLOS',            papers: 4240, citeScore: 6.2, sjr: 0.99, quartile: 'Q1' },
    { name: 'IOP Conference Series: Earth and Env. Science',    publisher: 'IOP Publishing',  papers: 3980, citeScore: 1.4, sjr: 0.23, quartile: 'Q3' },
    { name: 'Journal of Physics: Conference Series',            publisher: 'IOP Publishing',  papers: 3620, citeScore: 1.2, sjr: 0.20, quartile: 'Q3' },
    { name: 'Indonesian Journal of Chemistry',                  publisher: 'UGM',             papers: 2840, citeScore: 3.8, sjr: 0.48, quartile: 'Q2' },
    { name: 'Biodiversitas',                                    publisher: 'UNS',             papers: 2480, citeScore: 2.1, sjr: 0.32, quartile: 'Q2' },
    { name: 'Journal of Cleaner Production',                    publisher: 'Elsevier',        papers: 2240, citeScore: 19.1, sjr: 2.04, quartile: 'Q1' },
    { name: 'Sustainability',                                   publisher: 'MDPI',            papers: 2180, citeScore: 7.6, sjr: 0.84, quartile: 'Q1' },
    { name: 'Agricultural Water Management',                    publisher: 'Elsevier',        papers: 1920, citeScore: 10.4, sjr: 1.48, quartile: 'Q1' },
    { name: 'Energy',                                           publisher: 'Elsevier',        papers: 1840, citeScore: 14.8, sjr: 1.72, quartile: 'Q1' },
    { name: 'Computers & Education',                            publisher: 'Elsevier',        papers: 1680, citeScore: 20.3, sjr: 2.21, quartile: 'Q1' },
    { name: 'Jurnal Teknologi dan Sistem Komputer',             publisher: 'UNDIP',           papers: 1540, citeScore: 1.6, sjr: 0.25, quartile: 'Q3' },
    { name: 'Remote Sensing',                                   publisher: 'MDPI',            papers: 1480, citeScore: 8.9, sjr: 1.11, quartile: 'Q1' },
    { name: 'Food Chemistry',                                   publisher: 'Elsevier',        papers: 1420, citeScore: 13.6, sjr: 1.58, quartile: 'Q1' },
    { name: 'International Journal of Engineering & Technology',publisher: 'SPC',             papers: 1280, citeScore: 2.4, sjr: 0.28, quartile: 'Q3' },
  ],

  openAccess: { oa: 54, subscription: 46 },

  collab: {
    labels: ['Domestic Only', 'International (1 partner)', 'International (2+)'],
    values: [48, 32, 20]
  }
};

// ── LIVE DATA: Papers in discontinued journals by Indonesian authors ──────────
// Source: Scopus Search API, queried June 2026 against 1,142 discontinued
// journal source IDs (Scopus discontinued list May 2026).
const DISCONTINUED = {
  years:  [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  counts: [1740, 2978, 4960, 8396, 12018, 12127, 4651, 3221, 3635, 3452, 2077],
  // Total Indonesian output per year (mock — replace with live API when available)
  totalOutput: [19450, 24130, 30280, 37560, 44820, 52380, 61240, 71890, 80920, 91200, 62000]
};
