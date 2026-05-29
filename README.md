# jobby MD Editor

Un éditeur de CV Markdown haut de gamme, moderne et respectueux des standards ATS (Applicant Tracking System), conçu pour s'exécuter localement sans dépendance externe lourde.

Toutes vos modifications de contenu et de styles (couleurs, polices, marges) sont sauvegardées automatiquement dans votre dossier de travail pour vous permettre de reprendre votre travail d'un PC à l'autre via Git.

---

## 🚀 Démarrage Rapide

Pour lancer l'éditeur sur votre nouvelle machine après avoir fait votre `git pull` :

1. Ouvrez votre terminal (PowerShell / Invite de commande) dans le dossier du projet :
   ```powershell
   cd "chemin/vers/le/dossier/resume MD2HTML"
   ```

2. Démarrez le serveur local avec Python :
   ```powershell
   python server.py
   ```

3. Ouvrez votre navigateur et accédez à :
   👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📁 Structure des Fichiers du Projet

- `server.py` : Serveur local ultra-léger en Python (sans dépendances à installer). Il gère l'affichage de l'application et la sauvegarde de vos données sur votre disque.
- `index.html`, `style.css`, `app.js` : Code source de l'interface d'édition, du système de zoom auto et de l'analyseur ATS.
- `templates.css` : Styles de rendu pour la page A4 (écran + règles d'impression PDF).
- `sample.md` : Le modèle de CV par défaut (Julien Avarre) servant d'exemple initial.
- `resume.md` : **[Généré]** Le fichier contenant vos propres textes en Markdown.
- `config.json` : **[Généré]** Vos paramètres de mise en page personnalisés (polices choisies, tailles, interlignes, couleurs).

*Note : Commiter et pousser `resume.md` et `config.json` sur Git vous permet de synchroniser l'intégralité de vos textes et styles d'une machine à l'autre.*

---

## 📝 Directives Spécifiques dans le CV (Guide)

Conformément aux guides standards, vous pouvez utiliser des raccourcis spécifiques dans votre texte Markdown pour styliser votre rendu :

- **Couleur d'accentuation** : Utilisez `:accent[votre texte]` pour colorer des éléments importants (Ex. `:accent[Disponible immédiatement]`).
- **Texte estompé (gris)** : Utilisez `:muted[votre texte]` pour masquer visuellement des informations secondaires tout en les gardant indexables par les robots ATS (Ex. `:muted[Permis B · Véhiculé]`).
- **Barre de Contact** : L'éditeur détecte automatiquement la ligne contenant vos emails ou liens et la formate proprement. Vous pouvez également forcer un bloc de contact centré avec la syntaxe `[CONTACT : email | téléphone | linkedin]`.

---

## 🖨️ Générer le PDF pour les Recruteurs

Une fois satisfait de votre mise en page :
1. Cliquez sur le bouton **Imprimer / PDF** en haut à droite.
2. Dans la boîte de dialogue d'impression de votre navigateur, sélectionnez **Enregistrer au format PDF** comme destination.
3. Cochez **Graphiques d'arrière-plan** pour conserver vos couleurs, et décochez **En-têtes et pieds de page** pour un rendu de page propre.
4. Enregistrez votre fichier !
