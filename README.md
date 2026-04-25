# Pulse - Frontend

Vite + React 18 + TypeScript app for the GA4 (Firebase Analytics) dashboard builder. This is the Phase 1 frontend with mocked data; see `../TECHNICAL_DESIGN.md` for the broader architecture.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

Open the app, click **Connect with Google** on the login screen (mock), and you land on a dashboard editor pre-populated with eight widgets.

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - typecheck and produce a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - typecheck only (no emit)

## What's built (Phase 1)

- Two routes: `/login` and `/dashboard`, with a Redux-backed mock auth gate.
- Stack: Redux Toolkit + RTK Query, MUI v5 + MUI X (DataGrid, Date Pickers), react-grid-layout, Recharts.
- Five widget types: KPI, Line, Bar, Pie, Table.
- Drag-and-drop dashboard editor:
  - Left rail palette: drag a widget onto the canvas (or click to append).
  - Center canvas: react-grid-layout with drag/resize/drop, edit/view modes.
  - Right rail config: title, metrics, dimensions, date range (presets or custom), row limit, plus per-widget display options.
  - Top bar: property picker, refresh-all, edit/view toggle, save (persists to `localStorage`), user menu.
- Deterministic mock GA4 data generator (`src/lib/mockGa4.ts`) keyed by query, so widget values are stable across reloads.

## Where to swap in the real BFF later

The mock layer lives behind RTK Query slices that use `queryFn`. To swap to a real backend, replace `queryFn` with `query` (or change the `baseApi` `baseQuery`) in:

- `src/store/api/queryApi.ts`
- `src/store/api/propertiesApi.ts`
- `src/store/api/catalogApi.ts`
- `src/store/api/dashboardsApi.ts`
- `src/store/api/authApi.ts`

The widget contract (`src/types/dashboard.ts`, `src/types/ga4.ts`) does not change.

## Folder layout

```
src/
  app/         # router + ProtectedRoute
  components/  # shared UI (Logo, EmptyState, GoogleIcon)
  features/
    auth/      # LoginPage
    editor/    # TopBar, WidgetPalette, Canvas, WidgetTile, ConfigPanel
    widgets/   # registry + per-type Renderer/ConfigForm
  fixtures/    # default dashboard
  lib/         # GA4 catalog, mock generator, hashing, formatting
  store/       # Redux store, slices, RTK Query APIs
  theme/       # MUI theme
  types/       # GA4 + dashboard types
```
