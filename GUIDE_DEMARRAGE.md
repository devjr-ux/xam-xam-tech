# XamXam Tech — Guide de démarrage

> Plateforme e-learning moderne — React + Firebase + Cloudinary

---

## Prérequis

- **Node.js** 18+ → [nodejs.org](https://nodejs.org)
- **Firebase CLI** → `npm install -g firebase-tools`
- Compte **Firebase** → [console.firebase.google.com](https://console.firebase.google.com)
- Compte **Cloudinary** (gratuit) → [cloudinary.com](https://cloudinary.com) *(pour les images)*

---

## 1. Installation locale

```bash
cd xamxam-frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 2. Variables d'environnement

Créez ou modifiez le fichier `xamxam-frontend/.env` :

```env
# Firebase
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet
VITE_FIREBASE_STORAGE_BUCKET=votre_projet.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id

# Cloudinary (pour les images de cours)
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```

---

## 3. Configuration Firebase

### 3.1 Créer le projet Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. **Créer un projet** → notez le Project ID
3. Activez **Authentication** → Email/Password
4. Activez **Firestore** → mode Production

### 3.2 Déployer les règles et index Firestore

```bash
cd xamxam-frontend
firebase login
firebase use votre_project_id
firebase deploy --only firestore
```

### 3.3 Créer le compte Admin
1. Inscrivez-vous sur l'application (`/register`) avec votre email
2. Allez dans **Firestore Console** → collection `users`
3. Trouvez votre document et changez `role` : `"student"` → `"admin"`

---

## 4. Configuration Cloudinary (images gratuites)

1. Créez un compte gratuit sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → Settings → **Upload** → **Upload presets** → **Add upload preset**
3. Signing Mode : **Unsigned** → sauvegardez
4. Copiez votre **Cloud Name** et le **nom du preset**
5. Ajoutez-les dans `.env` (voir section 2)

---

## 5. Déploiement en production

```bash
cd xamxam-frontend

# Build de production
npm run build

# Déployer sur Firebase Hosting + Firestore
firebase deploy --only firestore,hosting --project votre_project_id
```

**URL de production :** `https://votre_project_id.web.app`

---

## 6. Structure du projet

```
xam xam tech/
└── xamxam-frontend/               ← Application React
    ├── public/                    ← Fichiers statiques (logo.png, etc.)
    ├── src/
    │   ├── animations/            ← Variantes Framer Motion
    │   ├── components/
    │   │   ├── landing/           ← Sections de la landing page
    │   │   ├── shared/            ← Navbar, Sidebar, Footer
    │   │   └── ui/                ← Button, Badge, Input, Logo, Skeleton...
    │   ├── context/               ← AuthContext, NotificationContext
    │   ├── firebase/              ← Services Firebase (Firestore)
    │   │   ├── config.js          ← Initialisation Firebase
    │   │   ├── authService.js     ← Inscription, connexion, profil
    │   │   ├── courseService.js   ← CRUD cours, sections, leçons
    │   │   ├── enrollmentService.js ← Inscriptions, progression
    │   │   ├── quizService.js     ← Quiz, soumission, corrections
    │   │   ├── certificateService.js ← Génération automatique certificats
    │   │   ├── adminService.js    ← Stats admin, gestion utilisateurs
    │   │   ├── forumService.js    ← Posts et réponses forum
    │   │   └── settingsService.js ← Paramètres plateforme
    │   ├── hooks/                 ← useRefreshOnNav, useInstructor...
    │   ├── layouts/               ← PublicLayout, DashboardLayout
    │   ├── pages/
    │   │   ├── admin/             ← Dashboard, Users, Courses, Stats, Validation, Settings
    │   │   ├── auth/              ← Login, Register
    │   │   ├── instructor/        ← Dashboard, CreateCourse, CreateQuiz, Students, Stats
    │   │   ├── public/            ← Landing, Courses, CourseDetail, About, Contact, Verify
    │   │   ├── shared/            ← Forum
    │   │   └── student/           ← Dashboard, Courses, Learn, Quiz, Certificates, Favorites, Profile
    │   ├── routes/                ← AppRouter, ProtectedRoute, menus
    │   ├── services/              ← adminService, authService, cloudinaryService...
    │   └── utils/                 ← formatters
    ├── firebase.json              ← Config Firebase (Hosting + Firestore)
    ├── firestore.rules            ← Règles de sécurité Firestore
    ├── firestore.indexes.json     ← Index composites Firestore
    └── storage.rules              ← Règles Firebase Storage (si activé)
```

---

## 7. Rôles et accès

| Rôle | URL Dashboard | Capacités |
|------|--------------|-----------|
| 👑 **Admin** | `/admin` | Gérer users, valider cours, stats globales, paramètres |
| 👨‍🏫 **Formateur** | `/instructor` | Créer cours, créer quiz, voir apprenants, stats |
| 🎓 **Apprenant** | `/student` | Suivre cours, faire quiz, télécharger certificats |

---

## 8. Fonctionnalités

### Authentification
- Inscription / Connexion par email
- Rôles : Admin, Formateur, Apprenant
- Routes protégées par rôle

### Cours
- Création de cours (titre, description, catégorie, niveau, langue, prix)
- Upload thumbnail via Cloudinary
- Sections et leçons (vidéo, PDF, quiz)
- Soumission pour validation admin
- Publication / Rejet par l'admin

### Quiz
- Création de quiz liés aux leçons
- Timer, feedback immédiat, révision des réponses
- Soumission automatique à la fin du temps
- Score minimum configurable

### Certificats
- Génération **automatique** quand :
  - 100% des leçons complétées
  - Tous les quiz du cours réussis
- Diplôme PDF téléchargeable
- Page de vérification publique `/verify/:id` avec QR code

### Paiements
- Cours gratuits : accès immédiat
- Cours payants : page de paiement (PayTech, Wave, Orange Money)
- Configuration des clés API dans Admin → Paramètres

### Autres
- Forum communautaire
- Favoris
- Profil apprenant
- Notifications

---

## 9. Commandes utiles

```bash
# Développement local
npm run dev

# Build production
npm run build

# Déployer le site
firebase deploy --only hosting --project votre_project_id

# Déployer les règles Firestore
firebase deploy --only firestore --project votre_project_id

# Déployer tout sauf Storage
firebase deploy --only firestore,hosting --project votre_project_id
```

---

## 10. Stack technique

| Technologie | Usage |
|-------------|-------|
| **React 19** + Vite | Frontend |
| **Tailwind CSS 4** | Styles |
| **Framer Motion** | Animations |
| **Firebase Auth** | Authentification |
| **Cloud Firestore** | Base de données |
| **Firebase Hosting** | Hébergement |
| **Cloudinary** | Stockage images (gratuit) |
| **React Router v7** | Navigation |
