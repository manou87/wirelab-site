# Méthode EduVolt (câblage) — sauvegarde

Mise de côté le **2026-10-15** pour revenir au câblage **classique** WireLab.
À retester plus tard ; plusieurs défauts constatés sur v160.

## Où retrouver le code complet

| Emplacement | Contenu |
|---|---|
| Branche `cursor/eduvolt-route-fix-18da` | Panneau entier v160 (dernier état) |
| Branche `cursor/eduvolt-route-toggle-18da` | Première version (v159, interrupteur EV) |
| `refs/eduvolt-route-method-v160.excerpt.js` | Extraits : toggle, routeur, stubs, raccord |
| PRs (draft) | wirelab-pro #36 · wirelab-site #37 |

Rev panneau concernée : `native-shell-8777-v160-eduvolt-route-fix`.

## Règles de la méthode (rappel)

1. **Interrupteur EV** — OFF = classique 100 % ; ON = mode EduVolt.
2. **Grille** — step `50` (classique = `100`).
3. **Flèches / repères de sortie** — indiquent le sens obligatoire de sortie de chaque borne.
4. **Stub** — 1 case dans le sens de la flèche avant tout coude.
5. **Anti U-turn** — après la flèche, pas de retour inverse sur le même segment ; coude 90° pour changer de direction.
6. **Coudes** — sur les **côtés / coins de la grille** (multiples du step).
7. **Raccord** — direct sur la borne (pas de jog multi-points / pastille).

## Comment réactiver plus tard

```bash
git checkout cursor/eduvolt-route-fix-18da
# ou recopier les blocs depuis refs/eduvolt-route-method-v160.excerpt.js
# dans swissdz-panel/index.html (voir commentaires v159 / v160)
```

Ne pas charger le `.excerpt.js` tel quel dans le navigateur : ce sont des fragments à réintégrer.
