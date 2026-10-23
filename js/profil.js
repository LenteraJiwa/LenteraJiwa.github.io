'use strict';

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function loadProfile(s) {
  const inisial = (s.nama || s.username || 'U').charAt(0).toUpperCase();
  document.getElementById('profil-avatar').textContent      = inisial;
  document.getElementById('profil-role-badge').textContent  = capitalize(s.role || 'User');
  document.getElementById('profil-nama').textContent        = s.nama     || '—';
  document.getElementById('profil-username').textContent    = '@' + (s.username || '—');
  document.getElementById('profil-email').textContent       = s.email    || '—';
  document.getElementById('stat-usia').textContent          = s.usia ? s.usia + ' th' : '—';
  const gMap = { L: '♂ L', P: '♀ P' };
  document.getElementById('stat-gender').textContent        = gMap[s.gender] || s.gender || '—';
  document.getElementById('val-nama').textContent           = s.nama     || '—';
  document.getElementById('val-usia').textContent           = s.usia ? s.usia + ' tahun' : '—';
  const gFull = { L: 'Laki-laki', P: 'Perempuan' };
  document.getElementById('val-gender').textContent         = gFull[s.gender] || s.gender || '—';
  document.getElementById('val-role').textContent           = capitalize(s.role || '—');
  document.getElementById('val-username').textContent       = s.username || '—';
  document.getElementById('val-email').textContent          = s.email    || '—';
  if (s.loginAt) {
    const d = new Date(s.loginAt);
    const str = d.toLocaleString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
    document.getElementById('val-loginat').textContent       = str;
    document.getElementById('profil-login-time').textContent = 'Masuk sejak ' + str;
  }
  document.getElementById('inp-nama').value   = s.nama   || '';
  document.getElementById('inp-usia').value   = s.usia   || '';
  document.getElementById('inp-gender').value = s.gender || 'L';
}

window.profilToggleEdit = function(cardId, btn) {
  const card = document.getElementById(cardId);
  const isEditing = card.classList.toggle('editing');
  btn.textContent = isEditing ? 'Batal' : 'Edit';
};

window.profilSaveInfo = function() {
  const s = LJ_AUTH.getSession();
  if (!s) return;
  const nama   = document.getElementById('inp-nama').value.trim();
  const usia   = parseInt(document.getElementById('inp-usia').value) || s.usia;
  const gender = document.getElementById('inp-gender').value;
  if (!nama) { profilShowToast('❌ Nama tidak boleh kosong'); return; }
  const newSession = Object.assign({}, s, { nama, usia, gender });
  localStorage.setItem('lj_session', JSON.stringify(newSession));
  loadProfile(newSession);
  const card = document.getElementById('card-info');
  card.classList.remove('editing');
  document.querySelector('#card-info .profil-edit-btn').textContent = 'Edit';
  profilShowToast('✅ Profil diperbarui!');
};

window.profilShowToast = function(msg) {
  const t = document.getElementById('profil-toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
};

(function init() {
  const session = LJ_AUTH.getSession();
  if (!session) { window.location.href = 'login.html'; return; }
  loadProfile(session);
  const portal = document.getElementById('profil-portal');
  if (portal && (session.role === 'psikolog' || session.role === 'admin')) portal.hidden = false;
})();
