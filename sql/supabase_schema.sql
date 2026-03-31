-- ==========================================================
-- BASE DE DONNEES : APP MOBILE CIS CHESSY
-- VERSION POSTGRESQL (SUPABASE) - AVEC SESSIONS
-- ==========================================================

-- --- 1. TYPES ENUMERES ---
CREATE TYPE user_role AS ENUM ('agent', 'superviseur', 'admin');
CREATE TYPE tranche_type AS ENUM ('07h-19h', '19h-07h');
CREATE TYPE statut_type AS ENUM ('disponible', 'sollicite', 'valide', 'refuse');

-- --- 2. TABLE DES UTILISATEURS ---
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	nom TEXT NOT NULL,
	prenom TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	telephone TEXT,
	password_hash TEXT NOT NULL,
	role user_role DEFAULT 'agent',
	competences TEXT[] DEFAULT '{}',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --- 3. TABLE DES SESSIONS (AJOUTEE) ---
CREATE TABLE sessions (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	refresh_token_hash TEXT UNIQUE NOT NULL,
	device_name TEXT,
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
	last_used_at TIMESTAMP WITH TIME ZONE,
	revoked_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE notifications (
	id SERIAL PRIMARY KEY,
	type TEXT NOT NULL,
	sender_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	message TEXT NOT NULL,
	data JSONB DEFAULT '{}',
	recipient_user_ids INT[] DEFAULT '{}',
	recipient_count INT NOT NULL DEFAULT 0,
	status TEXT NOT NULL DEFAULT 'pending',
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_sender ON notifications(sender_user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE TABLE user_devices (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
	push_token TEXT UNIQUE NOT NULL,
	device_name TEXT,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_platform ON user_devices(platform);

-- --- 4. VOLET 1 : COLLECTE DES DISPONIBILITES ---
CREATE TABLE disponibilites (
	id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	date_jour DATE NOT NULL,
	tranche tranche_type NOT NULL,
	statut statut_type DEFAULT 'disponible',
	date_saisie TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
	CONSTRAINT unique_planning UNIQUE (user_id, date_jour, tranche)
);

CREATE INDEX idx_dispo_date ON disponibilites(date_jour);

-- --- 5. VOLET 2 : FORMATION ET SUIVI ---
CREATE TABLE formation_items (
	id SERIAL PRIMARY KEY,
	titre TEXT NOT NULL,
	description TEXT,
	template_json JSONB DEFAULT '{}'
);

CREATE TABLE suivi_formation (
	id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(id) ON DELETE CASCADE,
	item_id INT REFERENCES formation_items(id) ON DELETE CASCADE,
	est_valide BOOLEAN DEFAULT FALSE,
	progression_pourcentage INT DEFAULT 0 CHECK (progression_pourcentage BETWEEN 0 AND 100),
	date_validation TIMESTAMP WITH TIME ZONE,
	commentaires TEXT,
	donnees_progression_json JSONB DEFAULT '{}',
	CONSTRAINT unique_suivi UNIQUE (user_id, item_id)
);

CREATE INDEX idx_suivi_user ON suivi_formation(user_id);