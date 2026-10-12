(() => {
  const cfg = window.NGOPI_SUPABASE_CONFIG || {};
  const configured = /^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(cfg.url || '') &&
    /^sb_publishable_|^[a-z0-9._-]+$/i.test(cfg.publishableKey || '') &&
    cfg.publishableKey !== 'GANTI_DENGAN_PUBLISHABLE_KEY';
  const client = configured && window.supabase?.createClient
    ? window.supabase.createClient(cfg.url, cfg.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;
  const unavailable = () => Promise.reject(new Error('Koneksi database belum tersedia. Muat ulang halaman atau coba lagi nanti.'));
  const db = (table) => client ? client.from(table) : null;
  const api = {
    configured: Boolean(client), client,
    listPublicShops: () => client ? db('coffee_shops').select('*').eq('status', 'approved').order('name') : unavailable(),
    getPublicShop: id => client ? db('coffee_shops').select('*').eq('id', id).eq('status', 'approved').maybeSingle() : unavailable(),
    listPublicArticles: () => client ? db('articles').select('*').eq('status', 'published').order('published_at', { ascending: false }) : unavailable(),
    listPublicPhotos: shopId => {
      if (!client) return unavailable();
      let query = db('shop_photos').select('id,shop_id,storage_path,caption,created_at').eq('status', 'approved').order('created_at', { ascending: false });
      if (shopId) query = query.eq('shop_id', shopId);
      return query;
    },
    getPublicArticle: slug => client ? db('articles').select('*').eq('slug', slug).eq('status', 'published').maybeSingle() : unavailable(),
    listPublicReviews: shopId => {
      if (!client) return unavailable();
      let query = db('reviews').select('id,shop_id,rating,message,created_at').eq('status', 'approved').order('created_at', { ascending: false });
      if (shopId) query = query.eq('shop_id', shopId);
      return query;
    },
    getPublicCrowdSummary: () => client ? client.rpc('get_public_crowd_summary') : unavailable(),
    onPublicDataChange: callback => {
      if (!client) return null;
      return client.channel('ngopi-public-data')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'coffee_shops' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, callback)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'shop_photos' }, callback)
        .subscribe();
    },
    submitSuggestion: row => client ? db('place_requests').insert({ name: row.name, area: row.area, address: row.address || null, notes: row.notes || null, submitter: row.submitter || null }) : unavailable(),
    submitCrowdReport: row => client ? db('crowd_reports').insert({ shop_id: row.shopId || null, shop_name: row.shopName || row.shop || null, level: row.level, area: row.area || null }) : unavailable(),
    submitCorrection: row => client ? db('corrections').insert({ shop_id: row.shopId || null, shop_name: row.shopName || row.shop || null, message: row.message, details: row.details || null }) : unavailable(),
    submitReview: row => client ? db('reviews').insert({ shop_id: row.shopId, rating: row.rating, message: row.message || null, status: 'pending' }) : unavailable(),
    signIn: (email, password) => client ? client.auth.signInWithPassword({ email, password }) : unavailable(),
    signUp: (email, password, name) => client ? client.auth.signUp({ email, password, options: { data: { display_name: name } } }) : unavailable(),
    signInWithGoogle: () => client ? client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.href } }) : unavailable(),
    getUser: () => client ? client.auth.getUser() : unavailable(),
    signOut: () => client ? client.auth.signOut() : unavailable(),
    getSession: () => client ? client.auth.getSession() : unavailable(),
    requestPasswordReset: (email, redirectTo) => client ? client.auth.resetPasswordForEmail(email, { redirectTo }) : unavailable(),
    updatePassword: password => client ? client.auth.updateUser({ password }) : unavailable(),
    onAuthStateChange: callback => client ? client.auth.onAuthStateChange(callback) : null,
    loadAdminData: async () => {
      if (!client) return unavailable();
      const tables = ['admin_users','coffee_shops','place_requests','crowd_reports','corrections','reviews','articles','shop_photos'];
      const results = await Promise.all(tables.map(table => db(table).select('*').order('created_at', { ascending: false })));
      const failed = results.find(result => result.error);
      if (failed) return { error: failed.error };
      if (!results[0].data?.length) return { error: new Error('Akun ini belum terdaftar sebagai admin pada tabel public.admin_users.') };
      return { data: Object.fromEntries(tables.slice(1).map((table, index) => [table, results[index + 1].data || []])) };
    },
    updateRow: (table, id, values) => client ? db(table).update(values).eq('id', id) : unavailable(),
    insertRow: (table, values) => client ? db(table).insert(values).select().single() : unavailable(),
    deleteRow: (table, id) => client ? db(table).delete().eq('id', id) : unavailable(),
    saveShop: (values, id) => client ? (id ? db('coffee_shops').update(values).eq('id', id).select().single() : db('coffee_shops').insert(values).select().single()) : unavailable(),
    saveArticle: (values, id) => client ? (id ? db('articles').update(values).eq('id', id).select().single() : db('articles').insert(values).select().single()) : unavailable(),
    uploadPhoto: async (file, shopId) => {
      if (!client) return unavailable();
      const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${shopId || 'unassigned'}/${crypto.randomUUID()}.${extension}`;
      const upload = await client.storage.from('cafe-photos').upload(path, file, { upsert: false, contentType: file.type });
      if (upload.error) return { error: upload.error };
      const row = await db('shop_photos').insert({ shop_id: shopId || null, storage_path: path, status: 'approved' }).select().single();
      if (row.error) await client.storage.from('cafe-photos').remove([path]);
      return row.error ? { error: row.error } : { data: { ...row.data, image_url: client.storage.from('cafe-photos').getPublicUrl(path).data.publicUrl } };
    },
    publicPhotoUrl: path => client && path ? client.storage.from('cafe-photos').getPublicUrl(path).data.publicUrl : ''
  };
  window.ngopiSupabase = api;
})();
