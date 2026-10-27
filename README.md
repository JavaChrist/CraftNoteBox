# CraftNoteBox

CraftNoteBox est une application web de prise de notes et d’organisation, pour un usage personnel. Elle rassemble des pages hiérarchiques, un éditeur par blocs, la recherche, un calendrier de réunions et un assistant de rédaction nommé JavaChrist.

Elle s’adresse à la personne qui tient ses notes : pages privées, pages PRO, projets, sauvegardes, fiches d’applications et comptes rendus. Chaque contenu est rattaché à un seul compte. L’interface ne propose pas de partage ni de travail à plusieurs.

Version indiquée dans le projet : `0.1.0`. Le paquet npm est privé.

---

## Fonctionnalités

### Opérationnelles

Ces parcours sont branchés sur le code et sur Supabase (ou sur OpenAI pour JavaChrist).

- **Connexion** par e-mail et mot de passe (Supabase Auth), déconnexion, et rappel de session via `proxy.ts`. L’écran de connexion ne crée pas de compte et ne propose pas de réinitialisation de mot de passe. La route `/auth/callback` échange un code de session lorsqu’un lien Supabase en fournit un.
- **Pages** classées en cinq rubriques : Pages privées, Pages PRO, Projets, Sauvegardes, Applications. Création, sous-pages, renommage, arborescence dans la barre latérale, titre enregistré automatiquement.
- **Éditeur Slate** : texte, titres, zone de texte, listes à puces et numérotées, tâches, citation, séparateur, bloc repliable, code coloré, encadré, tableau, image, fichier, aperçu de lien, vidéo, audio, intégration, lien vers une page et page intégrée. Menu slash, couleur du texte, déplacement et suppression d’un bloc depuis la marge. Sauvegarde automatique du contenu.
- **Médias** envoyés vers le bucket Supabase `page-media` par `/api/media/upload`. Images jusqu’à 12 Mo, autres fichiers jusqu’à 48 Mo. Les images courantes sont redimensionnées avant l’envoi.
- **Aperçu de lien** : `/api/link-preview` lit le titre, la description et l’image d’une page web autorisée.
- **Import** de fichiers `.md`, `.markdown`, `.txt` et `.csv` depuis le menu slash.
- **Export** de toutes les pages hors corbeille en archive ZIP de fichiers Markdown (`/api/export`), rangés dans `prive/`, `pro/`, `projets/`, `sauvegardes/` et `applications/`. Le bouton est en bas de la barre latérale. L’archive sert de copie lisible : elle ne reproduit pas la mise en page de l’éditeur.
- **Recherche** des titres et du contenu des pages (hors corbeille), depuis `/search` ou la palette `Ctrl+K` / `Cmd+K`. Les dernières recherches restent dans le navigateur.
- **Réunions** : calendrier, agenda, liste, création, modification et suppression. Lieu, description, pages liées, et page de compte rendu optionnelle (« titre - Compte rendu ») avec un modèle de sections.
- **Corbeille** : une page supprimée peut être restaurée ou effacée définitivement.
- **JavaChrist**, lorsque `OPENAI_API_KEY` est définie : résumé, reformulation, checklist, plan structuré, amélioration, compte rendu et propositions de titres, à partir du texte de la page ou d’une sélection. La page `/assistant` explique cet usage.
- **Thème** clair ou sombre, mémorisé dans le navigateur.
- **Application installable** (manifeste et icônes). En production, un service worker affiche `/offline.html` si le réseau ne répond pas. Une modale propose de recharger lorsque la version servie par `/api/version` diffère de celle de la page. Cette comparaison utilise `VERCEL_GIT_COMMIT_SHA` ; en local, la version vaut `dev` et la modale reste inactive.

### Partielles

- **Bloc « base de données »** : tableau enregistré dans la page (colonnes texte, nombre, date ou liste). Vues disponibles : table, kanban, galerie, liste, fil, chronologie, tableau de bord et calendrier. À la création, trois lignes d’exemple sont proposées, puis modifiables. Galerie, liste, fil et chronologie sont des présentations en cartes. Le tableau de bord compte les lignes, additionne la colonne nombre et répartit les statuts. On peut ajouter des lignes et régler les colonnes. Il n’y a pas de filtres, de relations entre pages ni de formules.
- **Bloc graphique** : barres, lignes ou anneau dessinés à partir de valeurs saisies dans le bloc. Quatre points d’exemple sont proposés à la création. Le graphique n’est pas calculé depuis le bloc base de données.
- **Intégrations** : YouTube, Vimeo, Loom, Spotify (piste, playlist, album, épisode), Figma, CodePen, Google Docs / Sheets / Slides et Google Maps s’affichent dans la page. Une autre adresse reste un lien. Une vidéo ou un audio peut aussi être un fichier envoyé dans `page-media`.
- **Recherche** : correspondance de texte, sans classement par pertinence. Le passage affiché est un extrait du contenu enregistré.
- **Hors ligne** : seule la page de secours est conservée. Les notes restent sur Supabase.
- **JavaChrist** : l’action échoue tant que `OPENAI_API_KEY` n’est pas définie. Le texte envoyé est limité à 80 000 caractères. Le modèle par défaut est `gpt-4o-mini`, remplaçable avec `OPENAI_MODEL`.
- **Compte** : la création d’un utilisateur se fait dans Supabase, hors de cet écran de connexion. En développement uniquement, `DEV_SUPABASE_USER_ID` peut remplacer la session.
- **Menu d’une rubrique** de la barre latérale : masquer la rubrique fonctionne. Trier, remonter, descendre et « Ouvrir dans la bibliothèque » sont présents dans le menu et désactivés.
- **Icône de page** : le champ existe en base. L’interface ne permet pas de le choisir. Les encadrés ont, eux, un choix d’icône.

### Simulées

Aucun écran parcouru n’est un décor vide. Les lignes et les points affichés à la création d’une base ou d’un graphique sont des exemples enregistrés avec la page dès qu’on les modifie.

### Prévues

Indiquées dans l’interface, sans date :

- tri, déplacement des rubriques (« Bientôt ») et bibliothèque (« Phase 2 ») dans le menu de la barre latérale ;
- pistes JavaChrist listées sur `/assistant` : résumé automatique à partir d’un fichier audio ou de notes liées, aide aux comptes rendus récurrents, suggestions pendant la rédaction, génération à partir de plusieurs pages.

La collaboration entre plusieurs personnes n’est pas implémentée.

---

## Parcours

| Adresse | Rôle |
| --- | --- |
| `/` | Redirige vers `/home` |
| `/login` | Connexion |
| `/home` | Accueil et raccourcis |
| `/pages` | Invite à ouvrir ou créer une page |
| `/pages/[pageId]` | Éditeur |
| `/meetings` | Calendrier et rendez-vous |
| `/assistant` | Mode d’emploi de JavaChrist |
| `/search` | Recherche |
| `/trash` | Corbeille |
| `/api/export` | Téléchargement de l’archive Markdown |
| `/api/ai` | Appel à JavaChrist |
| `/api/media/upload` | Envoi d’un fichier |
| `/api/link-preview` | Aperçu d’un lien |
| `/api/version` | Identifiant de la version servie |
| `/auth/callback` | Retour de session Supabase |
| `/auth/signout` | Déconnexion |

Les pages du tableau de bord exigent une session. Sans session, l’application renvoie vers `/login`.

---

## Stack

| Rôle | Technique |
| --- | --- |
| Application | Next.js 16 (App Router), React 19 |
| Présentation | Tailwind CSS |
| Éditeur | Slate, slate-react, slate-history, lowlight |
| Données, comptes, fichiers | Supabase (PostgreSQL, Auth, Storage) |
| Session | `@supabase/ssr`, fichier `proxy.ts` |
| Assistant | API OpenAI, route `/api/ai` |
| Tests | Vitest |

---

## Installation

Prérequis : Node.js, npm, et un projet Supabase déjà créé.

```bash
npm install
npm run dev
```

L’application de développement est servie par Next.js sur le port habituel (3000 si celui-ci est libre).

---

## Configuration

Créer un fichier `.env.local` à la racine. Il est ignoré par git. Le dépôt ne contient pas de fichier `.env.example`, même si la page JavaChrist le mentionne.

Variables à renseigner soi-même (valeurs absentes de ce document) :

| Variable | Rôle |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet Supabase. Alias accepté : `SUPABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon. Alias accepté : `SUPABASE_ANON_KEY`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète serveur. Nécessaire pour les pages, les blocs, les réunions, la recherche, l’export et l’envoi de fichiers. |
| `OPENAI_API_KEY` | Active JavaChrist. Sans elle, `/api/ai` répond que la clé manque. |
| `OPENAI_MODEL` | Facultatif. Modèle utilisé à la place de `gpt-4o-mini`. |
| `DEV_SUPABASE_USER_ID` | Facultatif, et ignoré en production. Identifiant utilisateur de secours en développement. |

`VERCEL_GIT_COMMIT_SHA` est fournie par l’hébergeur lorsqu’elle existe. Elle sert uniquement à détecter qu’une nouvelle version est en ligne. Sa présence dans le code ne signifie pas que le site est publié.

---

## Migrations SQL

À appliquer dans cet ordre sur le projet Supabase (éditeur SQL ou CLI) :

1. `supabase/migrations/20260408000000_init.sql`
2. `supabase/migrations/20260410000000_global_search.sql`
3. `supabase/migrations/20260411000000_page_scope.sql`
4. `supabase/migrations/20260412000000_meetings.sql`
5. `supabase/migrations/20260413000000_meetings_minutes_page.sql`
6. `supabase/migrations/20260415000000_pages_soft_delete.sql`
7. `supabase/migrations/20260416000000_page_media_storage.sql`
8. `supabase/migrations/20260417000000_storage_rls_split_part.sql`
9. `supabase/migrations/20261015020000_page_scope_sections.sql`

Sans les tables de réunions, la page Réunions affiche le fichier SQL à exécuter. Sans la colonne de rubrique, la barre latérale signale la migration des pages.

---

## Données

### `pages`

`user_id`, `title`, `parent_id`, `icon`, `scope` (`private`, `pro`, `projets`, `sauvegardes`, `applications`), `deleted_at`.

### `blocks`

`page_id`, `user_id`, `type`, `content` (JSON), `order_index`.

Types enregistrés : `paragraph`, `heading1`, `heading2`, `heading3`, `text_zone`, `bulleted_list`, `numbered_list`, `todo`, `quote`, `divider`, `toggle`, `code`, `image`, `file`, `bookmark`, `video`, `audio`, `callout`, `table`, `page_link`, `page_embed`, `embed`, `database`, `chart`.

### Réunions

`meetings` (titre, description, lieu, début, fin, `minutes_page_id` facultatif) et `meeting_pages` pour les pages liées.

L’accès SQL direct est limité au propriétaire (`user_id`). Les actions serveur utilisent la clé `service_role` et filtrent aussi par cet identifiant.

---

## Structure

```
app/
  (auth)/login/
  (dashboard)/     home, pages, meetings, assistant, search, trash
  api/             ai, export, link-preview, media/upload, version
  auth/            callback, signout
components/        éditeur, réunions, barre latérale, assistant
lib/               actions, éditeur, export, ia, supabase
proxy.ts
public/            manifeste, icônes, sw.js, offline.html
supabase/migrations/
```

---

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Compilation de production |
| `npm run start` | Sert la compilation |
| `npm run lint` | Vérification ESLint |
| `npm test` | Tests Vitest (archive, arbre de pages, blocs riches) |
| `npm run icons` | Régénère des icônes de marque |

---

## Sécurité

La clé `service_role` reste côté serveur. Ne pas la placer dans un fichier public et ne pas committer `.env.local`.

---

## Licence

Le champ `license` de `package.json` indique MIT. Le dépôt ne contient pas de fichier `LICENSE`.
