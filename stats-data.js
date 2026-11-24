/* ============================================================
   Statistiques « en temps réel » (calculées au moment du téléchargement)
   ============================================================ */
(function () {
  'use strict';
  const { LS } = window.PIRE;
  const POP = 8.2e9;
  const t = () => Date.now() / 1000;
  const osc = (periode, amp) => 1 + amp * Math.sin(2 * Math.PI * t() / periode);
  const bruit = n => Math.floor(Math.random() * n);
  const secDuJour = () => { const d = new Date(); return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); };
  const nb = x => Math.round(x).toLocaleString('fr-FR');

  window.STATS = [
    { id: 'personnes_en_train_d_uriner', titre: "Personnes en train d'uriner en ce moment dans le monde",
      calc: () => nb(POP * 0.0024 * osc(97, 0.03) + bruit(5000)) + ' personnes' },
    { id: 'pigeons_qui_vous_regardent', titre: 'Pigeons fixant actuellement un humain dans les yeux',
      calc: () => nb(4e8 * 0.013 * osc(41, 0.1) + bruit(999)) + ' pigeons' },
    { id: 'chaussettes_orphelines', titre: 'Chaussettes orphelines en France (estimation)',
      calc: () => nb(287e6 + (t() - 1.7e9) / 3) + ' chaussettes' },
    { id: 'oubli_piece', titre: "Personnes ayant oublié pourquoi elles sont entrées dans une pièce (dernière minute)",
      calc: () => nb(POP * 0.00011 * osc(60, 0.2)) + ' personnes' },
    { id: 'euh_depuis_minuit', titre: '« Euh » prononcés en France depuis minuit',
      calc: () => nb(secDuJour() * 1133 + bruit(1133)) + ' « euh »' },
    { id: 'tartines_cote_beurre', titre: "Tartines tombées côté beurre aujourd'hui",
      calc: () => nb(secDuJour() * 3 + bruit(3)) + ' tartines' },
    { id: 'tartines_cote_sans_beurre', titre: "Tartines tombées côté sans beurre aujourd'hui",
      calc: () => '0 tartine' },
    { id: 'reunion_semblant', titre: "Personnes faisant semblant d'écouter en réunion",
      calc: () => nb(POP * 0.0031 * osc(300, 0.15)) + ' personnes' },
    { id: 'eternuements', titre: "Personnes en train d'éternuer",
      calc: () => nb(POP * 0.00002 * osc(13, 0.4)) + ' personnes' },
    { id: 'lecteurs_de_cette_stat', titre: 'Personnes en train de lire cette statistique',
      calc: () => '1 personne (vous)' },
    { id: 'temps_perdu', titre: 'Temps que vous avez perdu sur ce site',
      calc: () => { const s = Math.floor((Date.now() - LS.get('debut', Date.now())) / 1000); return Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; } },
    { id: 'clics_sur_ce_bouton', titre: 'Nombre de fois où vous avez téléchargé cette statistique',
      calc: () => { const c = LS.get('clicsStat', 0) + 1; LS.set('clicsStat', c); return c + ' fois'; } },
    { id: 'onglets_ouverts', titre: 'Onglets que vous avez ouverts sur ce site',
      calc: () => LS.get('onglets', 0) + ' onglets' },
    { id: 'utilite_du_site', titre: "Pourcentage d'utilité de ce site",
      calc: () => '0,000 %' },
    { id: 'nombre_de_stats', titre: 'Nombre de statistiques sur la page des statistiques',
      calc: () => window.STATS.length + ' statistiques' }
  ];
})();
