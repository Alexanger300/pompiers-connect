# Challenge48h Backend API

Ce README decrit tous les endpoints exposes par l'API, avec leurs regles d'acces et schemas JSON.

## Base URL

- Local: `http://localhost:4000`
- Production: URL Vercel du projet

Note: selon l'environnement de deploiement/proxy, les endpoints peuvent etre exposes en
`/auth/...` ou `/api/auth/...` (idem pour `/users`, `/suivi`, `/disponibilites` et `/notifications`).

## Comptes staff par seed

Commande:

```bash
npm run seed:staff
```

Comportement:

- cree un compte `admin` si l'email configure n'existe pas
- cree un compte `superviseur` si l'email configure n'existe pas
- affiche les credentials generes uniquement pour les comptes nouvellement crees
- n'affiche pas de mot de passe pour un compte deja existant

Variables optionnelles:

- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_NOM`
- `SEED_ADMIN_PRENOM`
- `SEED_ADMIN_TELEPHONE`
- `SEED_SUPERVISEUR_EMAIL`
- `SEED_SUPERVISEUR_NOM`
- `SEED_SUPERVISEUR_PRENOM`
- `SEED_SUPERVISEUR_TELEPHONE`

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

#### GET /users

- Description: lister tous les utilisateurs
- Auth: oui
- Roles: `admin`, `superviseur`

Reponse 200:

```json
[
	{
		"id": 12,
		"nom": "Dupont",
		"prenom": "Jean",
		"email": "user@example.com",
		"role": "agent",
		"telephone": "0612345678",
		"createdAt": "2026-03-30T10:00:00.000Z"
	}
]
```

#### GET /users/:id

- Description: recuperer un profil utilisateur
- Auth: oui
- Roles: tous (self uniquement)

#### PATCH /users/:id

- Description: modifier son profil utilisateur
- Auth: oui
- Roles: tous (self uniquement)

Body JSON:

```json
{
	"nom": "NouveauNom",
	"prenom": "NouveauPrenom",
	"email": "new@example.com",
	"telephone": "0600000000"
}
```

#### PATCH /users/:id/role

- Description: promouvoir ou changer le role d'un utilisateur
- Auth: oui
- Roles: `admin`

Body JSON:

```json
{
	"role": "superviseur"
}
```

Valeurs possibles:

- `agent`
- `superviseur`
- `admin`

#### DELETE /users/:id

- Description: supprimer un utilisateur
- Auth: oui
- Roles: self, `admin`, `superviseur`

#### POST /users/:id/email

- Description: envoyer un email a un utilisateur specifique
- Auth: oui
- Roles: `admin`, `superviseur`, ou proprietaire du compte

Body JSON:

```json
{
	"subject": "Rappel",
	"message": "Bonjour, merci de verifier votre dossier."
}
```

#### POST /auth/register

- Description: creer un utilisateur depuis le front ou un back-office
- Auth: oui
- Roles: `admin`, `superviseur`
- Regle: `admin` peut creer n'importe quel role, `superviseur` cree uniquement des `agent`

Body JSON:

```json
{
	"email": "user@example.com",
	"password": "password123",
	"nom": "Dupont",
	"prenom": "Jean",
	"telephone": "0612345678",
	"deviceName": "BackOffice",
	"role": "agent"
}
```

### 4) Notifications

Les notifications sont separees des emails. Elles sont persistees en base dans la table `notifications`, puis le backend appelle le callback mobile configure par `MOBILE_NOTIFICATION_CALLBACK_URL`.

#### GET /notifications

- Description: lister les notifications envoyees
- Auth: oui
- Roles: `admin`, `superviseur`
- Regle: `admin` voit tout; `superviseur` voit les notifications qu'il a emises

Query params optionnels:

- `type=direct`
- `status=sent`

Reponse 200:

```json
[
	{
		"id": 3,
		"type": "broadcast",
		"senderUserId": 1,
		"title": "Alerte generale",
		"message": "Merci de consulter l'application",
		"data": {
			"screen": "home"
		},
		"recipientUserIds": [2, 3, 4],
		"recipientCount": 3,
		"status": "sent",
		"createdAt": "2026-03-31T08:00:00.000Z"
	}
]
```

#### POST /notifications/callback

- Description: demander l'envoi d'une notification a une liste de destinataires
- Auth: oui
- Roles: `admin`, `superviseur`

Body JSON:

```json
{
	"recipientUserIds": [12, 14],
	"title": "Alerte",
	"message": "Nouvelle information disponible",
	"data": {
		"screen": "planning"
	}
}
```

#### POST /notifications/broadcast

- Description: demander l'envoi d'une notification a tous les autres utilisateurs
- Auth: oui
- Roles: `admin`, `superviseur`

Body JSON:

```json
{
	"title": "Alerte generale",
	"message": "Merci de consulter l'application",
	"data": {
		"screen": "home"
	}
}
```

#### DELETE /notifications/:id

- Description: supprimer une notification enregistree
- Auth: oui
- Roles: `admin`, `superviseur`

### 5) Horaires / planning

#### GET /disponibilites

- Description: voir les horaires / disponibilites
- Auth: oui
- Roles: tous
- Regle: un utilisateur voit ses disponibilites; `admin`/`superviseur` peuvent filtrer avec `userId`

Query params optionnels:

- `userId=12`
- `dateJour=2026-03-31`

#### POST /disponibilites

- Description: creer un horaire / une disponibilite
- Auth: oui
- Roles: tous

Body JSON:

```json
{
	"dateJour": "2026-03-31",
	"tranche": "07h-19h",
	"statut": "disponible"
}
```

Valeurs possibles pour `tranche`:

- `07h-19h`
- `19h-07h`

Valeurs possibles pour `statut`:

- `disponible`
- `sollicite`
- `valide`
- `refuse`

#### PATCH /disponibilites/:id

- Description: modifier une disponibilite
- Auth: oui
- Roles: proprietaire du creneau, `admin`, `superviseur`

#### PATCH /disponibilites/:id/validate

- Description: valider un horaire
- Auth: oui
- Roles: `admin`, `superviseur`

#### PATCH /disponibilites/:id/reject

- Description: refuser un horaire
- Auth: oui
- Roles: `admin`, `superviseur`

### 6) Suivi de formation

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

#### GET /suivi/admin

- Description: voir tous les suivis de tous les agents
- Auth: oui
- Roles: `admin`, `superviseur`

Query params optionnels:

- `userId=12`
- `estValide=true`
- `estValide=false`

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
		},
		"userEmail": "user@example.com",
		"userNom": "Dupont",
		"userPrenom": "Jean",
		"formationTitre": "Formation Secours a Personne"
	}
]
```

#### GET /suivi/pending

- Description: lister globalement les suivis a valider
- Auth: oui
- Roles: `admin`, `superviseur`
- Regle: equivalent a `GET /suivi/admin?estValide=false`

Query params optionnels:

- `userId=12`

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
- `MOBILE_NOTIFICATION_CALLBACK_URL`
- `MOBILE_NOTIFICATION_CALLBACK_SECRET`

## Migration base de donnees

Pour supporter toutes les routes documentees ci-dessus, la base Supabase doit inclure les changements de `sql/supabase_schema.sql`:

- ajout de la table `notifications`
- ajout du statut `refuse` dans `statut_type`

### Branche de deploiement

Le workflow se declenche sur `push` de la branche `main`.
