Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#64748b';

const YEARS  = INDO.years;
const COLORS = {
  Indonesia: '#e11d48',
  Malaysia:  '#2563eb',
  Thailand:  '#7c3aed',
  India:     '#059669',
  Vietnam:   '#d97706',
};

// ── Build country legend ──────────────────────────────────────────────────────
const legendEl = document.getElementById('bench-legend');
Object.entries(COLORS).forEach(([name, color]) => {
  const isIndo = name === 'Indonesia';
  legendEl.innerHTML += `
    <div class="cl-item">
      <div class="cl-line ${isIndo ? 'thick' : ''}" style="background:${color}"></div>
      <span style="color:${isIndo ? color : '#475569'};${isIndo ? 'font-weight:800' : ''}">${name}</span>
    </div>`;
});

// ── 1. Country Benchmark Line Chart ──────────────────────────────────────────
const benchDatasets = [
  {
    label: 'Indonesia',
    data: INDO.counts,
    borderColor: COLORS.Indonesia,
    borderWidth: 3.5,
    pointRadius: 5,
    pointBackgroundColor: COLORS.Indonesia,
    tension: 0.4,
    z: 10,
  },
  ...Object.entries(BENCHMARK).map(([name, d]) => ({
    label: name,
    data: d.counts,
    borderColor: COLORS[name],
    borderWidth: 1.5,
    pointRadius: 3,
    pointBackgroundColor: COLORS[name],
    borderDash: [5, 3],
    tension: 0.4,
  }))
];

new Chart(document.getElementById('benchChart'), {
  type: 'line',
  data: { labels: YEARS, datasets: benchDatasets },
  options: {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} papers`
        }
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { callback: v => v >= 1000 ? (v/1000)+'k' : v }
      }
    }
  }
});

// ── 2. Indonesia Annual Bar Chart ─────────────────────────────────────────────
const peakVal   = Math.max(...INDO.counts);
const barColors = INDO.counts.map(v =>
  v === peakVal    ? '#e11d48' :
  YEARS[INDO.counts.indexOf(v)] >= 2021 ? '#cbd5e1' : '#fda4af'
);
// fix: colour by index not value (handles duplicate values safely)
const barColorsByIdx = INDO.counts.map((v, i) =>
  v === peakVal    ? '#e11d48' :
  YEARS[i] >= 2021 ? '#cbd5e1' : '#fda4af'
);

new Chart(document.getElementById('indoBar'), {
  type: 'bar',
  data: {
    labels: YEARS,
    datasets: [{
      data: INDO.counts,
      backgroundColor: barColorsByIdx,
      borderRadius: 6,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y.toLocaleString()} papers` } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => v >= 1000 ? (v/1000)+'k' : v } }
    }
  }
});

// ── 3. YoY Change Bar ────────────────────────────────────────────────────────
const yoy = INDO.counts.map((v, i) =>
  i === 0 ? null : parseFloat(((v - INDO.counts[i-1]) / INDO.counts[i-1] * 100).toFixed(1))
);

new Chart(document.getElementById('yoyChart'), {
  type: 'bar',
  data: {
    labels: YEARS,
    datasets: [{
      data: yoy,
      backgroundColor: yoy.map(v => v === null ? 'transparent' : v >= 0 ? '#3b82f6' : '#e11d48'),
      borderRadius: 5,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.parsed.y != null ? ` ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}%` : '' } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' } }
    }
  }
});

// ── 4. Share of Output Line Chart ────────────────────────────────────────────
// Approximate total Scopus output per country per year
const totalOutputs = {
  Indonesia: INDO.totalOutput,
  Malaysia:  [24800, 29600, 34200, 39800, 46000, 50200, 54800, 60100, 66400, 72000, 50000],
  Thailand:  [18200, 21400, 24800, 28600, 32400, 35200, 38600, 42400, 46800, 51200, 36000],
  India:     [135000,158000,182000,208000,236000,258000,282000,308000,336000,364000,250000],
  Vietnam:   [8400,  11200, 14600, 18800, 23400, 27200, 30800, 34600, 38400, 42000, 29000],
};
const allCounts = { Indonesia: INDO.counts, ...Object.fromEntries(Object.entries(BENCHMARK).map(([k,v])=>[k,v.counts])) };

const shareDatasets = Object.entries(COLORS).map(([name, color]) => {
  const isIndo = name === 'Indonesia';
  const shares = YEARS.map((_, i) =>
    parseFloat((allCounts[name][i] / totalOutputs[name][i] * 100).toFixed(1))
  );
  return {
    label: name,
    data: shares,
    borderColor: color,
    borderWidth: isIndo ? 3.5 : 1.5,
    pointRadius: isIndo ? 5 : 3,
    pointBackgroundColor: color,
    borderDash: isIndo ? [] : [5, 3],
    tension: 0.4,
  };
});

new Chart(document.getElementById('shareChart'), {
  type: 'line',
  data: { labels: YEARS, datasets: shareDatasets },
  options: {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 20, padding: 14, font: { size: 11 } }
      },
      tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` } }
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { callback: v => v + '%' }
      }
    }
  }
});
