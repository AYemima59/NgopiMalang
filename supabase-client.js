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
    listPublicArticles: () => client ? client.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }) : unavailable(),
    signIn: (email,password) => client ? client.auth.signInWithPassword({email,password}) : unavailable(),
    requestPasswordReset: (email,redirectTo) => client ? client.auth.resetPasswordForEmail(email,{redirectTo}) : unavailable(),
    updatePassword: password => client ? client.auth.updateUser({password}) : unavailable(),
    onAuthStateChange: callback => client ? client.auth.onAuthStateChange(callback) : null,
    signOut: () => client ? client.auth.signOut() : unavailable(),
    getSession: () => client ? client.auth.getSession() : unavailable(),
    loadAdminData: async () => {
      if (!client) return unavailable();
      const names=['admin_users','coffee_shops','place_requests','crowd_reports','corrections','reviews','articles','shop_photos'];
      const results=await Promise.all(names.map(name=>client.from(name).select('*').order('created_at',{ascending:false})));
      const failed=results.find(x=>x.error); if(failed?.error) return {error:failed.error};
      if(!results[0].data?.length) return {error:new Error('Akun ini belum terdaftar sebagai admin. Tambahkan UUID pengguna ke public.admin_users di SQL Editor.')};
      return {data:Object.fromEntries(names.slice(1).map((name,i)=>[name,results[i+1].data||[]]))};
    },
    updateRow: (table,id,values) => client ? client.from(table).update(values).eq('id',id) : unavailable(),
    insertRow: (table,values) => client ? client.from(table).insert(values).select().single() : unavailable(),
    deleteRow: (table,id) => client ? client.from(table).delete().eq('id',id) : unavailable(),
    saveShop: (values,id) => client ? (id ? client.from('coffee_shops').update(values).eq('id',id) : client.from('coffee_shops').insert(values)) : unavailable(),
    saveArticle: (values,id) => client ? (id ? client.from('articles').update(values).eq('id',id) : client.from('articles').insert(values)) : unavailable(),
    publicPhotoUrl: path => client && path ? client.storage.from('cafe-photos').getPublicUrl(path).data.publicUrl : ''
  };
  window.ngopiSupabase = api;
})();

