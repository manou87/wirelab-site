# Brancher wirelab.pro (GoDaddy → GitHub Pages)

Repo public : **https://github.com/manou87/wirelab-site** (racine = site)

## 1. GitHub

Settings → Pages → Branch `main` · Folder `/`  
Custom domain = `wirelab.pro` (déjà dans `CNAME`) · coche **Enforce HTTPS** quand le certificat est prêt.

## 2. GoDaddy DNS

Chez GoDaddy → Domaines → wirelab.pro → DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | `@` | `185.199.108.153` | 600 |
| A | `@` | `185.199.109.153` | 600 |
| A | `@` | `185.199.110.153` | 600 |
| A | `@` | `185.199.111.153` | 600 |
| CNAME | `www` | `manou87.github.io` | 600 |

Supprime les anciens A/CNAME parking GoDaddy qui entrent en conflit.

## 3. Modifier la vitrine

Édite `docs/index.html` (et `docs/assets/`) sur GitHub ou en local, puis push sur `main`.  
Comme Electro DZ : un push = site à jour.
