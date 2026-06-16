// ── Navigation ──────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = link.dataset.section;
    document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    link.classList.add('active');
    document.getElementById(target).classList.add('active');
    if (window.innerWidth < 640) document.getElementById('sidebar').classList.remove('open');
  });
});

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── KPI Formatting ───────────────────────────────────────────────────────────
function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}

document.getElementById('kpi-total').textContent       = fmt(MOCK.publications.reduce((a,b)=>a+b,0));
document.getElementById('kpi-citations').textContent   = fmt(MOCK.citations[MOCK.citations.length-1]);
document.getElementById('kpi-institutions').textContent= '423';
document.getElementById('kpi-authors').textContent     = '98K';

// ── Colour palette ───────────────────────────────────────────────────────────
const BLUES  = ['#1d4ed8','#2563eb','#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe'];
const MULTI  = ['#2563eb','#16a34a','#ea580c','#7c3aed','#db2777','#0891b2','#65a30d',
                '#c2410c','#9333ea','#0284c7','#15803d','#b45309','#be185d','#6d28d9','#0369a1'];

// ── Chart defaults ───────────────────────────────────────────────────────────
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#64748b';

// ── 1. Trend Chart (overview) ─────────────────────────────────────────────────
new Chart(document.getElementById('trendChart'), {
  type: 'line',
  data: {
    labels: MOCK.years,
    datasets: [{
      label: 'Publications',
      data: MOCK.publications,
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,.08)',
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: '#2563eb',
      fill: true,
      tension: 0.4,
    }, {
      label: 'Citations ÷ 10',
      data: MOCK.citations.map(c => Math.round(c / 10)),
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22,163,74,.05)',
      borderWidth: 2,
      pointRadius: 3,
      fill: true,
      tension: 0.4,
      borderDash: [5, 3],
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top', align: 'end' }, tooltip: { mode: 'index' } },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' } }
    }
  }
});

// ── 2. Doc Type Doughnut ─────────────────────────────────────────────────────
new Chart(document.getElementById('docTypeChart'), {
  type: 'doughnut',
  data: {
    labels: MOCK.docTypes.labels,
    datasets: [{ data: MOCK.docTypes.values, backgroundColor: MULTI, borderWidth: 2, borderColor: '#fff' }]
  },
  options: {
    responsive: true,
    cutout: '62%',
    plugins: {
      legend: { position: 'bottom', labels: { padding: 10, boxWidth: 12 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
    }
  }
});

// ── 3. Subject Area Bar (overview) ────────────────────────────────────────────
new Chart(document.getElementById('subjectChart'), {
  type: 'bar',
  data: {
    labels: MOCK.subjects.slice(0, 10).map(s => s.name.length > 20 ? s.name.slice(0,18)+'…' : s.name),
    datasets: [{
      label: 'Publications',
      data: MOCK.subjects.slice(0, 10).map(s => s.pubs),
      backgroundColor: BLUES,
      borderRadius: 5,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { callback: v => fmt(v) } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } }
    }
  }
});

// ── 4. Institution Bar (overview) ─────────────────────────────────────────────
new Chart(document.getElementById('institutionChart'), {
  type: 'bar',
  data: {
    labels: MOCK.institutions.slice(0, 10).map(i => {
      const abbr = { 'Universitas': 'Univ.', 'Institut': 'Inst.', 'Badan Riset dan Inovasi Nasional': 'BRIN' };
      let n = i.name;
      for (const [k, v] of Object.entries(abbr)) n = n.replace(k, v);
      return n.length > 26 ? n.slice(0,24)+'…' : n;
    }),
    datasets: [{
      label: 'Publications',
      data: MOCK.institutions.slice(0, 10).map(i => i.pubs),
      backgroundColor: '#3b82f6',
      borderRadius: 5,
      hoverBackgroundColor: '#2563eb',
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 30 } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => fmt(v) } }
    }
  }
});

// ── 5. Trend Detail ───────────────────────────────────────────────────────────
new Chart(document.getElementById('trendDetailChart'), {
  type: 'bar',
  data: {
    labels: MOCK.years,
    datasets: [{
      label: 'Publications',
      data: MOCK.publications,
      backgroundColor: MOCK.years.map((_, i) => i === MOCK.years.length - 1 ? '#2563eb' : '#93c5fd'),
      borderRadius: 6,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false },
      tooltip: { callbacks: { afterLabel: ctx => `YoY: ${MOCK.growthRate[ctx.dataIndex] != null ? '+'+MOCK.growthRate[ctx.dataIndex]+'%' : 'N/A'}` } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => fmt(v) } }
    }
  }
});

// ── 6. Growth Rate ────────────────────────────────────────────────────────────
new Chart(document.getElementById('growthChart'), {
  type: 'line',
  data: {
    labels: MOCK.years.slice(1),
    datasets: [{
      label: 'YoY Growth %',
      data: MOCK.growthRate.slice(1),
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,.08)',
      fill: true, tension: 0.4, borderWidth: 2.5, pointRadius: 4,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' } }
    }
  }
});

// ── 7. Open Access Pie ────────────────────────────────────────────────────────
new Chart(document.getElementById('oaChart'), {
  type: 'pie',
  data: {
    labels: ['Open Access', 'Subscription'],
    datasets: [{ data: [MOCK.openAccess.oa, MOCK.openAccess.subscription],
      backgroundColor: ['#16a34a', '#e2e8f0'], borderWidth: 2, borderColor: '#fff' }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom' },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
    }
  }
});

// ── 8. Collaboration Pie ──────────────────────────────────────────────────────
new Chart(document.getElementById('collabChart'), {
  type: 'pie',
  data: {
    labels: MOCK.collab.labels,
    datasets: [{ data: MOCK.collab.values,
      backgroundColor: ['#2563eb', '#0891b2', '#7c3aed'], borderWidth: 2, borderColor: '#fff' }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 8 } },
      tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
    }
  }
});

// ── 9. Subject Detail (Subjects section) ─────────────────────────────────────
new Chart(document.getElementById('subjectDetailChart'), {
  type: 'bar',
  data: {
    labels: MOCK.subjects.map(s => s.name.length > 22 ? s.name.slice(0,20)+'…' : s.name),
    datasets: [{
      label: 'Publications',
      data: MOCK.subjects.map(s => s.pubs),
      backgroundColor: MULTI,
      borderRadius: 5,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#f1f5f9' }, ticks: { callback: v => fmt(v) } },
      y: { grid: { display: false }, ticks: { font: { size: 10 } } }
    }
  }
});

// ── 10. Subject Doughnut (Subjects section) ───────────────────────────────────
new Chart(document.getElementById('subjectPieChart'), {
  type: 'doughnut',
  data: {
    labels: MOCK.subjects.slice(0, 8).map(s => s.name),
    datasets: [{
      data: MOCK.subjects.slice(0, 8).map(s => s.pubs),
      backgroundColor: MULTI.slice(0, 8),
      borderWidth: 2, borderColor: '#fff'
    }]
  },
  options: {
    responsive: true, cutout: '55%',
    plugins: { legend: { position: 'bottom', labels: { padding: 8, font: { size: 11 }, boxWidth: 12 } } }
  }
});

// ── Tables ────────────────────────────────────────────────────────────────────
function sparklineHtml(arr) {
  const max = Math.max(...arr);
  return '<span class="sparkline">' + arr.map(v => `<span style="height:${Math.round(v/max*22)}px"></span>`).join('') + '</span>';
}

// Institutions Table
const instTbody = document.getElementById('inst-tbody');
MOCK.institutions.forEach((inst, i) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="rank-num">${i + 1}</td>
    <td><strong>${inst.name}</strong></td>
    <td>${inst.city}</td>
    <td>${inst.pubs.toLocaleString()}</td>
    <td>${inst.cites.toLocaleString()}</td>
    <td>${inst.hindex}</td>
    <td>${sparklineHtml(inst.spark)}</td>`;
  instTbody.appendChild(tr);
});

// Authors Table
const authorTbody = document.getElementById('author-tbody');
MOCK.authors.forEach((a, i) => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="rank-num">${i + 1}</td>
    <td><strong>${a.name}</strong></td>
    <td>${a.affil}</td>
    <td>${a.docs}</td>
    <td>${a.cites.toLocaleString()}</td>
    <td>${a.hindex}</td>
    <td>${a.subject}</td>`;
  authorTbody.appendChild(tr);
});

// Journals Table
const journalTbody = document.getElementById('journal-tbody');
MOCK.journals.forEach((j, i) => {
  const qClass = { Q1:'badge-q1', Q2:'badge-q2', Q3:'badge-q3', Q4:'badge-q4' }[j.quartile] || '';
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="rank-num">${i + 1}</td>
    <td><strong>${j.name}</strong></td>
    <td>${j.publisher}</td>
    <td>${j.papers.toLocaleString()}</td>
    <td>${j.citeScore}</td>
    <td>${j.sjr}</td>
    <td><span class="${qClass}">${j.quartile}</span></td>`;
  journalTbody.appendChild(tr);
});

// ── Discontinued Journals Charts ─────────────────────────────────────────────
const discTotal = DISCONTINUED.counts.reduce((a, b) => a + b, 0);
const discPeak  = Math.max(...DISCONTINUED.counts);
const disc2024  = DISCONTINUED.counts[DISCONTINUED.years.indexOf(2024)];
const discDrop  = Math.round((discPeak - disc2024) / discPeak * 100);

document.getElementById('disc-total').textContent = discTotal.toLocaleString();
document.getElementById('disc-drop').textContent  = `−${discDrop}%`;

// Bar colours: red for peak years, amber for others, grey for post-peak
const barColors = DISCONTINUED.counts.map((v, i) => {
  if (v === discPeak || (i > 0 && DISCONTINUED.counts[i-1] === discPeak)) return '#dc2626';
  if (v > 8000) return '#f97316';
  if (DISCONTINUED.years[i] >= 2021) return '#94a3b8';
  return '#3b82f6';
});

new Chart(document.getElementById('discTrendChart'), {
  type: 'bar',
  data: {
    labels: DISCONTINUED.years,
    datasets: [{
      label: 'Papers in discontinued journals',
      data: DISCONTINUED.counts,
      backgroundColor: barColors,
      borderRadius: 6,
      borderSkipped: false,
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.y.toLocaleString()} papers`,
          afterLabel: ctx => {
            const i = ctx.dataIndex;
            if (i > 0) {
              const prev = DISCONTINUED.counts[i - 1];
              const chg  = Math.round((ctx.parsed.y - prev) / prev * 100);
              return `YoY: ${chg > 0 ? '+' : ''}${chg}%`;
            }
            return '';
          }
        }
      },
      annotation: {}
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { callback: v => v.toLocaleString() }
      }
    }
  }
});

// YoY Change chart
const yoyChanges = DISCONTINUED.counts.map((v, i) => {
  if (i === 0) return null;
  return Math.round((v - DISCONTINUED.counts[i-1]) / DISCONTINUED.counts[i-1] * 100);
});

new Chart(document.getElementById('discChangeChart'), {
  type: 'bar',
  data: {
    labels: DISCONTINUED.years,
    datasets: [{
      label: 'YoY Change %',
      data: yoyChanges,
      backgroundColor: yoyChanges.map(v => v === null ? 'transparent' : v >= 0 ? '#3b82f6' : '#ef4444'),
      borderRadius: 4,
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false },
      tooltip: { callbacks: { label: ctx => ctx.parsed.y !== null ? ` ${ctx.parsed.y > 0 ? '+' : ''}${ctx.parsed.y}%` : '' } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' } }
    }
  }
});

// Share of total output
const shareData = DISCONTINUED.counts.map((v, i) =>
  parseFloat((v / DISCONTINUED.totalOutput[i] * 100).toFixed(1))
);

new Chart(document.getElementById('discShareChart'), {
  type: 'line',
  data: {
    labels: DISCONTINUED.years,
    datasets: [{
      label: '% of total Indonesian output',
      data: shareData,
      borderColor: '#7c3aed',
      backgroundColor: 'rgba(124,58,237,.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: 5,
      pointBackgroundColor: shareData.map(v => v === Math.max(...shareData) ? '#dc2626' : '#7c3aed'),
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y}% of total output` } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' }, min: 0 }
    }
  }
});

// ── Table Filter ──────────────────────────────────────────────────────────────
function filterTable(tableId, query) {
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);
  const q = query.toLowerCase();
  let visible = 0;
  rows.forEach(row => {
    const match = row.textContent.toLowerCase().includes(q);
    row.style.display = match ? '' : 'none';
    if (match) visible++;
  });
}

// ── API Modal ─────────────────────────────────────────────────────────────────
function showApiModal() { document.getElementById('api-modal').classList.add('open'); }
function closeApiModal(e) {
  if (!e || e.target === document.getElementById('api-modal'))
    document.getElementById('api-modal').classList.remove('open');
}
function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  const status = document.getElementById('api-status');
  if (!key) { status.textContent = 'Please enter an API key.'; status.className = 'api-status error'; return; }
  localStorage.setItem('scopus_api_key', key);
  localStorage.setItem('scopus_inst_token', document.getElementById('inst-token-input').value.trim());
  status.textContent = '✓ API key saved. Live data fetch will be enabled once the backend is configured.';
  status.className = 'api-status ok';
}

// ── Load saved API key ────────────────────────────────────────────────────────
const savedKey = localStorage.getItem('scopus_api_key');
if (savedKey) document.getElementById('api-key-input').value = savedKey;

function updateYear() {
  // Placeholder — will filter live API data by year when backend is ready
  const yr = document.getElementById('year-filter').value;
  document.getElementById('year-range').textContent = yr === 'all' ? '2014 – 2024' : yr;
}
