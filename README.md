# Spelite - D&D 5e Spell Manager

Spelite est une application web légère et performante (PWA) conçue pour aider les lanceurs de sorts de Donjons & Dragons 5e à gérer leur grimoire, leurs sorts préparés et leurs emplacements de sorts, même hors-ligne.

## ✨ Fonctionnalités

- **Gestion multi-personnages** : Créez, sauvegardez et basculez entre plusieurs aventuriers.
- **PWA (Progressive Web App)** : Installez l'application sur votre mobile ou bureau et utilisez-la sans connexion internet.
- **Grimoire complet** : Recherchez et apprenez des sorts parmi une base de données multilingue (FR/EN).
- **Suivi des emplacements** : Gérez vos "slots" de sorts et effectuez des repos longs en un clic.
- **Backup & Restore** : Exportez vos personnages au format JSON pour les sauvegarder ou les transférer sur un autre appareil.

## 🛠️ Installation & Développement

### Prérequis

- Node.js (v20+)
- npm

### Installation

```bash
npm install
```

### Démarrage en local

```bash
npm run dev
```

### Build de production

```bash
npm run build
```

## 🚀 Déploiement particulier

L'application est configurée pour être déployée n'importe où (racine du domaine ou sous-répertoire).

### Déploiement en sous-répertoire

Si vous déployez l'application dans un dossier spécifique (ex: `https://mon-domaine.com/spelite/`), vous devez spécifier le chemin de base lors du build :

```bash
VITE_BASE_URL=/spelite/ npm run build
```

Si aucune variable n'est fournie, le build utilise des chemins relatifs (`./`), ce qui permet une portabilité maximale dans la plupart des environnements de "Proof of Concept".

## 📖 Guide Utilisateur (Backup/Restore)

Pour transférer un personnage ou faire une sauvegarde manuelle :

1. Allez dans l'onglet **Personnage**.
2. Dans la section "Mes Personnages Sauvegardés", utilisez le bouton **Exporter** pour télécharger le fichier JSON.
3. Pour restaurer, cliquez sur **Importer** et sélectionnez votre fichier.

---

_Développé avec Preact, Signals, Vite et Tailwind CSS v4._
