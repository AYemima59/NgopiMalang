(() => {
  const FAVORITES_KEY = 'ngopimalang:favorites:v1';
  const REPORTS_KEY = 'ngopimalang:crowd-reports:v1';
  const CORRECTIONS_KEY = 'ngopimalang:corrections:v1';
  const SUGGESTIONS_KEY = 'ngopimalang:suggestions:v1';
  const cafes = {
    '1': 'Bataputih Coffee & Space',
    '2': 'Rumah Opa Heritage Cafe',
    '3': 'Kopi Titik Koma Soehat',
    '4': 'Nakoa Cafe Borobudur',
    '5': 'Maha Kopi Kebun'
  };
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const favorites = () => read(FAVORITES_KEY, []);
  const nav = {
    beranda: 'index.html',
    jelajahi: 'jelajahi.html',
    'artikel-panduan': 'artikel.html',
    favorit: 'favorit.html',
    'jelajahi-klojen': 'jelajahi.html?area=klojen',
    'jelajahi-lowokwaru': 'jelajahi.html?area=lowokwaru',
    'jelajahi-sukun': 'jelajahi.html?area=sukun',
    'jelajahi-blimbing': 'jelajahi.html?area=blimbing',
    'jelajahi-kedungkandang': 'jelajahi.html?area=semua',
    'etika-review': 'artikel.html?kategori=heritage',
    faq: 'artikel.html'
  };
  const goExplore = (params = {}) => {
    const url = new URL('jelajahi.html', location.href);
    Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
    location.href = url.href;
  };
  const showModal = (title, message, actionLabel = 'Mengerti', actionHref = '') => {
    let modal = document.getElementById('ngopi-site-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ngopi-site-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:1000;background:rgba(32,27,24,.55);display:none;align-items:center;justify-content:center;padding:20px;font-family:Work Sans, sans-serif';
      modal.innerHTML = '<section role="dialog" aria-modal="true" style="width:min(520px,100%);background:#fff8f5;color:#201b18;border-radius:18px;padding:24px;box-shadow:0 20px 60px #201b1840"><button type="button" data-close style="float:right;border:0;background:transparent;font-size:24px;cursor:pointer" aria-label="Tutup">×</button><h2 data-title style="font:600 24px Domine,serif;margin:4px 34px 12px 0"></h2><div data-message style="font-size:15px;line-height:1.65"></div><div data-actions style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px"></div></section>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) modal.style.display = 'none'; });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = 'none'; });
    }
    modal.querySelector('[data-title]').textContent = title;
    const messageEl = modal.querySelector('[data-message]');
    messageEl.textContent = message;
    const actions = modal.querySelector('[data-actions]');
    actions.replaceChildren();
    if (actionHref) {
      const link = document.createElement('a');
      link.href = actionHref;
      link.textContent = actionLabel;
      link.style.cssText = 'background:#3e2723;color:#fff;padding:10px 16px;border-radius:9px;text-decoration:none;font-weight:600';
      actions.appendChild(link);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.textContent = actionLabel;
      btn.style.cssText = 'background:#3e2723;color:#fff;padding:10px 16px;border:0;border-radius:9px;font-weight:600;cursor:pointer';
      btn.onclick = () => { modal.style.display = 'none'; };
      actions.appendChild(btn);
    }
    modal.style.display = 'flex';
  };
  const addPreviewNotice = () => {
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    if (!header || !main || document.getElementById('preview-notice')) return;
    const notice = document.createElement('div');
    notice.id = 'preview-notice';
    notice.textContent = 'Pratinjau website · Informasi kedai, foto, rating, harga, jam buka, dan statistik masih berupa contoh. Periksa dan ganti dengan data terverifikasi sebelum dipublikasikan.';
    notice.style.cssText = `background:#fff1cc;color:#684516;text-align:center;padding:8px 16px;font:500 12px/1.5 "Plus Jakarta Sans",sans-serif;position:relative;z-index:20;margin-top:${header.offsetHeight || 64}px`;
    header.insertAdjacentElement('afterend', notice);
    main.style.setProperty('padding-top', '14px', 'important');
  };
  const harmonizeRemainingPages = () => {
    const page = location.pathname.split('/').pop();
    if (page !== 'detail.html' && page !== 'artikel.html') return;
    const style = document.createElement('style');
    style.textContent = `
      body, main { background:#FAFAF9 !important; color:#18181B !important; font-family:"Plus Jakarta Sans",sans-serif !important; }
      header { background:rgba(250,250,249,.94) !important; border-bottom:1px solid rgba(228,228,231,.8) !important; box-shadow:0 2px 12px rgba(24,24,27,.05) !important; }
      h1,h2,h3,h4,.font-headline-sm,.font-headline-md { font-family:"Plus Jakarta Sans",sans-serif !important; }
      .bg-background { background:#FAFAF9 !important; }
      .bg-surface,.bg-surface-container-lowest { background:#fff !important; }
      .bg-surface-container-low { background:#FDF8F3 !important; }
      .bg-surface-container { background:#F0EDF1 !important; }
      .bg-surface-container-high { background:#EAE7EB !important; }
      .text-primary { color:#18181B !important; }
      .text-secondary { color:#9A4C15 !important; }
      .bg-primary,.bg-primary-container { background:#18181B !important; color:#fff !important; }
      .border-outline-variant { border-color:#E2DED9 !important; }
      .rounded-xl { border-radius:16px !important; }
    `;
    document.head.appendChild(style);
  };  const getBookmarkId = btn => {
    const card = btn?.closest('.cafe-card[data-id]');
    if (card) return String(card.dataset.id);
    let node = btn?.parentElement;
    while (node && node !== document.body) {
      const text = node.innerText || '';
      const match = Object.entries(cafes).find(([, name]) => text.toLowerCase().includes(name.toLowerCase()));
      if (match) return match[0];
      node = node.parentElement;
    }
    return null;
  };
  const syncCardBookmarks = () => {
    const saved = favorites();
    document.querySelectorAll('button[aria-label="Simpan Favorit"]').forEach(btn => {
      const icon = btn?.querySelector('.material-symbols-outlined');
      if (!btn || !icon) return;
      const id = getBookmarkId(btn);
      if (!id) return;
      const on = saved.includes(id);
      icon.textContent = on ? 'favorite' : 'favorite_border';
      icon.style.fontVariationSettings = on ? "'FILL' 1" : "'FILL' 0";
      btn.classList.toggle('text-secondary', on);
    });
  };
  const renderFavoritesOnly = () => {
    if (!new URLSearchParams(location.search).has('favorit')) return;
    const saved = favorites();
    const cards = [...document.querySelectorAll('.cafe-card[data-id]')];
    const apply = () => {
      let count = 0;
      cards.forEach(card => {
        const visible = saved.includes(String(card.dataset.id));
        card.classList.toggle('hidden', !visible);
        if (visible) count++;
      });
      const counter = document.getElementById('visibleCardCount');
      if (counter) counter.textContent = String(count);
      const emptyState = document.getElementById('favorites-empty');
      if (emptyState) emptyState.style.display = count ? 'none' : 'block';
    };
    apply();
    document.querySelectorAll('#searchInput,#areaFilter,#priceFilter,.filter-pill').forEach(el => {
      el.addEventListener('input', () => setTimeout(apply, 0));
      el.addEventListener('change', () => setTimeout(apply, 0));
      el.addEventListener('click', () => setTimeout(apply, 0));
    });
    const title = [...document.querySelectorAll('h1,h2')].find(el => /Menampilkan 5 Coffee Shop Terkurasi/i.test(el.textContent));
    if (title) title.textContent = 'Coffee Shop Favoritmu';
    const list = document.getElementById('cardListContainer');
    if (list) {
      const empty = document.createElement('p');
      empty.id = 'favorites-empty';
      empty.textContent = 'Belum ada tempat tersimpan. Tekan ikon hati pada coffee shop untuk menambahkannya ke favorit.';
      empty.style.cssText = 'display:none;padding:24px;background:#f7ece7;border-radius:12px;color:#504442;text-align:center';
      list.prepend(empty);
      apply();
    }
  };
  const setDetailFavorite = state => {
    const btn = document.getElementById('btn-favorite');
    const icon = document.getElementById('fav-icon');
    const label = document.getElementById('fav-text');
    if (!btn || !icon || !label) return;
    icon.style.fontVariationSettings = state ? "'FILL' 1" : "'FILL' 0";
    icon.classList.toggle('text-secondary', state);
    label.textContent = state ? 'Tersimpan di Favorit' : 'Simpan ke Favorit';
    btn.setAttribute('aria-pressed', String(state));
  };
  const setSearch = () => {
    const search = document.querySelector('#hero-search-input');
    const query = document.querySelector('#searchInput');
    const shared = document.querySelector('input[placeholder^="Cari kedai"]');
    const submitSearch = value => goExplore({ q: value.trim() });
    [search, shared, query].filter(Boolean).forEach(input => {
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submitSearch(input.value); } });
    });
    if (shared) {
      const btn = shared.closest('div')?.querySelector('button');
      if (btn) btn.addEventListener('click', () => submitSearch(shared.value));
    }
    window.triggerSearch = () => {
      const term = document.getElementById('hero-search-input')?.value || '';
      const selected = [...document.querySelectorAll('.filter-pill.bg-primary-container')]
        .map(el => el.getAttribute('onclick')?.match(/'([^']+)'/)?.[1]).filter(Boolean).join(',');
      goExplore({ q: term.trim(), category: selected });
    };
  };
  const initExplore = () => {
    if (!document.getElementById('searchInput')) return;
    const params = new URLSearchParams(location.search);
    const search = document.getElementById('searchInput');
    const area = document.getElementById('areaFilter');
    if (search && params.has('q')) { search.value = params.get('q'); search.dispatchEvent(new Event('input', { bubbles: true })); }
    if (area && params.has('area')) { area.value = params.get('area'); area.dispatchEvent(new Event('change', { bubbles: true })); }
    const cat = params.get('category') || '';
    if (cat.includes('24jam')) document.querySelector('[data-filter="late"]')?.click();
    if (cat.includes('nugas')) document.querySelector('[data-filter="nugas"]')?.click();
    if (cat.includes('outdoor')) document.querySelector('[data-filter="outdoor"]')?.click();
    if (cat.includes('hemat')) { const price = document.getElementById('priceFilter'); if (price) { price.value = 'hemat'; price.dispatchEvent(new Event('change', { bubbles: true })); } }
    syncCardBookmarks();
    renderFavoritesOnly();
  };
  const openSuggestion = () => {
    let modal = document.getElementById('suggest-place-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'suggest-place-modal';
      modal.style.cssText = 'position:fixed;inset:0;z-index:999;background:#201b1880;display:none;align-items:center;justify-content:center;padding:20px;font-family:Work Sans,sans-serif';
      modal.innerHTML = '<form style="width:min(480px,100%);background:#fff8f5;padding:24px;border-radius:16px;display:grid;gap:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h2 style="font:600 22px Domine,serif;margin:0">Usulkan coffee shop</h2><button type="button" data-close aria-label="Tutup" style="border:0;background:none;font-size:24px">×</button></div><p style="margin:0;color:#504442;font-size:14px;line-height:1.5">Usulan ini hanya disimpan di browser ini pada versi pratinjau, belum dikirim ke pengelola.</p><label>Nama tempat<input required name="name" style="display:block;width:100%;box-sizing:border-box;padding:10px;margin-top:5px;border:1px solid #d3c3c0;border-radius:8px"></label><label>Area atau alamat<input required name="area" style="display:block;width:100%;box-sizing:border-box;padding:10px;margin-top:5px;border:1px solid #d3c3c0;border-radius:8px"></label><label>Catatan (opsional)<textarea name="notes" rows="3" style="display:block;width:100%;box-sizing:border-box;padding:10px;margin-top:5px;border:1px solid #d3c3c0;border-radius:8px"></textarea></label><button type="submit" style="background:#3e2723;color:white;border:0;border-radius:8px;padding:11px;font-weight:600">Simpan usulan di perangkat ini</button></form>';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('[data-close]')) modal.style.display = 'none'; });
      modal.querySelector('form').addEventListener('submit', async e => {
        e.preventDefault(); const form=e.currentTarget; const data = Object.fromEntries(new FormData(form));
        try {
          if (window.ngopiSupabase?.configured) {
            const {error}=await window.ngopiSupabase.submitSuggestion(data); if(error) throw error;
          } else {
            const rows = read(SUGGESTIONS_KEY, []); rows.push({ ...data, id: 'req-' + Date.now(), status: 'Menunggu', createdAt: new Date().toISOString() }); write(SUGGESTIONS_KEY, rows);
          }
          modal.style.display = 'none'; form.reset(); showModal('Usulan terkirim', window.ngopiSupabase?.configured ? 'Terima kasih! Usulanmu tersimpan di database NgopiMalang dan menunggu moderasi.' : 'Usulan tersimpan di browser ini. Buat dan hubungkan project Supabase agar usulan dibagikan ke admin.');
        } catch (err) { showModal('Belum berhasil mengirim', 'Koneksi database bermasalah. Coba lagi beberapa saat.'); console.error(err); }
      });
    }
    modal.style.display = 'flex';
  };
  const articleModal = anchor => {
    const card = anchor.closest('.article-card') || anchor.closest('article') || anchor.parentElement;
    const title = card?.querySelector('h1,h2,h3,h4')?.textContent?.trim() || 'Panduan NgopiMalang';
    const excerpt = card?.innerText?.replace(/Baca (Rekomendasi|Catatan|Panduan Lengkap).*/s, '').trim() || 'Baca rekomendasi coffee shop pilihan di Kota Malang.';
    showModal(title, excerpt + '\n\nIni adalah pratinjau artikel. Konten contoh perlu dilengkapi dan diverifikasi sebelum situs dipublikasikan.', 'Lihat coffee shop', 'detail.html');
  };
  const initLinks = () => {
    document.querySelectorAll('[data-path]').forEach(a => {
      const key = a.dataset.path;
      if (nav[key]) a.href = nav[key];
      else if (key === 'usulkan-tempat') a.href = '#usulkan-tempat';
    });
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      const key = a.dataset.path;
      if (key === 'usulkan-tempat') { e.preventDefault(); openSuggestion(); return; }
      if (key && nav[key]) { a.href = nav[key]; return; }
      const label = (a.innerText || a.getAttribute('aria-label') || '').trim().toLowerCase();
      if (a.getAttribute('href') === '#' && /detail kedai|detail & menu|detail arrow|lihat detail/.test(label)) { e.preventDefault(); const id = getBookmarkId(a) || '1'; location.href = 'detail.html?cafe=' + encodeURIComponent(id); return; }
      if (a.getAttribute('href') === '#' && /baca rekomendasi|baca catatan|baca panduan lengkap|baca selengkapnya/.test(label)) { e.preventDefault(); articleModal(a); return; }
      if (a.getAttribute('href') === '#' && /lihat peta|petunjuk arah|rute maps|arah/.test(label)) {
        e.preventDefault(); const name = a.closest('.cafe-card')?.querySelector('h2')?.textContent || 'coffee shop Malang';
        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ' Malang'), '_blank', 'noopener');
      }
    });
  };
  const initFavorites = () => {
    syncCardBookmarks();
    const detailId = new URLSearchParams(location.search).get('cafe') || '1';
    setDetailFavorite(favorites().includes(detailId));
    window.toggleFavorite = () => {
      const saved = favorites();
      const on = !saved.includes(detailId);
      write(FAVORITES_KEY, on ? [...saved, detailId] : saved.filter(x => x !== detailId));
      setDetailFavorite(on);
    };
    document.addEventListener('click', e => {
      const btn = e.target.closest('button[aria-label="Simpan Favorit"]');
      const id = getBookmarkId(btn);
      if (!btn || !id) return;
      const saved = favorites();
      const icon = btn.querySelector('.material-symbols-outlined');
      const adding = icon?.textContent.trim() !== 'favorite';
      write(FAVORITES_KEY, adding ? [...new Set([...saved, id])] : saved.filter(x => x !== id));
      setTimeout(() => { syncCardBookmarks(); if (new URLSearchParams(location.search).has('favorit')) renderFavoritesOnly(); renderFavoritePage(); }, 0);
    }, true);
  };
  const initCrowd = () => {
    if (!document.querySelector('[onclick^="submitCrowdVote"]')) return;
    const crowd = document.querySelector('.animate-ping')?.parentElement;
    if (crowd) {
      const badge = crowd.querySelector('span:last-child'); if (badge) badge.textContent = 'Laporan sukarela';
    }
    document.querySelectorAll('h4').forEach(h => { if (h.textContent.trim() === 'Cukup Ramai') h.textContent = 'Belum ada laporan terbaru'; });
    document.querySelectorAll('span').forEach(s => {
      if (s.textContent.trim() === '~65%') s.textContent = '—';
      if (/^8 laporan$/.test(s.textContent.trim())) s.textContent = 'Belum ada laporan bersama';
      if (s.textContent.trim() === '14 menit yang lalu') s.textContent = 'Belum ada laporan';
    });
    document.querySelectorAll('span').forEach(s => { if (s.textContent.includes('Crowd Pulse • Waktu Riil')) s.textContent = 'Crowd Pulse • Pratinjau lokal'; });
    document.querySelectorAll('h4').forEach(h => { if (h.textContent.trim() === 'Pola Keramaian Umum Mingguan') h.textContent = 'Pola keramaian mingguan'; });
    document.querySelectorAll('span').forEach(s => { if (/^(Sepi|Sedang|Ramai) ~\d+%$/.test(s.textContent.trim())) s.textContent = 'Belum cukup data'; });
    document.querySelectorAll('[style*="width: 20%"],[style*="width: 55%"],[style*="width: 85%"]').forEach(el => { el.style.width = '0%'; });
    document.querySelectorAll('span').forEach(s => { if (s.textContent.trim() === 'Berdasarkan 90 Hari') s.textContent = 'Menunggu cukup laporan'; });
    document.querySelectorAll('p').forEach(p => {
      if (p.textContent.includes('100% berasal dari laporan sukarela')) p.textContent = 'Jika fitur laporan dipakai, laporan dikirim secara sukarela. Di pratinjau ini laporan hanya tersimpan pada browser/perangkat yang digunakan, belum dibagikan atau diagregasi.';
    });
    const notice = document.createElement('p');
    notice.textContent = 'Laporan hanya disimpan di browser/perangkat ini. Pengunjung lain belum dapat melihatnya sampai tersedia backend bersama.';
    notice.style.cssText = 'font:12px/1.5 "Work Sans",sans-serif;color:#504442;background:#f7ece7;border-radius:8px;padding:9px 11px;margin:10px 0 0';
    const voteButtons = document.querySelector('[onclick^="submitCrowdVote"]')?.parentElement?.parentElement;
    voteButtons?.appendChild(notice);
    window.submitCrowdVote = async status => {
      try {
      if (window.ngopiSupabase?.configured) { const {error}=await window.ngopiSupabase.submitCrowdReport({shop:'Bataputih Coffee & Space',level:status}); if(error) throw error; }
      else { const rows = read(REPORTS_KEY, []); rows.push({ id: 'crowd-' + Date.now(), cafeId: '1', status, createdAt: new Date().toISOString() }); write(REPORTS_KEY, rows.slice(-100)); }
      document.querySelectorAll('h4').forEach(h => { if (/Belum ada laporan terbaru|Laporan Anda:/.test(h.textContent)) h.textContent = 'Laporan Anda: ' + status; });
      const updated = document.getElementById('last-updated-text'); if (updated) updated.textContent = 'Baru saja · di perangkat ini';
      const toast = document.getElementById('vote-toast');
      if (toast) { toast.classList.remove('hidden'); toast.classList.add('flex'); const p = toast.querySelector('p'); if (p) p.textContent = window.ngopiSupabase?.configured ? 'Terima kasih! Laporan tersimpan di database dan dapat dilihat admin.' : 'Terima kasih! Laporan tersimpan di perangkat ini; hubungkan Supabase agar dibagikan.'; setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('flex'); }, 5000); }
      } catch(err) { console.error(err); showModal('Belum berhasil mengirim', 'Laporan gagal dikirim ke database. Coba lagi.'); }
    };
  };
  const initForms = () => {
    let selectedCrowdLevel = '';
    document.querySelectorAll('#report-modal button').forEach(btn => {
      const level=(btn.innerText||'').trim();
      if(!['Sepi','Sedang','Ramai'].includes(level)) return;
      btn.addEventListener('click',()=>{selectedCrowdLevel=level;document.querySelectorAll('#report-modal button[aria-pressed="true"]').forEach(x=>x.setAttribute('aria-pressed','false'));btn.setAttribute('aria-pressed','true');});
    });
    window.submitCorrection = async e => {
      e.preventDefault(); const form = e.currentTarget;
      const values=Object.fromEntries(new FormData(form));
      try { if(window.ngopiSupabase?.configured){const {error}=await window.ngopiSupabase.submitCorrection({shop:values.shop||values.name,message:JSON.stringify(values)});if(error)throw error;} else {const rows = read(CORRECTIONS_KEY, []); rows.push({ id: 'cor-' + Date.now(), values, status: 'Menunggu', createdAt: new Date().toISOString() }); write(CORRECTIONS_KEY, rows);} }
      catch(err){console.error(err);showModal('Belum berhasil mengirim','Koreksi gagal dikirim ke database. Coba lagi.');return;}
      if (typeof window.closeCorrectionModal === 'function') window.closeCorrectionModal();
      showModal('Koreksi terkirim', window.ngopiSupabase?.configured ? 'Terima kasih, koreksi tersimpan di database dan menunggu ditinjau.' : 'Koreksi tersimpan di browser ini. Hubungkan Supabase agar admin dapat menerimanya.');
    };
    window.submitReportModal = async () => {
      const modal = document.getElementById('report-modal');
      const val = selectedCrowdLevel;
      if(!val){showModal('Pilih kondisi dulu','Pilih Sepi, Sedang, atau Ramai sebelum mengirim laporan.');return;}
      const shop=modal?.querySelector('select')?.value?.replace(/\s*\([^)]*\)\s*$/,'')||'Coffee shop Malang';
      try { if(window.ngopiSupabase?.configured){const {error}=await window.ngopiSupabase.submitCrowdReport({shop,level:val});if(error)throw error;} else {const rows = read(REPORTS_KEY, []); rows.push({ id: 'crowd-' + Date.now(), cafeId: '1', shop, status: val, createdAt: new Date().toISOString() }); write(REPORTS_KEY, rows);} }
      catch(err){console.error(err);showModal('Belum berhasil mengirim','Laporan gagal dikirim ke database. Coba lagi.');return;}
      if (typeof window.closeReportModal === 'function') window.closeReportModal();
      showModal('Laporan terkirim', window.ngopiSupabase?.configured ? 'Laporan tersimpan di database bersama.' : 'Status tersimpan di browser ini. Hubungkan Supabase agar laporan dibagikan.');
    };
    window.handleNewsletter = e => { e.preventDefault(); showModal('Pratinjau saja', 'Formulir buletin belum terhubung ke layanan email, jadi alamat tidak dikirim atau disimpan.'); };
    document.querySelectorAll('[data-correction]').forEach(btn => btn.addEventListener('click', () => {
      const note = window.prompt('Apa informasi yang perlu dikoreksi?');
      if (!note || !note.trim()) return;
      try { if(window.ngopiSupabase?.configured){const {error}=await window.ngopiSupabase.submitCorrection({message:note.trim()});if(error)throw error;} else {const rows = read(CORRECTIONS_KEY, []); rows.push({ id: 'cor-' + Date.now(), note:note.trim(), status: 'Menunggu', createdAt:new Date().toISOString() }); write(CORRECTIONS_KEY, rows);} showModal('Koreksi terkirim', window.ngopiSupabase?.configured?'Koreksi tersimpan di database dan menunggu ditinjau.':'Catatan tersimpan di browser ini. Hubungkan Supabase agar admin dapat menerimanya.'); }
      catch(err){console.error(err);showModal('Belum berhasil mengirim','Koreksi gagal dikirim ke database. Coba lagi.');}
    }));
    document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', async () => {
      const url = location.href;
      try { if (navigator.share) await navigator.share({title:document.title,url}); else { await navigator.clipboard.writeText(url); showModal('Tautan disalin', 'Tautan halaman tersalin ke clipboard.'); } } catch {}
    }));
  };
  const cafeData = {
    '1': { name:'Bataputih Space & Roastery', area:'Lowokwaru', rating:'4,9', price:'Rp 22.000–38.000 / orang', address:'Jl. Puncak Borobudur, Lowokwaru, Kota Malang', hours:'08.00–23.30 WIB (contoh)', image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85', map:'Bataputih Space and Roastery Malang' },
    '2': { name:'Rumah Opa Heritage Cafe', area:'Klojen', rating:'4,7', price:'Rp 20.000–35.000 / orang', address:'Klojen, Kota Malang', hours:'10.00–01.00 WIB (contoh)', image:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85', map:'Rumah Opa Heritage Cafe Malang' },
    '3': { name:'Kopi Titik Koma Soehat', area:'Lowokwaru', rating:'4,8', price:'Rp 18.000–28.000 / orang', address:'Jl. Soekarno Hatta, Lowokwaru, Kota Malang', hours:'07.00–22.00 WIB (contoh)', image:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85', map:'Kopi Titik Koma Soehat Malang' },
    '4': { name:'Nakoa Cafe Borobudur', area:'Blimbing', rating:'4,6', price:'Rp 15.000–26.000 / orang', address:'Blimbing, Kota Malang', hours:'24 jam (contoh)', image:'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1200&q=85', map:'Nakoa Cafe Borobudur Malang' },
    '5': { name:'Maha Kopi Kebun', area:'Dau, Kabupaten Malang', rating:'4,8', price:'Rp 20.000–32.000 / orang', address:'Dau, Kabupaten Malang (di luar Kota Malang)', hours:'09.00–22.00 WIB (contoh)', image:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85', map:'Maha Kopi Kebun Dau Malang' }
  };
  const articleData = {
    nugas: { category:'Tempat nugas', title:'7 coffee shop ramah nugas di sekitar kampus UB & UM', intro:'Cara memilih tempat belajar yang nyaman: periksa fasilitas, suasana, akses, dan kisaran harga sebelum berangkat.', date:'Panduan kurasi · konten contoh', read:'5 menit baca', image:'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85', paragraphs:['Pilih tempat dengan meja yang cukup untuk perangkat dan catatanmu. Ketersediaan stopkontak dan tingkat kebisingan bisa berbeda menurut area dan waktu kunjungan.', 'Tanyakan atau cek kanal resmi coffee shop untuk informasi Wi-Fi, jam buka, dan kebijakan penggunaan ruang. Pertimbangkan juga untuk memesan menu selama bekerja di tempat.', 'Daftar lokasi dalam panduan ini adalah contoh prototipe. Kami akan menggantinya dengan rekomendasi yang sudah dicek langsung dan mencantumkan tanggal pembaruan.'] },
    '24jam': { category:'Buka malam', title:'Tempat ngopi sampai larut di Malang', intro:'Rencanakan kunjungan malam dengan memeriksa jam operasional dan akses pulang terlebih dahulu.', date:'Panduan kurasi · konten contoh', read:'4 menit baca', image:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85', paragraphs:['Jam buka dapat berubah pada hari libur atau karena kebijakan kedai. Pastikan memeriksa akun resmi atau menghubungi tempat sebelum datang.', 'Untuk kunjungan malam, perhatikan transportasi pulang, pencahayaan area, dan ketersediaan tempat duduk.'] },
    budget: { category:'Harga terjangkau', title:'Ngopi enak dengan budget mahasiswa', intro:'Bandingkan kisaran harga minuman dan camilan supaya pilihan tempat sesuai anggaran.', date:'Panduan kurasi · konten contoh', read:'4 menit baca', image:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85', paragraphs:['Kisaran harga di direktori sebaiknya diberi tanggal pengecekan karena menu dan harga bisa berubah.', 'Periksa menu terbaru sebelum berkunjung. Harga yang ditampilkan di prototipe ini hanya contoh dan belum diverifikasi.'] },
    outdoor: { category:'Outdoor', title:'Tempat ngopi dengan halaman hijau', intro:'Cari area teduh, perhatikan cuaca, dan cek fasilitas luar ruang sebelum memilih tempat.', date:'Panduan kurasi · konten contoh', read:'5 menit baca', image:'https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=1200&q=85', paragraphs:['Area outdoor cocok untuk suasana santai, tetapi kenyamanan bergantung pada cuaca, waktu, dan kondisi tempat.', 'Periksa foto terbaru dan tanyakan apakah area luar tersedia saat kamu berkunjung.'] },
    heritage: { category:'Heritage', title:'Menelusuri kedai kopi bernuansa klasik di Klojen', intro:'Jelajahi suasana bangunan dan sudut kota lama sambil mengenal kultur ngopi Malang.', date:'Panduan kurasi · konten contoh', read:'6 menit baca', image:'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85', paragraphs:['Kawasan Klojen memiliki banyak sudut kota dengan karakter bangunan yang beragam. Gunakan peta untuk merencanakan rute dan cek jam buka tiap tempat.', 'Hormati aturan lokasi dan privasi pengunjung ketika mengambil foto.'] },
    etika: { category:'Etika ngopi', title:'Berapa lama nyaman nugas di coffee shop?', intro:'Panduan sederhana menghargai ruang, barista, dan pengunjung lain saat bekerja dari kedai.', date:'Panduan kurasi · konten contoh', read:'4 menit baca', image:'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=85', paragraphs:['Pesan menu, pilih meja sesuai kebutuhan, dan beri ruang bagi pengunjung lain saat kedai ramai.', 'Jika bekerja cukup lama, tanyakan kebijakan kedai mengenai penggunaan meja dan stopkontak.'] }
  };
  const renderDetailPage = () => {
    if (!document.querySelector('[data-cafe-name]')) return;
    const id = new URLSearchParams(location.search).get('cafe') || '1';
    const cafe = cafeData[id] || cafeData['1'];
    document.querySelectorAll('[data-cafe-name]').forEach(el => el.textContent = cafe.name);
    document.querySelectorAll('[data-cafe-area]').forEach(el => el.textContent = cafe.area);
    document.querySelectorAll('[data-cafe-rating]').forEach(el => el.textContent = cafe.rating);
    document.querySelectorAll('[data-cafe-price]').forEach(el => el.textContent = cafe.price);
    document.querySelectorAll('[data-cafe-address]').forEach(el => el.textContent = cafe.address);
    document.querySelectorAll('[data-cafe-hours]').forEach(el => el.textContent = cafe.hours);
    document.querySelectorAll('[data-cafe-cover]').forEach(el => el.src = cafe.image);
    document.querySelectorAll('[data-maps-link]').forEach(el => el.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(cafe.map));
    document.title = cafe.name + ' — NgopiMalang';
    if (id !== '1') {
      const columns = document.querySelector('.ng-detail-columns');
      const left = columns?.firstElementChild;
      if (left) left.innerHTML = '<section class="ng-card ng-panel"><h2>Profil singkat</h2><p class="ng-muted">Informasi dasar ini adalah konten contoh. Profil fasilitas, menu, alamat rinci, dan jam buka tempat ini belum tersedia untuk diverifikasi.</p><a class="ng-button secondary" href="jelajahi.html">Kembali ke direktori</a></section>';
    }
  };
  const renderFavoritePage = () => {
    const grid = document.getElementById('favoriteGrid');
    if (!grid) return;
    const saved = favorites();
    const listed = saved.map(id => ({ id, cafe:cafeData[id] })).filter(row => row.cafe);
    document.getElementById('favorite-empty').style.display = listed.length ? 'none' : 'block';
    grid.innerHTML = listed.map(({id,cafe}) => `<article class="ng-card ng-favorite cafe-card" data-id="${id}"><img src="${cafe.image}" alt="${cafe.name}"><button type="button" aria-label="Simpan Favorit" style="position:absolute;right:12px;top:12px;border:0;background:#fff;border-radius:50%;width:38px;height:38px;cursor:pointer;color:#9a4c15"><span class="material-symbols-outlined">favorite</span></button><div class="ng-favorite-body"><span class="ng-kicker">${cafe.area}</span><h2>${cafe.name}</h2><div class="ng-muted" style="font-size:12px">★ ${cafe.rating}　·　${cafe.price}</div><a class="ng-read" href="detail.html?cafe=${id}">Lihat detail　→</a></div></article>`).join('');
  };
  const initArticleFilters = () => {
    const filters = document.querySelectorAll('[data-category]');
    if (!filters.length) return;
    filters.forEach(btn => btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      filters.forEach(other => other.classList.toggle('active', other === btn));
      document.querySelectorAll('#articles-list [data-cat]').forEach(card => { card.style.display = category === 'all' || card.dataset.cat === category ? '' : 'none'; });
    }));
  };
  const renderArticlePage = () => {
    if (!document.getElementById('articleTitle')) return;
    const key = new URLSearchParams(location.search).get('id') || 'nugas';
    const article = articleData[key] || articleData.nugas;
    document.title = article.title + ' — NgopiMalang';
    document.getElementById('articleCategory').textContent = article.category;
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleIntro').textContent = article.intro;
    document.getElementById('articleDate').textContent = article.date;
    document.getElementById('articleRead').textContent = article.read;
    document.getElementById('articleCover').src = article.image;
    const body = document.getElementById('articleBody'); body.replaceChildren();
    article.paragraphs.forEach(text => { const p = document.createElement('p'); p.textContent = text; body.appendChild(p); });
  };
  const init = () => {
    harmonizeRemainingPages();
    addPreviewNotice();
    initLinks();
    renderDetailPage();
    renderFavoritePage();
    initArticleFilters();
    renderArticlePage();
    setSearch();
    initFavorites();
    initExplore();
    initCrowd();
    initForms();
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const search = document.getElementById('searchInput');
    if (q && search && !search.value) { search.value = q; search.dispatchEvent(new Event('input', { bubbles: true })); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();





