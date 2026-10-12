(() => {
  const cfg = window.NGOPI_SUPABASE_CONFIG || {};
  const configured = /^https:\/\/.+\.supabase\.co$/.test(cfg.url || '') &&
    cfg.publishableKey && cfg.publishableKey !== 'GANTI_DENGAN_PUBLISHABLE_KEY';
  const client = configured && window.supabase?.createClient
    ? window.supabase.createClient(cfg.url, cfg.publishableKey)
    : null;
  const unavailable = () => Promise.reject(new Error('Supabase belum dikonfigurasi.'));
  const api = {
    configured: Boolean(client),
    client,
    submitSuggestion: row => client ? client.from('place_requests').insert({
      name: row.name, area: row.area, notes: row.notes || null, submitter: row.submitter || null
    }) : unavailable(),
    submitCrowdReport: row => client ? client.from('crowd_reports').insert({
      shop_id: row.shopId || null, shop_name: row.shop || null, level: row.level,
      area: row.area || null
    }) : unavailable(),
    submitCorrection: row => client ? client.from('corrections').insert({
      shop_id: row.shopId || null, shop_name: row.shop || null,
      message: row.message || JSON.stringify(row.values || {}), details: row.details || null
    }) : unavailable(),
    listPublicShops: () => client ? client.from('coffee_shops').select('*').eq('status', 'approved').order('name') : unavailable(),
    listPublicArticles: () => client ? client.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }) : unavailable()
  };
  window.ngopiSupabase = api;
})();

