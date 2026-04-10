# 📝 Blog Personnel — React

Application de blog personnel développée avec React, suivant le modèle MVC.

## 🚀 Démarrage rapide

```bash
# 1. Cloner le projet
git clone https://github.com/VOTRE_USERNAME/blog-personnel.git
cd blog-personnel

# 2. Installer les dépendances
npm install

# 3. Configurer l'API
cp .env.example .env
# Modifier REACT_APP_API_URL dans le fichier .env

# 4. Lancer en développement
npm start

# 5. Build production
npm run build
```

## 📁 Structure du projet

```
blog-personnel/
├── public/
│   └── index.html
├── src/
│   ├── index.js                  # Point d'entrée React
│   ├── App.js                    # Routage principal
│   ├── index.css                 # Design system global
│   ├── context/
│   │   └── AuthContext.js        # État d'authentification global
│   ├── services/
│   │   └── api.js                # Toutes les requêtes HTTP (Axios)
│   └── components/
│       ├── auth/
│       │   └── AuthPages.js      # Pages Login & Register
│       ├── layout/
│       │   └── Sidebar.js        # Navigation latérale
│       ├── dashboard/
│       │   └── Dashboard.js      # Tableau de bord + fil d'actualité
│       ├── articles/
│       │   ├── ArticleCard.js    # Composant carte article
│       │   ├── ArticleForm.js    # Modal création/modification
│       │   ├── ArticleView.js    # Vue détaillée + commentaires
│       │   └── MyArticles.js     # Liste de mes articles
│       └── friends/
│           ├── Friends.js        # Liste des amis
│           ├── SearchFriends.js  # Recherche d'utilisateurs
│           └── FriendRequests.js # Demandes d'amis en attente
├── .env.example
└── package.json
```

## ✅ Fonctionnalités

### Authentification
- Inscription avec nom complet, nom d'utilisateur et mot de passe
- Connexion avec nom d'utilisateur et mot de passe
- Token JWT stocké en localStorage
- Déconnexion

### Tableau de bord
- Fil d'actualité (mes articles + articles publics des amis)
- Statistiques (nombre d'articles, amis, total)
- Filtrage par auteur

### Gestion des articles
- Créer un article (titre, contenu, visibilité, commentaires)
- Modifier un article existant
- Supprimer un article
- Vue détaillée avec commentaires
- Visibilité publique / privée
- Activation / désactivation des commentaires

### Gestion des amis
- Recherche d'utilisateurs par nom d'utilisateur
- Envoi de demandes d'amis
- Acceptation / refus des demandes
- Retrait d'un ami
- Blocage d'un utilisateur
- Badge de notifications pour les demandes en attente

### Commentaires
- Ajouter un commentaire sur un article
- Supprimer un commentaire (auteur ou propriétaire de l'article)
- Désactivation des commentaires par l'auteur

## 🔌 API Endpoints attendus

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |

### Articles
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/articles` | Fil d'actualité |
| GET | `/api/articles/mine` | Mes articles |
| GET | `/api/articles/:id` | Un article |
| POST | `/api/articles` | Créer un article |
| PUT | `/api/articles/:id` | Modifier un article |
| DELETE | `/api/articles/:id` | Supprimer un article |

### Commentaires
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/articles/:id/comments` | Commentaires d'un article |
| POST | `/api/articles/:id/comments` | Ajouter un commentaire |
| DELETE | `/api/articles/:id/comments/:cid` | Supprimer un commentaire |

### Amis
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/friends` | Ma liste d'amis |
| GET | `/api/friends/requests` | Demandes reçues |
| GET | `/api/users/search?username=` | Rechercher un utilisateur |
| POST | `/api/friends/request/:userId` | Envoyer une demande |
| PUT | `/api/friends/request/:id/accept` | Accepter une demande |
| PUT | `/api/friends/request/:id/reject` | Refuser une demande |
| DELETE | `/api/friends/:id` | Retirer un ami |
| POST | `/api/friends/:id/block` | Bloquer un utilisateur |

## 🛠 Technologies

- **React 18** — Bibliothèque UI
- **React Router v6** — Navigation SPA
- **Axios** — Requêtes HTTP
- **CSS Custom Properties** — Design system sans dépendance externe

## 🎨 Design

- Thème éditorial « Encre & Papier »
- Typographie : Playfair Display + DM Sans
- Responsive (mobile-friendly)
- Animations CSS légères

## 📤 Déploiement GitHub

```bash
git init
git add .
git commit -m "feat: blog personnel React - architecture MVC"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/blog-personnel.git
git push -u origin main
```

## 📌 Notes importantes

- Le token JWT est automatiquement injecté dans chaque requête via un intercepteur Axios.
- Les routes protégées redirigent vers `/login` si l'utilisateur n'est pas connecté.
- Adaptez les endpoints dans `src/services/api.js` selon votre backend.
