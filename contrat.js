/* ============================================================
   Contrat d'utilisation : défilement très lent + infini.
   La vraie croix est cachée dans l'article 3 (le « × » de 24 × 7).
   ============================================================ */
(function () {
  'use strict';
  const { LS, ouvrir, toast } = window.PIRE;
  const VALIDITE = 3 * 60 * 1000; // l'acceptation expire au bout de 3 minutes

  const overlay = document.getElementById('contrat');
  const boite = overlay.querySelector('.contrat-boite');
  const texte = document.getElementById('contrat-texte');
  const articles = document.getElementById('articles');
  const fausseCroix = document.getElementById('fausse-croix');
  const croixSecrete = document.getElementById('croix-secrete');

  if (Date.now() - LS.get('contratAccepte', 0) < VALIDITE) return;

  overlay.hidden = false;
  document.body.classList.add('bloque');

  const CLAUSES = [
    "L'utilisateur reconnaît avoir lu le présent contrat avant même de l'avoir ouvert.",
    "Le site décline toute responsabilité, y compris celle de décliner toute responsabilité.",
    null, // article 3 : spécial (contient la vraie croix)
    "Toute tentative de compréhension du présent contrat sera considérée comme une acceptation tacite.",
    "L'utilisateur s'engage à ne pas utiliser le site de manière utile.",
    "Les cookies utilisés par ce site sont aux pépites de chocolat. Aucun ne vous sera remis.",
    "En cas de litige, le tribunal compétent sera celui de la planète Mars, chambre des réclamations sans objet.",
    "L'utilisateur cède au site ses droits sur tous les mots qu'il pensera en lisant cet article, y compris « pourquoi ».",
    "Le site se réserve le droit de modifier le présent contrat pendant que vous le lisez. C'est d'ailleurs ce qu'il fait.",
    "Il est interdit de faire défiler ce contrat trop vite. Le site s'en charge pour vous, à sa vitesse.",
    "Toute ressemblance entre ce site et un site utile serait purement fortuite.",
    "L'utilisateur accepte que chaque action ouvre un nouvel onglet, ainsi que les conséquences sur sa mémoire vive.",
    "Le volume sonore du site ne peut être baissé que par la voix de l'utilisateur, à pleine puissance.",
    "Les statistiques fournies sont exactes au moment où vous ne les lisez pas.",
    "Le présent article a été laissé volontairement vide, à l'exception de cette phrase.",
    "Le site peut être consulté de 0 h 00 à 23 h 59, sauf pendant les heures d'ouverture.",
    "En acceptant ce contrat, vous acceptez également le contrat suivant, qui n'a pas encore été rédigé.",
    "L'utilisateur reconnaît que la lecture de cet article lui a pris environ 4 secondes de vie, non remboursables."
  ];
  const SUFFIXES = ['', ' (bis)', ' (ter)', ' (quater)', ' (quinquies)', ' (sexies)'];

  // Le contrat a une vraie fin… vers l'article 120 (à quelques articles près, ça change à chaque fois).
  const FIN = 118 + Math.floor(Math.random() * 6);

  let n = 0;
  function ajouterArticle() {
    if (n >= FIN) return;
    n++;
    const p = document.createElement('p');
    if (n === FIN) {
      p.innerHTML = `<strong>Article ${n} et dernier.</strong> Le présent contrat prend fin ici. Félicitations : vous êtes la première personne à l'avoir lu en entier. En cliquant sur le bouton ci-dessous, vous acceptez l'ensemble des ${n} articles, ainsi que toutes leurs conséquences, y compris dimensionnelles.`;
    } else if (n === 3) {
      p.innerHTML = '<strong>Article 3.</strong> Le présent contrat est valable 24 h sur 24 et 7 jours sur 7, soit 24 <span id="vraie-croix">×</span> 7 = 168 heures par semaine, renouvelables tacitement jusqu\'à la fin des temps, et même un peu après.';
    } else {
      const base = CLAUSES[(n - 1) % CLAUSES.length] || CLAUSES[0];
      const tour = Math.floor((n - 1) / CLAUSES.length);
      const suffixe = SUFFIXES[tour % SUFFIXES.length] + (tour >= SUFFIXES.length ? ' (encore)' : '');
      const renvoi = n > 5 ? ` Conformément à l'article ${Math.floor(Math.random() * (n - 1)) + 1}, alinéa ${n % 7 + 1}.` : '';
      p.innerHTML = `<strong>Article ${n.toLocaleString('fr-FR')}${suffixe}.</strong> ${base}${renvoi}`;
    }
    articles.appendChild(p);
  }
  for (let i = 0; i < 40; i++) ajouterArticle();

  // « Infini » : dès qu'on approche du bas, on rajoute des articles (jusqu'à la fin).
  function verifierFin() {
    if (texte.scrollTop + texte.clientHeight > texte.scrollHeight - 400) {
      for (let i = 0; i < 10; i++) ajouterArticle();
    }
  }

  // Défilement très, très lent.
  const PAS = 2;
  function defiler(sens) { texte.scrollTop += sens * PAS; verifierFin(); }

  overlay.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.deltaY) defiler(Math.sign(e.deltaY));
  }, { passive: false });

  let yTouch = null;
  overlay.addEventListener('touchstart', e => { yTouch = e.touches[0].clientY; }, { passive: true });
  overlay.addEventListener('touchmove', e => {
    e.preventDefault();
    const y = e.touches[0].clientY;
    if (yTouch !== null && y !== yTouch) defiler(Math.sign(yTouch - y));
    yTouch = y;
  }, { passive: false });

  const TOUCHES = { ArrowDown: 1, PageDown: 1, ' ': 1, End: 1, ArrowUp: -1, PageUp: -1, Home: -1 };
  document.addEventListener('keydown', e => {
    if (overlay.hidden || !(e.key in TOUCHES)) return;
    e.preventDefault();
    defiler(TOUCHES[e.key]);
  });

  // Le contrat remonte tout seul, un tout petit peu, régulièrement.
  setInterval(() => { if (!overlay.hidden) texte.scrollTop -= 1; }, 2500);

  // Fermeture (la vraie)
  function fermer() {
    LS.set('contratAccepte', Date.now());
    overlay.hidden = true;
    document.body.classList.remove('bloque');
    toast('Contrat accepté. Votre acceptation expirera dans 3 minutes.');
    ouvrir('page.html?id=merci-contrat');
  }
  articles.addEventListener('click', e => { if (e.target.id === 'vraie-croix') fermer(); });

  // Remet le contrat à zéro (nouvelle version, tout en haut).
  function reinitialiser() {
    articles.innerHTML = '';
    n = 0;
    for (let i = 0; i < 40; i++) ajouterArticle();
    texte.scrollTop = 0;
    document.getElementById('contrat-titre').textContent =
      `Contrat d'utilisation (version ${48 + Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}-bêta-final-v${Math.floor(Math.random() * 9) + 4})`;
    toast('Une nouvelle version du contrat est disponible. Veuillez la relire depuis le début.');
  }

  // Quelqu'un a atteint le bas et accepte : apocalypse interdimensionnelle, puis retour au contrat.
  let enCours = false;
  document.getElementById('accepter').addEventListener('click', () => {
    if (enCours) return;
    enCours = true;
    window.animationApocalypse(() => { reinitialiser(); enCours = false; });
  });
  // Troisième croix, planquée dans le coin de la page, quasi invisible à l'œil nu.
  croixSecrete.addEventListener('click', fermer);

  // La fausse croix s'enfuit.
  fausseCroix.addEventListener('mouseenter', () => {
    const w = boite.clientWidth - 40, h = boite.clientHeight - 40;
    fausseCroix.style.right = 'auto';
    fausseCroix.style.left = Math.floor(Math.random() * w) + 'px';
    fausseCroix.style.top = Math.floor(Math.random() * h) + 'px';
  });
  fausseCroix.addEventListener('click', () => {
    toast('Ce n’était pas la bonne croix.');
    ouvrir('index.html');
  });
})();
