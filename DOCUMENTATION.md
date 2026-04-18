# Documentation — EduContentApp

> Plateforme mobile React Native / Expo permettant aux étudiants de télécharger des ressources éducatives (documents PDF/PPT, vidéos MP4) et de les consulter hors ligne.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Structure des fichiers](#4-structure-des-fichiers)
5. [État actuel — ce qui est fait](#5-état-actuel--ce-qui-est-fait)
6. [Configuration (Supabase + .env)](#6-configuration-supabase--env)
7. [Installation & lancement](#7-installation--lancement)
8. [Flux applicatif](#8-flux-applicatif)
9. [À modifier / à faire](#9-à-modifier--à-faire)
10. [Limitations connues](#10-limitations-connues)
11. [Roadmap d'évolution](#11-roadmap-dévolution)
12. [Référence API interne](#12-référence-api-interne)

---

## 1. Vue d'ensemble

**EduContentApp** est une application mobile destinée aux étudiants pour :

- Consulter un catalogue de contenus éducatifs (documents & vidéos)
- Les télécharger pour les lire **hors ligne**
- Recevoir des **notifications** lors de l'ajout de nouveaux contenus
- Gérer un profil utilisateur et l'historique des téléchargements

**Plateformes cibles** : Android + iOS (via Expo Go en dev, Expo Application Services pour la prod).

---

## 2. Stack technique

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Framework mobile | React Native | 0.81.5 | Cœur UI natif |
| Outillage | Expo SDK | ~54.0.33 | Runtime, bundler, build |
| Langage UI | React | 19.1.0 | Composants |
| Backend | Supabase | @2.103.3 | Auth + Postgres + Storage |
| Navigation | React Navigation | v7 | Stacks + Bottom tabs |
| Stockage local (état) | AsyncStorage | 2.2.0 | Session, préférences, index téléchargements |
| Stockage local (fichiers) | expo-file-system | ~19.0.21 | Fichiers téléchargés |
| Lecteur vidéo | expo-video | ~3.0.16 | Lecture MP4 |
| Notifications | expo-notifications | ~0.32.16 | Push + locales |
| Device info | expo-device | ~8.0.10 | Détection physique/simulateur |
| Partage | expo-sharing | ~14.0.8 | Partage de fichiers locaux |
| Icônes | @expo/vector-icons | ^15.0.3 | Ionicons |

---

## 3. Architecture du projet

### Pattern MVC

```
┌──────────────────────────────────────────────────────────┐
│                         VIEW                             │
│    screens/ + components/   (React + React Navigation)   │
└─────────────────────▲─────────────────┬──────────────────┘
                      │                 │
              (state, callbacks)   (user events)
                      │                 ▼
┌──────────────────────────────────────────────────────────┐
│                      CONTROLLER                          │
│    AuthController · ContentController · DownloadController│
│                  NotificationController                  │
└─────────────────────▲─────────────────┬──────────────────┘
                      │                 │
                   (data)          (queries)
                      │                 ▼
┌──────────────────────────────────────────────────────────┐
│                        MODEL                             │
│   UserModel  ·  ContentModel  ·  DownloadModel           │
└─────────────────────▲─────────────────┬──────────────────┘
                      │                 │
                      │                 ▼
                ┌─────────────┐   ┌──────────────┐
                │  Supabase   │   │ File system  │
                │  (remote)   │   │  (local)     │
                └─────────────┘   └──────────────┘
```

### Règles architecturales

- **Les screens ne parlent jamais directement à Supabase ni au file system** — elles passent toujours par un controller.
- **Les controllers orchestrent** — ils assemblent des appels models + logique métier de haut niveau.
- **Les models** encapsulent un domaine de données (User, Content, Download) et ses accès.
- **Le AuthContext** est la seule exception : c'est un pont React réactif entre `AuthController` et l'arbre de composants.

---

## 4. Structure des fichiers

```
EduContentApp/
├── App.js                         # Entrée : providers, ErrorBoundary, navigation
├── index.js                       # registerRootComponent
├── app.json                       # Config Expo (scheme, plugins, extra)
├── package.json                   # Dépendances
├── .env                           # Clés Supabase (non versionné)
├── .env.example                   # Template des variables
├── CLAUDE.md                      # Guide pour Claude Code (assistant IA)
├── DOCUMENTATION.md               # Ce document
└── src/
    ├── config/
    │   ├── env.js                 # Lit .env + app.json.extra (IS_CONFIGURED)
    │   └── supabase.js            # Client Supabase + STORAGE_BUCKET
    ├── context/
    │   └── AuthContext.js         # Provider session + profile
    ├── models/
    │   ├── UserModel.js           # profiles table
    │   ├── ContentModel.js        # contents table + storage signed URLs
    │   └── DownloadModel.js       # index AsyncStorage + fichiers locaux
    ├── controllers/
    │   ├── AuthController.js      # signIn/signUp/signOut, onAuthChange
    │   ├── ContentController.js   # fetchAll, fetchById, getStreamUrl
    │   ├── DownloadController.js  # download, remove, share, isDownloaded
    │   └── NotificationController.js  # registerForPush, notifyLocal, realtime
    ├── navigation/
    │   ├── RootNavigator.js       # Bascule Auth/App selon session
    │   ├── AuthNavigator.js       # Login + Register
    │   └── AppNavigator.js        # Bottom tabs + Home/Downloads stacks
    ├── views/
    │   ├── screens/
    │   │   ├── LoginScreen.js
    │   │   ├── RegisterScreen.js
    │   │   ├── HomeScreen.js
    │   │   ├── ContentListScreen.js
    │   │   ├── ContentDetailScreen.js
    │   │   ├── DownloadsScreen.js
    │   │   ├── ProfileScreen.js
    │   │   └── MissingEnvScreen.js   # Fallback si .env absent
    │   └── components/
    │       ├── Button.js
    │       ├── Input.js
    │       ├── ContentCard.js
    │       ├── CategoryFilter.js
    │       ├── EmptyState.js
    │       ├── VideoPlayerView.js    # expo-video wrapper
    │       └── ErrorBoundary.js      # Catch React errors
    └── utils/
        ├── theme.js               # colors, spacing, radius, typography
        └── storage.js             # AsyncStorage helpers + formatSize
```

---

## 5. État actuel — ce qui est fait

### ✅ Authentification
- Inscription par email/mot de passe (avec `full_name`)
- Connexion par email/mot de passe
- Bouton « Continuer avec Google » (OAuth — nécessite config côté Supabase)
- Persistance de session via AsyncStorage
- Déconnexion avec confirmation
- Reactive state via `AuthContext` : `session`, `user`, `profile`, `loading`

### ✅ Catalogue de contenus
- Liste paginable avec filtres (matière, niveau, type)
- Deux types : `document` et `video`
- Niveaux : Collège, Lycée, Licence, Master
- Rafraîchissement par pull-to-refresh
- Détail d'un contenu avec métadonnées (matière, niveau, taille, description)

### ✅ Téléchargement hors ligne
- Téléchargement avec barre de progression
- Stockage dans `FileSystem.documentDirectory/educontent/`
- Index persistant dans AsyncStorage (clé : `@educontent/downloads`)
- Reprise automatique du fichier local si déjà téléchargé
- Suppression individuelle + suppression globale
- Partage via `expo-sharing`

### ✅ Lecteur vidéo
- `expo-video` (`useVideoPlayer` + `VideoView`)
- Plein écran + picture-in-picture
- Lecture depuis fichier local (offline) OU URL signée Supabase

### ✅ Notifications
- Notifications locales via `expo-notifications`
- Abonnement **realtime Supabase** sur table `contents` (INSERT)
- Déclenchement automatique d'une notif locale à chaque nouveau contenu
- Toggle utilisateur dans le profil
- Détection Expo Go → skip push (pas crash)

### ✅ UI / UX
- Thème centralisé (couleurs, spacing, typographie)
- Composants réutilisables (Button, Input, Card, Filter, EmptyState)
- SafeAreaView sur tous les écrans
- Mobile-first, responsive aux tailles d'écran

### ✅ Robustesse
- `ErrorBoundary` global : affiche les crashs React au lieu d'un écran blanc
- `MissingEnvScreen` : guide utilisateur si `.env` absent
- Warnings défensifs (try/catch autour du realtime, push, OAuth)

---

## 6. Configuration (Supabase + .env)

### 6.1 Variables d'environnement

Fichier `.env` à la racine (déjà créé, **non versionné**) :

```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...votre-clé-publique
```

⚠ Les variables doivent commencer par `EXPO_PUBLIC_` pour être exposées au bundle client.

**Après toute modification de `.env`**, relancer Expo avec cache vidé :
```bash
npx expo start -c
```

### 6.2 Schéma Supabase requis

À exécuter dans le SQL Editor de votre projet Supabase :

```sql
-- Table profiles (liée à auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  push_token TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile"  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Table contents
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,              -- Mathématiques, Physique, ...
  level TEXT,                -- Collège | Lycée | Licence | Master
  type TEXT NOT NULL,        -- 'document' | 'video'
  file_path TEXT NOT NULL,   -- Chemin dans le bucket
  thumbnail_url TEXT,
  size BIGINT,               -- Taille en octets
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Any authenticated user can read contents"
  ON contents FOR SELECT TO authenticated USING (true);

-- Table downloads (historique côté serveur, optionnel)
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  content_id UUID REFERENCES contents ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_id)
);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own downloads" ON downloads
  FOR ALL USING (auth.uid() = user_id);
```

### 6.3 Storage bucket

Dans Supabase Dashboard → Storage :

1. Créer un bucket nommé **`content-files`**
2. Cocher `Public` **OU** ajouter une policy pour les lectures authentifiées
3. Uploader vos fichiers (PDF, MP4, PPTX) dans ce bucket
4. Renseigner le chemin dans `contents.file_path` (ex: `math/chapitre1.pdf`)

### 6.4 Realtime

Activer Realtime sur la table `contents` :
- Database → Replication → activer `contents` pour les INSERTs

### 6.5 OAuth Google (optionnel)

Pour le bouton « Continuer avec Google » :
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Ajouter votre Client ID / Secret depuis Google Cloud Console
3. Redirect URL : `educontentapp://auth-callback` (scheme défini dans `app.json`)

---

## 7. Installation & lancement

```bash
# 1. Cloner / être sur la branche
git checkout features-realisation

# 2. Installer
npm install

# 3. Configurer .env (voir §6.1)
cp .env.example .env
# éditer les valeurs

# 4. Démarrer (première fois, toujours avec -c)
npx expo start -c

# 5. Scanner le QR code avec Expo Go sur téléphone
```

### Scripts disponibles

| Commande | Effet |
|---|---|
| `npm start` | Expo dev server |
| `npm run android` | Lance sur émulateur / device Android |
| `npm run ios` | Lance sur simulateur iOS (macOS uniquement) |
| `npm run web` | Mode web (debug UI) |

---

## 8. Flux applicatif

### 8.1 Démarrage

```
App.js
  └─ ErrorBoundary
      └─ SafeAreaProvider
          └─ if (IS_CONFIGURED)
              ├─ AuthProvider  → charge session depuis AsyncStorage
              ├─ NotificationBridge  → s'abonne au realtime, déclenche notifs locales
              └─ RootNavigator
                  ├─ if session → AppNavigator (tabs)
                  └─ else → AuthNavigator (Login/Register)
          └─ else → MissingEnvScreen
```

### 8.2 Téléchargement d'un contenu

```
ContentDetailScreen
  └─ handleDownload()
      └─ DownloadController.download(content, onProgress)
          ├─ ContentModel.getSignedUrl(file_path)  → URL temporaire Supabase
          └─ DownloadModel.save(signedUrl, content, onProgress)
              ├─ FileSystem.createDownloadResumable(...)
              ├─ Écrit sur disque (documentDirectory/educontent/{id}.{ext})
              └─ AsyncStorage.setItem('@educontent/downloads', [...])
```

### 8.3 Notification de nouveau contenu

```
Admin ajoute une ligne dans `contents` (Supabase Dashboard / SQL)
  └─ Postgres NOTIFY → Realtime channel
      └─ NotificationController.subscribeToNewContent()  (app client)
          └─ NotificationController.notifyLocal(titre, body)
              └─ expo-notifications affiche la bannière système
```

---

## 9. À modifier / à faire

### 9.1 Côté Supabase (obligatoire pour tester)

- [ ] Créer les tables `profiles`, `contents`, `downloads` (§6.2)
- [ ] Créer le bucket `content-files` (§6.3)
- [ ] Activer Realtime sur `contents` (§6.4)
- [ ] Uploader au moins un contenu de test
- [ ] (Optionnel) Configurer OAuth Google (§6.5)

### 9.2 Côté application — petites améliorations

- [ ] **Recherche textuelle** dans HomeScreen (actuellement : filtres seuls)
- [ ] **Pagination** infinie pour `contents` (aujourd'hui : tout en une requête)
- [ ] **Prévisualisation** du thumbnail (champ `thumbnail_url` non encore affiché)
- [ ] **Suivi serveur** des téléchargements : insérer dans `downloads` lors de `DownloadController.download()`
- [ ] **Indicateur offline** : détecter l'état réseau (`@react-native-community/netinfo`) et afficher un badge
- [ ] **Dark mode** : le thème est prêt, il manque l'alternative sombre + toggle dans le profil
- [ ] **i18n** : extraire les strings dans un fichier `i18n/fr.js` pour faciliter l'ajout d'autres langues
- [ ] **Validation de formulaires** plus riche (regex email, force mot de passe) dans Login/Register

### 9.3 Côté application — évolutions importantes

- [ ] **Dev build Expo** (remplace Expo Go) pour avoir les vraies push notifications Android
  ```bash
  npx expo install expo-dev-client
  eas build --profile development --platform android
  ```
- [ ] **Lecteur PDF intégré** (actuellement : ouverture externe via Sharing). Options :
  - `react-native-pdf` (nécessite dev build)
  - `expo-web-browser` + URL Supabase (web view)
- [ ] **Gestion des uploads** (pour admins/profs) : `expo-document-picker` est installé, reste à brancher l'upload vers Storage
- [ ] **Favoris** : table `favorites` + toggle étoile dans ContentCard
- [ ] **Commentaires / notes** sur les contenus
- [ ] **Téléchargement en arrière-plan** (`expo-background-fetch`)
- [ ] **Compression/nettoyage automatique** du cache local quand l'espace devient critique

### 9.4 Qualité & DX

- [ ] **Tests** : aucun test n'est présent. Ajouter :
  - Jest + React Native Testing Library pour les composants
  - Tests d'intégration pour les controllers
- [ ] **TypeScript** : passage recommandé pour typer models/controllers
- [ ] **ESLint + Prettier** : configurer avec un preset Expo
- [ ] **CI GitHub Actions** : lint + tests sur chaque PR
- [ ] **Monitoring** : intégrer Sentry (`sentry-expo`) pour capturer les erreurs en prod
- [ ] **Analytics** : `expo-analytics-amplitude` ou équivalent si besoin produit

### 9.5 Sécurité

- [ ] **Row Level Security** : vérifier les policies (§6.2) et ajouter des tests
- [ ] **Rate limiting** côté Supabase Edge Functions pour éviter abus
- [ ] **Rotation des clés** si jamais elles ont été committées (le `.env` est ignoré, mais vérifier l'historique git)
- [ ] **HTTPS only** : vérifier `file_path` et URLs signées
- [ ] **Validation serveur** : contraintes CHECK sur `type` (`document`/`video`) et `level`

### 9.6 Production / déploiement

- [ ] **EAS Build** pour générer APK/IPA
  ```bash
  npm install -g eas-cli
  eas login
  eas build:configure
  eas build --platform all
  ```
- [ ] **EAS Submit** pour publier sur Google Play / App Store
- [ ] **Icône & splash** personnalisés (actuellement : défauts Expo dans `assets/`)
- [ ] **Privacy policy + CGU** (exigé par les stores)
- [ ] **Versionning** : stratégie `semver` + changelog

---

## 10. Limitations connues

| Limitation | Impact | Contournement |
|---|---|---|
| Push notifications absentes dans Expo Go (SDK 53+) | Pas de notif bannière système en dev | Utiliser un dev build (`eas build --profile development`) |
| `expo-av` déprécié → migré vers `expo-video` | Aucun — déjà fait | — |
| Pas d'upload admin dans l'app | Les contenus doivent être ajoutés via Supabase Dashboard | Ajouter un écran admin (§9.3) |
| OAuth Google non branché par défaut | Le bouton renvoie une erreur si Google non configuré | Configurer Google dans Supabase Auth Providers |
| Taille des fichiers non limitée côté client | Risque de saturer le stockage du device | Ajouter un check avant `DownloadController.download` |
| Pas de reprise après coupure réseau pendant un download | Le fichier partiel est perdu | `FileSystem.createDownloadResumable` expose `pauseAsync/resumeAsync` — reste à brancher UI |
| Pas de détection d'état réseau | L'utilisateur peut cliquer « Télécharger » hors ligne | Ajouter `@react-native-community/netinfo` |

---

## 11. Roadmap d'évolution

### Phase 1 — MVP stabilisé (1-2 semaines)
1. Créer tables + bucket Supabase, uploader du contenu réel
2. Tester bout en bout sur device physique
3. Configurer OAuth Google
4. Corriger les warnings EDIT de SDK si présents

### Phase 2 — Confort utilisateur (2-4 semaines)
5. Recherche textuelle
6. Pagination infinie
7. Thumbnails
8. Dark mode
9. Favoris
10. Indicateur réseau

### Phase 3 — Production (1-2 mois)
11. Dev build + push réelles
12. Monitoring Sentry
13. Tests Jest (>60% coverage)
14. EAS Build + submit stores
15. CI/CD GitHub Actions

### Phase 4 — Fonctionnalités avancées
16. Upload admin in-app
17. Commentaires / notes
18. Lecteur PDF intégré
19. Téléchargement en arrière-plan
20. Statistiques d'utilisation

---

## 12. Référence API interne

### AuthController

| Méthode | Signature | Rôle |
|---|---|---|
| `signInWithEmail` | `(email, password) → Promise<Session>` | Login email/password |
| `signUpWithEmail` | `(email, password, fullName) → Promise<Session>` | Création compte + upsert profile |
| `signInWithGoogle` | `() → Promise<OAuthData>` | OAuth Google |
| `signOut` | `() → Promise<void>` | Déconnexion |
| `getSession` | `() → Promise<Session \| null>` | Récupère la session courante |
| `onAuthChange` | `(callback) → unsubscribe` | Écoute les changements de session |

### ContentController

| Méthode | Signature | Rôle |
|---|---|---|
| `fetchAll` | `({ subject, level, type }) → Promise<Content[]>` | Liste filtrée |
| `fetchById` | `(id) → Promise<Content>` | Détail |
| `getStreamUrl` | `(content) → Promise<string>` | URL signée (1h) |
| `fetchSubjects` | `() → Promise<string[]>` | Liste des matières distinctes |

### DownloadController

| Méthode | Signature | Rôle |
|---|---|---|
| `list` | `() → Promise<LocalDownload[]>` | Tous les téléchargements |
| `isDownloaded` | `(contentId) → Promise<boolean>` | Présent en local ? |
| `getLocalEntry` | `(contentId) → Promise<LocalDownload \| null>` | Métadonnées locales |
| `download` | `(content, onProgress) → Promise<LocalDownload>` | Télécharge + indexe |
| `remove` | `(contentId) → Promise<void>` | Supprime fichier + index |
| `clearAll` | `() → Promise<void>` | Reset complet |
| `share` | `(contentId) → Promise<void>` | Ouvre la feuille de partage |

### NotificationController

| Méthode | Signature | Rôle |
|---|---|---|
| `registerForPush` | `(userId) → Promise<string \| null>` | Enregistre token Expo (skip si Expo Go) |
| `addListener` | `(onReceived, onResponse) → unsubscribe` | Écoute les notifs |
| `notifyLocal` | `(title, body, data) → Promise<void>` | Notif locale immédiate |
| `subscribeToNewContent` | `(onNewContent) → unsubscribe` | Abonne au realtime Supabase |

### Modèles de données (TypeScript-like)

```ts
type Content = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  level?: 'Collège' | 'Lycée' | 'Licence' | 'Master';
  type: 'document' | 'video';
  file_path: string;
  thumbnail_url?: string;
  size?: number; // bytes
  created_at: string;
};

type LocalDownload = {
  contentId: string;
  title: string;
  type: string;
  subject?: string;
  level?: string;
  size?: number;
  localUri: string;       // file://...
  downloadedAt: string;   // ISO date
};

type Profile = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  push_token?: string;
  preferences?: Record<string, any>;
};
```

---

## Historique Git

| Commit | Description |
|---|---|
| `e88ee25` | Migrate expo-av to expo-video and skip push in Expo Go |
| `99b3dba` | Add ErrorBoundary and graceful fallback when Supabase env is missing |
| `8497575` | Implement MVC architecture for EduContentApp |
| `f547b9e` | first commit |
| `f27339f` | Created a new Expo app |

---

## Contact / Support

- **Repo GitHub** : https://github.com/joharymanantena1-ux/educontent-app
- **Branche active** : `features-realisation`
- **CLAUDE.md** : guide pour l'assistant IA (Claude Code) sur ce projet
