# Indonesia Academic Publication Analytics

A data analytics dashboard for Indonesia's academic publications sourced from the **Scopus** database (Elsevier).

## Features

- Publication volume trends (2014–2024)
- Top institutions by output and citations
- Subject area distribution (ASJC classification)
- Top authors ranked by publications and h-index
- Journal analytics with CiteScore and SJR
- Open access vs subscription breakdown
- International collaboration metrics

## Getting Started

### 1. Get a Scopus API Key

1. Go to [dev.elsevier.com](https://dev.elsevier.com)
2. Register/log in and create a new application
3. Request access to the **Scopus Search API**
4. Copy your API key

### 2. Run the mockup (no API key needed)

Open `index.html` directly in a browser — the mockup uses realistic placeholder data.

### 3. Configure the API key

Click **🔑 API Config** in the top-right corner and paste your Scopus API key.

> **Note:** Scopus API requires either an institutional IP address or an institutional token for full access. If you are on a university network, the API key alone is sufficient.

## Project Structure

```
scopusclaude/
├── index.html          # Single-page dashboard
├── css/
│   └── style.css       # Layout and component styles
├── js/
│   ├── data.js         # Mock data (replace with API calls)
│   └── main.js         # Chart.js visualizations + interactions
└── data/               # Cache directory for API responses (future)
```

## Scopus API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| Search publications | `https://api.elsevier.com/content/search/scopus` |
| Author search | `https://api.elsevier.com/content/search/author` |
| Affiliation search | `https://api.elsevier.com/content/search/affiliation` |
| Abstract retrieval | `https://api.elsevier.com/content/abstract/eid/{eid}` |

### Example query — Indonesia publications in 2024

```
GET https://api.elsevier.com/content/search/scopus
    ?query=AFFILCOUNTRY(Indonesia)&date=2024
    &apiKey=YOUR_API_KEY
```

## Roadmap

- [ ] Backend fetch script (Python) to pull Scopus data
- [ ] Data caching layer (JSON files in `/data`)
- [ ] Live chart updates from cached data
- [ ] Province-level geographic breakdown
- [ ] SDG (Sustainable Development Goal) mapping
- [ ] Export to CSV / PDF

## License

MIT
