# Documentation technique

## Architecture de l'application

L'application est une API backend NestJS dediee au partage de fichiers. Elle permet a un utilisateur de creer un compte, se connecter, televerser des fichiers, consulter les metadonnees de fichiers, telecharger des fichiers proteges et gerer des tags.

L'architecture est decoupee en modules NestJS :

- `AuthModule` : inscription, connexion, hachage des mots de passe, creation et verification des sessions JWT.
- `UserModule` : recherche, creation et exposition des donnees utilisateur.
- `FileModule` : televersement, listing, telechargement, suppression, generation de liens, gestion des mots de passe de fichiers, dates d'expiration et tags.
- `TagModule` : creation, liste et suppression des tags reutilisables.

Le flux principal est le suivant :

1. L'utilisateur s'inscrit ou se connecte via l'API d'authentification.
2. L'API cree un JWT et l'enregistre dans un cookie HTTP-only nomme `session_id`.
3. Les routes protegees verifient ce cookie avec `CookieAuthGuard`.
4. Les fichiers envoyes en `multipart/form-data` sont valides, convertis en base64 dans le controleur, puis reconvertis en binaire avant stockage.
5. Le service fichier enregistre les donnees en base, cree les relations avec l'utilisateur et les tags, puis renvoie les metadonnees.

## Choix technologiques justifies

- NestJS : framework Node.js structure autour des modules, controleurs, services et injections de dependances. Il convient bien a une API maintenable avec une separation claire entre routes, logique metier et acces aux donnees.
- TypeScript : typage statique pour securiser les DTO, services, entites et tests.
- PostgreSQL : base relationnelle robuste pour stocker les utilisateurs, fichiers, tags et tables d'association. Le type `bytea` est utilise pour stocker le contenu binaire des fichiers.
- TypeORM : ORM utilise pour mapper les entites TypeScript vers PostgreSQL, manipuler les repositories et eviter les requetes SQL concatenees manuellement.
- JWT : format compact pour representer une session utilisateur signee cote serveur.
- Cookies HTTP-only : stockage de session moins expose au JavaScript frontend qu'un token en local storage.
- Jest : framework de test adapte a l'ecosysteme NestJS, utilise pour tester les controleurs et services.
- `class-validator` : validation declarative des DTO et des payloads, notamment pour les champs de tags, identifiants UUID et fichiers.

## Modele de donnees

Les entites principales utilisent des identifiants UUID generes par TypeORM.

### `Users`

Stocke les comptes utilisateur.

- `id` : UUID primaire.
- `email` : adresse email.
- `password` : mot de passe hache au format `salt:hash`.
- `firstname` : prenom.
- `lastname` : nom.
- `hasVerifiedEmail` : booleen indiquant si l'email est verifie.

Relation : un utilisateur peut etre lie a plusieurs fichiers via `File_User`.

### `File`

Stocke les fichiers televerses et leurs metadonnees.

- `id` : UUID primaire.
- `expirationDate` : date d'expiration optionnelle.
- `name` : nom du fichier.
- `password` : mot de passe optionnel du fichier, stocke haché.
- `link` : lien partageable genere a partir de l'UUID.
- `uploadDate` : date d'envoi.
- `physicalFileName` : nom physique du fichier stoqué sur le système. généré à partir de la date d'upload et de l'Id du fichier.

Relations : un fichier peut etre lie a plusieurs utilisateurs via `File_User` et a plusieurs tags via `File_Tags`.

### `Tags`

Stocke les tags reutilisables.

- `id` : UUID primaire.
- `name` : nom du tag.

Relation : un tag peut etre associe a plusieurs fichiers via `File_Tags`.


### `File_Tags`

Table d'association entre fichiers et tags.

- `id` : UUID primaire.
- `idTag` : UUID du tag.
- `idFile` : UUID du fichier.

Les relations vers `File` et `Tags` utilisent `onDelete: 'CASCADE'`.

## Documentation d'API

### Authentification

#### `POST /auth/register`

Cree un compte et connecte immediatement l'utilisateur.

Corps attendu :

```json
{
  "email": "user@example.com",
  "password": "password123",
  "passwordConfirmation": "password123",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Comportement :

- rejette les confirmations de mot de passe incorrectes ;
- rejette les emails deja utilises ;
- rejette les mots de passe de moins de 8 caracteres ;
- hache le mot de passe ;
- retourne les donnees de l'utilisateur connecte ;
- ajoute le cookie `session_id`.

#### `POST /auth/login`

Connecte un utilisateur existant.

Corps attendu :

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Comportement :

- recherche l'utilisateur par email ;
- compare le mot de passe soumis avec le hash stocke ;
- retourne les donnees connectees si les identifiants sont valides ;
- ajoute le cookie `session_id`.

### Utilisateurs

Les routes suivantes sont protegees par `CookieAuthGuard`, sauf `POST /user/login`.

- `GET /user/health` : verifie la connexion a la base de donnees.
- `GET /user/by-email?email=...` : retourne un utilisateur par email.
- `GET /user/by-id?id=...` : retourne un utilisateur par identifiant.
- `GET /user/all` : retourne tous les utilisateurs.
- `POST /user/login` : route de connexion alternative utilisant le meme service d'authentification.

### Fichiers

#### `POST /file/upload`

Route protegee par `CookieAuthGuard`.

Format : `multipart/form-data`.

Champs :

- `file` : contenu du fichier, obligatoire.
- `name` : nom affiche.
- `extension` : extension du fichier.
- `email` : email du proprietaire.
- `expirationTimeInDay` : nombre de jours avant expiration.
- `password` : mot de passe optionnel du fichier.
- `uploadDate` : date d'envoi optionnelle.
- `tags` : tags optionnels.

Comportement :

- verifie l'authentification ;
- rejette l'absence de fichier ;
- rejette certaines extensions dangereuses ;
- convertit le fichier en base64 avant de l'envoyer au service ;
- stocke le contenu en `bytea` ;
- hache le mot de passe de fichier si fourni ;
- calcule une date d'expiration ;
- genere un lien partageable ;
- associe le fichier a l'utilisateur et aux tags.

#### Autres routes fichier

- `POST /file` : retourne les fichiers associes a un email utilisateur.
- `POST /file/download` : telecharge un fichier par ID, avec mot de passe optionnel.
- `GET /file/link/:link` : resout un lien genere et retourne les metadonnees du fichier.
- `DELETE /file/delete/:id` : supprime un fichier par identifiant.

### Tags

Toutes les routes `tag` sont protegees par `CookieAuthGuard`.

- `POST /tag/add` : cree ou ajoute un tag.
- `GET /tag/all` : liste les tags.
- `DELETE /tag/delete` : supprime un tag a partir de son ID.

## Securite et gestion des acces

L'authentification repose sur un cookie `session_id` contenant un JWT signe.

Parametres du cookie :

- `httpOnly: true` : le cookie n'est pas lisible par le JavaScript frontend.
- `sameSite: 'strict'` : limite les risques CSRF.
- `secure: true` en production : impose HTTPS lorsque `NODE_ENV=production`.
- `path: '/'` : cookie disponible sur toute l'API.
- `maxAge: 1 heure` : expiration de session apres une heure.

Le secret JWT est lu depuis `JWT_SECRET`. En production, l'application refuse de demarrer si cette variable est absente. En developpement, un secret local de secours est utilise.

Les mots de passe utilisateur et les mots de passe optionnels des fichiers sont haches avec `crypto.scryptSync`, un sel aleatoire et une cle derivee de 64 octets. La comparaison utilise `timingSafeEqual` pour limiter les attaques par timing.

Les routes sensibles utilisent `CookieAuthGuard`, qui verifie la presence et la validite du cookie. Les routes de fichiers et de tags principales sont donc accessibles uniquement avec une session valide.

La validation des fichiers bloque des extensions executables ou dangereuses comme `.exe`, `.bat`, `.cmd`, `.js`, `.ps1`, `.sh`, `.vbs` et `.msi`.

Limites et points d'amelioration identifies :

- les UUID ne remplacent pas une verification stricte des droits par proprietaire ;
- certaines routes fichier pourraient renforcer l'autorisation au niveau du fichier demande ;
- les fichiers sont stockes en base sans chiffrement applicatif ;
- une limite de taille d'upload devrait etre configuree ;
- la validation d'extension ne remplace pas une analyse MIME ou antivirus ;
- les routes de connexion et d'inscription gagneraient a avoir du rate limiting ;
- HTTPS et un `JWT_SECRET` fort sont obligatoires en production ;
- `synchronize` TypeORM doit rester desactive en production.

## Qualite, tests et maintenance

Le projet utilise Jest pour les tests unitaires et les tests de routes. La configuration exclut les DTO du calcul de couverture car ils portent principalement des formes de donnees.

Les tests documentes couvrent :

- la connexion via `POST /auth/login` ;
- l'inscription via `POST /auth/register` ;
- les erreurs d'inscription : confirmation incorrecte, email deja utilise, mot de passe trop court ;
- le hachage des mots de passe ;
- la creation du cookie `session_id` ;
- le televersement de fichier via `POST /file/upload` ;
- le rejet des fichiers manquants ;
- le rejet des utilisateurs non authentifies ;
- le rejet des extensions interdites ;
- la preparation du fichier avant stockage ;
- la generation de liens ;
- l'association fichier-utilisateur ;
- le hachage des mots de passe de fichiers ;
- la normalisation et reutilisation des tags ;
- le calcul des dates d'expiration.

Commandes utiles :

```bash
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

Bonnes pratiques de maintenance :

- conserver la separation controleur/service/mapper ;
- ajouter des tests lors de toute evolution de route ou de regle metier ;
- garder les DTO en kebab-case pour une convention de nommage homogene ;
- documenter les nouvelles routes dans `API.md` ou dans ce dossier technique ;
- verifier les migrations et la configuration TypeORM avant un deploiement production.

## Processus d'installation et d'execution

Depuis le dossier `app` :

```bash
npm install
```

Lancement en developpement :

```bash
npm run start
```

Lancement avec rechargement automatique :

```bash
npm run start:dev
```

Build :

```bash
npm run build
```

Lancement en production apres build :

```bash
npm run start:prod
```

La base PostgreSQL doit etre accessible avec les variables d'environnement configurees. En developpement, TypeORM peut synchroniser automatiquement le schema car `synchronize` est active hors production. En production, cette synchronisation automatique doit rester desactivee et les changements de schema doivent etre geres par migrations.
