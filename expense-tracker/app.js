(() => {
  const els = {
    totalIncome: document.getElementById('totalIncome'),
    totalExpense: document.getElementById('totalExpense'),
    netTotal: document.getElementById('netTotal'),
    txForm: document.getElementById('txForm'),
    txDate: document.getElementById('txDate'),
    txType: document.getElementById('txType'),
    txDesc: document.getElementById('txDesc'),
    txCategory: document.getElementById('txCategory'),
    txAmount: document.getElementById('txAmount'),
    saveBtn: document.getElementById('saveBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    txTbody: document.getElementById('txTbody'),
    emptyState: document.getElementById('emptyState'),
    filterCategory: document.getElementById('filterCategory'),
    searchText: document.getElementById('searchText'),
    sortBy: document.getElementById('sortBy'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    expenseChart: document.getElementById('expenseChart')
  };

  const STORAGE_KEY = 'expense-tracker:transactions';
  /** @type {Array<{id:string,date:string,desc:string,category:string,amount:number,type:'income'|'expense'}>} */
  let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  let editingId = null;
  let chartInstance = null;

  // Defaults
  if (!els.txDate.value) {
    const today = new Date().toISOString().slice(0,10);
    els.txDate.value = today;
  }

  // Validation helpers
  function setError(el, message) {
    const small = el.parentElement.querySelector('.error');
    if (small) small.textContent = message || '';
    el.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateForm() {
    let ok = true;
    if (!els.txDate.value) { setError(els.txDate, 'Date is required'); ok = false; } else setError(els.txDate,'');
    if (!els.txType.value) { setError(els.txType, 'Choose income or expense'); ok = false; } else setError(els.txType,'');
    if (!els.txDesc.value.trim()) { setError(els.txDesc, 'Description is required'); ok = false; } else setError(els.txDesc,'');
    if (!els.txCategory.value) { setError(els.txCategory, 'Select a category'); ok = false; } else setError(els.txCategory,'');
    const amt = parseFloat(els.txAmount.value);
    if (isNaN(amt) || amt <= 0) { setError(els.txAmount, 'Enter amount > 0'); ok = false; } else setError(els.txAmount,'');
    return ok;
  }

  // Persistence
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  // Derived values
  function computeSummary() {
    const income = transactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
    const net = income - expense;
    els.totalIncome.textContent = '₹' + income.toFixed(2);
    els.totalExpense.textContent = '₹' + expense.toFixed(2);
    els.netTotal.textContent = '₹' + net.toFixed(2);
  }

  // Populate filters (categories from data)
  function refreshCategoryFilters() {
    const categories = Array.from(new Set(transactions.map(t => t.category))).sort();
    const current = els.filterCategory.value || 'all';
    els.filterCategory.innerHTML = '<option value="all">All</option>' + categories.map(c => `<option>${c}</option>`).join('');
    els.filterCategory.value = current;
  }

  // Render table rows
  function renderList() {
    const q = els.searchText.value.trim().toLowerCase();
    const cat = els.filterCategory.value;
    let data = transactions.filter(t => {
      const matchesCat = cat === 'all' || t.category === cat;
      const matchesText = !q || t.desc.toLowerCase().includes(q);
      return matchesCat && matchesText;
    });

    switch (els.sortBy.value) {
      case 'dateAsc': data.sort((a,b)=> a.date.localeCompare(b.date)); break;
      case 'dateDesc': data.sort((a,b)=> b.date.localeCompare(a.date)); break;
      case 'amountAsc': data.sort((a,b)=> a.amount - b.amount); break;
      case 'amountDesc': data.sort((a,b)=> b.amount - a.amount); break;
    }

    els.txTbody.innerHTML = data.map(t => `
      <tr>
        <td>${t.date}</td>
        <td>${escapeHtml(t.desc)}</td>
        <td><span class="badge">${escapeHtml(t.category)}</span></td>
        <td><span class="badge ${t.type}">${t.type}</span></td>
        <td class="right">${t.amount.toFixed(2)}</td>
        <td class="row-actions">
          <button class="btn secondary" data-action="edit" data-id="${t.id}">Edit</button>
          <button class="btn danger" data-action="delete" data-id="${t.id}">Delete</button>
        </td>
      </tr>
    `).join('');

    els.emptyState.style.display = data.length ? 'none' : 'block';
  }

  function escapeHtml(str){
    return str.replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[s]);
  }

  // Chart
  function renderChart() {
    if (!window.Chart) return;
    const byCat = {};
    for (const t of transactions) {
      if (t.type !== 'expense') continue;
      byCat[t.category] = (byCat[t.category] || 0) + t.amount;
    }
    const labels = Object.keys(byCat);
    const data = Object.values(byCat);

    if (chartInstance) chartInstance.destroy();
    if (!labels.length) {
      // No data; render an empty chart
      chartInstance = new Chart(els.expenseChart.getContext('2d'), {
        type: 'pie', data: { labels: ['No expenses'], datasets: [{ data: [1] }] },
        options:{ plugins:{ legend:{ display:false } } }
      });
      return;
    }

    chartInstance = new Chart(els.expenseChart.getContext('2d'), {
      type: 'pie',
      data: { labels, datasets: [{ data }] },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  // Add or update
  function onSubmit(e){
    e.preventDefault();
    if (!validateForm()) return;

    const tx = {
      id: editingId || crypto.randomUUID(),
      date: els.txDate.value,
      desc: els.txDesc.value.trim(),
      category: els.txCategory.value,
      amount: parseFloat(els.txAmount.value),
      type: els.txType.value
    };

    if (editingId) {
      const idx = transactions.findIndex(t => t.id === editingId);
      if (idx !== -1) transactions[idx] = tx;
      editingId = null;
      els.saveBtn.textContent = 'Add Transaction';
      els.cancelEditBtn.hidden = true;
    } else {
      transactions.push(tx);
    }

    save();
    computeSummary();
    refreshCategoryFilters();
    renderList();
    renderChart();
    e.target.reset();
    // re-set today's date for convenience
    els.txDate.value = new Date().toISOString().slice(0,10);
  }

  function onTableClick(e){
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'delete') {
      if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        save(); computeSummary(); refreshCategoryFilters(); renderList(); renderChart();
      }
    } else if (action === 'edit') {
      const t = transactions.find(x => x.id === id);
      if (!t) return;
      editingId = id;
      els.txDate.value = t.date;
      els.txType.value = t.type;
      els.txDesc.value = t.desc;
      // add missing category to select if needed
      if (![...els.txCategory.options].some(o => o.value === t.category)) {
        els.txCategory.insertAdjacentHTML('beforeend', `<option>${escapeHtml(t.category)}</option>`);
      }
      els.txCategory.value = t.category;
      els.txAmount.value = t.amount.toString();
      els.saveBtn.textContent = 'Save Changes';
      els.cancelEditBtn.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function cancelEdit(){
    editingId = null;
    els.txForm.reset();
    els.txDate.value = new Date().toISOString().slice(0,10);
    els.saveBtn.textContent = 'Add Transaction';
    els.cancelEditBtn.hidden = true;
    document.querySelectorAll('.error').forEach(s => s.textContent='');
  }

  // Export / Import
  function exportJson(){
    const data = JSON.stringify({ exportedAt: new Date().toISOString(), transactions }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(e){
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || !Array.isArray(parsed.transactions)) throw new Error('Invalid file');
        // Basic schema check
        const ok = parsed.transactions.every(t => t && typeof t.id==='string' && typeof t.date==='string' && typeof t.desc==='string' && typeof t.category==='string' && typeof t.amount==='number' && (t.type==='income'||t.type==='expense'));
        if (!ok) throw new Error('Invalid transaction schema');
        transactions = parsed.transactions;
        save(); computeSummary(); refreshCategoryFilters(); renderList(); renderChart();
        alert('Import successful!');
      } catch (err) {
        alert('Failed to import: ' + err.message);
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function clearAll(){
    if (!transactions.length) return;
    if (confirm('This will delete ALL transactions. Continue?')) {
      transactions = [];
      save(); computeSummary(); refreshCategoryFilters(); renderList(); renderChart();
    }
  }

  // Events
  els.txForm.addEventListener('submit', onSubmit);
  els.txTbody.addEventListener('click', onTableClick);
  els.cancelEditBtn.addEventListener('click', cancelEdit);
  els.exportBtn.addEventListener('click', exportJson);
  els.importFile.addEventListener('change', importJson);
  els.clearAllBtn.addEventListener('click', clearAll);
  ['input','change'].forEach(ev => {
    els.filterCategory.addEventListener(ev, ()=>renderList());
    els.searchText.addEventListener(ev, ()=>renderList());
    els.sortBy.addEventListener(ev, ()=>renderList());
  });

  // Initial render
  computeSummary();
  refreshCategoryFilters();
  renderList();
  renderChart();
})();