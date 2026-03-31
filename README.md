# Challenge48h Backend API

Ce README decrit tous les endpoints exposes par l'API, avec leurs regles d'acces et schemas JSON.

## Base URL

- Local: `http://localhost:4000`
- Production: URL Vercel du projet

Note: selon l'environnement de deploiement/proxy, les endpoints peuvent etre exposes en
`/auth/...` ou `/api/auth/...` (idem pour `/users`, `/suivi`, `/disponibilites`, `/notifications` et `/devices`).

## Vue d'ensemble technique

Le backend couvre 5 blocs fonctionnels:

- authentification et sessions JWT + refresh token stocke en base
- gestion des utilisateurs et des roles (`agent`, `superviseur`, `admin`)
- gestion des disponibilites / horaires
- suivi de formation
- notifications push mobiles

Architecture simplifiee:

```text
Front mobile / front admin
        |
        v
    Backend Express
        |
        +--> Supabase (users, sessions, notifications, user_devices, disponibilites, suivi_formation)
        |
        +--> Expo Push Service
                |
                +--> Android
                +--> iOS
```

## Ce qu'une autre IA ou un autre dev doit savoir

- ce backend ne depend plus d'un "callback notifications" externe
- les notifications push sont envoyees via Expo Push Service
- Android et iOS restent geres separement via des flags d'activation
- si la config d'une plateforme est absente, cette plateforme est ignoree a l'envoi
- l'app mobile doit enregistrer ses `ExpoPushToken` dans `/devices`
- Expo Go ne doit pas etre considere comme cible Android fiable pour ce systeme
- pour Expo, il faut privilegier un `development build` ou un vrai build natif

## Limites actuelles connues

- les notifications sont envoyees via Expo Push Service
- iOS peut rester desactive tant que `EXPO_PUSH_IOS_ENABLED=false`
- aucune file de jobs / retry systematique n'est implemente
- aucun "logout all devices" n'est implemente
- l'access token reste valide jusqu'a expiration meme si la session est revoquee

## Guide d'implementation mobile

Si une autre equipe doit brancher le mobile:

1. authentifier l'utilisateur via `/auth/login`
2. recuperer le token push de l'appareil
3. appeler `POST /devices` avec le `pushToken`
4. stocker localement `accessToken` et `refreshToken`
5. a chaque refresh du token push, renvoyer `POST /devices`
6. a la deconnexion locale, appeler `DELETE /devices/:id` puis `/auth/logout`

## Expo / React Native

Le projet mobile est annonce comme utilisant Expo Go. Important:

- ce backend est maintenant oriente Expo Push Service
- le front mobile doit envoyer un `ExpoPushToken` au backend
- Expo Go ne doit pas etre considere comme environnement cible Android fiable pour les notifications push
- pour tester serieusement les notifications, il faut un appareil reel et idealement un `development build`

## Matrice de configuration push

- Android actif si `EXPO_PUSH_ANDROID_ENABLED=true`
- Android desactive si `EXPO_PUSH_ANDROID_ENABLED=false`
- iOS actif si `EXPO_PUSH_IOS_ENABLED=true`
- iOS desactive si `EXPO_PUSH_IOS_ENABLED=false`

Le serveur doit demarrer meme si Android ou iOS n'est pas configure.

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

Deroulement:

1. le backend verifie l'email et le mot de passe
2. il genere un `accessToken` JWT court
3. il genere un `refreshToken` JWT long
4. il hash le `refreshToken` en SHA-256
5. il cree une ligne dans `sessions`
6. il retourne les 2 tokens au client

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

Deroulement:

1. le backend verifie la signature du `refreshToken`
2. il hash le token recu
3. il retrouve la session en base via `refresh_token_hash`
4. il refuse si la session est revoquee ou expiree
5. il genere un nouveau couple access/refresh token
6. il met a jour la session avec le nouveau hash de refresh token

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

Deroulement:

1. le backend retrouve la session via le hash du refresh token
2. il positionne `revoked_at`
3. l'access token deja emis reste cependant valide jusqu'a son expiration naturelle

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

### 4) Notifications

Les notifications sont separees des emails. Elles sont persistees en base dans la table `notifications`, puis le backend envoie des pushs systeme:

- via Expo Push Service
- Android seulement si `EXPO_PUSH_ANDROID_ENABLED=true`
- iOS seulement si `EXPO_PUSH_IOS_ENABLED=true`

Si la configuration d'un OS est absente, les notifications pour cet OS sont ignorees sans faire tomber l'API.

#### GET /devices

- Description: lister les appareils push de l'utilisateur connecte
- Auth: oui
- Roles: tous

Reponse 200:

```json
[
	{
		"id": 4,
		"userId": 12,
		"platform": "android",
		"pushToken": "ExponentPushToken[...]",
		"deviceName": "Pixel 8",
		"isActive": true,
		"lastSeenAt": "2026-03-31T09:00:00.000Z",
		"createdAt": "2026-03-30T18:00:00.000Z"
	}
]
```

#### POST /devices

- Description: enregistrer ou mettre a jour un appareil pour recevoir des notifications push
- Auth: oui
- Roles: tous

Body JSON:

```json
{
	"platform": "android",
	"pushToken": "device_push_token",
	"deviceName": "Samsung S24"
}
```

Reponse 201:

```json
{
	"id": 4,
	"userId": 12,
	"platform": "android",
	"pushToken": "device_push_token",
	"deviceName": "Samsung S24",
	"isActive": true,
	"lastSeenAt": "2026-03-31T09:00:00.000Z",
	"createdAt": "2026-03-31T09:00:00.000Z"
}
```

Notes d'implementation:

- l'appel sert a la fois pour une premiere inscription et pour un refresh de token
- le backend fait un `upsert` sur `push_token`
- `platform` doit valoir exactement `android` ou `ios`
- le token attendu ici est un `ExpoPushToken`
- le backend ne veut pas de token FCM/APNs natif dans cette version

Erreurs frequentes:

- `400` `platform` invalide
- `400` `pushToken` manquant

#### DELETE /devices/:id

- Description: desactiver un appareil push
- Auth: oui
- Roles: tous

Reponse 204: pas de body

Comportement:

- le device n'est pas supprime physiquement
- il passe `is_active = false`
- il ne recevra plus de push

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

Usage:

- `admin` voit toute l'historique
- `superviseur` ne voit que ses propres emissions
- `status` permet d'isoler `pending`, `sent` ou `failed`
- `type` permet de filtrer `direct` ou `broadcast`

#### POST /notifications/targeted

- Description: demander l'envoi d'une notification push a une liste de destinataires
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

Reponse 202:

```json
{
	"message": "Targeted notification requested",
	"id": 8,
	"recipients": 5
}
```

Deroulement interne:

1. le backend cree une ligne `notifications` avec statut `pending`
2. il charge tous les `user_devices` actifs des utilisateurs cibles
3. il partitionne les tokens `android` et `ios`
4. il construit les messages Expo Push
5. il envoie les messages a `https://exp.host/--/api/v2/push/send`
6. si un OS n'est pas configure, cet OS est ignore
7. les tokens invalides peuvent etre desactives
8. la notification passe a `sent` ou `failed`

#### POST /notifications/broadcast

- Description: demander l'envoi d'une notification push a tous les autres utilisateurs
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

Reponse 202:

```json
{
	"message": "Broadcast notification requested",
	"id": 9,
	"recipients": 42
}
```

Regle:

- l'utilisateur emetteur n'est pas inclus dans le broadcast

#### DELETE /notifications/:id

- Description: supprimer une notification enregistree
- Auth: oui
- Roles: `admin`, `superviseur`

Important:

- cette suppression ne "rappelle" pas une push deja envoyee au telephone
- elle supprime seulement l'entree d'historique en base

### 5) Horaires / planning

#### GET /disponibilites

- Description: voir les horaires / disponibilites
- Auth: oui
- Roles: tous
- Regle: un utilisateur voit ses disponibilites; `admin`/`superviseur` peuvent voir globalement et filtrer avec `userId`

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
- Regle: retourne uniquement les suivis du proprietaire du token

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
- Roles: proprietaire du suivi, `admin`, `superviseur`

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
- `403` acces interdit
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
- Regle: vue globale reservee au management

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
- `EXPO_ACCESS_TOKEN`
- `EXPO_PUSH_ANDROID_ENABLED`
- `EXPO_PUSH_IOS_ENABLED`

## Migration base de donnees

Pour supporter toutes les routes documentees ci-dessus, la base Supabase doit inclure les changements de `sql/supabase_schema.sql`:

- ajout de la table `notifications`
- ajout de la table `user_devices`
- ajout du statut `refuse` dans `statut_type`

Tables clefs a connaitre:

- `users`: utilisateurs applicatifs
- `sessions`: refresh tokens hashes et etat des sessions
- `user_devices`: appareils push actifs/inactifs
- `notifications`: historique logique des notifications emises
- `disponibilites`: horaires / disponibilites
- `suivi_formation`: progression de formation

Colonnes critiques:

- `sessions.refresh_token_hash`
- `sessions.revoked_at`
- `user_devices.platform`
- `user_devices.push_token`
- `user_devices.is_active`
- `notifications.type`
- `notifications.status`
- `notifications.recipient_user_ids`

## Variables d'environnement detaillees

Variables obligatoires au boot:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Variables optionnelles:

- `SESSION_EXPIRY_DAYS`
- `EXPO_ACCESS_TOKEN`
- `EXPO_PUSH_ANDROID_ENABLED`
- `EXPO_PUSH_IOS_ENABLED`
- `SEED_ADMIN_*`
- `SEED_SUPERVISEUR_*`

Interpretation:

- `EXPO_ACCESS_TOKEN` peut etre vide
- si `EXPO_PUSH_ANDROID_ENABLED=false`, Android est ignore a l'envoi
- si `EXPO_PUSH_IOS_ENABLED=false`, iOS est ignore a l'envoi
- l'API continue de demarrer dans les deux cas

## Checklist d'implementation pour une autre equipe

Backend:

1. appliquer la migration SQL
2. renseigner `.env`
3. verifier le demarrage avec `npm run dev`
4. tester `POST /auth/login`
5. tester `POST /devices`
6. tester `POST /notifications/targeted` et `POST /notifications/broadcast`

Front mobile:

1. obtenir la permission notifications
2. obtenir un push token sur appareil reel
3. appeler `POST /devices`
4. re-enregistrer le token si celui-ci change
5. supprimer/desactiver le device lors du logout

Front admin:

1. authentifier un `admin` ou `superviseur`
2. lister les utilisateurs via `GET /users`
3. envoyer une notif ciblee ou globale
4. consulter l'historique via `GET /notifications`

## Tests manuels recommandes

- login + refresh + logout
- inscription d'un appareil Android
- envoi d'une notification ciblee a un utilisateur ayant un device actif
- envoi d'un broadcast
- verification du fallback si iOS n'est pas configure
- validation et refus d'une disponibilite
- consultation globale `GET /suivi/admin`
- consultation `GET /suivi/pending`

## Risques et points d'attention

- Expo Go n'est pas un environnement de validation fiable pour ce systeme push reel
- les notifications push necessitent un appareil reel
- `DELETE /notifications/:id` n'annule pas une notif deja delivree
- les tokens appareils invalides doivent etre surveilles
- le systeme de session est fonctionnel mais pas encore "enterprise-grade"

### Branche de deploiement

Le workflow se declenche sur `push` de la branche `main`.
