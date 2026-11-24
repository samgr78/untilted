/* ============================================================
   JS commun à toutes les pages
   - chaque action ouvre un nouvel onglet
   - tous les boutons deviennent des triangles
   - la barre de recherche est le seul moyen de revenir au menu
   - le volume part de 0 et ne monte qu'en spammant la barre espace ; il redescend
     tout seul de 1 toutes les 5 secondes dès qu'on arrête
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
  // Migration unique : remise à 35 au passage vers ce système.
  if (!LS.get('volumeReset35', false)) {
    LS.set('volume', 35);
    LS.set('volumeReset35', true);
  }
  const getVol = () => Math.max(0, Math.min(100, Number(LS.get('volume', 0)) || 0));
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

  // ---------- Blocage total si le son est trop bas ----------
  const SEUIL_BLOCAGE = 30;
  let volBloqueEl = null, volBloqueRaf = null, volBloqueTimer = null;
  const volBloqueParts = [];

  // Bruit d'explosion : branché direct sur la sortie (pas sur le volume du site,
  // sinon on n'entendrait jamais l'alerte quand le son est justement trop bas).
  function volBloqueBoom(force) {
    if (!audioCtx) return;
    const len = Math.floor(audioCtx.sampleRate * 0.45);
    const b = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = audioCtx.createBufferSource();
    s.buffer = b;
    const f = audioCtx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 180 + Math.random() * 420;
    const g = audioCtx.createGain();
    g.gain.value = 0.55 * (force || 1);
    s.connect(f); f.connect(g); g.connect(audioCtx.destination);
    s.start();
  }

  function volBloqueExplosion(x, y) {
    const teinte = Math.random() * 50; // rouge/orange
    for (let i = 0; i < 36; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 2 + Math.random() * 9;
      volBloqueParts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        vie: 1, dec: 0.015 + Math.random() * 0.02, taille: 2 + Math.random() * 4,
        coul: `hsl(${teinte + Math.random() * 20}, 100%, 55%)`
      });
    }
    volBloqueBoom(0.6 + Math.random() * 0.6);
  }

  function demarrerBlocageVolume() {
    volBloqueEl = document.createElement('div');
    volBloqueEl.id = 'vol-bloque';
    volBloqueEl.innerHTML = `
      <canvas></canvas>
      <div class="vol-bloque-texte">💥 ALERTE 💥<br>VOLUME INSUFFISANT<br><span class="petit-rouge">Le site est entièrement à l'arrêt.</span><br>SPAMMEZ LA BARRE ESPACE<br>pour remonter le son au-dessus de ${SEUIL_BLOCAGE} %</div>`;
    document.body.appendChild(volBloqueEl);
    document.body.classList.add('bloque-volume');

    const cv = volBloqueEl.querySelector('canvas');
    const ctx = cv.getContext('2d');
    function taille() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
    taille();
    window.addEventListener('resize', taille);

    (function boucleExplosions() {
      if (!volBloqueEl) return;
      volBloqueExplosion(Math.random() * cv.width, Math.random() * cv.height * 0.85);
      volBloqueTimer = setTimeout(boucleExplosions, 220);
    })();

    function image() {
      if (!volBloqueEl) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = volBloqueParts.length - 1; i >= 0; i--) {
        const p = volBloqueParts[i];
        p.vy += 0.1; p.x += p.vx; p.y += p.vy; p.vie -= p.dec;
        if (p.vie <= 0) { volBloqueParts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.vie);
        ctx.fillStyle = p.coul;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.taille * p.vie + 1, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      volBloqueRaf = requestAnimationFrame(image);
    }
    image();

    volBloqueEl._nettoyer = () => window.removeEventListener('resize', taille);
  }

  function arreterBlocageVolume() {
    cancelAnimationFrame(volBloqueRaf);
    clearTimeout(volBloqueTimer);
    volBloqueEl._nettoyer();
    volBloqueEl.remove();
    volBloqueEl = null;
    volBloqueParts.length = 0;
    document.body.classList.remove('bloque-volume');
  }

  function majBlocageVolume() {
    const bloque = getVol() < SEUIL_BLOCAGE;
    if (bloque && !volBloqueEl) demarrerBlocageVolume();
    else if (!bloque && volBloqueEl) arreterBlocageVolume();
  }
  document.addEventListener('volume', majBlocageVolume);

  // Le volume ne monte qu'en spammant la barre espace : 2 appuis = +1 %.
  function estSaisie(el) { return el && /^(input|textarea|select)$/i.test(el.tagName); }
  let appuisEspace = 0;
  document.addEventListener('keydown', e => {
    if ((e.code !== 'Space' && e.key !== ' ') || estSaisie(e.target)) return;
    e.preventDefault();
    appuisEspace++;
    if (appuisEspace >= 2) { appuisEspace -= 2; setVol(getVol() + 1); }
  });

  // Et il redescend tout seul, 1 % toutes les secondes, dès qu'on arrête de spammer.
  setInterval(() => { if (!document.hidden) setVol(getVol() - 1); }, 1000);

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
        toast('Impossible de baisser le son avec le curseur. Spammez la barre espace pour l’augmenter, il redescend tout seul sinon.');
      }
    });

    afficherOnglets();
    appliquerVolume();
  }

  barre();
  trianglify();

  window.PIRE = { LS, ouvrir, toast, trianglify, getVol, setVol };
})();
