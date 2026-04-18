# EduContentApp — Guide Claude

Plateforme mobile React Native / Expo permettant aux étudiants de télécharger et consulter des contenus éducatifs (PDF, PowerPoint, MP4) hors ligne.

## Stack technique

- **Framework** : React Native 0.81 + Expo SDK 54 (New Architecture activée)
- **Backend** : Supabase (Auth + Storage + Postgres)
- **Navigation** : `@react-navigation/native-stack` + `bottom-tabs`
- **Stockage local** : `expo-file-system` pour les fichiers, `@react-native-async-storage/async-storage` pour l'état
- **Media** : `expo-av` (vidéo), `expo-document-picker`, `expo-sharing`
- **Notifications** : `expo-notifications` + `expo-device`

## Architecture MVC

```
src/
├── config/          # Supabase client, constantes
├── models/          # Logique métier + accès données (User, Content, Download)
├── controllers/     # Orchestration modèle ↔ vue (Auth, Content, Download, Notification)
├── views/
│   ├── screens/     # Écrans (une View = un screen)
│   └── components/  # Composants réutilisables
├── navigation/      # Stacks et tabs
├── context/         # Providers React (AuthContext)
└── utils/           # Thème, helpers, storage keys
```

**Règle** : les **screens** ne parlent jamais à Supabase ni au file-system directement — ils passent toujours par un **controller**, qui orchestre les **models**.

## Commandes

```bash
npm start          # Expo dev server
npm run android    # Lancer sur Android
npm run ios        # Lancer sur iOS
npm run web        # Mode web (debug UI)
```

## Variables d'environnement

Copier `.env.example` → `.env` et remplir :
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Les variables doivent être préfixées `EXPO_PUBLIC_` pour être exposées côté client.

## Tables Supabase attendues

- `profiles` (id, email, full_name, avatar_url, created_at)
- `contents` (id, title, description, subject, level, type, file_path, thumbnail_url, size, created_at)
- `downloads` (id, user_id, content_id, local_path, downloaded_at)

Bucket storage : `content-files` (public read, auth write).

## Conventions

- **Mobile-first** : tester sur viewport étroit, utiliser `SafeAreaView`, éviter les tailles fixes.
- **Offline-first** : tout contenu téléchargé doit être lisible sans réseau (chemin local stocké dans AsyncStorage + Supabase).
- **i18n** : l'UI est en français.
- **Pas de logique dans les screens** : déléguer aux controllers.
- **Pas de commentaires superflus** ; nommer clairement.
