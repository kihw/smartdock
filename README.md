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

- Node.js 18+ 
- Docker et Docker Compose
- Caddy (pour le proxy automatique)

### Installation Rapide

```bash
# Cloner le repository
git clone https://github.com/votre-username/smartdock.git
cd smartdock

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Installation avec Docker

```bash
# Construire l'image
docker build -t smartdock .

# Lancer le conteneur
docker run -d \
  --name smartdock \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  smartdock
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration Docker
DOCKER_HOST=unix:///var/run/docker.sock
DOCKER_API_VERSION=1.41

# Configuration Proxy
CADDY_CONFIG_PATH=/etc/caddy/Caddyfile
MAIN_DOMAIN=example.com

# Sécurité
API_KEY=your-secure-api-key
ENABLE_AUTH=true

# Notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Configuration Caddy

Exemple de configuration Caddy pour le proxy automatique :

```caddyfile
# Caddyfile
{
    admin localhost:2019
    auto_https on
}

# Configuration automatique via SmartDock
import /etc/caddy/smartdock/*.caddy
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
├── public/            # Assets statiques
├── docs/             # Documentation
└── docker/           # Configuration Docker
```

### Scripts disponibles

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run preview      # Aperçu du build

# Qualité de code
npm run lint         # Linting ESLint
npm run type-check   # Vérification TypeScript
npm run format       # Formatage Prettier

# Tests
npm run test         # Tests unitaires
npm run test:e2e     # Tests end-to-end
npm run test:coverage # Couverture de code
```

### Contribution

1. **Fork** le projet
2. **Créez** une branche feature (`git checkout -b feature/amazing-feature`)
3. **Committez** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrez** une Pull Request

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

## 📊 Statistiques

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=votre-username&repo=smartdock&show_icons=true&theme=dark" alt="GitHub Stats">
</div>

## 🏆 Remerciements

- **Docker** - Pour la containerisation
- **React** - Pour l'interface utilisateur
- **Caddy** - Pour le reverse proxy
- **Tailwind CSS** - Pour le design
- **Lucide** - Pour les icônes
- **Framer Motion** - Pour les animations

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