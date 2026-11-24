/* ============================================================
   Animation « apocalypse interdimensionnelle »
   Lancée quand quelqu'un accepte enfin le contrat.
   window.animationApocalypse(onFin) — onFin est appelé juste avant
   la disparition de l'animation (pour remettre le contrat à zéro).
   ============================================================ */
(function () {
  'use strict';

  window.animationApocalypse = function (onFin) {
    const vol = (window.PIRE ? window.PIRE.getVol() : 80) / 100;

    // ---------- Scène ----------
    const scene = document.createElement('div');
    scene.id = 'apocalypse';
    scene.innerHTML = `
      <canvas></canvas>
      <div class="portail p-secondaire"><div class="anneau"></div><div class="anneau a2"></div></div>
      <div class="portail p-principal"><div class="anneau"></div><div class="anneau a2"></div><div class="anneau a3"></div></div>
      <div class="apo-flash"></div>
      <div class="apo-texte"></div>`;
    document.body.appendChild(scene);

    const cv = scene.querySelector('canvas');
    const ctx = cv.getContext('2d');
    const texte = scene.querySelector('.apo-texte');
    const flash = scene.querySelector('.apo-flash');
    const pPrin = scene.querySelector('.p-principal');
    const pSec = scene.querySelector('.p-secondaire');

    let W = 0, H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    function taille() {
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    taille();
    window.addEventListener('resize', taille);

    // ---------- Son (au volume du site, donc fort) ----------
    let ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; }

    function boom(force) {
      if (!ac) return;
      const len = Math.floor(ac.sampleRate * 1.5);
      const b = ac.createBuffer(1, len, ac.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 4);
      const s = ac.createBufferSource();
      s.buffer = b;
      const f = ac.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 250 + Math.random() * 500;
      const g = ac.createGain();
      g.gain.value = 0.9 * vol * force;
      s.connect(f); f.connect(g); g.connect(ac.destination);
      s.start();
    }

    function whoosh(dur, f0, f1) {
      if (!ac) return;
      const t = ac.currentTime;
      const o = ac.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f1, t + dur);
      const f = ac.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.7;
      const g = ac.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3 * vol + 0.0001, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(f); f.connect(g); g.connect(ac.destination);
      o.start(t); o.stop(t + dur + 0.05);
    }

    // ---------- Effets visuels ----------
    const parts = [];
    const ondes = [];
    const etoiles = [];
    let attraction = 0; // aspiration vers le portail central
    let warp = 0;       // vitesse de l'hyperespace

    for (let i = 0; i < 400; i++) {
      etoiles.push({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: Math.random() });
    }

    function secouer(fort) {
      const a = fort ? 30 : 12;
      const k = [];
      for (let i = 0; i < 8; i++) k.push({ transform: `translate(${(Math.random() - 0.5) * a}px, ${(Math.random() - 0.5) * a}px) rotate(${(Math.random() - 0.5) * (fort ? 3 : 1)}deg)` });
      k.push({ transform: 'none' });
      scene.animate(k, { duration: fort ? 700 : 350 });
    }

    function eclair(duree) {
      flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: duree || 500, easing: 'ease-out' });
    }

    function explosion(x, y, n, force) {
      const teinte = Math.random() * 360;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 2 + Math.random() * 10 * (force || 1);
        parts.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          vie: 1, dec: 0.007 + Math.random() * 0.015, taille: 2 + Math.random() * 4,
          coul: `hsl(${teinte + Math.random() * 70}, 100%, ${50 + Math.random() * 30}%)`
        });
      }
      ondes.push({ x, y, r: 10, vie: 1, coul: `hsl(${teinte}, 100%, 70%)` });
      boom(0.5 + Math.random() * 0.6 * (force || 1));
      secouer(force > 1);
    }

    const LETTRES = "CONTRAT D'UTILISATION ARTICLE 24×7 ALINÉA BIS TER QUATER §§§";
    function debris() {
      for (let i = 0; i < 4; i++) {
        const bord = Math.floor(Math.random() * 4);
        const x = bord === 0 ? Math.random() * W : bord === 1 ? W + 20 : bord === 2 ? Math.random() * W : -20;
        const y = bord === 0 ? -20 : bord === 1 ? Math.random() * H : bord === 2 ? H + 20 : Math.random() * H;
        parts.push({
          x, y, vx: 0, vy: 0, vie: 1, dec: 0.002,
          taille: 14 + Math.random() * 22,
          coul: `hsl(${170 + Math.random() * 140}, 100%, 70%)`,
          ch: LETTRES[Math.floor(Math.random() * LETTRES.length)]
        });
      }
    }

    let fini = false;
    function image() {
      if (fini) return;
      const cx = W / 2, cy = H / 2;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      // Hyperespace
      if (warp > 0) {
        ctx.lineCap = 'round';
        const f = Math.max(W, H) * 0.5;
        for (const s of etoiles) {
          const pz = s.z;
          s.z -= warp * 0.004;
          if (s.z <= 0.01) { s.x = (Math.random() - 0.5) * 2; s.y = (Math.random() - 0.5) * 2; s.z = 1; continue; }
          const sx = cx + (s.x / s.z) * f, sy = cy + (s.y / s.z) * f;
          const px = cx + (s.x / pz) * f, py = cy + (s.y / pz) * f;
          ctx.strokeStyle = `hsl(${(s.x + s.y) * 180 + performance.now() / 10}, 100%, ${60 + (1 - s.z) * 40}%)`;
          ctx.lineWidth = (1 - s.z) * 4 + 0.5;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(sx, sy); ctx.stroke();
        }
      }

      // Particules (étincelles + lettres du contrat)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        if (attraction > 0) {
          const dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy) + 1;
          p.vx += (dx / d) * attraction + (dy / d) * attraction * 0.7;
          p.vy += (dy / d) * attraction - (dx / d) * attraction * 0.7;
          p.vx *= 0.97; p.vy *= 0.97;
          if (d < 25) p.vie = 0;
        } else {
          p.vy += 0.12;
          p.vx *= 0.99;
        }
        p.x += p.vx; p.y += p.vy;
        p.vie -= p.dec;
        if (p.vie <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, Math.min(1, p.vie));
        ctx.fillStyle = p.coul;
        if (p.ch) {
          ctx.font = `bold ${p.taille}px Impact, sans-serif`;
          ctx.fillText(p.ch, p.x, p.y);
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.taille * p.vie + 0.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Ondes de choc
      for (let i = ondes.length - 1; i >= 0; i--) {
        const o = ondes[i];
        o.r += 14; o.vie -= 0.03;
        if (o.vie <= 0) { ondes.splice(i, 1); continue; }
        ctx.globalAlpha = o.vie;
        ctx.strokeStyle = o.coul;
        ctx.lineWidth = 8 * o.vie;
        ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(image);
    }
    requestAnimationFrame(image);

    // ---------- Texte ----------
    function dire(txt, cls) {
      texte.className = 'apo-texte' + (cls ? ' ' + cls : '');
      texte.textContent = txt;
      void texte.offsetWidth; // relance l'animation CSS
      texte.classList.add('montre');
    }

    // ---------- Chronologie ----------
    const minuteurs = [];
    const T = (ms, fn) => minuteurs.push(setTimeout(() => { if (!fini) fn(); }, ms));
    let ivDebris = null;

    // 0 s : le bouton explose
    eclair(700);
    explosion(W / 2, H / 2, 260, 1.6);
    dire('CONTRAT ACCEPTÉ');

    // Pluie d'explosions
    for (let k = 0; k < 14; k++) T(300 + k * 220, () => explosion(Math.random() * W, Math.random() * H * 0.85, 90, 1));
    T(1800, () => dire('⚠ ANOMALIE JURIDIQUE DÉTECTÉE ⚠', 'rouge'));

    // Portails
    T(3400, () => {
      pSec.classList.add('ouvert');
      whoosh(1.5, 80, 600);
      dire("OUVERTURE D'UN PORTAIL INTERDIMENSIONNEL");
    });
    T(4200, () => {
      pPrin.classList.add('ouvert');
      whoosh(2.5, 50, 1200);
      attraction = 0.35;
      ivDebris = setInterval(debris, 60);
    });
    T(5600, () => {
      const r = pSec.getBoundingClientRect();
      pSec.classList.add('implose');
      explosion(r.left + r.width / 2, r.top + r.height / 2, 160, 1.4);
    });
    T(6000, () => dire('LES CLAUSES SONT ASPIRÉES DANS LE VIDE'));

    // Hyperespace
    T(7500, () => {
      clearInterval(ivDebris);
      pPrin.classList.add('engloutit');
      warp = 4;
      whoosh(3.2, 40, 3000);
      dire('TRAVERSÉE DIMENSIONNELLE', 'arc');
    });
    ['DIMENSION 4', 'DIMENSION 17', 'DIMENSION 404', 'DIMENSION 8 000 000', 'DIMENSION ∞'].forEach((d, i) => {
      T(8400 + i * 450, () => { warp = 6 + i * 3; dire(d, 'arc'); });
    });

    // Arrivée
    T(10800, () => {
      eclair(1400);
      boom(1.6);
      secouer(true);
      warp = 0;
      attraction = 0;
      pPrin.style.display = 'none';
      pSec.style.display = 'none';
    });
    T(11300, () => dire("Bienvenue dans la dimension… du contrat d'utilisation.", 'calme'));

    // Retour au contrat
    T(13800, () => {
      if (typeof onFin === 'function') onFin();
      const sortie = scene.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, fill: 'forwards' });
      sortie.onfinish = () => {
        fini = true;
        minuteurs.forEach(clearTimeout);
        window.removeEventListener('resize', taille);
        if (ac) ac.close();
        scene.remove();
      };
    });
  };
})();
