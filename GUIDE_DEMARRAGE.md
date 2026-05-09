# XamXam Tech — Guide de démarrage

## Prérequis
- Node.js 18+
- PHP 8.1+ & Composer
- MySQL 8+

---

## 1. Base de données

Créez la base de données MySQL :

```sql
CREATE DATABASE xamxam_tech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 2. Backend Laravel

```bash
cd xamxam-backend

# Configurer la DB dans .env
# DB_DATABASE=xamxam_tech
# DB_USERNAME=root
# DB_PASSWORD=votre_mot_de_passe

# Installer les dépendances (déjà fait)
composer install

# Générer la clé (déjà fait)
php artisan key:generate

# Migrations + Seed
php artisan migrate --seed

# Lancer le serveur
php artisan serve
# → http://localhost:8000
```

---

## 3. Frontend React

```bash
cd xamxam-frontend

# Installer les dépendances (déjà fait)
npm install

# Lancer le serveur de dev
npm run dev
# → http://localhost:5173
```

---

## 4. Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| 👑 Admin | admin@xamxam.com | password |
| 👨‍🏫 Formateur | formateur@xamxam.com | password |
| 🎓 Apprenant | apprenant@xamxam.com | password |

---

## 5. Structure du projet

```
xam xam tech/
├── xamxam-frontend/          ← React + Vite + Tailwind
│   └── src/
│       ├── animations/       ← Variantes Framer Motion
│       ├── components/
│       │   ├── landing/      ← Sections de la landing page
│       │   ├── shared/       ← Navbar, Sidebar, Footer, Notifications
│       │   └── ui/           ← Button, Card, Badge, Input, ProgressBar, Skeleton
│       ├── context/          ← AuthContext, NotificationContext
│       ├── hooks/            ← useApi, useDebounce, useLocalStorage
│       ├── layouts/          ← PublicLayout, DashboardLayout
│       ├── pages/
│       │   ├── admin/        ← Dashboard, Users, Courses, Stats, Validation, Settings
│       │   ├── auth/         ← Login, Register
│       │   ├── instructor/   ← Dashboard, CreateCourse, CreateQuiz, Students, Stats
│       │   ├── public/       ← Landing, Courses, CourseDetail, About, Contact, 404
│       │   ├── shared/       ← Forum
│       │   └── student/      ← Dashboard, Courses, Learn, Quiz, Certificates, Favorites, Profile
│       ├── routes/           ← AppRouter, ProtectedRoute, menus/
│       ├── services/         ← api, auth, course, quiz, enrollment, certificate, forum, user
│       └── utils/            ← formatters
│
└── xamxam-backend/           ← Laravel 9 + Sanctum
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/Api/
    │   │   │   ├── AuthController.php
    │   │   │   ├── CourseController.php
    │   │   │   ├── CategoryController.php
    │   │   │   ├── LessonController.php
    │   │   │   ├── QuizController.php
    │   │   │   ├── EnrollmentController.php
    │   │   │   ├── CertificateController.php
    │   │   │   ├── ForumController.php
    │   │   │   ├── UserController.php
    │   │   │   ├── NotificationController.php
    │   │   │   └── DashboardController.php
    │   │   └── Middleware/
    │   │       └── RoleMiddleware.php
    │   ├── Models/           ← User, Course, Section, Lesson, Enrollment,
    │   │                        Quiz, QuizQuestion, QuizAttempt, Certificate,
    │   │                        ForumPost, ForumReply, Category, LessonCompletion
    │   └── Policies/
    │       └── CoursePolicy.php
    ├── database/
    │   ├── migrations/       ← 7 fichiers de migration
    │   └── seeders/
    │       └── DatabaseSeeder.php
    └── routes/
        └── api.php           ← 35+ endpoints REST
```

---

## 6. API Endpoints principaux

### Auth
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | /api/auth/register | Inscription |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/logout | Déconnexion |
| GET | /api/auth/me | Profil connecté |

### Cours
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/courses | Liste publique |
| GET | /api/courses/{id} | Détail cours |
| POST | /api/courses/{id}/enroll | S'inscrire |
| POST | /api/courses/{id}/progress | Progression |
| GET | /api/my-courses | Mes cours |

### Quiz & Certificats
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/lessons/{id}/quiz | Quiz d'une leçon |
| POST | /api/quizzes/{id}/submit | Soumettre quiz |
| GET | /api/certificates | Mes certificats |

---

## 7. Variables d'environnement

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```
APP_NAME="XamXam Tech"
DB_DATABASE=xamxam_tech
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

---

## 8. Fonctionnalités complètes

### ✅ Implémentées
- Authentification JWT/Sanctum avec rôles (Admin/Formateur/Apprenant)
- Landing page premium avec animations Framer Motion
- Catalogue de cours avec filtres et recherche
- Lecteur de cours avec progression leçon par leçon
- Quiz interactif avec timer, feedback instantané, et révision des réponses
- Certificats téléchargeables (print PDF)
- Forum communautaire avec réponses et likes
- Dashboards distincts pour chaque rôle
- Dashboard Admin : stats, gestion users, validation cours, paramètres
- Dashboard Formateur : créer cours (stepper), créer quiz, voir apprenants, stats
- Dashboard Apprenant : progression, favoris, profil, quiz, certificats
- Système de notifications dans le dashboard
- Responsive mobile / tablette / desktop
- Sidebar collapsible avec navigation par rôle
- 404 page animée

### 🚀 Prochaines étapes suggérées
- Upload vidéos (AWS S3 ou Cloudinary)
- Paiement Wave / Orange Money
- Application mobile React Native
- Messagerie privée formateur↔apprenant
- Système de notation des cours
- Tableau de bord temps réel (Pusher/WebSocket)
