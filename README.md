# 🚀 CraftNoteBox

Application web personnelle d’organisation et de prise de notes, inspirée de Notion, avec pages hiérarchiques, éditeur par blocs, recherche globale et modules extensibles.

---

## ✨ Fonctionnalités principales

- 🔐 Authentification sécurisée (Supabase)
- 🧭 Navigation structurée type Notion (sidebar modulaire)
- 📄 Pages privées hiérarchiques (sous-pages, expand/collapse)
- ✍️ Éditeur riche basé sur Slate (blocs structurés)
- ⚡ Slash menu (`/`) pour insertion rapide
- 💾 Sauvegarde automatique des contenus
- 🔎 Recherche globale (titres + contenu)
- 🧱 Architecture modulaire (Accueil, Réunions, Inbox, Assistant)

---

## 📊 État d’avancement

| Zone | Statut | Détail |
|------|--------|--------|
| **Auth** | Fait | Connexion / déconnexion email + mot de passe (Supabase). Redirection vers `/login` si non connecté. Session gérée via `proxy.ts`. |
| **Navigation** | Fait (MVP) | Sidebar avec liens fixes + section Pages privées (repliable, +, menu …). |
| **Accueil** | Fait (MVP) | `/home` avec cartes d’accès aux modules. |
| **Pages privées** | Fait | Création, hiérarchie (`parent_id`), expand/collapse. |
| **Éditeur** | Fait | Slate : paragraph, headings, listes, todo, quote, divider, toggle, code. |
| **Autosave** | Fait | Sauvegarde automatique (~800 ms). |
| **Slash menu** | Fait | Insertion / transformation de blocs. |
| **Recherche** | Fait (MVP) | `/search` via RPC SQL (`ILIKE` sur contenu JSON). |
| **Réunions** | Fait (MVP) | `/meetings` : calendrier mensuel simple. |
| **Boîte de réception** | Placeholder | `/inbox` (phase 2). |
| **Assistant (IA)** | Placeholder | `/assistant` (phase 2). |
| **Drag & drop** | Prévu | `@dnd-kit` installé mais non branché. |
| **Collaboration** | Non prévu | Usage personnel uniquement. |

---

## 🧭 Parcours utilisateur

| Route | Description |
|-------|------------|
| `/` | Redirection vers `/home` |
| `/home` | Accueil (cartes modules) |
| `/login` | Connexion |
| `/pages` | Vue sans page sélectionnée |
| `/pages/[pageId]` | Éditeur |
| `/meetings` | Module réunions (MVP) |
| `/inbox` | Inbox (placeholder) |
| `/assistant` | IA (placeholder) |
| `/search` | Recherche globale |
| `/auth/callback` | Auth Supabase |

---

## 🧱 Stack technique

| Couche | Techno |
|--------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TailwindCSS |
| Éditeur | Slate.js |
| Données | Supabase (PostgreSQL + Auth) |
| Session | @supabase/ssr + proxy.ts |
| Drag & drop | @dnd-kit (prévu) |

---

## 🗄️ Modèle de données

### `pages`

- `user_id`
- `title`
- `parent_id`
- `icon`
- `created_at`
- `updated_at`

### `blocks`

- `page_id` (FK)
- `user_id`
- `type`
- `content` (jsonb)
- `order_index`

**Types de blocs :**  
`paragraph`, `heading1`, `heading2`, `heading3`, `bulleted_list`, `numbered_list`, `todo`, `quote`, `divider`, `toggle`, `code`

---

## 🏗️ Structure du projet

```
app/
  (dashboard)/
    home/
    meetings/
    inbox/
    assistant/
    pages/
    search/
  auth/

components/
  editor/
  layout/
  home/
  meetings/
  inbox/
  pages/

lib/
  actions/
  supabase/
  editor/
  auth/

proxy.ts
```

---

## ⚙️ Installation

```bash```
npm install
npm run dev
```

---

## 🔐 Configuration Supabase

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Voir aussi `.env.example` à la racine du dépôt.

---

## 🧪 Base de données

Exécuter les migrations dans l’ordre (SQL Editor Supabase) :

- `supabase/migrations/20260408000000_init.sql`
- `supabase/migrations/20260410000000_global_search.sql`

---

## 🚧 Prochaines étapes

- Drag & drop des blocs
- Amélioration UX sidebar (menu section avancé)
- Module Réunions complet (création d’événements)
- Boîte de réception (e-mails)
- Assistant IA
- Favoris / pages épinglées

---

## 🛡️ Sécurité

- Accès serveur via `service_role` uniquement côté Server Actions
- Filtrage systématique par `user_id`
- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` ni `.env.local`

---

## 📄 Licence

MIT (voir `package.json`).
