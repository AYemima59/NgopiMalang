(() => {
  const db=window.ngopiSupabase,$=id=>document.getElementById(id),form=$('accountForm');let mode='signin';
  const message=(text,error=false)=>{const el=$('accountMessage');el.textContent=text;el.style.color=error?'#a3352b':'#2d6a4f';};
  const setMode=value=>{mode=value;const signup=value==='signup',reset=value==='reset';$('accountTitle').textContent=signup?'Buat akun pengunjung':reset?'Atur ulang password':'Masuk ke NgopiMalang';$('accountIntro').textContent=signup?'Daftar agar bisa menyimpan favorit dan menulis ulasan.':reset?'Kami akan mengirim tautan untuk membuat password baru.':'Masuk untuk menyimpan tempat favorit dan menulis ulasan.';$('nameField').hidden=!signup;$('passwordField').hidden=reset;$('passwordField').querySelector('input').required=!reset;$('submitAccount').textContent=signup?'Daftar':reset?'Kirim tautan reset':'Masuk';$('switchMode').hidden=reset;$('forgotPassword').hidden=signup||reset;message('');};
  const showSignedIn=user=>{$('accountForm').hidden=true;$('signedInPanel').hidden=false;$('signedInEmail').textContent=`Kamu masuk sebagai ${user.email||'pengunjung NgopiMalang'}.`};
  if(!db?.configured){message('Koneksi Supabase belum tersedia. Coba muat ulang halaman.',true);return;}
  db.getUser().then(({data})=>{if(data?.user)showSignedIn(data.user);if(new URLSearchParams(location.search).has('reset'))setMode('reset');}).catch(()=>{});
  $('switchMode').addEventListener('click',()=>setMode(mode==='signin'?'signup':'signin'));
  $('forgotPassword').addEventListener('click',()=>setMode('reset'));
  $('signOutAccount').addEventListener('click',async()=>{const {error}=await db.signOut();if(error)message(error.message,true);else{ $('signedInPanel').hidden=true;$('accountForm').hidden=false;message('Kamu sudah keluar.');}});
  form.addEventListener('submit',async e=>{e.preventDefault();const fd=new FormData(form),button=$('submitAccount');button.disabled=true;message('Sedang memproses…');try{
    if(mode==='reset'){const {error}=await db.requestPasswordReset(String(fd.get('email')).trim(),new URL('akun.html?reset=1',location.href).href);if(error)throw error;message('Jika email terdaftar, tautan reset sudah dikirim. Periksa inbox dan spam.');return;}
    const email=String(fd.get('email')).trim(),password=String(fd.get('password'));
    if(mode==='signup'){const {data,error}=await db.signUp(email,password,String(fd.get('name')||'').trim());if(error)throw error;if(data.session)showSignedIn(data.user);else message('Akun dibuat. Buka email untuk mengonfirmasi, lalu masuk.');return;}
    const {data,error}=await db.signIn(email,password);if(error)throw error;showSignedIn(data.user);
  }catch(error){message(error.message||'Tidak dapat memproses akun. Coba lagi.',true);}finally{button.disabled=false;}});
})();
