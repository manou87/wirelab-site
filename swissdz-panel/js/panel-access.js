/**
 * Porte d’accès panel WireLab (code partagé).
 * Soft gate côté client — débloque la session via localStorage.
 */
(function () {
  'use strict';
  var KEY = 'wirelab-panel-access-v1';
  var CODE = 'athmano';

  function unlocked() {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function setUnlocked() {
    try {
      localStorage.setItem(KEY, '1');
    } catch (_) {}
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function showGate() {
    var gate = qs('wlAccessGate');
    if (!gate) return;
    gate.hidden = false;
    gate.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('wl-access-locked');
    var input = qs('wlAccessCode');
    if (input) {
      setTimeout(function () {
        try {
          input.focus();
        } catch (_) {}
      }, 50);
    }
  }

  function hideGate() {
    var gate = qs('wlAccessGate');
    if (gate) {
      gate.hidden = true;
      gate.setAttribute('aria-hidden', 'true');
    }
    document.documentElement.classList.remove('wl-access-locked');
  }

  function fail(msg) {
    var err = qs('wlAccessErr');
    if (err) {
      err.textContent = msg || 'Code incorrect.';
      err.hidden = false;
    }
    var input = qs('wlAccessCode');
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  function tryUnlock(raw) {
    var v = String(raw || '')
      .trim()
      .toLowerCase();
    if (v === CODE) {
      setUnlocked();
      hideGate();
      return true;
    }
    fail('Code incorrect.');
    return false;
  }

  function bind() {
    if (unlocked()) {
      hideGate();
      return;
    }
    showGate();
    var form = qs('wlAccessForm');
    var btn = qs('wlAccessSubmit');
    var input = qs('wlAccessCode');
    function onSubmit(ev) {
      if (ev) ev.preventDefault();
      tryUnlock(input && input.value);
    }
    if (form) form.addEventListener('submit', onSubmit);
    if (btn) btn.addEventListener('click', onSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
