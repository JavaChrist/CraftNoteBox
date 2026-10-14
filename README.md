# CraftNoteBox

Application web personnelle d’organisation et de prise de notes, inspirée de Notion, avec pages hiérarchiques, éditeur par blocs, recherche globale et modules extensibles.

---

## Fonctionnalités principales

- Authentification (Supabase Auth)
- Navigation type Notion : sidebar, pages **privées** et **PRO** (`scope`)
- Éditeur riche **Slate** : texte, titres, zone de texte, listes, tâches, citation, séparateur, repliable, code, encadré, tableau, base de données, graphique, vidéo, audio, intégrations, liens de page
- **Médias** : blocs image, fichier et aperçu de lien (Open Graph), import via **API** `/api/media/upload` + bucket Supabase `page-media`
- **Import** `.md`, `.txt` et `.csv` depuis le menu slash, **export** de toutes les pages en archive Markdown (`/api/export`)
- **Slash menu** (« + » ou transformation de blocs), positionnement adaptatif en bas de page
- **Couleur** de texte par bloc, **suppression** de bloc depuis la gouttière
- Sauvegarde automatique du contenu
- Recherche globale (titres + contenu JSON des blocs)
- **JavaChrist** : résumé, plan, reformulation et tâches depuis l’éditeur ; `/assistant` décrit le fonctionnement
- **Réunions** : calendrier, création / édition, page de compte rendu **optionnelle**, pages liées
- Corbeille (soft delete des pages)
- PWA installable, page hors ligne de secours, et modale quand un nouveau déploiement est en ligne

---

## État d’avancement

| Zone | Statut | Détail |
|------|--------|--------|
| **Auth** | Fait | Email / mot de passe, middleware `proxy.ts`, `@supabase/ssr`. |
| **Navigation** | Fait | Sidebar, pages privées + PRO, création, corbeille. |
| **Éditeur** | Fait | Blocs listés ci-dessous, médias, code, import et export Markdown. |
| **Stockage fichiers** | Fait | `page-media` + `SUPABASE_SERVICE_ROLE_KEY` pour l’upload serveur. |
| **Réunions** | Fait | Calendrier, rendez-vous, compte rendu optionnel. |
| **Recherche** | Fait | `/search`, RPC SQL. |
| **Assistant** | Fait | Actions dans l’éditeur. `/assistant` explique l’usage. |
| **Mises à jour** | Fait | `/api/version` + modale. L’app installée se recharge au lancement si le document est ancien. |
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
| `/meetings` | Réunions / calendrier |
| `/assistant` | Mode d’emploi de JavaChrist |
| `/search` | Recherche |
| `/trash` | Corbeille (pages supprimées) |
| `/api/export` | Archive ZIP des pages (Markdown) |
| `/api/version` | SHA du déploiement courant |
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
`paragraph`, `heading1`–`heading3`, `text_zone`, `bulleted_list`, `numbered_list`, `todo`, `quote`, `divider`, `toggle`, `code`, `image`, `file`, `bookmark`, `video`, `audio`, `callout`, `table`, `page_link`, `page_embed`, `embed`, `database`, `chart`

### Réunions

- `meetings`, `meeting_pages`, `minutes_page_id` (nullable)

---

## Structure du projet (extrait)

```
app/
  (dashboard)/    # home, pages, meetings, search, trash, …
  api/            # ai, export, link-preview, media/upload, version
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

## Périmètre

Usage personnel. Pas de collaboration temps réel. Le hors-ligne se limite à la page de secours : les notes restent sur Supabase, et l’archive Markdown sert de copie de sauvegarde.

---

## Sécurité

- `service_role` uniquement côté serveur (actions, routes API sensibles)
- Filtre systématique par `user_id`
- Ne jamais committer `.env.local` ni la clé `service_role`

---

## Licence

MIT (voir `package.json`).
