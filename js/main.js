Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#64748b';

const { years, counts, totalOutput } = DISCONTINUED;

// Bar colours: blue = growth, red = peak, gray = post-discontinuation
const barColors = counts.map((v, i) => {
  if (v === Math.max(...counts)) return '#dc2626';
  if (years[i] >= 2021)         return '#94a3b8';
  return '#3b82f6';
});

// ── Main bar chart ────────────────────────────────────────────────────────────
new Chart(document.getElementById('mainChart'), {
  type: 'bar',
  data: {
    labels: years,
    datasets: [{
      data: counts,
      backgroundColor: barColors,
      borderRadius: 7,
      borderSkipped: false,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: ctx => `Year: ${ctx[0].label}`,
          label: ctx => ` ${ctx.parsed.y.toLocaleString()} papers`,
          afterLabel: ctx => {
            const i = ctx.dataIndex;
            if (i === 0) return '';
            const chg = Math.round((counts[i] - counts[i-1]) / counts[i-1] * 100);
            return ` YoY: ${chg > 0 ? '+' : ''}${chg}%`;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 13, weight: '600' } } },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { callback: v => v.toLocaleString() }
      }
    }
  }
});

// ── YoY change chart ──────────────────────────────────────────────────────────
const yoy = counts.map((v, i) =>
  i === 0 ? null : parseFloat(((v - counts[i-1]) / counts[i-1] * 100).toFixed(1))
);

new Chart(document.getElementById('yoyChart'), {
  type: 'bar',
  data: {
    labels: years,
    datasets: [{
      data: yoy,
      backgroundColor: yoy.map(v => v === null ? 'transparent' : v >= 0 ? '#3b82f6' : '#ef4444'),
      borderRadius: 5,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.parsed.y != null ? ` ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}%` : '' } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' } }
    }
  }
});

// ── Share of total output ─────────────────────────────────────────────────────
const share = counts.map((v, i) => parseFloat((v / totalOutput[i] * 100).toFixed(1)));

new Chart(document.getElementById('shareChart'), {
  type: 'line',
  data: {
    labels: years,
    datasets: [{
      data: share,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 5,
      pointBackgroundColor: share.map(v => v === Math.max(...share) ? '#dc2626' : '#7c3aed'),
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}% of total output` } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' }, min: 0 }
    }
  }
});
