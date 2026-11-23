# Formulaire de classe : « On construit notre année ensemble »

Site léger en Vue 3, sans compilation. Les réponses arrivent dans une feuille Google Sheets grâce à un petit script Apps Script gratuit, et un tableau de bord privé permet de les lire.

```
formulaire-classe/
├── config.js             ← LE fichier de réglages (URL du script, nom de la classe)
├── index.html            ← le formulaire (lien à partager à la classe)
├── admin.html            ← le tableau de bord des responsables (/admin)
├── vercel.json           ← adresse /admin et non-référencement
├── .vercelignore         ← garde le script et ce guide hors du site en ligne
├── apps-script/Code.gs   ← le script à coller dans Google Sheets
└── README.md
```

## 1. Préparer la feuille qui reçoit les réponses

1. Crée une feuille Google Sheets, par exemple « Réponses formulaire de classe ».
2. Menu **Extensions > Apps Script**.
3. Efface le code présent, colle tout le contenu de `apps-script/Code.gs`, puis enregistre.
4. Crée le code d’accès du tableau de bord : roue dentée **Paramètres du projet > Propriétés du script > Ajouter une propriété**.
   - Propriété : `ADMIN_KEY`
   - Valeur : un code long que toi seul connais (au moins 12 caractères, par exemple trois mots et des chiffres).
5. Clique sur **Déployer > Nouveau déploiement**. Choisis le type **Application Web**, puis :
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
6. Clique sur **Déployer** et autorise l’accès avec ton compte Google. Si Google affiche un avertissement, passe par « Paramètres avancés » puis « Accéder au projet ».
7. Copie l’**URL de l’application Web** (elle se termine par `/exec`). Pour vérifier, ouvre-la dans ton navigateur : tu dois voir `"ok":true`.

Si tu avais déjà déployé l’ancienne version du script : colle le nouveau `Code.gs`, ajoute `ADMIN_KEY`, puis **Déployer > Gérer les déploiements > crayon > Version : Nouvelle version > Déployer**. L’URL ne change pas.

## 2. Coller l’URL dans config.js

Ouvre `config.js` et colle l’URL `/exec` entre les guillemets de `scriptUrl`. C’est le seul fichier à modifier : le formulaire et le tableau de bord le lisent tous les deux.

```js
window.FORM_CONFIG = {
  scriptUrl: "https://script.google.com/macros/s/…/exec",
  classe: "Notre classe de L2 IRT, groupe 4, ESGIS",
  sheetUrl: "",   // facultatif : le lien de ta feuille Google Sheets
};
```

Tant que `scriptUrl` est vide, le formulaire affiche « Mode test » et n’envoie rien, et le tableau de bord montre des réponses d’exemple inventées.

## 3. Mettre en ligne sur Vercel

**Avec GitHub (le plus simple)**
1. Mets le dossier `formulaire-classe` dans un dépôt GitHub.
2. Sur vercel.com : **Add New > Project**, importe le dépôt.
3. Framework Preset : **Other**, puis **Deploy**.

**En ligne de commande**
```bash
npm i -g vercel
cd formulaire-classe
vercel          # aperçu
vercel --prod   # version finale
```

- Le formulaire : `https://ton-projet.vercel.app` (le lien à partager sur WhatsApp)
- Le tableau de bord : `https://ton-projet.vercel.app/admin` (ne le partage qu’avec l’autre responsable)

## 4. Utiliser le tableau de bord

- **Statistiques** : chaque question avec le nombre et le pourcentage de réponses, les matières difficiles regroupées, et un bouton « Copier le résumé pour WhatsApp » qui prépare le message à poster dans le groupe Annonces.
- **Réponses** : chaque réponse complète, avec le prénom quand l’étudiant l’a donné (sinon « Anonyme »), une recherche et un filtre « Avec prénom ».
- **Équipe et idées** : les volontaires pour l’équipe, les talents à partager et les idées pour la classe.

Le code d’accès est vérifié par le script Google, il n’est jamais écrit dans les fichiers du site. Le navigateur s’en souvient jusqu’à la fermeture de l’onglet. Pour changer le code, modifie simplement `ADMIN_KEY` dans les propriétés du script.

## Bon à savoir

- Le formulaire annonce qu’il est anonyme : aucune adresse e-mail ni aucun numéro n’est collecté, et le prénom est facultatif. Le tableau de bord ne peut donc afficher un nom que pour ceux qui ont choisi de le donner.
- Le script n’enregistre que les champs prévus, coupe les textes trop longs et empêche qu’une réponse soit lue comme une formule.
- Un champ invisible piège les robots de spam.
- Si tu modifies les questions ou les options dans `index.html`, fais la même modification dans la liste `QUESTIONS` de `admin.html`.
