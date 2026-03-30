# Deploiement Vercel (GitHub)

Le projet est configure pour un deploiement automatique via GitHub Actions vers Vercel.

## Fichiers de deploiement

- [vercel.json](vercel.json)
- [.github/workflows/vercel-deploy.yml](.github/workflows/vercel-deploy.yml)
- [api/index.ts](api/index.ts)

## Secrets GitHub a ajouter

Dans GitHub > Settings > Secrets and variables > Actions, ajoute:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Variables d'environnement Vercel a definir

Dans le dashboard Vercel du projet, ajoute:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Branche de deploiement

Le workflow se declenche sur `push` de la branche `main`.
