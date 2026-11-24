# Le Site Le Plus Utile™ (le pire site du monde)

HTML + CSS + JS uniquement, pas de PHP.

## Lancer

Le micro ne marche qu'en `localhost`, donc lancer un petit serveur dans ce dossier :

```bash
python3 -m http.server 8000
```

(ou `php -S localhost:8000`), puis ouvrir http://localhost:8000 et **autoriser les pop-ups**.

## Les horreurs

| Idée | Où |
|---|---|
| Contrat infini à défilement très lent | `contrat.js` — la vraie croix est le « × » de « 24 × 7 » dans l'article 3 ; la grosse croix rouge s'enfuit et rouvre le contrat |
| Tous les boutons sont des triangles, texte qui dépasse | `style.css` (`button.tri`) + `common.js` (`trianglify`) |
| Retour au menu uniquement via la barre de recherche (taper « menu » ou « accueil ») | `common.js` |
| Chaque action ouvre un nouvel onglet | `common.js` (`ouvrir`) |
| Plein de pages inutiles | `page.html` + `pages.js` |
| Stats inutiles livrées en `.txt` | `stats.html`, `stats-data.js`, `telechargement.html` |
| Musique d'ascenseur générée en direct | `common.js` (`demarrerMusique`, démarre au premier clic/touche) |
| Le son part de 35 et ne monte qu'en spammant la barre espace (2 appuis = +1 %) ; il redescend tout seul (1 % / s) dès qu'on arrête | `common.js` — le curseur du bas, lui, ne fait toujours que monter |
| Sous 30 % de volume, le site entier se bloque (explosions plein écran, écran qui tremble) jusqu'à ce qu'on remonte le son | `common.js` (`majBlocageVolume`) + `style.css` (`#vol-bloque`) |
| Augmenter le son plus vite en criant dans le micro | `volume.html` |

Le contrat réapparaît 3 minutes après avoir été accepté.

Le contrat se termine vers l'article 120 (entre 118 et 123, ça change à chaque fois). Le bouton « J'accepte » lance l'animation d'apocalypse interdimensionnelle (`animation.js`), qui ramène ensuite à une nouvelle version du contrat, à relire depuis le début.
