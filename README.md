# Pompiers Connect - Frontend

Application frontend pour la gestion et la formation des pompiers, développée avec les technologies web modernes pour une expérience utilisateur optimale.

## 📚 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Scripts disponibles](#scripts-disponibles)
- [Structure du projet](#structure-du-projet)
- [Configuration Vite](#configuration-vite)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Développement](#développement)

## 🎯 Vue d'ensemble

Pompiers Connect est une application web de gestion des ressources et de formation pour les services de pompiers. L'application fournit:

- **Dashboard** - Vue d'ensemble consolidée des activités
- **Gestion des utilisateurs** - Administration et gestion des comptes
- **Calendrier** - Planification et suivi des événements
- **Gestion des compétences** - Suivi des formations et des compétences
- **Notifications** - Système d'alertes et notifications en temps réel
- **Planification superviseur** - Gestion des horaires et des plannings

## 🛠️ Technologies

### Frontend Stack
- **Framework UI**: React 18+ avec TypeScript
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS + CSS Modules
- **UI Components**: shadcn/ui (basé sur Radix UI)
- **Forms**: React Hook Form + Zod pour la validation
- **State Management**: TanStack React Query + React Context
- **Animations**: Framer Motion
- **Charting**: Recharts
- **Routing**: React Router v6
- **Toast Notifications**: Sonner

### Services Backend
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Context API + JWT (via backend)

### Outils de développement
- **Linting & Formatting**: ESLint + TypeScript ESLint
- **Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright
- **Build Tools**: PostCSS, TypeScript 5.8

## 📋 Prérequis

- **Node.js**: >= 18.x
- **Package Manager**: npm, yarn, pnpm ou bun
- **Navigateur moderne**: Chrome, Firefox, Safari, ou Edge (versions récentes)
- **Git**: Pour cloner et gérer les versions

## 📦 Installation

### 1. Cloner le repository

```bash
git clone <repository-url>
cd pompiers-connect
```

### 2. Installer les dépendances

Avec **npm**:
```bash
npm install
```

Avec **bun**:
```bash
bun install
```

Avec **pnpm**:
```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Voir la section [Configuration de l'environnement](#configuration-de-lenvironnement) ci-dessous.

## 🌍 Configuration de l'environnement

### Création du fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes:

```env
# Vite - Configuration de l'application
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Pompiers Connect
VITE_APP_VERSION=0.0.0

# Supabase - Configuration de la base de données
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_MOCK_DATA=true
VITE_ENV=development
```

### Description détaillée des variables

| Variable | Description | Valeur par défaut | Requis |
|----------|-------------|-------------------|--------|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:4000` | ✅ |
| `VITE_APP_NAME` | Nom de l'application affiché | `Pompiers Connect` | ❌ |
| `VITE_APP_VERSION` | Version actuelle de l'app | `0.0.0` | ❌ |
| `VITE_SUPABASE_URL` | URL du projet Supabase | - | ✅ Production |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme du client Supabase | - | ✅ Production |
| `VITE_ENABLE_MOCK_DATA` | Activer les données de démonstration | `true` | ❌ |
| `VITE_ENV` | Environnement d'exécution | `development` | ❌ |

### Configuration pour différents environnements

#### Développement (.env.local)
```env
VITE_API_URL=http://localhost:4000
VITE_ENABLE_MOCK_DATA=true
VITE_ENV=development
```

#### Production (.env.production.local)
```env
VITE_API_URL=https://api.production.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENABLE_MOCK_DATA=false
VITE_ENV=production
```

## 🚀 Scripts disponibles

```bash
# Démarrer le serveur de développement
npm run dev
# Serveur disponible sur http://localhost:8080

# Compiler pour la production
npm run build

# Compiler en mode développement
npm run build:dev

# Prévisualiser le build
npm run preview

# Linter et vérifier le code
npm run lint

# Exécuter les tests unitaires
npm run test

# Exécuter les tests en mode watch
npm run test:watch
```

## 📂 Structure du projet

```
pompiers-connect/
├── public/                         # Ressources statiques
│   └── robots.txt
│
├── src/
│   ├── assets/                    # Images, icônes, médias
│   │
│   ├── components/
│   │   ├── Navbar.tsx            # Barre de navigation
│   │   ├── NavLink.tsx           # Lien de navigation
│   │   └── ui/                   # Composants shadcn/ui
│   │       ├── accordion.tsx
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       └── ... (autres composants UI)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx       # Context d'authentification
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx        # Hook pour responsive design
│   │   └── use-toast.ts          # Hook pour notifications toast
│   │
│   ├── lib/
│   │   └── utils.ts              # Fonctions utilitaires
│   │
│   ├── pages/
│   │   ├── AdminTraining.tsx     # Page gestion des formations
│   │   ├── AdminUsers.tsx        # Page gestion des utilisateurs
│   │   ├── CalendarPage.tsx      # Page calendrier
│   │   ├── Dashboard.tsx         # Tableau de bord principal
│   │   ├── Index.tsx             # Page d'accueil
│   │   ├── Login.tsx             # Page de connexion
│   │   ├── NotFound.tsx          # Page 404
│   │   ├── Notifications.tsx     # Centre de notifications
│   │   ├── Profile.tsx           # Page profil utilisateur
│   │   ├── Skills.tsx            # Page gestion compétences
│   │   └── SupervisorSchedule.tsx # Page planning superviseur
│   │
│   ├── test/
│   │   ├── example.test.ts       # Tests unitaires
│   │   └── setup.ts              # Configuration tests
│   │
│   ├── types/
│   │   └── index.ts              # Types TypeScript globaux
│   │
│   ├── App.css                   # Styles App
│   ├── App.tsx                   # Composant racine
│   ├── main.tsx                  # Point d'entrée
│   ├── index.css                 # Styles globaux
│   └── vite-env.d.ts             # Types Vite
│
├── .env                          # Variables env (git ignored)
├── .env.local                    # Variables env locales (git ignored)
├── .env.production.local         # Variables env production (git ignored)
├── .gitignore
├── components.json               # Configuration shadcn/ui
├── eslint.config.js              # Configuration ESLint
├── index.html                    # Page HTML principale
├── package.json
├── package-lock.json
├── playwright.config.ts          # Configuration Playwright
├── postcss.config.js             # Configuration PostCSS
├── tailwind.config.ts            # Configuration TailwindCSS
├── tsconfig.json                 # Configuration TypeScript
├── tsconfig.app.json             # TS config pour app
├── tsconfig.node.json            # TS config pour node
├── vite.config.ts                # Configuration Vite
├── vitest.config.ts              # Configuration Vitest
└── README.md
```

## ⚙️ Configuration Vite

### Serveur de développement
- **Port**: 8080
- **Host**: `::` (IPv6)
- **HMR**: Activé avec overlay désactiver

### Alias TypeScript
- `@` → `src/`

### Optimisations
- Déduplication de React et React DOM
- Support des nouveaux composants React

## 👥 Comptes de démonstration

Pour tester l'application avec différents rôles d'utilisateurs:

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `stagiaire@pompiers.fr` | `demo1234` | Stagiaire | Accès en lecture aux formations |
| `superviseur@pompiers.fr` | `demo1234` | Superviseur | Gestion des équipes et horaires |
| `admin@pompiers.fr` | `demo1234` | Administrateur | Accès complet au système |

> ⚠️ **Important**: Ces comptes sont fournis à titre de démonstration uniquement. En production, utiliser l'authentification Supabase réelle.

## 💻 Développement

### Démarrage rapide

1. **Installer les dépendances**
	```bash
	npm install
	```

2. **Configurer l'environnement** (.env.local)
	```bash
	cp .env .env.local
	# Modifier .env.local avec vos valeurs
	```

3. **Démarrer le serveur de développement**
	```bash
	npm run dev
	```

4. **Accéder à l'application**
	```
	http://localhost:8080
	```

### Hot Module Replacement (HMR)

Vite supporte HMR - les modifications sont reflétées instantanément dans le navigateur sans rechargement complet.

### Linting et Formatage

```bash
# Vérifier le code
npm run lint

# Exécuter les tests
npm run test:watch
```

### Création de composants

Les composants shadcn/ui peuvent être ajoutés avec:
```bash
npx shadcn-ui@latest add <component-name>
```

## 📚 Ressources et Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Validation Documentation](https://zod.dev/)

## 🔗 Intégration Backend

L'application communique avec un backend Express.js accessible via `VITE_API_URL`.

### Endpoints principaux:
- `/auth/*` - Authentification et sessions
- `/users/*` - Gestion des utilisateurs
- `/suivi/*` - Suivi de formation

Pour plus d'détails, consulter la documentation du backend.

---

**Développé avec ❤️ par l'équipe Pompiers Connect**

## Expo Go (Nouveau)

Un client mobile Expo a été ajouté dans le dossier `mobile-expo/`.

### Objectif
- Rendre le projet compatible Expo Go sans casser le frontend web Vite.
- Connecter Expo au backend existant (`/auth`, `/auth/refresh`, `/devices`, `/notifications`).

### Lancer l'app Expo

```bash
cd mobile-expo
npm install
npm run start
```

Ensuite scanner le QR code avec Expo Go.

### Configuration API

Le client mobile lit l'URL backend dans:
- `mobile-expo/app.json` -> `expo.extra.apiUrl`

Valeur actuelle:
- `http://localhost:4000`

Sur téléphone réel, remplacer `localhost` par l'IP locale de la machine backend (ex: `http://192.168.1.20:4000`).

### Écrans mobiles inclus
- Login (JWT + refresh auto)
- Home avec:
- profil connecté
- enregistrement du `ExpoPushToken` dans `POST /devices`
- liste des devices de l'utilisateur
- liste des notifications pour `admin` / `superviseur`

### Note importante push

Conformément à la doc backend:
- Expo Go peut fonctionner pour tests rapides
- mais pour des tests push Android fiables, privilégier un development build
