'use strict';
/* ============================================================
   auth.js — Lentera Jiwa Auth via Google Sheets + Apps Script
   ============================================================ */

const LJ_AUTH = (function() {

  const API = 'https://script.google.com/macros/s/AKfycbyx-p9_xqptSqmgLHqyDail0tq8peZFvZuaBdhVloKVWUVGVWtu7Tv-hKyO5ylUyPAs/exec';
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
      return { ok: false, msg: 'Koneksi gagal. Periksa internet kamu.' };
    }
  }

  /* ── Register ── */
  async function register(data) {
    const result = await api({ action: 'register', data });
    return result;
  }

  /* ── Login ── */
  async function login(usernameOrEmail, password) {
    const result = await api({ action: 'login', username: usernameOrEmail, password });
    if (result.ok) {
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
    return result;
  }

  /* ── Logout ── */
  function logout() {
    localStorage.removeItem(KEY_SESSION);
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

  /* ── Cek Username ── */
  async function checkUsername(username) {
    const url = API + '?action=checkUsername&username=' + encodeURIComponent(username);
    try {
      const res = await fetch(url);
      return await res.json();
    } catch(e) {
      return { ok: true }; // kalau gagal, lanjut saja
    }
  }

  /* ── Kirim OTP ── */
  async function sendOTP(email) {
    const url = API + '?action=sendOTP&email=' + encodeURIComponent(email);
    try {
      const res = await fetch(url);
      return await res.json();
    } catch(e) {
      return { ok: false, msg: 'Koneksi gagal.' };
    }
  }

  /* ── Verifikasi OTP ── */
  async function verifyOTP(email, otp) {
    const url = API + '?action=verifyOTP&email=' + encodeURIComponent(email) + '&otp=' + encodeURIComponent(otp);
    try {
      const res = await fetch(url);
      return await res.json();
    } catch(e) {
      return { ok: false, msg: 'Koneksi gagal.' };
    }
  }

  return {
    register:    register,
    login:       login,
    logout:      logout,
    getSession:  getSession,
    isLoggedIn:  isLoggedIn,
    requireLogin: requireLogin,
    verifyToken: verifyToken,
    sendOTP:       sendOTP,
    verifyOTP:     verifyOTP,
    checkUsername: checkUsername
  };

})();
