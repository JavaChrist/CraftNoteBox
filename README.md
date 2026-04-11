# CraftNoteBox

Application web personnelle d’organisation et de prise de notes, inspirée de Notion, avec pages hiérarchiques, éditeur par blocs, recherche globale et modules extensibles.

---

## Fonctionnalités principales

- Authentification (Supabase Auth)
- Navigation type Notion : sidebar, pages **privées** et **PRO** (`scope`)
- Éditeur riche **Slate** : texte, titres, listes, tâches, citation, séparateur, repliable, code avec coloration (**lowlight** / thème highlight.js)
- **Médias** : blocs image, fichier et aperçu de lien (Open Graph), import via **API** `/api/media/upload` + bucket Supabase `page-media`
- **Slash menu** (« + » ou transformation de blocs), positionnement adaptatif en bas de page
- **Couleur** de texte par bloc, **suppression** de bloc depuis la gouttière
- Sauvegarde automatique du contenu
- Recherche globale (titres + contenu JSON des blocs)
- **Réunions** : calendrier, création / édition, page de compte rendu **optionnelle**, pages liées
- Corbeille (soft delete des pages), PWA / mode hors ligne (MVP selon config)

---

## État d’avancement

| Zone | Statut | Détail |
|------|--------|--------|
| **Auth** | Fait | Email / mot de passe, middleware `proxy.ts`, `@supabase/ssr`. |
| **Navigation** | Fait | Sidebar, pages privées + PRO, création, corbeille. |
| **Éditeur** | Fait (MVP) | Blocs listés ci-dessous + médias + code ; voids (Enter / suppression). |
| **Stockage fichiers** | Fait | `page-media` + `SUPABASE_SERVICE_ROLE_KEY` pour l’upload serveur. |
| **Réunions** | Fait (MVP) | RDV avec ou sans page « … - Compte rendu ». |
| **Recherche** | Fait | `/search`, RPC SQL. |
| **Inbox / Assistant** | Placeholder | Routes présentes, contenu à venir. |
| **Mail (inbox réelle)** | Prévu | Hors périmètre actuel ; à brancher plus tard. |
| **Blocs enrichis** | À venir | Extensions futures dans le sélecteur de blocs. |
| **Collaboration** | Non prévu | Usage personnel. |

---

## Parcours utilisateur

| Route | Description |
|-------|------------|
| `/` | Redirection vers `/home` |
| `/home` | Accueil |
| `/login` | Connexion |
| `/pages` | Liste / contexte pages |
| `/pages/[pageId]` | Éditeur |
| `/meetings` | Réunions / agenda |
| `/inbox` | Placeholder |
| `/assistant` | Placeholder |
| `/search` | Recherche |
| `/trash` | Corbeille (pages supprimées) |
| `/auth/callback` | Callback Supabase |

---

## Stack technique

| Couche | Techno |
|--------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TailwindCSS |
| Éditeur | Slate.js, slate-history, lowlight |
| Données | Supabase (PostgreSQL + Auth + Storage) |
| Session | `@supabase/ssr` + `proxy.ts` |

---

## Modèle de données (aperçu)

### `pages`

- `user_id`, `title`, `parent_id`, `icon`, `scope` (`private` \| `pro`)
- `deleted_at` (soft delete → corbeille)

### `blocks`

- `page_id`, `user_id`, `type`, `content` (jsonb), `order_index`

**Types de blocs persistés (racine) :**  
`paragraph`, `heading1`–`heading3`, `bulleted_list`, `numbered_list`, `todo`, `quote`, `divider`, `toggle`, `code`, `image`, `file`, `bookmark`

### Réunions

- `meetings`, `meeting_pages`, `minutes_page_id` (nullable)

---

## Structure du projet (extrait)

```
app/
  (dashboard)/    # home, pages, meetings, search, trash, …
  api/            # ai, link-preview, media/upload
components/
  editor/
lib/
  actions/
  editor/
  media/
  supabase/
proxy.ts
supabase/migrations/
```

---

## Installation

```bash
npm install
npm run dev
```

---

## Configuration Supabase

Fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` est **obligatoire** pour les Server Actions (blocs, pages, **upload média**). Voir `.env.example`.

---

## Migrations SQL

À exécuter dans l’ordre sur le projet Supabase (SQL Editor ou CLI) :

1. `20260408000000_init.sql`
2. `20260410000000_global_search.sql`
3. `20260411000000_page_scope.sql`
4. `20260412000000_meetings.sql`
5. `20260413000000_meetings_minutes_page.sql`
6. `20260415000000_pages_soft_delete.sql`
7. `20260416000000_page_media_storage.sql` (bucket `page-media`)
8. `20260417000000_storage_rls_split_part.sql` (politiques storage, optionnel mais recommandé)

---

## Prochaines étapes (feuille de route)

- Enrichir le **sélecteur de blocs** (nouveaux types, mise en page)
- **Module mail** / boîte de réception fonctionnelle
- Améliorations UX (drag & drop blocs, sidebar, etc.)
- Assistant IA opérationnel sur `/assistant`

---

## Sécurité

- `service_role` uniquement côté serveur (actions, routes API sensibles)
- Filtre systématique par `user_id`
- Ne jamais committer `.env.local` ni la clé `service_role`

---

## Licence

MIT (voir `package.json`).
