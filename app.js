
// Millionaire Full Upgrade - app.js
// LocalStorage-based app with all lists: daily routine, trading daily, trading weekly, dropshipping plan, reading timetable, finance tracker, streaks.

const STORAGE_KEY = "millionaire_full_v1";

const DEFAULT_STATE = {
  dailyRoutine: [
    {id:'d1',label:'Wake up (no phone)',done:false},
    {id:'d2',label:'Drink water + stretch',done:false},
    {id:'d3',label:'10-min meditation',done:false},
    {id:'d4',label:'20-min chart review',done:false},
    {id:'d5',label:'30-min reading',done:false},
    {id:'d6',label:'Plan 3 goals for the day',done:false},
    {id:'d7',label:'Quick exercise (15 min)',done:false}
  ],
  tradingDaily: [
    {id:'td1',label:'Check market structure',done:false},
    {id:'td2',label:'Review setups (1 hour)',done:false},
    {id:'td3',label:'Backtest trades',done:false},
    {id:'td4',label:'Log trades in journal',done:false},
    {id:'td5',label:'Review risk management',done:false}
  ],
  readingTimetable:[
    {id:'r1',label:'Mastering Self Discipline - 30 min',done:false},
    {id:'r2',label:'Power of Habit - 30 min',done:false},
    {id:'r3',label:'The Psychology of Trading - 30 min',done:false}
  ],
  tradingWeekly:{
    Monday:[],Tuesday:[],Wednesday:[],Thursday:[],Friday:[],Saturday:[],Sunday:[]
  },
  dropshipping:[
    {id:'dp1',label:'Jan - Product research (20-30)',done:false},
    {id:'dp2',label:'Feb - Test 5 products',done:false},
    {id:'dp3',label:'Mar - Build store & branding',done:false},
    {id:'dp4',label:'Apr - Launch winning product',done:false},
    {id:'dp5',label:'May-Jun - Scale ads & margins',done:false}
  ],
  finance:{
    targetCapital:15000,
    currentSavings:0
  },
  streak:{current:0,lastDate:null,longest:0},
  notes:{}
};

let state = loadState();

function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function loadState(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE)); return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
  try { return JSON.parse(raw); } catch(e){ localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE)); return JSON.parse(JSON.stringify(DEFAULT_STATE)); }
}

function el(id){ return document.getElementById(id); }

// Render functions
function renderList(containerId, list, groupKey){
  const container = el(containerId);
  container.innerHTML = '';
  list.forEach(item => {
    const node = document.createElement('div');
    node.className = 'task';
    const left = document.createElement('div'); left.className='left';
    const cb = document.createElement('div'); cb.className='checkbox'; cb.dataset.id = item.id;
    if(item.done) cb.style.background = 'linear-gradient(90deg,#10b981,#06b6d4)';
    cb.onclick = ()=> { toggleDone(groupKey, item.id); };
    const label = document.createElement('div'); label.innerText = item.label;
    left.appendChild(cb); left.appendChild(label);
    const right = document.createElement('div'); right.className='small'; right.innerText = item.done? 'Done' : '';
    node.appendChild(left); node.appendChild(right);
    container.appendChild(node);
  });
}

function renderWeekly(){
  const container = el('tradingWeekly');
  container.innerHTML = '';
  Object.keys(state.tradingWeekly).forEach(day=>{
    const box = document.createElement('div'); box.className='week-day';
    const title = document.createElement('div'); title.innerText = day; title.style.fontWeight='700';
    const list = document.createElement('div');
    state.tradingWeekly[day].forEach(it=>{
      const p = document.createElement('div'); p.className='small'; p.innerText = (it.done? '✓ ':'') + it.label;
      list.appendChild(p);
    });
    const addBtn = document.createElement('button'); addBtn.className='btn small'; addBtn.innerText='Add'; addBtn.onclick = ()=>{
      const text = prompt('New task for '+day);
      if(text) { state.tradingWeekly[day].push({id:day+'_'+Date.now(),label:text,done:false}); saveState(); renderAll(); }
    };
    box.appendChild(title); box.appendChild(list); box.appendChild(addBtn);
    container.appendChild(box);
  });
}

function renderFinance(){
  el('targetCapital').value = state.finance.targetCapital;
  el('currentSavings').value = state.finance.currentSavings;
  const pct = Math.min(100, Math.round((state.finance.currentSavings / state.finance.targetCapital) * 100));
  el('savingsProgress').querySelector('.bar').style.width = pct + '%';
  el('savingsText').innerText = `Saved R${state.finance.currentSavings} of R${state.finance.targetCapital} (${pct}%)`;
}

function renderStreak(){
  el('streakCount').innerText = state.streak.current;
}

function renderNotes(){
  const today = new Date().toISOString().slice(0,10);
  el('dailyNotes').value = state.notes[today] || '';
}

function renderAll(){
  renderList('dailyList', state.dailyRoutine, 'dailyRoutine');
  renderList('tradingDaily', state.tradingDaily, 'tradingDaily');
  renderList('readingList', state.readingTimetable, 'readingTimetable');
  renderWeekly();
  renderList('dropship', state.dropshipping, 'dropshipping');
  renderFinance();
  renderStreak();
  renderNotes();
}

// Toggles
function toggleDone(group, id){
  const list = state[group];
  if(Array.isArray(list)){
    const item = list.find(i=>i.id===id);
    if(item){ item.done = !item.done; saveState(); renderAll(); checkStreak(); }
  } else {
    console.warn('unknown group',group);
  }
}

// Finance inputs
el('targetCapital').addEventListener('change', (e)=>{ state.finance.targetCapital = Number(e.target.value); saveState(); renderFinance(); });
el('currentSavings').addEventListener('change', (e)=>{ state.finance.currentSavings = Number(e.target.value); saveState(); renderFinance(); });

// Notes
el('dailyNotes').addEventListener('input', (e)=> {
  const today = new Date().toISOString().slice(0,10);
  state.notes[today] = e.target.value;
  saveState();
});

// Export
el('exportBtn').addEventListener('click', ()=> {
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'millionaire_state.json'; a.click();
  URL.revokeObjectURL(url);
});

// Reset
el('resetBtn').addEventListener('click', ()=> {
  if(confirm('Reset all local data to defaults?')){ localStorage.removeItem(STORAGE_KEY); state = loadState(); renderAll(); }
});

// Streak logic: if all morning tasks done for a day, increment streak (basic)
function checkStreak(){
  const done = state.dailyRoutine.every(t=>t.done);
  const today = new Date().toISOString().slice(0,10);
  if(done && state.streak.lastDate !== today){
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    const cont = state.streak.lastDate === yesterday;
    state.streak.current = cont? state.streak.current + 1 : 1;
    if(state.streak.current > state.streak.longest) state.streak.longest = state.streak.current;
    state.streak.lastDate = today;
    saveState();
    renderStreak();
  }
}

// Allow marking weekly tasks done by clicking text (simple)
document.addEventListener('click',(e)=>{
  if(e.target && e.target.matches && e.target.matches('.week-day .small')){ /* placeholder */ }
});

// Initialize
renderAll();
