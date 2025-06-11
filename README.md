# SmartDock 🐳

<div align="center">
  <img src="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800" alt="SmartDock Banner" width="800" height="300" style="object-fit: cover; border-radius: 10px;">
  
  **Gestionnaire Intelligent et Automatisé de Conteneurs Docker**
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-Compatible-2496ED.svg)](https://www.docker.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 🚀 Aperçu

SmartDock est une interface web moderne et intuitive pour la gestion intelligente de vos conteneurs Docker. Avec des fonctionnalités avancées comme le Smart Wake-Up, la configuration automatique de proxy et la planification des tâches, SmartDock simplifie la gestion de votre infrastructure containerisée.

### ✨ Fonctionnalités Principales

- 🔄 **Smart Wake-Up** - Démarrage automatique des conteneurs lors de l'accès aux domaines
- 🌐 **Proxy Automatique** - Configuration automatique des sous-domaines avec Caddy
- ⏰ **Planification** - Programmation des démarrages/arrêts de conteneurs
- 📦 **Gestion des Stacks** - Interface pour Docker Compose
- 🔄 **Mises à jour** - Système de mise à jour automatique et manuelle
- 🎨 **Interface Moderne** - Design responsive avec animations fluides

## 📸 Captures d'écran

<div align="center">
  <img src="https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Dashboard" width="400" style="border-radius: 8px; margin: 10px;">
  <img src="https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Containers" width="400" style="border-radius: 8px; margin: 10px;">
</div>

## 🛠️ Installation

### Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement)

### Installation avec Docker (Recommandée)

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/smartdock.git
cd smartdock
```

2. **Lancer avec Docker Compose**
```bash
docker-compose up -d
```

3. **Accéder à l'interface**
- SmartDock: http://localhost:3000
- Caddy Admin: http://localhost:2019

### Installation pour le développement

```bash
# Cloner le repository
git clone https://github.com/votre-username/smartdock.git
cd smartdock

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev:full
```

## 🔧 Configuration Docker

### Permissions Docker

Pour que SmartDock puisse accéder à Docker, vous devez configurer les permissions appropriées :

#### Linux/macOS
```bash
# Ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER

# Redémarrer votre session ou utiliser
newgrp docker

# Vérifier les permissions du socket Docker
ls -la /var/run/docker.sock
```

#### Windows
```bash
# Définir la variable d'environnement
set DOCKER_HOST=npipe:////./pipe/docker_engine
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration Docker
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_API_VERSION=1.41

# Configuration Proxy
CADDY_CONFIG_PATH=/etc/caddy/Caddyfile
MAIN_DOMAIN=localhost

# Sécurité
API_KEY=your-secure-api-key
ENABLE_AUTH=true

# Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

## 🐳 Déploiement Docker

### Configuration Docker Compose

Le fichier `docker-compose.yml` inclut :

- **SmartDock** : Interface principale sur le port 3000
- **Caddy** : Reverse proxy avec SSL automatique
- **Volumes** : Accès au socket Docker et persistance des données

### Résolution des problèmes Docker

Si SmartDock ne peut pas se connecter à Docker :

1. **Vérifiez que Docker est démarré**
```bash
docker info
```

2. **Vérifiez les permissions**
```bash
# Linux/macOS
sudo chmod 666 /var/run/docker.sock

# Ou ajoutez l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

3. **Testez la connexion**
```bash
# Depuis le conteneur SmartDock
docker exec -it smartdock docker ps
```

4. **Vérifiez les logs**
```bash
docker logs smartdock
```

### Configuration Caddy

Exemple de configuration Caddy pour le proxy automatique :

```caddyfile
# Caddyfile
{
    admin :2019
    auto_https off
}

# SmartDock principal
smartdock.localhost {
    reverse_proxy smartdock:3000
}

# Smart Wake-Up pour tous les sous-domaines
*.localhost {
    @wakeup not path /api/*
    handle @wakeup {
        reverse_proxy smartdock:3000/api/wakeup/{host}
    }
    reverse_proxy smartdock:3000
}
```

## 📋 Utilisation

### 1. Dashboard

Le tableau de bord offre une vue d'ensemble de votre infrastructure :
- État des conteneurs et stacks
- Métriques en temps réel
- Activité récente
- Actions rapides

### 2. Gestion des Conteneurs

- **Démarrage/Arrêt** : Contrôle individuel ou en lot
- **Smart Wake-Up** : Activation du réveil automatique
- **Monitoring** : CPU, mémoire, ports exposés
- **Configuration** : Paramètres avancés

### 3. Stacks Docker Compose

- **Déploiement** : Import et déploiement de stacks
- **GitHub Integration** : Synchronisation avec vos repositories
- **Auto-Update** : Mise à jour automatique depuis GitHub
- **Gestion des services** : Vue détaillée des services

### 4. Proxy et Domaines

- **Configuration automatique** : Création de sous-domaines
- **Certificats SSL** : Génération automatique avec Let's Encrypt
- **Règles personnalisées** : Configuration manuelle de règles
- **Monitoring** : État des certificats et règles

### 5. Planification

- **Tâches programmées** : Cron jobs pour conteneurs
- **Smart Scheduling** : Arrêt nocturne, démarrage matinal
- **Conditions** : Déclenchement basé sur des événements
- **Historique** : Suivi des exécutions

### 6. Mises à jour

- **Détection automatique** : Vérification des nouvelles versions
- **Mise à jour sélective** : Choix des conteneurs à mettre à jour
- **Planification** : Mises à jour programmées
- **Rollback** : Retour aux versions précédentes

## 🔄 Smart Wake-Up

Le Smart Wake-Up est une fonctionnalité unique qui permet de démarrer automatiquement vos conteneurs lorsqu'ils sont sollicités :

1. **Configuration** : Activez le Smart Wake-Up pour vos conteneurs
2. **Détection** : SmartDock détecte les tentatives d'accès aux domaines
3. **Démarrage** : Le conteneur se lance automatiquement
4. **Redirection** : L'utilisateur est redirigé vers l'application

```javascript
// Exemple de configuration Smart Wake-Up
{
  "container": "web-app",
  "domain": "app.example.com",
  "smartWakeUp": true,
  "startupTime": 30, // secondes
  "healthCheck": "/health"
}
```

## 🌐 API

SmartDock expose une API REST pour l'intégration avec d'autres outils :

### Endpoints principaux

```bash
# Test de connexion Docker
GET    /api/docker/test

# Conteneurs
GET    /api/containers
POST   /api/containers/:id/start
POST   /api/containers/:id/stop
POST   /api/containers/:id/restart

# Stacks
GET    /api/stacks
POST   /api/stacks/:id/deploy
DELETE /api/stacks/:id

# Proxy
GET    /api/proxy/rules
POST   /api/proxy/rules
PUT    /api/proxy/rules/:id
DELETE /api/proxy/rules/:id

# Planification
GET    /api/schedules
POST   /api/schedules
PUT    /api/schedules/:id
DELETE /api/schedules/:id

# Système
GET    /api/system/stats
GET    /api/health
```

### Authentification

```bash
# Utilisation de l'API avec clé
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/containers
```

## 🔧 Développement

### Structure du projet

```
smartdock/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── hooks/         # Hooks personnalisés
│   ├── utils/         # Utilitaires
│   └── types/         # Types TypeScript
├── server/            # Serveur Node.js
├── public/            # Assets statiques
├── caddy/            # Configuration Caddy
└── docker/           # Configuration Docker
```

### Scripts disponibles

```bash
# Développement
npm run dev          # Interface uniquement
npm run dev:server   # Serveur uniquement
npm run dev:full     # Interface + Serveur

# Production
npm run build        # Build de production
npm run start        # Démarrer le serveur

# Qualité de code
npm run lint         # Linting ESLint
```

### Contribution

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Committez** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request

## 🚨 Résolution des problèmes

### Docker ne se connecte pas

1. **Vérifiez que Docker Desktop est démarré**
2. **Vérifiez les permissions du socket Docker**
3. **Ajoutez votre utilisateur au groupe docker**
4. **Redémarrez votre session**
5. **Vérifiez la variable DOCKER_HOST**

### Erreurs de permissions

```bash
# Linux/macOS - Permissions temporaires
sudo chmod 666 /var/run/docker.sock

# Solution permanente
sudo usermod -aG docker $USER
newgrp docker
```

### Conteneurs non visibles

1. **Vérifiez que SmartDock a accès au socket Docker**
2. **Consultez les logs du conteneur SmartDock**
3. **Testez l'API de santé : GET /api/health**

## 🗺️ Roadmap

### Version 2.0 (Q2 2024)
- [ ] **Système de projets** - Organisation en projets/dossiers
- [ ] **Intégration GitHub** - Webhooks et auto-déploiement
- [ ] **Monitoring avancé** - Métriques détaillées
- [ ] **Backup automatique** - Sauvegarde des configurations

### Version 2.1 (Q3 2024)
- [ ] **Multi-serveur** - Gestion de plusieurs hôtes Docker
- [ ] **RBAC** - Contrôle d'accès basé sur les rôles
- [ ] **Plugins** - Système d'extensions
- [ ] **Mobile App** - Application mobile companion

### Version 3.0 (Q4 2024)
- [ ] **Kubernetes** - Support de Kubernetes
- [ ] **AI Assistant** - Assistant IA pour l'optimisation
- [ ] **Marketplace** - Store d'applications pré-configurées
- [ ] **Enterprise** - Fonctionnalités entreprise

## 🤝 Support

### Documentation

- 📖 [Documentation complète](https://smartdock.dev/docs)
- 🎥 [Tutoriels vidéo](https://smartdock.dev/tutorials)
- 💬 [Forum communautaire](https://community.smartdock.dev)

### Aide

- 🐛 [Signaler un bug](https://github.com/votre-username/smartdock/issues)
- 💡 [Demander une fonctionnalité](https://github.com/votre-username/smartdock/discussions)
- 📧 [Contact direct](mailto:support@smartdock.dev)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <p>Fait avec ❤️ par l'équipe SmartDock</p>
  <p>
    <a href="https://smartdock.dev">Site Web</a> •
    <a href="https://docs.smartdock.dev">Documentation</a> •
    <a href="https://twitter.com/smartdock">Twitter</a> •
    <a href="https://discord.gg/smartdock">Discord</a>
  </p>
</div>