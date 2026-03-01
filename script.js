const form = document.getElementById('f');
const printBtn = document.getElementById('printBtn');

function setVal(key, val){
  const el = document.querySelector(`[data-k="${key}"]`);
  if(!el) return;
  el.textContent = val && String(val).trim() ? val : '—';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  setVal('name', fd.get('name'));
  setVal('from', (fd.get('from')||'').toUpperCase());
  setVal('to', (fd.get('to')||'').toUpperCase());
  setVal('flight', fd.get('flight'));
  setVal('pnr', (fd.get('pnr')||'').toUpperCase());

  // date format
  const d = fd.get('date');
  if(d){
    const dt = new Date(d);
    const pretty = dt.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'2-digit'});
    setVal('date', pretty);
  } else {
    setVal('date', '—');
  }
});

printBtn.addEventListener('click', () => {
  window.print();
});
