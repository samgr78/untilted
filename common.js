/* ============================================================
   JS commun à toutes les pages
   - chaque action ouvre un nouvel onglet
   - tous les boutons deviennent des triangles
   - la barre de recherche est le seul moyen de revenir au menu
   - le volume ne peut que monter (sauf en criant, voir volume.html)
   ============================================================ */
(function () {
  'use strict';

  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* tant pis */ } }
  };

  // ---------- Ouvrir un nouvel onglet (pour TOUT) ----------
  function ouvrir(url) {
    const w = window.open(url, '_blank');
    if (!w) location.href = url; // popups bloquées : on se rabat, à contrecœur
  }

  // ---------- Petits compteurs inutiles ----------
  if (!LS.get('debut', null)) LS.set('debut', Date.now());
  LS.set('onglets', LS.get('onglets', 0) + 1);

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3500);
  }

  // ---------- Triangles ----------
  const COULEURS = ['#0000ff', '#ff0000', '#008000', '#ff8c00', '#8a2be2', '#ff1493', '#00ced1', '#8b4513'];
  function trianglify(root) {
    (root || document).querySelectorAll('button:not(.tri)').forEach(b => {
      const s = document.createElement('span');
      s.className = 'tri-txt';
      while (b.firstChild) s.appendChild(b.firstChild);
      b.appendChild(s);
      b.classList.add('tri');
      if (Math.random() < 0.3) b.classList.add('tri-bas');
      b.style.setProperty('--rot', (Math.random() * 24 - 12).toFixed(1) + 'deg');
      b.style.setProperty('--couleur', COULEURS[Math.floor(Math.random() * COULEURS.length)]);
    });
  }
  new MutationObserver(() => trianglify()).observe(document.body, { childList: true, subtree: true });

  // ---------- Toute navigation = nouvel onglet ----------
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-href]');
    if (el) { e.preventDefault(); ouvrir(el.getAttribute('data-href')); return; }
    const a = e.target.closest('a[href]');
    if (a && !a.hasAttribute('download')) { e.preventDefault(); ouvrir(a.href); }
  });

  // ---------- Volume ----------
  const getVol = () => Math.max(0, Math.min(100, Number(LS.get('volume', 80)) || 0));
  let audioCtx = null, master = null;

  function appliquerVolume() {
    const v = getVol();
    if (master) master.gain.value = (v / 100) * 0.12;
    const val = document.getElementById('vol-val');
    const sl = document.getElementById('vol-slider');
    const ic = document.getElementById('vol-icone');
    if (val) val.textContent = v + ' %';
    if (sl) sl.value = v;
    if (ic) ic.textContent = v === 0 ? '🔇' : v < 40 ? '🔉' : '🔊';
    document.dispatchEvent(new CustomEvent('volume', { detail: v }));
  }
  function setVol(v) { LS.set('volume', Math.round(Math.max(0, Math.min(100, v)))); appliquerVolume(); }

  window.addEventListener('storage', e => {
    if (e.key === 'volume') appliquerVolume();
    if (e.key === 'onglets') afficherOnglets();
  });

  // Le volume remonte tout seul, doucement, inexorablement.
  setInterval(() => { if (!document.hidden) setVol(getVol() + 1); }, 4000);

  // Musique d'ascenseur (légèrement fausse), générée en direct.
  function demarrerMusique() {
    if (audioCtx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();
    master = audioCtx.createGain();
    master.connect(audioCtx.destination);
    appliquerVolume();
    const notes = [440, 466, 415, 523, 392, 554, 370, 622, 349, 659];
    let i = 0;
    setInterval(() => {
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = 'square';
      o.frequency.value = notes[i % notes.length] * (Math.random() < 0.15 ? 1.06 : 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(1, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.3);
      i++;
    }, 270);
  }
  document.addEventListener('pointerdown', demarrerMusique, { once: true });
  document.addEventListener('keydown', demarrerMusique, { once: true });

  // ---------- Barre du bas ----------
  const MOTS_MENU = ['menu', 'accueil', 'menu principal', 'home', 'retour', 'retour au menu', 'index'];
  const normaliser = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  function afficherOnglets() {
    const el = document.getElementById('onglets');
    if (el) el.textContent = '🗂️ Onglets ouverts sur ce site : ' + LS.get('onglets', 0);
  }

  function barre() {
    const bar = document.createElement('div');
    bar.id = 'barre';
    bar.innerHTML = `
      <form id="recherche" autocomplete="off" role="search">
        <input id="q" type="search" placeholder="🔍 Rechercher…" aria-label="Rechercher">
      </form>
      <div id="vol"><span id="vol-icone">🔊</span>
        <input id="vol-slider" type="range" min="0" max="100" aria-label="Volume">
        <span id="vol-val"></span></div>
      <div id="onglets"></div>
      <div id="astuce">Astuce : pour revenir au menu, utilisez la barre de recherche.</div>`;
    document.body.appendChild(bar);

    bar.querySelector('#recherche').addEventListener('submit', e => {
      e.preventDefault();
      const brut = bar.querySelector('#q').value;
      if (!brut.trim()) { toast('Veuillez rechercher quelque chose. N’importe quoi. Pas rien.'); return; }
      if (MOTS_MENU.includes(normaliser(brut))) ouvrir('index.html');
      else ouvrir('page.html?id=recherche&q=' + encodeURIComponent(brut));
    });

    // Le curseur de volume ne fonctionne que dans un sens : vers le haut.
    const sl = bar.querySelector('#vol-slider');
    let tentative = false;
    sl.addEventListener('input', () => {
      const v = Number(sl.value);
      if (v < getVol()) { sl.value = getVol(); tentative = true; }
      else setVol(v);
    });
    sl.addEventListener('change', () => {
      if (tentative) {
        tentative = false;
        toast('Pour baisser le son, faites du bruit. Beaucoup de bruit.');
        ouvrir('volume.html');
      }
    });

    afficherOnglets();
    appliquerVolume();
  }

  barre();
  trianglify();

  window.PIRE = { LS, ouvrir, toast, trianglify, getVol, setVol };
})();
