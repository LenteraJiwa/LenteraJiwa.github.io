'use strict';
/* ============================================================
   auth.js — Lentera Jiwa Auth via Google Sheets + Apps Script
   ============================================================ */

const LJ_AUTH = (function() {

  const API = 'https://script.google.com/macros/s/AKfycbxxsDNCC84VIo4UjXuBuzF6q2F_PfVGNJpuWhapELL0eg8JCOFkNqjNfSRyAVp-yt8z9w/exec';
  const KEY_SESSION = 'lj_session';

  /* ── Kirim request ke Apps Script ── */
  async function api(body) {
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch(e) {
      return { ok: false, msg: 'Koneksi gagal. Periksa internet kamu.', offline: true };
    }
  }

  /* ── Baca data publik (GET, bisa di-cache browser) ── */
  async function apiGet(action, params) {
    const q = new URLSearchParams(Object.assign({ action: action }, params || {}));
    try {
      const res = await fetch(API + '?' + q.toString());
      return await res.json();
    } catch(e) {
      return { ok: false, msg: 'Koneksi gagal. Periksa internet kamu.', offline: true };
    }
  }

  /* ── Panggil aksi yang butuh login (token otomatis ditambahkan) ── */
  async function call(action, payload) {
    const s = getSession();
    const res = await api(Object.assign({ action: action, token: s ? s.token : '' }, payload || {}));
    if (res && res.code === 'AUTH') localStorage.removeItem(KEY_SESSION);
    return res;
  }

  /* ── Register ── */
  // ticket: didapat dari verifyOTP; membuktikan email sudah diverifikasi
  // otp: untuk akun umum, kode OTP dikirim bersama data (1 request saja).
  // Server baru langsung membuat sesi, jadi tidak perlu login terpisah.
  async function register(data, ticket, otp) {
    const res = await api({ action: 'register', ticket, otp, data });
    if (res && res.ok && res.token) saveSession(res);
    return res;
  }

  /* ── Login ── */
  function saveSession(result) {
    localStorage.setItem(KEY_SESSION, JSON.stringify({
      token:    result.token,
      username: result.user.username,
      nama:     result.user.nama,
      email:    result.user.email,
      usia:     result.user.usia,
      gender:   result.user.gender,
      role:     result.user.role,
      loginAt:  new Date().toISOString()
    }));
  }

  async function login(usernameOrEmail, password) {
    const result = await api({ action: 'login', username: usernameOrEmail, password });
    if (result.ok) saveSession(result);
    return result;
  }

  /* ── Logout ── */
  async function logout() {
    const s = getSession();
    localStorage.removeItem(KEY_SESSION);
    // Cabut token di server juga (bila gagal, tetap keluar di perangkat ini)
    if (s && s.token) {
      try { await Promise.race([api({ action: 'logout', token: s.token }), new Promise(r => setTimeout(r, 3000))]); } catch(e) {}
    }
    window.location.href = 'login.html';
  }

  /* ── Cek session lokal ── */
  function getSession() {
    try { return JSON.parse(localStorage.getItem(KEY_SESSION)) || null; } catch(e) { return null; }
  }

  function isLoggedIn() {
    return getSession() !== null;
  }

  /* ── Guard: redirect ke login kalau belum login ── */
  function requireLogin() {
    if (!isLoggedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  /* ── Verifikasi token ke server ── */
  async function verifyToken() {
    const session = getSession();
    if (!session) return false;
    const result = await api({ action: 'checkToken', token: session.token });
    if (!result.ok) {
      localStorage.removeItem(KEY_SESSION);
      return false;
    }
    return true;
  }

  /* ── Upload Foto KTM ── */
  async function uploadPhoto(file, ticket) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async function(e) {
        const base64 = e.target.result.split(',')[1];
        const mimeType = file.type;
        const fileName = file.name;
        const res = await api({ action: 'uploadPhoto', ticket, base64, fileName, mimeType });
        resolve(res.ok || res.msg ? res : { ok: false, msg: 'Gagal upload foto.' });
      };
      reader.onerror = function() { resolve({ ok: false, msg: 'File tidak bisa dibaca.' }); };
      reader.readAsDataURL(file);
    });
  }

  /* ── Cek Username ── */
  async function checkUsername(username) {
    const url = API + '?action=checkUsername&username=' + encodeURIComponent(username);
    try {
      const res = await fetch(url);
      return await res.json();
    } catch(e) {
      return { ok: true }; // kalau gagal, server tetap memeriksa lagi saat register
    }
  }

  /* ── Kirim OTP ── */
  // Lewat POST agar email tidak tercatat di URL/log
  async function sendOTP(email) {
    return api({ action: 'sendOTP', email });
  }

  /* ── Verifikasi OTP ── */
  // Bila benar, server mengembalikan { ok:true, ticket } untuk upload KTM & register
  async function verifyOTP(email, otp) {
    return api({ action: 'verifyOTP', email, otp });
  }

  /* ── Lupa kata sandi ── */
  async function sendResetOTP(email) {
    return api({ action: 'sendResetOTP', email });
  }
  async function resetPassword(email, otp, password) {
    return api({ action: 'resetPassword', email, otp, password });
  }

  return {
    api:           api,
    apiGet:        apiGet,
    call:          call,
    sendResetOTP:  sendResetOTP,
    resetPassword: resetPassword,
    register:    register,
    login:       login,
    logout:      logout,
    getSession:  getSession,
    isLoggedIn:  isLoggedIn,
    requireLogin: requireLogin,
    verifyToken: verifyToken,
    sendOTP:       sendOTP,
    verifyOTP:     verifyOTP,
    checkUsername: checkUsername,
    uploadPhoto:   uploadPhoto
  };

})();
