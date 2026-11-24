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
| Baisser le son en criant dans le micro | `volume.html` (le curseur du bas ne fait que monter le son) |

Le contrat réapparaît 3 minutes après avoir été accepté.
