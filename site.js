(() => {
  'use strict';
  const FAVORITES_KEY = 'ngopimalang:favorites:v1';
  const db = window.ngopiSupabase;
  let shops = [];
  let articles = [];
  let shopPhotos = [];
  let ratings = new Map();
  let crowd = new Map();
  let currentMap;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const favoriteIds = () => { try { const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'); return Array.isArray(value) ? value.map(String) : []; } catch { return []; } };
  const saveFavorites = ids => localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids.map(String))]));
  const money = value => value || 'Harga belum diisi';
  const mapQuery = shop => [shop.name, shop.address, shop.area, 'Malang'].filter(Boolean).join(', ');
  const mapsUrl = shop => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(shop))}`;
  const ratingFor = id => ratings.get(String(id));
  const crowdFor = id => crowd.get(String(id));
  const shortDate = value => value ? new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value)) : '';
  const showNotice = (message, kind = 'info') => {
    let el = $('#dataNotice');
    if (!el) { el = document.createElement('div'); el.id='dataNotice'; el.setAttribute('role','status'); el.style.cssText='position:relative;z-index:5;margin:12px auto;padding:12px 16px;max-width:1240px;border-radius:10px;font:13px/1.5 "Plus Jakarta Sans",sans-serif'; document.querySelector('main')?.prepend(el); }
    el.textContent=message; el.style.background=kind==='error'?'#fff0ed':'#f2f6f1'; el.style.color=kind==='error'?'#8c2f23':'#345b43';
  };
  const announce = (title, text) => {
    let modal=$('#ngopi-site-modal');
    if(!modal){modal=document.createElement('div');modal.id='ngopi-site-modal';modal.style.cssText='position:fixed;inset:0;z-index:1000;background:#201b1880;display:none;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif';modal.innerHTML='<section role="dialog" aria-modal="true" aria-labelledby="siteModalTitle" style="width:min(480px,100%);background:white;color:#201b18;border-radius:16px;padding:24px;box-shadow:0 20px 60px #201b1840"><button type="button" data-close aria-label="Tutup" style="float:right;border:0;background:transparent;font-size:24px;cursor:pointer">×</button><h2 id="siteModalTitle" style="font-size:22px;margin:4px 34px 12px 0"></h2><p data-message style="font-size:14px;line-height:1.65"></p><button type="button" data-close style="background:#315c48;color:white;padding:10px 16px;border:0;border-radius:8px;font-weight:700;cursor:pointer">Mengerti</button></section>';document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))modal.style.display='none';});document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.style.display='none';});}
    $('#siteModalTitle',modal).textContent=title; $('[data-message]',modal).textContent=text; modal.style.display='flex';
  };
  const emptyState = (title, body, icon='local_cafe') => `<div class="ng-card ng-empty" style="grid-column:1/-1;padding:32px;text-align:center"><span class="material-symbols-outlined" aria-hidden="true" style="font-size:38px;color:#8b684e">${icon}</span><h2>${escapeHTML(title)}</h2><p class="ng-muted">${escapeHTML(body)}</p></div>`;
  const areaKey = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
  const priceBucket = value => {
    const nums=String(value||'').replace(/\./g,'').match(/\d+/g)?.map(Number)||[];
    if(!nums.length)return 'unknown'; const max=Math.max(...nums); return max<20000?'hemat':max<=40000?'menengah':'premium';
  };
  const crowdInfo = shop => {
    const row=crowdFor(shop.id); if(!row)return {label:'Belum ada laporan baru',key:'nodata',meta:'Laporan 2 jam terakhir'};
    const label=row.level||'Belum ada laporan baru'; return {label,key:label.toLowerCase(),meta:`${row.report_count||0} laporan · ${shortDate(row.latest_at)}`};
  };
  const shopCard = (shop, compact = false) => {
    const id=String(shop.id), average=ratingFor(id), report=crowdInfo(shop), image=shop.image_url;
    const cardClass=compact?'flex flex-col bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-all group':'cafe-card group relative bg-white border border-zinc-200 rounded-2xl p-4 transition-all hover:shadow-md';
    return `<article class="${compact?'':'flex flex-col sm:flex-row'} ${cardClass}" data-id="${escapeHTML(id)}" data-area="${escapeHTML(areaKey(shop.area))}" data-price="${priceBucket(shop.price_range)}" data-crowd="${report.key}" data-features="${escapeHTML((shop.features||[]).join(' ').toLowerCase())}" data-search="${escapeHTML((shop.name+' '+shop.area+' '+(shop.address||'')).toLowerCase())}" ${shop.latitude!=null?`data-lat="${Number(shop.latitude)}"`:''} ${shop.longitude!=null?`data-lng="${Number(shop.longitude)}"`:''}>
      <div class="${compact?'aspect-[16/10]':'w-full sm:w-56 aspect-[16/10]'} overflow-hidden rounded-xl bg-zinc-100 relative">${image?`<img class="w-full h-full object-cover" src="${escapeHTML(image)}" alt="Foto ${escapeHTML(shop.name)}" loading="lazy">`:'<div class="w-full h-full grid place-items-center text-zinc-400"><span class="material-symbols-outlined" aria-hidden="true" style="font-size:42px">local_cafe</span></div>'}<button type="button" class="favorite-toggle absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-zinc-200 shadow-sm" aria-label="Simpan ke favorit" aria-pressed="${favoriteIds().includes(id)}" data-favorite="${escapeHTML(id)}"><span class="material-symbols-outlined">${favoriteIds().includes(id)?'favorite':'favorite_border'}</span></button></div>
      <div class="${compact?'p-4':'flex-1 min-w-0 pt-3 sm:pt-0 sm:pl-4'}"><div class="text-xs text-zinc-500 flex justify-between gap-2"><span>${escapeHTML(shop.area)}, Malang</span><span>★ ${average?average.avg.toFixed(1):'—'}${average?` (${average.count})`:''}</span></div><h2 class="font-bold text-zinc-900 mt-1">${escapeHTML(shop.name)}</h2><p class="text-xs text-zinc-600 mt-1">${escapeHTML(money(shop.price_range))}</p><p class="text-xs text-zinc-500 mt-1 line-clamp-2">${escapeHTML(shop.description||shop.address||'Informasi tempat belum dilengkapi.')}</p><div class="flex items-center justify-between gap-2 mt-3"><span class="text-xs text-zinc-600">${escapeHTML(report.label)}</span><a class="px-3 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold" href="detail.html?cafe=${encodeURIComponent(id)}">Lihat detail</a></div></div></article>`;
  };
  const articleCategoryKey = article => { const value=(article.category+' '+article.title).toLowerCase(); if(/nugas|kampus/.test(value))return 'nugas';if(/malam|24.?jam|nokturnal/.test(value))return '24jam';if(/budget|hemat|harga|terjangkau/.test(value))return 'budget';if(/outdoor|alam|kebun/.test(value))return 'outdoor';if(/heritage|klasik|klojen/.test(value))return 'heritage';return 'all'; };
  const articleCard = article => `<article class="ng-card ng-article" data-cat="${articleCategoryKey(article)}"><a href="artikel-detail.html?id=${encodeURIComponent(article.slug)}" class="ng-article-link" style="color:inherit;text-decoration:none"><div style="aspect-ratio:16/10;background:#f0eeea;overflow:hidden">${article.image_url?`<img src="${escapeHTML(article.image_url)}" alt="Sampul ${escapeHTML(article.title)}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`:'<div style="height:100%;display:grid;place-items:center;color:#8a755e"><span class="material-symbols-outlined" style="font-size:42px">auto_stories</span></div>'}</div><div class="ng-article-content"><span class="ng-kicker">${escapeHTML(article.category||'Panduan lokal')}</span><h2>${escapeHTML(article.title)}</h2><p>${escapeHTML(article.summary||'Baca panduan lokal NgopiMalang.')}</p><span class="ng-read">Baca artikel →</span></div></a></article>`;
  const fillArticles = (container, rows, limit) => {
    if(!container)return; const list=(limit?rows.slice(0,limit):rows); container.replaceChildren();
    if(!list.length){container.innerHTML=emptyState('Belum ada artikel terbit','Artikel yang diterbitkan admin akan tampil di sini.','auto_stories');return;}
    container.innerHTML=list.map(articleCard).join('');
  };
  const fillShopGrid = (container, rows) => {
    if(!container)return;container.replaceChildren();container.innerHTML=rows.length?rows.map(shop=>shopCard(shop,true)).join(''):emptyState('Belum ada kedai terbit','Kedai yang disetujui admin akan tampil di sini.');
  };
  const initNavigation = () => {
    const nav={beranda:'index.html',jelajahi:'jelajahi.html','artikel-panduan':'artikel.html',favorit:'favorit.html','jelajahi-klojen':'jelajahi.html?area=klojen','jelajahi-lowokwaru':'jelajahi.html?area=lowokwaru','jelajahi-sukun':'jelajahi.html?area=sukun','jelajahi-blimbing':'jelajahi.html?area=blimbing','jelajahi-kedungkandang':'jelajahi.html?area=kedungkandang','etika-review':'artikel.html',faq:'artikel.html'};
    $$('[data-path]').forEach(link=>{const key=link.dataset.path;if(nav[key])link.href=nav[key];else if(key==='usulkan-tempat')link.href='#usulkan-tempat';});
    $$('[data-path="usulkan-tempat"]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();openSuggestion();}));
    $$('[data-share]').forEach(btn=>btn.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:document.title,url:location.href});else{await navigator.clipboard.writeText(location.href);announce('Tautan disalin','Tautan halaman sudah disalin.');}}catch{}}));
  };
  const openSuggestion = () => {
    let modal=$('#suggest-place-modal');
    if(!modal){modal=document.createElement('div');modal.id='suggest-place-modal';modal.style.cssText='position:fixed;inset:0;z-index:999;background:#201b1880;display:none;align-items:center;justify-content:center;padding:20px';modal.innerHTML='<form style="width:min(480px,100%);max-height:90vh;overflow:auto;background:white;padding:24px;border-radius:16px;display:grid;gap:12px"><div style="display:flex;justify-content:space-between"><h2>Usulkan coffee shop</h2><button type="button" data-close aria-label="Tutup">×</button></div><p>Usulan masuk ke antrian admin setelah dikirim.</p><label>Nama tempat<input required name="name" minlength="2" maxlength="120"></label><label>Area<select required name="area"><option value="">Pilih area</option><option>Klojen</option><option>Lowokwaru</option><option>Blimbing</option><option>Sukun</option><option>Kedungkandang</option></select></label><label>Alamat atau catatan<textarea name="notes" maxlength="1500" rows="3"></textarea></label><label>Nama pengusul (opsional)<input name="submitter" maxlength="100"></label><button type="submit">Kirim usulan</button><p data-form-status role="status"></p></form>';document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal||e.target.closest('[data-close]'))modal.style.display='none';});modal.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,status=$('[data-form-status]',form),button=$('button[type="submit"]',form);button.disabled=true;status.textContent='Mengirim…';try{if(!db?.configured)throw new Error('Koneksi database belum tersedia. Coba muat ulang halaman.');const values=Object.fromEntries(new FormData(form));const {error}=await db.submitSuggestion(values);if(error)throw error;form.reset();modal.style.display='none';announce('Usulan terkirim','Terima kasih. Usulan tempat sudah masuk ke antrian admin.');}catch(err){status.textContent=err.message||'Usulan gagal dikirim. Coba lagi.';}finally{button.disabled=false;}});}
    modal.style.display='flex';$('input[name="name"]',modal).focus();
  };
  const renderExplore = () => {
    const list=$('#cardListContainer'); if(!list)return;
    list.innerHTML=shops.length?shops.map(shop=>shopCard(shop)).join(''):emptyState('Belum ada coffee shop terdaftar','Tempat yang disetujui admin akan muncul di sini. Kamu bisa mengirim usulan lewat tombol “Usulkan tempat”.');
    const count=$('#visibleCardCount'); if(count)count.textContent=String(shops.length);
    const params=new URLSearchParams(location.search), search=$('#searchInput'), area=$('#areaFilter'), price=$('#priceFilter'), sort=$('#sortSelect');
    if(params.has('q')&&search)search.value=params.get('q');
    if(params.has('area')&&area){const key=areaKey(params.get('area'));area.value=[...area.options].find(o=>areaKey(o.value)===key)?.value||'semua';}
    if(params.has('price')&&price)price.value=params.get('price');
    let userCoords=null;
    const filter=()=>{
      const query=(search?.value||'').trim().toLowerCase(), selectedArea=areaKey(area?.value||'semua'), selectedPrice=price?.value||'semua';
      const activeFilters=$$('.filter-pill.active-pill').map(btn=>btn.dataset.filter);
      let rows=shops.filter(s=>{const report=crowdFor(s.id), crowdKey=(report?.level||'').toLowerCase(), bucket=priceBucket(s.price_range),features=(s.features||[]).join(' ').toLowerCase(),hours=(s.opening_hours||'').toLowerCase();const matches={quiet:crowdKey==='sepi'||crowdKey==='sedang',wifi:/wi.?fi/.test(features),power:/colokan|stopkontak/.test(features),nugas:/nugas|belajar|kerja/.test(features),late:/24\s*jam|hingga larut|sampai malam/.test(hours+' '+features),outdoor:/outdoor|teras|taman|kebun/.test(features)};return (!query||(s.name+' '+s.area+' '+(s.address||'')+' '+(s.description||'')+' '+hours+' '+(s.price_range||'')+' '+features).toLowerCase().includes(query))&&(selectedArea==='semua'||selectedArea===areaKey(s.area))&&(selectedPrice==='semua'||selectedPrice===bucket)&&activeFilters.every(key=>matches[key]);});
      if(sort?.value==='rating')rows.sort((a,b)=>(ratingFor(b.id)?.avg||0)-(ratingFor(a.id)?.avg||0));
      if(sort?.value==='termurah')rows.sort((a,b)=>{const low=value=>Number((String(value||'').match(/\d+/)||[])[0])||Infinity;return low(a.price_range)-low(b.price_range);});
      if(sort?.value==='tersepi'){const rank=v=>v==='Sepi'?0:v==='Sedang'?1:v==='Ramai'?2:3;rows.sort((a,b)=>rank(crowdFor(a.id)?.level)-rank(crowdFor(b.id)?.level));}
      if(sort?.value==='terdekat'&&userCoords){const distance=s=>{if(!hasCoordinates(s))return Infinity;const rad=x=>x*Math.PI/180,lat1=rad(userCoords.latitude),lat2=rad(Number(s.latitude)),dlat=lat2-lat1,dlon=rad(Number(s.longitude)-userCoords.longitude);return 6371*2*Math.asin(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2));};rows.sort((a,b)=>distance(a)-distance(b));}
      list.innerHTML=rows.length?rows.map(s=>shopCard(s)).join(''):emptyState('Tidak ada hasil yang cocok','Coba ubah kata kunci atau filter yang dipilih.','search_off');
      if(count)count.textContent=String(rows.length); mapMarkers(rows);
    };
    [search,area,price,sort].filter(Boolean).forEach(el=>el.addEventListener('input',filter));[area,price].filter(Boolean).forEach(el=>el.addEventListener('change',filter));sort?.addEventListener('change',()=>{if(sort.value==='terdekat'&&!userCoords){if(!navigator.geolocation){announce('Lokasi tidak tersedia','Browser ini tidak mendukung fitur lokasi.');return;}navigator.geolocation.getCurrentPosition(pos=>{userCoords={latitude:pos.coords.latitude,longitude:pos.coords.longitude};filter();},()=>{sort.value='rekomendasi';announce('Izin lokasi diperlukan','Izinkan lokasi untuk mengurutkan kedai berdasarkan jarak.');});}else filter();});
    $$('.filter-pill').forEach(btn=>btn.addEventListener('click',()=>{btn.classList.toggle('active-pill');filter();}));
    $('#resetFiltersBtn')?.addEventListener('click',()=>{if(search)search.value='';if(area)area.value='semua';if(price)price.value='semua';if(sort)sort.value='rekomendasi';$$('.filter-pill').forEach(x=>x.classList.remove('active-pill'));filter();});
    $('#clearSearchBtn')?.addEventListener('click',()=>{if(search){search.value='';filter();search.focus();}});
    $('#loadMoreBtn')?.remove();
    const split=$('#viewSplitBtn'), listBtn=$('#viewListBtn'), mapBtn=$('#viewMapBtn'), panelList=$('#panelList'), panelMap=$('#panelMap');
    const setView=mode=>{if(!panelList||!panelMap)return;panelList.style.display=mode==='map'?'none':'';panelMap.style.display=mode==='list'?'none':'';if(mode==='list')panelList.className='col-span-12 flex flex-col gap-4 max-w-4xl mx-auto w-full';else if(mode==='map')panelMap.className='col-span-12 h-[calc(100vh-10rem)] rounded-2xl overflow-hidden border';else{panelList.className='lg:col-span-7 flex flex-col gap-4';panelMap.className='lg:col-span-5 sticky top-28 h-[calc(100vh-8.5rem)] rounded-2xl overflow-hidden border';}currentMap?.invalidateSize();};
    split?.addEventListener('click',()=>setView('split'));listBtn?.addEventListener('click',()=>setView('list'));mapBtn?.addEventListener('click',()=>setView('map'));
    initMap();
    $('#myLocationBtn')?.addEventListener('click',()=>{if(!navigator.geolocation){announce('Lokasi tidak tersedia','Browser ini tidak mendukung fitur lokasi.');return;}navigator.geolocation.getCurrentPosition(pos=>{currentMap?.setView([pos.coords.latitude,pos.coords.longitude],15);},()=>announce('Izin lokasi diperlukan','Izinkan akses lokasi pada browser untuk melihat posisimu di peta.'));});
    filter();
  };
  let markerLayer;
  const hasCoordinates = shop => shop.latitude !== null && shop.latitude !== undefined && shop.latitude !== '' && shop.longitude !== null && shop.longitude !== undefined && shop.longitude !== '' && Number.isFinite(Number(shop.latitude)) && Number.isFinite(Number(shop.longitude));
  const initMap = () => {
    const mapEl=$('#mapStage');if(!mapEl)return;if(!window.L){mapEl.textContent='Peta tidak dapat dimuat. Buka detail kedai untuk melihat petunjuk arah di Google Maps.';mapEl.classList.add('grid','place-items-center','p-8','text-center','text-sm');return;}
    mapEl.replaceChildren();mapEl.classList.remove('relative');mapEl.style.cssText='height:100%;min-height:420px;width:100%;';
    currentMap=L.map(mapEl,{scrollWheelZoom:false}).setView([-7.9666,112.6326],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(currentMap);
    markerLayer=L.layerGroup().addTo(currentMap);mapMarkers(shops);
  };
  const mapMarkers = rows => {
    if(!currentMap||!markerLayer)return;markerLayer.clearLayers();
    const located=rows.filter(hasCoordinates);let notice=$('[data-map-notice]');if(!located.length){if(!notice){notice=document.createElement('div');notice.dataset.mapNotice='';notice.className='absolute top-3 left-1/2 -translate-x-1/2 z-[500] max-w-[90%] rounded-lg bg-white/95 border border-zinc-200 px-3 py-2 text-xs text-zinc-700 shadow';notice.textContent='Belum ada koordinat kedai. Petunjuk arah tersedia di detail tiap tempat.';$('#mapStage')?.appendChild(notice);}}else notice?.remove();
    located.forEach(shop=>{
      const marker=L.marker([Number(shop.latitude),Number(shop.longitude)]).addTo(markerLayer);
      const popup=document.createElement('div'), title=document.createElement('strong'), info=document.createElement('p'), link=document.createElement('a');title.textContent=shop.name;info.textContent=`${shop.area} · ${ratingFor(shop.id)?ratingFor(shop.id).avg.toFixed(1)+' ★':'Belum ada rating'}`;link.href=`detail.html?cafe=${encodeURIComponent(shop.id)}`;link.textContent='Lihat detail';popup.append(title,info,link);marker.bindPopup(popup);
      marker.on('click',()=>{const card=$(`.cafe-card[data-id="${CSS.escape(String(shop.id))}"]`);card?.scrollIntoView({behavior:'smooth',block:'center'});});
    });
    if(located.length>1){const points=located.map(s=>[Number(s.latitude),Number(s.longitude)]);currentMap.fitBounds(points,{padding:[24,24],maxZoom:14});}
  };
  const refreshRatings = async () => {
    if(!shops.length)return;
    const result=await db.listPublicReviews();
    if(result.error)throw result.error;ratings=new Map();
    (result.data||[]).forEach(review=>{const key=String(review.shop_id),prev=ratings.get(key)||{sum:0,count:0};prev.sum+=Number(review.rating)||0;prev.count++;ratings.set(key,prev);});
    ratings.forEach(value=>value.avg=value.sum/value.count);
  };
  const renderDetail = async () => {
    const name=$('[data-cafe-name]');if(!name)return;
    const id=new URLSearchParams(location.search).get('cafe');const shop=shops.find(s=>String(s.id)===String(id));
    if(!shop){const main=$('main');if(main)main.innerHTML=`<div class="ng-container">${emptyState('Coffee shop tidak ditemukan','Tempat ini mungkin belum disetujui, sudah dihapus, atau tautannya tidak benar.')}<a class="ng-button" href="jelajahi.html">Kembali ke jelajahi</a></div>`;return;}
    document.title=`${shop.name} — NgopiMalang`;
    $$('[data-cafe-name]').forEach(el=>el.textContent=shop.name);$$('[data-cafe-area]').forEach(el=>el.textContent=`${shop.area}, Malang`);$$('[data-cafe-rating]').forEach(el=>el.textContent=ratingFor(shop.id)?ratingFor(shop.id).avg.toFixed(1):'—');
    $$('[data-cafe-price]').forEach(el=>el.textContent=money(shop.price_range));$$('[data-cafe-address]').forEach(el=>el.textContent=shop.address||'Alamat belum ditambahkan.');$$('[data-cafe-hours]').forEach(el=>el.textContent=shop.opening_hours||'Jam operasional belum diisi.');$$('[data-cafe-description]').forEach(el=>el.textContent=shop.description||'Belum ada deskripsi untuk tempat ini.');
    const featureBox=$('#publicShopFeatures');if(featureBox){featureBox.innerHTML=(shop.features||[]).map(feature=>`<span>${escapeHTML(feature)}</span>`).join('');featureBox.hidden=!(shop.features||[]).length;}
    $$('[data-cafe-cover]').forEach(el=>{if(shop.image_url)el.src=shop.image_url;else el.removeAttribute('src');el.alt=`Foto ${shop.name}`;});$$('[data-maps-link]').forEach(el=>el.href=mapsUrl(shop));
    const gallery=$('#shopPhotoGallery');if(gallery){const photos=shopPhotos.filter(p=>String(p.shop_id)===String(shop.id));gallery.innerHTML=photos.length?photos.map(photo=>`<img src="${escapeHTML(db.publicPhotoUrl(photo.storage_path))}" alt="${escapeHTML(photo.caption||`Foto ${shop.name}`)}" loading="lazy">`).join(''):'';gallery.hidden=!photos.length;}
    const fav=$('#btn-favorite');fav?.setAttribute('data-favorite',String(shop.id));fav?.setAttribute('aria-pressed',String(favoriteIds().includes(String(shop.id))));if($('#fav-text'))$('#fav-text').textContent=favoriteIds().includes(String(shop.id))?'Tersimpan di Favorit':'Simpan ke favorit';
    const report=crowdFor(shop.id), crowdLabel=$('#crowdSummary');if(crowdLabel)crowdLabel.textContent=report?`${report.level} · ${report.report_count} laporan dalam 2 jam terakhir`:'Belum ada laporan dalam 2 jam terakhir';
    const reviews=$('#publicReviews');if(reviews){const result=await db.listPublicReviews(shop.id);if(result.error)reviews.innerHTML=emptyState('Ulasan belum bisa dimuat','Coba muat ulang halaman.','reviews');else reviews.innerHTML=result.data?.length?result.data.map(r=>`<article class="ng-review"><div>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div><p>${escapeHTML(r.message||'Tanpa komentar.')}</p><small>${shortDate(r.created_at)}</small></article>`).join(''):emptyState('Belum ada ulasan tayang','Ulasan yang disetujui admin akan muncul di sini.','reviews');}
    setupShopForms(shop);
  };
  const setupShopForms = shop => {
    const crowdButtons=$$('.ng-crowd [data-crowd-level]');crowdButtons.forEach(btn=>btn.addEventListener('click',async()=>{crowdButtons.forEach(x=>x.disabled=true);try{const {error}=await db.submitCrowdReport({shopId:shop.id,shopName:shop.name,area:shop.area,level:btn.dataset.crowdLevel});if(error)throw error;const res=await db.getPublicCrowdSummary();if(!res.error)crowd=new Map((res.data||[]).map(x=>[String(x.shop_id),x]));renderCrowdCounts();renderCrowdActivity();announce('Laporan terkirim','Terima kasih, laporan keramaian tersimpan dan akan dihitung selama dua jam.');const label=$('#crowdSummary');if(label)label.textContent=crowdFor(shop.id)?`${crowdFor(shop.id).level} · ${crowdFor(shop.id).report_count} laporan dalam 2 jam terakhir`:'Belum ada laporan baru';}catch(err){announce('Laporan belum terkirim',err.message||'Coba lagi beberapa saat.');}finally{crowdButtons.forEach(x=>x.disabled=false);}}));
    $('#reviewForm')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const data=new FormData(form);const status=$('[data-review-status]',form),button=$('button[type="submit"]',form);button.disabled=true;status.textContent='Mengirim ulasan…';try{const {error}=await db.submitReview({shopId:shop.id,rating:Number(data.get('rating')),message:String(data.get('message')||'').trim()});if(error)throw error;form.reset();status.textContent='Ulasan masuk untuk ditinjau admin.';}catch(err){status.textContent=err.message||'Ulasan gagal dikirim.';}finally{button.disabled=false;}});
    $('#correctionForm')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,data=new FormData(form),status=$('[data-correction-status]',form),button=$('button[type="submit"]',form);button.disabled=true;status.textContent='Mengirim koreksi…';try{const {error}=await db.submitCorrection({shopId:shop.id,shopName:shop.name,message:String(data.get('message')||'').trim()});if(error)throw error;form.reset();status.textContent='Koreksi terkirim dan menunggu peninjauan admin.';}catch(err){status.textContent=err.message||'Koreksi gagal dikirim.';}finally{button.disabled=false;}});
  };
  const renderArticleList = () => {const list=$('#articles-list');if(list)fillArticles(list,articles);const home=$('#homepage-articles-grid');if(home)fillArticles(home,articles,3);$$('[data-category]').forEach(button=>button.addEventListener('click',()=>{const category=button.dataset.category;$$('[data-category]').forEach(x=>x.classList.toggle('active',x===button));$$('#articles-list [data-cat]').forEach(card=>card.style.display=category==='all'||card.dataset.cat===category?'':'none');}));const featured=$('#featured-shop-grid');if(featured)fillShopGrid(featured,shops.slice(0,4));$$('[data-home-area]').forEach(button=>button.addEventListener('click',()=>{$$('[data-home-area]').forEach(x=>x.classList.toggle('bg-white',x===button));const area=areaKey(button.dataset.homeArea);$$('#featured-shop-grid [data-area]').forEach(card=>card.style.display=area==='semua'||card.dataset.area===area?'':'none');}));};
  const renderCrowdActivity = () => {const box=$('#crowdActivity');if(!box)return;const recent=[...crowd.entries()].map(([id,row])=>({shop:shops.find(s=>String(s.id)===id),...row})).filter(row=>row.shop).sort((a,b)=>new Date(b.latest_at)-new Date(a.latest_at)).slice(0,3);box.innerHTML='<span class="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Laporan keramaian terbaru</span>'+(recent.length?recent.map(row=>`<p class="text-xs text-zinc-300 mt-3"><b>${escapeHTML(row.shop.name)}</b> · ${escapeHTML(row.level)} · ${row.report_count} laporan · ${escapeHTML(shortDate(row.latest_at))}</p>`).join(''):'<p class="text-xs text-zinc-300 mt-3">Belum ada laporan keramaian dalam dua jam terakhir.</p>');};
  const renderCrowdCounts = () => {const counts={Sepi:0,Sedang:0,Ramai:0};let reports=0;crowd.forEach(row=>{if(counts[row.level]!==undefined)counts[row.level]++;reports+=Number(row.report_count)||0;});for(const [id,value] of [['quietShopCount',counts.Sepi],['mediumShopCount',counts.Sedang],['busyShopCount',counts.Ramai],['homeShopCount',shops.length],['homeReportCount',reports]]){const el=document.getElementById(id);if(el)el.textContent=String(value);}};
  const renderArticleDetail = () => {
    const title=$('#articleTitle');if(!title)return;const slug=new URLSearchParams(location.search).get('id');const article=articles.find(a=>a.slug===slug);
    if(!article){const main=$('main');if(main)main.innerHTML=`<div class="ng-container">${emptyState('Artikel tidak ditemukan','Artikel ini belum diterbitkan atau tautannya tidak benar.','auto_stories')}<a class="ng-button" href="artikel.html">Kembali ke artikel</a></div>`;return;}
    document.title=`${article.title} — NgopiMalang`;$('#articleCategory').textContent=article.category||'Panduan lokal';title.textContent=article.title;$('#articleIntro').textContent=article.summary||'';$('#articleDate').textContent=shortDate(article.published_at);$('#articleRead').textContent='Artikel NgopiMalang';const cover=$('#articleCover');if(article.image_url){cover.src=article.image_url;cover.alt=`Sampul ${article.title}`;}else cover.hidden=true;
    const body=$('#articleBody');body.replaceChildren();String(article.body||article.summary||'').split(/\n\s*\n/).filter(Boolean).forEach(text=>{const p=document.createElement('p');p.textContent=text;body.appendChild(p);});
  };
  const renderFavorites = () => {
    const grid=$('#favoriteGrid');if(!grid)return;const ids=favoriteIds(),list=shops.filter(s=>ids.includes(String(s.id)));const empty=$('#favorite-empty');if(empty)empty.style.display=list.length?'none':'';grid.innerHTML=list.length?list.map(s=>shopCard(s,true)).join(''):'';
  };
  const initFavorites = () => {
    document.addEventListener('click',e=>{const btn=e.target.closest('[data-favorite]');if(!btn)return;e.preventDefault();const id=String(btn.dataset.favorite),saved=favoriteIds(),next=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];saveFavorites(next);const pressed=next.includes(id);btn.setAttribute('aria-pressed',String(pressed));const icon=$('.material-symbols-outlined',btn);if(icon)icon.textContent=pressed?'favorite':'favorite_border';const label=$('#fav-text');if(label&&btn.id==='btn-favorite')label.textContent=pressed?'Tersimpan di Favorit':'Simpan ke favorit';renderFavorites();});
  };
  const initLegacyReportModal = () => {
    const modal=$('#report-modal');if(!modal)return;
    window.openReportModal=()=>{modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');};window.closeReportModal=()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');};
    const form=$('#crowdReportForm');if(!form)return;
    const select=$('#reportShopSelect',form);if(select){select.replaceChildren(new Option(shops.length?'Pilih kedai':'Belum ada kedai terbit',''));shops.forEach(shop=>select.add(new Option(`${shop.name} · ${shop.area}`,String(shop.id))));select.disabled=!shops.length;}
    $$('[data-crowd-level]',form).forEach(btn=>btn.addEventListener('click',()=>$$('[data-crowd-level]',form).forEach(other=>other.setAttribute('aria-pressed',String(other===btn)))));
    modal.addEventListener('click',e=>{if(e.target===modal)window.closeReportModal();});
    form.addEventListener('submit',async e=>{e.preventDefault();const button=$('button[type="submit"]',form),shop=shops.find(s=>String(s.id)===select?.value),level=$('[data-crowd-level][aria-pressed="true"]',form)?.dataset.crowdLevel;if(!shop||!level){announce('Lengkapi laporan','Pilih kedai dan kondisi keramaian terlebih dahulu.');return;}button.disabled=true;try{const {error}=await db.submitCrowdReport({shopId:shop.id,shopName:shop.name,area:shop.area,level});if(error)throw error;const result=await db.getPublicCrowdSummary();if(!result.error)crowd=new Map((result.data||[]).map(row=>[String(row.shop_id),row]));renderCrowdCounts();renderCrowdActivity();window.closeReportModal();announce('Laporan terkirim','Terima kasih telah membantu pengunjung lain. Laporan ini akan tampil sebagai sinyal komunitas selama dua jam.');}catch(err){announce('Laporan gagal dikirim',err.message||'Coba lagi.');}finally{button.disabled=false;}});
  };
  const loadData = async () => {
    if(!db?.configured){showNotice('Data dari Supabase belum dapat dimuat. Periksa konfigurasi koneksi.','error');return;}
    try{
      const [shopResult,articleResult,crowdResult,photoResult]=await Promise.all([db.listPublicShops(),db.listPublicArticles(),db.getPublicCrowdSummary(),db.listPublicPhotos()]);
      if(shopResult.error)throw shopResult.error;if(articleResult.error)throw articleResult.error;
      shops=shopResult.data||[];articles=articleResult.data||[];
      if(!crowdResult.error)crowd=new Map((crowdResult.data||[]).map(row=>[String(row.shop_id),row]));
      renderCrowdCounts();
      if(!photoResult.error)shopPhotos=photoResult.data||[];
      const reportSelect=$('#reportShopSelect');if(reportSelect){reportSelect.replaceChildren(new Option(shops.length?'Pilih kedai':'Belum ada kedai terbit',''));shops.forEach(shop=>reportSelect.add(new Option(`${shop.name} · ${shop.area}`,String(shop.id))));reportSelect.disabled=!shops.length;}
      renderCrowdActivity();
      await refreshRatings();renderExplore();renderArticleList();renderFavorites();await renderDetail();renderArticleDetail();
      if(!shops.length&&!articles.length)showNotice('Belum ada kedai atau artikel terbit. Admin dapat menambahkan konten melalui panel admin.');
      else if(!shops.length)showNotice('Belum ada kedai terbit. Admin dapat menambahkan kedai melalui panel admin.');
      else if(!articles.length)showNotice('Belum ada artikel terbit. Artikel akan tampil setelah admin menerbitkannya.');
    }catch(err){console.error('NgopiMalang public data:',err);showNotice(`Data Supabase gagal dimuat: ${err.message||'periksa koneksi dan kebijakan database.'}`,'error');}
  };
  const init = () => {
    initNavigation();initFavorites();initLegacyReportModal();
    const hero=$('#hero-search-input');if(hero){const go=()=>{const target=new URL('jelajahi.html',location.href);if(hero.value.trim())target.searchParams.set('q',hero.value.trim());location.href=target.href;};hero.addEventListener('keydown',e=>{if(e.key==='Enter')go();});window.triggerSearch=go;}
    $$('[data-discover-query]').forEach(button=>button.addEventListener('click',()=>{const target=new URL('jelajahi.html',location.href);target.searchParams.set('q',button.dataset.discoverQuery);location.href=target.href;}));
    $$('[data-discover-price]').forEach(button=>button.addEventListener('click',()=>{const target=new URL('jelajahi.html',location.href);target.searchParams.set('price',button.dataset.discoverPrice);location.href=target.href;}));
    $$('[data-correction]').forEach(btn=>btn.addEventListener('click',()=>$('#correctionForm')?.scrollIntoView({behavior:'smooth',block:'center'})));
    let refreshTimer;db?.onPublicDataChange?.(()=>{clearTimeout(refreshTimer);refreshTimer=setTimeout(loadData,300);});
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')loadData();});
    if($('#crowdActivity')||$('#crowdSummary'))setInterval(async()=>{if(document.visibilityState!=='visible')return;const result=await db.getPublicCrowdSummary();if(result.error)return;crowd=new Map((result.data||[]).map(row=>[String(row.shop_id),row]));renderCrowdCounts();renderCrowdActivity();const id=new URLSearchParams(location.search).get('cafe'),row=crowd.get(String(id)),summary=$('#crowdSummary');if(summary)summary.textContent=row?`${row.level} · ${row.report_count} laporan dalam 2 jam terakhir`:'Belum ada laporan dalam 2 jam terakhir';},60000);
    loadData();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

