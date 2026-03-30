# Challenge48h Backend API

Ce README decrit tous les endpoints exposes par l'API, avec leurs regles d'acces et schemas JSON.

## Base URL

- Local: `http://localhost:4000`
- Production: URL Vercel du projet

Note: selon l'environnement de deploiement/proxy, les endpoints peuvent etre exposes en
`/auth/...` ou `/api/auth/...` (idem pour `/users` et `/suivi`).

## Authentification

- Les routes protegees attendent un header HTTP:

```http
Authorization: Bearer <access_token>
```

- Roles applicatifs:
	- `agent`
	- `superviseur`
	- `admin`

## Schema d'erreur commun

La plupart des erreurs retournent ce format:

```json
{
	"message": "Error message"
}
```

## Endpoints

### 1) Sante API

#### GET /

- Description: verifier que l'API tourne
- Auth: non
- Roles: tous

Reponse 200:

```json
{
	"message": "API running"
}
```

### 2) Authentification

#### POST /auth/register

- Description: creer un utilisateur + ouvrir une session
- Auth: oui
- Roles autorises: `admin`, `superviseur`
- Regle speciale: seul `admin` peut forcer `role` dans le body

Body JSON:

```json
{
	"email": "user@example.com",
	"password": "password123",
	"nom": "Dupont",
	"prenom": "Jean",
	"telephone": "0612345678",
	"deviceName": "iPhone 15",
	"role": "agent"
}
```

Reponse 201:

```json
{
	"user": {
		"id": 12,
		"nom": "Dupont",
		"prenom": "Jean",
		"email": "user@example.com",
		"telephone": "0612345678"
	},
	"accessToken": "<jwt_access_token>",
	"refreshToken": "<jwt_refresh_token>"
}
```

Erreurs frequentes:

- `400` email/password manquants ou invalides
- `403` role force par un non-admin
- `409` email deja utilise

#### POST /auth/login

- Description: authentifier un utilisateur
- Auth: non
- Roles: tous
- Methode: `POST` uniquement (un `GET` retourne `405 Method not allowed`)

Body JSON:

```json
{
	"email": "user@example.com",
	"password": "password123",
	"deviceName": "iPhone 15"
}
```

Reponse 200:

```json
{
	"user": {
		"id": 12,
		"nom": "Dupont",
		"prenom": "Jean",
		"email": "user@example.com",
		"telephone": "0612345678"
	},
	"accessToken": "<jwt_access_token>",
	"refreshToken": "<jwt_refresh_token>"
}
```

Erreurs frequentes:

- `400` email/password manquants
- `401` credentials invalides

#### POST /auth/refresh

- Description: renouveler access/refresh token
- Auth: non (utilise le refresh token dans le body)
- Roles: tous

Body JSON:

```json
{
	"refreshToken": "<jwt_refresh_token>"
}
```

Reponse 200:

```json
{
	"accessToken": "<new_jwt_access_token>",
	"refreshToken": "<new_jwt_refresh_token>"
}
```

Erreurs frequentes:

- `400` refresh token manquant
- `401` refresh token invalide, expire ou session revoquee

#### POST /auth/logout

- Description: revoquer la session associee au refresh token
- Auth: non (utilise le refresh token dans le body)
- Roles: tous

Body JSON:

```json
{
	"refreshToken": "<jwt_refresh_token>"
}
```

Reponse 204: pas de body

Erreurs frequentes:

- `400` refresh token manquant
- `401` refresh token invalide

#### GET /auth/me

- Description: recuperer l'utilisateur connecte
- Auth: oui
- Roles: tous

Reponse 200:

```json
{
	"id": 12,
	"nom": "Dupont",
	"prenom": "Jean",
	"email": "user@example.com",
	"telephone": "0612345678"
}
```

Erreurs frequentes:

- `401` token absent/invalide/expire
- `404` utilisateur introuvable

### 3) Utilisateurs

Toutes les routes `/users/:id` sont protegees et limitees au proprietaire du compte (self access).

#### GET /users/:id

- Description: recuperer un profil utilisateur
- Auth: oui
- Roles: tous (self uniquement)

Reponse 200:

```json
{
	"id": 12,
	"nom": "Dupont",
	"prenom": "Jean",
	"email": "user@example.com",
	"telephone": "0612345678",
	"createdAt": "2026-03-30T10:00:00.000Z"
}
```

Erreurs frequentes:

- `403` acces a un autre utilisateur
- `404` utilisateur introuvable

#### PATCH /users/:id

- Description: modifier un profil utilisateur
- Auth: oui
- Roles: tous (self uniquement)

Body JSON (au moins un champ):

```json
{
	"nom": "NouveauNom",
	"prenom": "NouveauPrenom",
	"email": "new@example.com",
	"telephone": "0600000000"
}
```

Reponse 200:

```json
{
	"id": 12,
	"nom": "NouveauNom",
	"prenom": "NouveauPrenom",
	"email": "new@example.com",
	"telephone": "0600000000",
	"createdAt": "2026-03-30T10:00:00.000Z"
}
```

Erreurs frequentes:

- `400` aucun champ a modifier
- `403` acces a un autre utilisateur
- `409` email deja utilise

#### DELETE /users/:id

- Description: supprimer un utilisateur
- Auth: oui
- Roles: tous (self uniquement)

Reponse 204: pas de body

Erreurs frequentes:

- `403` acces a un autre utilisateur
- `404` utilisateur introuvable

#### POST /users/:id/email

- Description: envoyer un email a un utilisateur specifique
- Auth: oui
- Roles: `admin`, `superviseur`, ou proprietaire du compte (self)

Body JSON:

```json
{
	"subject": "Rappel",
	"message": "Bonjour, merci de verifier votre dossier."
}
```

Reponse 202:

```json
{
	"message": "Email sent"
}
```

Erreurs frequentes:

- `400` subject/message manquants
- `403` acces interdit
- `404` utilisateur introuvable

### 4) Suivi de formation

#### GET /suivi/formation-items

- Description: lister les elements de formation
- Auth: oui
- Roles: tous

Reponse 200:

```json
[
	{
		"id": 1,
		"titre": "Formation Secours a Personne",
		"description": "Validation des gestes techniques",
		"templateJson": {
			"HEMORRAGIE": false,
			"ACR": false,
			"BILAN": false
		}
	}
]
```

#### GET /suivi/formation-items/:id

- Description: recuperer un element de formation
- Auth: oui
- Roles: tous

Reponse 200:

```json
{
	"id": 1,
	"titre": "Formation Secours a Personne",
	"description": "Validation des gestes techniques",
	"templateJson": {
		"HEMORRAGIE": false,
		"ACR": false,
		"BILAN": false
	}
}
```

Erreurs frequentes:

- `400` id invalide
- `404` item introuvable

#### GET /suivi/

- Description: lister les suivis du user connecte
- Auth: oui
- Roles: tous

Reponse 200:

```json
[
	{
		"id": 10,
		"userId": 12,
		"itemId": 1,
		"estValide": false,
		"progressionPourcentage": 45,
		"dateValidation": null,
		"commentaires": "En cours",
		"donneesProgressionJson": {
			"HEMORRAGIE": true,
			"ACR": false,
			"BILAN": false
		}
	}
]
```

#### GET /suivi/:id

- Description: recuperer un suivi par son id
- Auth: oui
- Roles: tous

Reponse 200:

```json
{
	"id": 10,
	"userId": 12,
	"itemId": 1,
	"estValide": false,
	"progressionPourcentage": 45,
	"dateValidation": null,
	"commentaires": "En cours",
	"donneesProgressionJson": {
		"HEMORRAGIE": true,
		"ACR": false,
		"BILAN": false
	}
}
```

Erreurs frequentes:

- `400` id invalide
- `404` suivi introuvable

#### PATCH /suivi/:id

- Description: modifier un suivi
- Auth: oui
- Roles autorises: `admin`, `superviseur`

Body JSON:

```json
{
	"estValide": true,
	"progressionPourcentage": 100,
	"commentaires": "Valide",
	"donneesProgressionJson": {
		"HEMORRAGIE": true,
		"ACR": true,
		"BILAN": true
	}
}
```

Reponse 200:

```json
{
	"id": 10,
	"userId": 12,
	"itemId": 1,
	"estValide": true,
	"progressionPourcentage": 100,
	"dateValidation": "2026-03-30T10:20:00.000Z",
	"commentaires": "Valide",
	"donneesProgressionJson": {
		"HEMORRAGIE": true,
		"ACR": true,
		"BILAN": true
	}
}
```

Erreurs frequentes:

- `400` id invalide ou progression hors [0..100]
- `403` role insuffisant
- `404` suivi introuvable

## Deploiement Vercel (GitHub)

Le projet est configure pour un deploiement automatique via GitHub Actions vers Vercel.

### Fichiers de deploiement

- `vercel.json`
- `.github/workflows/vercel-deploy.yml`
- `api/index.ts`

### Secrets GitHub a ajouter

Dans GitHub > Settings > Secrets and variables > Actions:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Variables d'environnement Vercel

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_EXPIRY_DAYS`

### Branche de deploiement

Le workflow se declenche sur `push` de la branche `main`.
