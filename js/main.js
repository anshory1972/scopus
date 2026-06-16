Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = '#64748b';

const C = {
  Indonesia: '#e11d48', Malaysia: '#2563eb',
  Thailand:  '#7c3aed', India:    '#059669', "Viet Nam": '#d97706',
};
const PALETTE = ['#2563eb','#7c3aed','#059669','#d97706','#db2777',
                 '#0891b2','#65a30d','#c2410c','#9333ea','#0369a1',
                 '#15803d','#b45309','#be185d','#6d28d9','#0284c7'];

function fmt(n){ return n >= 1000 ? (n/1000).toFixed(1)+'k' : String(n); }

// ── Subnav scroll highlight ───────────────────────────────────────────────────
const sections = document.querySelectorAll('[id^="s-"]');
const navLinks  = document.querySelectorAll('.sn');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
  navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+cur));
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TREND CHART
// ═══════════════════════════════════════════════════════════════════════════════
new Chart(document.getElementById('trendChart'), {
  type: 'bar',
  data: {
    labels: YEARS,
    datasets: [{
      data: INDO_COUNTS,
      backgroundColor: INDO_COUNTS.map((v,i) =>
        v === Math.max(...INDO_COUNTS) ? '#e11d48' :
        YEARS[i] >= 2021 ? '#cbd5e1' : '#fca5a5'),
      borderRadius: 7,
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
            if (!i) return '';
            const chg = ((INDO_COUNTS[i]-INDO_COUNTS[i-1])/INDO_COUNTS[i-1]*100).toFixed(1);
            return ` YoY: ${chg > 0 ? '+' : ''}${chg}%`;
          }
        }
      }
    },
    scales: {
      x: { grid:{display:false} },
      y: { beginAtZero:true, grid:{color:'#f1f5f9'}, ticks:{callback:v=>fmt(v)} }
    }
  }
});

// YoY
const yoy = INDO_COUNTS.map((v,i) =>
  i===0 ? null : parseFloat(((v-INDO_COUNTS[i-1])/INDO_COUNTS[i-1]*100).toFixed(1)));
new Chart(document.getElementById('yoyChart'), {
  type:'bar',
  data:{ labels:YEARS, datasets:[{
    data:yoy,
    backgroundColor:yoy.map(v=>v===null?'transparent':v>=0?'#3b82f6':'#e11d48'),
    borderRadius:5
  }]},
  options:{ responsive:true, plugins:{legend:{display:false},
    tooltip:{callbacks:{label:ctx=>ctx.parsed.y!=null?` ${ctx.parsed.y>0?'+':''}${ctx.parsed.y}%`:''}}},
    scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'},ticks:{callback:v=>v+'%'}}}
  }
});

// Stacked doc type by year
new Chart(document.getElementById('stackedDocYear'), {
  type:'bar',
  data:{
    labels:YEARS,
    datasets:[
      {label:'Article',         data:YEARLY_DOC['Article'],         backgroundColor:'#3b82f6', borderRadius:0},
      {label:'Conference Paper',data:YEARLY_DOC['Conference Paper'],backgroundColor:'#7c3aed', borderRadius:0},
      {label:'Review',          data:YEARLY_DOC['Review'],          backgroundColor:'#059669', borderRadius:0},
    ]
  },
  options:{ responsive:true, plugins:{legend:{position:'bottom',labels:{boxWidth:12,padding:10}}},
    scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>fmt(v)}}}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. BENCHMARK
// ═══════════════════════════════════════════════════════════════════════════════
// Legend
const legEl = document.getElementById('bench-leg');
Object.entries(C).forEach(([name,color])=>{
  const thick = name==='Indonesia';
  legEl.innerHTML+=`<div class="cl">
    <div class="cl-line${thick?' w':''}" style="background:${color}"></div>
    <span style="color:${thick?color:'#475569'};${thick?'font-weight:800':''}">
      ${name==='Viet Nam'?'Vietnam':name}</span>
  </div>`;
});

const allCountries = {Indonesia: INDO_COUNTS, ...BENCHMARK};
const benchDS = Object.entries(allCountries).map(([name,data])=>{
  const isIndo = name==='Indonesia';
  return {
    label: name==='Viet Nam'?'Vietnam':name,
    data,
    borderColor:  C[name],
    borderWidth:  isIndo ? 3.5 : 1.5,
    pointRadius:  isIndo ? 5 : 3,
    borderDash:   isIndo ? [] : [5,3],
    tension: 0.4,
    pointBackgroundColor: C[name],
  };
});

new Chart(document.getElementById('benchLine'), {
  type:'line',
  data:{labels:YEARS, datasets:benchDS},
  options:{
    responsive:true,
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{display:false},
      tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`}}
    },
    scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>fmt(v)}}}
  }
});

// Share line
const shareDS = Object.entries(C).map(([name,color])=>{
  const isIndo = name==='Indonesia';
  const counts = allCountries[name];
  const totals = TOTAL_OUTPUT[name];
  return {
    label: name==='Viet Nam'?'Vietnam':name,
    data: YEARS.map((_,i)=>parseFloat((counts[i]/totals[i]*100).toFixed(1))),
    borderColor:color, borderWidth:isIndo?3.5:1.5,
    pointRadius:isIndo?5:3, borderDash:isIndo?[]:[5,3],
    tension:0.4, pointBackgroundColor:color,
  };
});
new Chart(document.getElementById('shareLine'), {
  type:'line',
  data:{labels:YEARS, datasets:shareDS},
  options:{
    responsive:true,
    interaction:{mode:'index',intersect:false},
    plugins:{
      legend:{position:'top',align:'end',labels:{boxWidth:18,padding:12,font:{size:11}}},
      tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${ctx.parsed.y}%`}}
    },
    scales:{x:{grid:{display:false}},y:{beginAtZero:true,grid:{color:'#f1f5f9'},ticks:{callback:v=>v+'%'}}}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════
const dtLabels = Object.keys(DOC_TYPES);
const dtVals   = Object.values(DOC_TYPES);
new Chart(document.getElementById('docDoughnut'),{
  type:'doughnut',
  data:{labels:dtLabels, datasets:[{data:dtVals, backgroundColor:PALETTE, borderWidth:2, borderColor:'#fff'}]},
  options:{cutout:'60%',plugins:{legend:{position:'bottom',labels:{padding:10,boxWidth:12}}}}
});
new Chart(document.getElementById('docBar'),{
  type:'bar',
  data:{labels:dtLabels, datasets:[{data:dtVals, backgroundColor:PALETTE, borderRadius:5}]},
  options:{indexAxis:'y',plugins:{legend:{display:false}},
    scales:{x:{grid:{color:'#f1f5f9'},ticks:{callback:v=>fmt(v)}},y:{grid:{display:false}}}}
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SUBJECT AREAS
// ═══════════════════════════════════════════════════════════════════════════════
new Chart(document.getElementById('subjectBar'),{
  type:'bar',
  data:{
    labels:SUBJECTS.map(s=>s.name),
    datasets:[{data:SUBJECTS.map(s=>s.journals), backgroundColor:PALETTE, borderRadius:4}]
  },
  options:{
    indexAxis:'y',
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.parsed.x} journals`}}},
    scales:{x:{grid:{color:'#f1f5f9'},ticks:{callback:v=>v+' journals'}},y:{grid:{display:false},ticks:{font:{size:11}}}}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SOURCE TITLES
// ═══════════════════════════════════════════════════════════════════════════════
const top20 = TOP_SOURCES.slice(0,20);
new Chart(document.getElementById('sourceBar'),{
  type:'bar',
  data:{
    labels:top20.map(s=> s.title.length>45 ? s.title.slice(0,43)+'…' : s.title),
    datasets:[{
      data:top20.map(s=>s.count),
      backgroundColor:top20.map(s=>s.type==='Conference Proceedings'?'#7c3aed':'#3b82f6'),
      borderRadius:4
    }]
  },
  options:{
    indexAxis:'y',
    plugins:{
      legend:{display:false},
      tooltip:{callbacks:{
        title:ctx=>TOP_SOURCES[ctx[0].dataIndex].title,
        label:ctx=>` ${ctx.parsed.x.toLocaleString()} papers`,
        afterLabel:ctx=>` Type: ${TOP_SOURCES[ctx[0].dataIndex].type}`
      }}
    },
    scales:{x:{grid:{color:'#f1f5f9'},ticks:{callback:v=>fmt(v)}},y:{grid:{display:false},ticks:{font:{size:10}}}}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SOURCE TYPES
// ═══════════════════════════════════════════════════════════════════════════════
const stLabels  = ['Journal','Conference Proceedings','Trade Journal'];
const stPapers  = [SOURCE_TYPES.journals.papers, SOURCE_TYPES.conferences.papers, SOURCE_TYPES.trade.papers];
const stJournals= [SOURCE_TYPES.journals.journals,SOURCE_TYPES.conferences.journals,SOURCE_TYPES.trade.journals];
const stColors  = ['#3b82f6','#7c3aed','#f59e0b'];
new Chart(document.getElementById('srcTypePie'),{
  type:'doughnut',
  data:{labels:stLabels,
    datasets:[{data:stPapers,backgroundColor:stColors,borderWidth:2,borderColor:'#fff'}]},
  options:{cutout:'58%',plugins:{legend:{position:'bottom',labels:{padding:10,boxWidth:12}},
    tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.parsed.toLocaleString()} papers`}}}}
});
new Chart(document.getElementById('srcTypeCount'),{
  type:'bar',
  data:{labels:stLabels,
    datasets:[{data:stJournals,backgroundColor:stColors,borderRadius:6}]},
  options:{plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>` ${ctx.parsed.y} sources`}}},
    scales:{x:{grid:{display:false}},y:{grid:{color:'#f1f5f9'}}}}
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. OPEN ACCESS
// ═══════════════════════════════════════════════════════════════════════════════
const oaPct = Math.round(OPEN_ACCESS.oa/(OPEN_ACCESS.oa+OPEN_ACCESS.nonOa)*100);
document.getElementById('oa-pct').textContent = oaPct+'%';
new Chart(document.getElementById('oaPie'),{
  type:'doughnut',
  data:{labels:['Open Access','Subscription'],
    datasets:[{data:[OPEN_ACCESS.oa,OPEN_ACCESS.nonOa],
      backgroundColor:['#16a34a','#e2e8f0'],borderWidth:2,borderColor:'#fff'}]},
  options:{cutout:'62%',plugins:{legend:{position:'bottom',labels:{padding:12,boxWidth:12}},
    tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${ctx.parsed.toLocaleString()}`}}}}
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. AFFILIATIONS
// ═══════════════════════════════════════════════════════════════════════════════
new Chart(document.getElementById('affilBar'),{
  type:'bar',
  data:{
    labels:TOP_AFFILIATIONS.map(a=>a.name.replace('Universitas','Univ.').replace('Institut','Inst.')),
    datasets:[{data:TOP_AFFILIATIONS.map(a=>a.count),backgroundColor:'#3b82f6',borderRadius:4}]
  },
  options:{indexAxis:'y',plugins:{legend:{display:false},
    tooltip:{callbacks:{title:ctx=>TOP_AFFILIATIONS[ctx[0].dataIndex].name,
      label:ctx=>` ${ctx.parsed.x} papers (sample)`}}},
    scales:{x:{grid:{color:'#f1f5f9'},ticks:{callback:v=>v+' papers'}},y:{grid:{display:false},ticks:{font:{size:11}}}}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. AUTHORS TABLE
// ═══════════════════════════════════════════════════════════════════════════════
const maxAuth = Math.max(...TOP_AUTHORS.map(a=>a.count));
const tbody = document.getElementById('author-tbody');
TOP_AUTHORS.forEach((a,i)=>{
  const pct = Math.round(a.count/maxAuth*100);
  tbody.innerHTML+=`<tr>
    <td style="color:#94a3b8;font-weight:700;width:32px">${i+1}</td>
    <td><strong>${a.name}</strong></td>
    <td style="text-align:right;font-weight:700">${a.count}</td>
    <td style="width:140px;padding:10px 16px">
      <div class="bar-mini" style="width:${pct}%"></div>
    </td>
  </tr>`;
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. KEYWORDS
// ═══════════════════════════════════════════════════════════════════════════════
const top20kw = KEYWORDS.slice(0,20);
new Chart(document.getElementById('kwBar'),{
  type:'bar',
  data:{labels:top20kw.map(k=>k.word),
    datasets:[{data:top20kw.map(k=>k.count),backgroundColor:'#6366f1',borderRadius:4}]},
  options:{indexAxis:'y',plugins:{legend:{display:false}},
    scales:{x:{grid:{color:'#f1f5f9'}},y:{grid:{display:false},ticks:{font:{size:11}}}}}
});

// Keyword cloud
const maxKw = KEYWORDS[0].count;
const cloud = document.getElementById('kwcloud');
const sizes = [2.0,1.7,1.5,1.3,1.15,1.0,0.9,0.82,0.76,0.7];
const bgOpts = ['#dbeafe','#ede9fe','#d1fae5','#fef3c7','#fce7f3','#e0f2fe','#f0fdf4','#fff7ed','#f5f3ff','#fdf2f8'];
KEYWORDS.forEach((kw,i)=>{
  const span = document.createElement('span');
  span.className='kw-tag';
  span.textContent = kw.word;
  const tier = Math.min(Math.floor(i/3), sizes.length-1);
  span.style.cssText=`font-size:${sizes[tier]}rem;background:${bgOpts[i%bgOpts.length]};color:#1e293b;`;
  cloud.appendChild(span);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. FUNDING
// ═══════════════════════════════════════════════════════════════════════════════
const top15f = FUNDING.slice(0,15);
new Chart(document.getElementById('fundBar'),{
  type:'bar',
  data:{
    labels:top15f.map(f=>f.name.length>40?f.name.slice(0,38)+'…':f.name),
    datasets:[{data:top15f.map(f=>f.count),backgroundColor:'#f59e0b',borderRadius:4}]
  },
  options:{indexAxis:'y',plugins:{legend:{display:false},
    tooltip:{callbacks:{title:ctx=>top15f[ctx[0].dataIndex].name,label:ctx=>` ${ctx.parsed.x} papers`}}},
    scales:{x:{grid:{color:'#f1f5f9'}},y:{grid:{display:false},ticks:{font:{size:11}}}}
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. COUNTRY COLLABORATION
// ═══════════════════════════════════════════════════════════════════════════════
new Chart(document.getElementById('countryBar'),{
  type:'bar',
  data:{
    labels:COUNTRY_COLLAB.map(c=>c.name),
    datasets:[{data:COUNTRY_COLLAB.map(c=>c.count),backgroundColor:PALETTE,borderRadius:5}]
  },
  options:{indexAxis:'y',plugins:{legend:{display:false}},
    scales:{x:{grid:{color:'#f1f5f9'},ticks:{callback:v=>fmt(v)}},y:{grid:{display:false}}}}
});
const top5collab = COUNTRY_COLLAB.slice(0,5);
new Chart(document.getElementById('countryPie'),{
  type:'doughnut',
  data:{
    labels:[...top5collab.map(c=>c.name),'Others'],
    datasets:[{
      data:[...top5collab.map(c=>c.count), COUNTRY_COLLAB.slice(5).reduce((a,c)=>a+c.count,0)],
      backgroundColor:['#2563eb','#7c3aed','#059669','#d97706','#e11d48','#94a3b8'],
      borderWidth:2,borderColor:'#fff'
    }]
  },
  options:{cutout:'55%',plugins:{legend:{position:'bottom',labels:{padding:10,boxWidth:12}}}}
});
