# Contrôle électrique — câble secteur Fluke (chemin isolé)

## Deux programmes / deux chemins

| Chemin | Où | Fluke | Câble secteur |
|--------|----|-------|---------------|
| **Contrôle électrique** | Overlay `#ctrlElec` + Flutter `#/trainer` (sans iframe meter-embed) | Maquette OIBT locale | **Oui** — module `controle-elec/` |
| **Catalogue plan** | Composant `fluke_1664` / `flukeMeter` sur le plan CAD | iframe `meter-embed.html?embed=1#/meter` | **Non** — pointes L/N/PE libres + pont `__wirelabFluke` |

Règle : ce module **ne modifie pas** le layout, le moteur ni l’UI du Fluke catalogue (`mountFlukeMeter`, `pushFlukeEmbedVoltages`, CHECK LEADS / RISO plan).  
Les patches Flutter liés au câble secteur sont **gardés hors `embed=1`**.

## Modèle UX (câble logique)

Pas une photo unique à glisser. Trois éléments :

1. **Embout tête L/PE/N** — se clipse sur la zone bornes du Fluke (`clipFluke`)
2. **Fil déroulé** — polyline SVG (stubs + Manhattan + coudes arrondis, même esprit que le moteur de câblage)
3. **Embout fiche Schuko** — se branche sur la prise mono **R2** (`plugR2`)

CHECK LEADS côté trainer ne se résout que si `clipFluke && plugR2` (pont `__ctrlFlukeMains`).

## Photos (sprites RGBA découpés)

- `assets/fluke/fluke-cable-secteur-tete-lpn.png` — tête L/PE/N seule, fond transparent
- `assets/fluke/fluke-cable-secteur-schuko.png` — fiche Schuko seule, fond transparent  
Affichage sans pastille / boîte blanche : sprites `object-fit: contain`.  
Le lien entre les deux = **fil SVG noir dynamique**, pas le câble de la photo.

## Utilisation

1. Menu → **Contrôle électrique**
2. Glisser la **tête** sur la zone bornes du Fluke (clip L·PE·N)
3. Glisser la **fiche** sur la prise mono **R2** — le câble se déroule entre les embouts
4. Les deux côtés OK → mesures mono possibles
5. Double-clic sur un embout ou bouton **Débrancher** pour reset

## Fichiers

- `controle-elec/mains-cable.js` — état `clipFluke` / `plugR2`, drag embouts, polyline
- `controle-elec/mains-cable.css`
- Pont JS dans `oibt-trainer/main.dart.js` : `window.__ctrlFlukeMains` (no-op si `embed=1`)
