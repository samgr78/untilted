/* ============================================================
   Plein de pages inutiles, servies par page.html?id=...
   ============================================================ */
(function () {
  'use strict';
  const { LS, ouvrir, toast } = window.PIRE;
  const P = new URLSearchParams(location.search);
  const id = P.get('id') || 'erreur';
  const n = Math.max(1, parseInt(P.get('n') || '1', 10) || 1);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hasard = arr => arr[Math.floor(Math.random() * arr.length)];

  const PAGES = {

    'merci-contrat': {
      titre: 'Merci !',
      html: () => `<div class="encart"><p>Merci d'avoir accepté le contrat sans l'avoir lu, comme tout le monde.</p>
        <p>Votre acceptation est valable <strong>3 minutes</strong>. Passé ce délai, il faudra le relire.</p></div>`
    },

    'a-propos': {
      titre: 'À propos de la page À propos',
      html: () => `<div class="encart"><p>Cette page a pour but de vous présenter la page « À propos ».</p>
        <p>La page « À propos », quant à elle, a pour but de vous présenter cette page.</p>
        <p>Nous espérons que ces informations vous auront été utiles.</p></div>
        <button data-href="page.html?id=a-propos-bis&n=2">En savoir plus à propos de cette page à propos</button>`
    },

    'a-propos-bis': {
      titre: () => 'À propos de ' + 'la page À propos de '.repeat(n - 1) + 'la page À propos',
      html: () => `<div class="encart"><p>Niveau de profondeur : <strong>${n}</strong>.</p>
        <p>${'Toujours à propos. '.repeat(n * 3)}</p></div>
        <button data-href="page.html?id=a-propos-bis&n=${n + 1}">Encore plus à propos</button>`
    },

    'vide': {
      titre: 'Page vide',
      html: () => `<p>Cette page est volontairement vide. Inutile de faire défiler.</p>
        <div style="height:5000px"></div>
        <p>Vous avez fait défiler quand même. Il n'y a toujours rien.</p>`
    },

    'chargement': {
      titre: 'Chargement',
      html: () => `<div class="encart"><p id="txt-chargement">Chargement : 100 %</p>
        <div class="jauge"><div id="barre-chargement" style="width:100%"></div></div></div>`,
      init: () => {
        const b = document.getElementById('barre-chargement');
        const t = document.getElementById('txt-chargement');
        let p = 100;
        const iv = setInterval(() => {
          p -= Math.random() * 3;
          if (p <= 0) {
            p = 0; clearInterval(iv);
            t.textContent = "Déchargement terminé. Il n'y avait rien à charger.";
          } else t.textContent = 'Chargement : ' + p.toFixed(1) + ' %';
          b.style.width = p + '%';
        }, 200);
      }
    },

    'contact': {
      titre: 'Nous contacter',
      html: () => `<div class="encart"><p>Une question ? Une remarque ? Gardez-la pour vous. Sinon, remplissez ce formulaire.</p>
        <form id="form-contact" class="formulaire">
          <label>Nom (écrit à l'envers) <input name="nom"></label>
          <label>Prénom de votre arrière-grand-mère maternelle <input name="aieule"></label>
          <label>Numéro de téléphone (glissez jusqu'au bon) :
            <input type="range" id="tel" min="600000000" max="799999999" value="700000000">
            <output id="tel-val"></output></label>
          <label>Votre humeur, sur une échelle de 3,7 à π <input type="number" step="0.01"></label>
          <label>Message (12 caractères maximum) <textarea maxlength="12" rows="2"></textarea></label>
          <label><input type="checkbox" required> J'accepte que mon message ne soit jamais lu</label>
          <button type="submit">Envoyer</button>
        </form></div>`,
      init: () => {
        const tel = document.getElementById('tel');
        const out = document.getElementById('tel-val');
        const maj = () => { out.textContent = ('0' + tel.value).replace(/(\d{2})(?=\d)/g, '$1 '); };
        tel.addEventListener('input', maj); maj();
        document.getElementById('form-contact').addEventListener('submit', e => {
          e.preventDefault();
          e.target.reset(); maj();
          ouvrir('page.html?id=contact-envoye');
        });
      }
    },

    'contact-envoye': {
      titre: 'Message envoyé',
      html: () => `<div class="encart"><p>Votre message a été envoyé directement à la corbeille.</p>
        <p>Délai de réponse estimé : <strong>7 à 12 ans</strong>.</p></div>`
    },

    'meteo-hier': {
      titre: "Météo d'hier",
      html: () => `<div class="encart"><p>Hier, il a fait : <strong>${hasard(['beau', 'moche', 'un temps de saison', 'un temps hors saison', 'gris clair foncé', 'le temps qu\'il a fait'])}</strong>.</p>
        <p>Température ressentie : ${(Math.random() * 40 - 5).toFixed(1)} °C. Température réelle : on ne sait plus.</p>
        <p>Fiabilité de la prévision : <strong>100 %</strong>. Utilité : <strong>0 %</strong>.</p></div>`
    },

    'boutique': {
      titre: 'Boutique',
      html: () => {
        const produits = [
          ['Air en bouteille (déjà respiré)', '12,99 €'],
          ['Trou, format A4', '3,50 €'],
          ["Notice de montage d'une chaise que nous ne vendons pas", '29,00 €'],
          ['Wi-Fi en poudre (ajouter de l\'eau)', '49,90 €'],
          ['Abonnement Premium (même site, plus cher)', '999 €/mois']
        ];
        return '<div class="grille">' + produits.map(([nom, prix]) => `
          <div class="carte"><h3>${nom}</h3><p>${prix}</p>
          <p class="petit">Rupture de stock depuis 1997</p>
          <button data-href="page.html?id=panier">Ajouter au panier</button></div>`).join('') + '</div>';
      }
    },

    'panier': {
      titre: 'Votre panier',
      html: () => `<div class="encart"><p>Votre panier contient <strong>0 article</strong>.</p>
        <p>Nous avons retiré l'article que vous venez d'ajouter pour vous éviter une dépense inutile.</p></div>
        <button data-href="page.html?id=erreur">Valider la commande</button>`
    },

    'faq': {
      titre: 'Foire aux questions (jamais posées)',
      html: () => {
        const qr = [
          ['Pourquoi ce site existe-t-il ?', 'Nous nous posons la même question.'],
          ['Comment revenir au menu ?', 'Utilisez la barre de recherche. Comme sur tous les sites normaux.'],
          ['Pourquoi tous les boutons sont-ils des triangles ?', 'Les ronds étaient déjà pris.'],
          ['Comment baisser le son ?', 'Criez.'],
          ['Pourquoi ai-je 47 onglets ouverts ?', 'Parce que vous avez cliqué 47 fois.'],
          ['Cette FAQ répond-elle à ma question ?', 'Non.']
        ];
        return '<div class="encart">' + qr.map(([q, r]) => `<h3>${q}</h3><p>${r}</p>`).join('') + '</div>';
      }
    },

    'plan': {
      titre: 'Plan du site',
      html: () => {
        const L = [
          ['Statistiques', 'stats.html'], ['Volume', 'volume.html'], ['À propos', 'page.html?id=a-propos'],
          ['Contact', 'page.html?id=contact'], ['Boutique', 'page.html?id=boutique'], ['FAQ', 'page.html?id=faq'],
          ['Page vide', 'page.html?id=vide'], ['Météo', 'page.html?id=meteo-hier'], ['Horloge', 'page.html?id=horloge']
        ];
        const cibles = L.map(x => x[1]).sort(() => Math.random() - 0.5);
        return `<p>Retrouvez ici toutes les pages du site. Probablement pas aux bons endroits.</p>
          <div class="menu">${L.map((x, i) => `<button data-href="${cibles[i]}">${x[0]}</button>`).join('')}</div>`;
      }
    },

    'parametres': {
      titre: 'Paramètres',
      html: () => {
        const opts = ['Mode sombre', 'Mode clair', 'Mode ni l\'un ni l\'autre', 'Désactiver les nouveaux onglets', 'Rendre les boutons ronds', 'Activer l\'utilité', 'Accepter les cookies (au chocolat)'];
        return '<div class="encart formulaire">' + opts.map(o => `<label><input type="checkbox" class="param"> ${o}</label>`).join('') + '</div>';
      },
      init: () => {
        document.querySelectorAll('.param').forEach(c => c.addEventListener('change', () => {
          ouvrir('page.html?id=parametre-enregistre');
          setTimeout(() => { c.checked = !c.checked; toast('Paramètre réinitialisé par mesure de sécurité.'); }, 1500);
        }));
      }
    },

    'parametre-enregistre': {
      titre: 'Paramètre enregistré',
      html: () => `<div class="encart"><p>Votre paramètre a bien été enregistré.</p><p>Il n'aura aucun effet.</p></div>`
    },

    'mentions': {
      titre: 'Mentions illégales',
      html: () => `<div class="encart">
        <p><strong>Éditeur :</strong> quelqu'un, quelque part.</p>
        <p><strong>Hébergeur :</strong> un ordinateur allumé, on espère.</p>
        <p><strong>Directeur de la publication :</strong> personne n'a voulu.</p>
        <p><strong>Propriété intellectuelle :</strong> aucune intelligence n'a été utilisée dans la conception de ce site.</p></div>`
    },

    'compteur': {
      titre: 'Compteur de visiteurs',
      html: () => {
        const v = LS.get('visitesCompteur', 0) + 1;
        LS.set('visitesCompteur', v);
        return `<div class="encart" style="text-align:center"><p>Vous êtes le visiteur n°</p>
          <p style="font-family:'Courier New',monospace;font-size:48px;background:#000;color:#0f0;display:inline-block;padding:4px 12px">000001</p>
          <p>C'est votre ${v}<sup>e</sup> visite sur cette page. Vous êtes toujours le seul.</p></div>`;
      }
    },

    'horloge': {
      titre: 'Horloge en temps réel (il y a 5 minutes)',
      html: () => `<div class="encart" style="text-align:center"><p id="heure" style="font-size:60px;font-family:Impact,sans-serif;margin:0"></p>
        <p>Heure exacte d'il y a 5 minutes. Pour l'heure actuelle, revenez dans 5 minutes.</p></div>`,
      init: () => {
        const el = document.getElementById('heure');
        const maj = () => { el.textContent = new Date(Date.now() - 5 * 60000).toLocaleTimeString('fr-FR'); };
        maj(); setInterval(maj, 1000);
      }
    },

    'page-suivante': {
      titre: () => `Page ${n} sur ∞`,
      html: () => `<div class="encart"><p>Cette page n'existe que pour vous mener à la page suivante.</p>
        ${n >= 50 ? '<p><strong>Félicitations, page ' + n + ' ! Il n\'y a rien ici non plus.</strong></p>' : ''}</div>
        <button data-href="page.html?id=page-suivante&n=${n + 1}">Page suivante</button>`
    },

    'bouton-interdit': {
      titre: 'Ne cliquez PAS sur ce bouton',
      html: () => `<div class="encart"><p>${n > 1 ? `Vous avez cliqué <strong>${n - 1}</strong> fois sur le bouton sur lequel il ne fallait pas cliquer.` : 'Merci de ne pas cliquer sur le bouton ci-dessous.'}</p></div>
        <button data-href="page.html?id=bouton-interdit&n=${n + 1}">Ne pas cliquer</button>`
    },

    'recherche': {
      titre: 'Résultats de recherche',
      html: () => {
        const q = P.get('q') || '';
        const inverse = [...q].reverse().join('');
        return `<div class="encart"><p>Résultats pour « <strong>${esc(q)}</strong> » : <strong>0 résultat</strong> (trouvés en 4,7 secondes).</p>
          <p>Vouliez-vous dire : <strong>${esc(inverse)}</strong> ?</p>
          <p class="petit">Conseil : la recherche ne trouve jamais rien, sauf la page principale du site.</p></div>
          <button data-href="page.html?id=recherche&q=${encodeURIComponent(inverse)}">Rechercher « ${esc(inverse)} »</button>`;
      }
    },

    'erreur': {
      titre: 'Erreur 200',
      html: () => `<div class="encart"><p><strong>Erreur 200 — OK.</strong></p>
        <p>Tout fonctionne normalement. Nous ne savons pas pourquoi vous êtes ici.</p></div>`
    },

      'important-offre':{
          titre: 'Offre de Bienvenu Important',
          html:() => '<div class="encart"><p>Cliquer sur le le lien pour acceder a loffre</p> <a href="https://samuelgallianiroyer.fr ">Offre -20%</a> <a href="https://www.iledefrance.fr/decouvrir-la-richesse-du-patrimoine/patrimoine-artistique-et-architectural/le-domaine-de-villarceaux">Offre -20%</a> <a href="https://youtu.be/bDYNNDKcYxA?si=iNf4d7HqEL4xsJpG&t=7">Offre -70 PUTAIN CEST EXEPTIONNELLE CLQIQUE VITE VITE VITE</a>'
      },

  };

  const page = PAGES[id] || PAGES.erreur;
  const titre = typeof page.titre === 'function' ? page.titre() : page.titre;
  document.title = titre;
  document.getElementById('contenu').innerHTML = `<h1>${esc(titre)}</h1>` + page.html();
  if (page.init) page.init();
})();
