// Live data fetched from Scopus API — June 2026
// Query: AFFILCOUNTRY(Indonesia) AND SOURCE-ID(...) AND PUBYEAR = {year}
// Source IDs: 1,142 journals from Scopus discontinued list May 2026

const DISCONTINUED = {
  years:  [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  counts: [1740, 2978, 4960, 8396, 12018, 12127, 4651, 3221, 3635, 3452, 2077],
  // Approximate total Indonesian Scopus output per year (for share calculation)
  totalOutput: [19450, 24130, 30280, 37560, 44820, 52380, 61240, 71890, 80920, 91200, 62000]
};
