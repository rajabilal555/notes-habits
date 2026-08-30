# 11: Filament label admin

**What to build:** Filament admin panel installed at **`/admin`**, limited scope: CRUD for labels only. Notes and habits are not managed in Filament — they stay in the Inertia/React app. Useful for lightweight back-office label cleanup/rename without building admin UI in the main app.

**Blocked by:** 05 Labels on notes

**Status:** done

- [x] Filament installed and reachable at `/admin`
- [x] Label resource: list, create, edit, delete
- [x] Admin access restricted (auth policy — admin user or same authenticated user scoping as appropriate for homelab single-user setup)
- [x] Changes in Filament reflect on `/notes` label filter and chips
- [x] No Filament resources for notes or habits
