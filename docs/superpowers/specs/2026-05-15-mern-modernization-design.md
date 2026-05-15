# MERN Book E-Commerce — Modernization & Republish Design

**Date:** 2026-05-15  
**Status:** Approved  
**Approach:** B — Layer by layer (backend first, then frontend)

---

## Goal

Update a ~6-year-old MERN book e-commerce app so it runs on current tooling, can be developed locally, and can be published to Render. No UI redesign — functional modernization only.

---

## Deployment Target

- **Host:** Render (web service)
- **Database:** MongoDB Atlas (existing or new free-tier cluster)
- **Payments:** Braintree sandbox (existing credentials)
- **Node version:** 20 LTS

---

## Phase 1 — Backend Modernization

### Package upgrades

| Package | From | To | Reason |
|---|---|---|---|
| `mongoose` | 5.9.x | 8.x | v6+ removed deprecated connection options and callback APIs |
| `express-jwt` | 6.x | 8.x | v7+ changed to named export `{ expressjwt }` |
| `braintree` | 2.x | 3.x | v3 removed `braintree.connect()` |
| `uuidv1` | 1.x | `uuid` 9.x | `uuidv1` is deprecated; replaced by `uuid` v1 |
| `formidable` | 1.x | 3.x | `IncomingForm` API changed |
| `express-validator` | 6.x | 7.x | Minor API tightening |
| `concurrently` | 5.x | 8.x | Dev dependency |
| `nodemon` | 2.x | 3.x | Dev dependency |

### Code changes

1. **`index.js`** — Remove `useCreateIndex` and `useFindAndModify` from Mongoose connect options (removed in Mongoose 6+). Keep `useNewUrlParser` and `useUnifiedTopology` removal too — Mongoose 8 ignores them with a warning, but clean removal is preferred.

2. **`controllers/auth.js`**
   - Change `const expressJwt = require("express-jwt")` → `const { expressjwt } = require("express-jwt")`
   - Update `exports.requireSignIn` to use `expressjwt(...)` (lowercase, named)

3. **`controllers/braintree.js`**
   - Replace `braintree.connect({...})` with `new braintree.BraintreeGateway({...})`
   - Fix existing `err` reference bug (variable is named `error` but referenced as `err` in generateToken)

4. **`models/users.js`**
   - Replace `const uuidv1 = require("uuidv1")` with `const { v1: uuidv1 } = require("uuid")`

5. **`controllers/product.js`**
   - `new formidable.IncomingForm()` → `new formidable.Formidable({ keepExtensions: true })`
   - formidable v3 returns fields and files as arrays: `fields.name[0]`, `files.photo[0]`
   - File properties renamed: `files.photo.path` → `files.photo[0].filepath`, `files.photo.type` → `files.photo[0].mimetype`, `files.photo.size` → `files.photo[0].size`
   - Fix `res.satus(400)` typo (appears twice in `create` and `update`)
   - `product.remove()` is removed in Mongoose 7+; replace with `product.deleteOne()`

6. **All controllers** — Convert Mongoose callback-style queries to async/await. Affects: `auth.js`, `user.js`, `product.js`, `category.js`, `order.js`.

7. **`config/dev.js`** — Create with placeholder values for local development. This file is gitignored. Actual values must be set manually per developer.
   ```js
   module.exports = {
     MONGO_URI: "mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<dbname>",
     JWT_SECRET: "your-local-jwt-secret",
     BRAINTREE_MERCHANT_ID: "your-merchant-id",
     BRAINTREE_PUBLIC_KEY: "your-public-key",
     BRAINTREE_PRIVATE_KEY: "your-private-key",
   };
   ```

8. **`package.json`** — Update `engines` to `"node": ">=20.0.0"`. Add a `build` script: `"build": "npm install --prefix client && npm run build --prefix client"` for Render.

### Deployment config

- Add **`render.yaml`** at repo root:
  - Web service: build command `npm install && npm run build`, start command `npm start`
  - Environment variables defined as names only (values set in Render dashboard): `MONGO_URI`, `JWT_SECRET`, `BRAINTREE_MERCHANT_ID`, `BRAINTREE_PUBLIC_KEY`, `BRAINTREE_PRIVATE_KEY`, `NODE_ENV=production`

---

## Phase 2 — Frontend Modernization

### Package changes

| Package | From | To | Notes |
|---|---|---|---|
| `react-scripts` (CRA) | 3.x | **removed** | Replaced by Vite |
| `vite` | — | 5.x | New build tool |
| `@vitejs/plugin-react` | — | 4.x | Vite React plugin |
| `react` | 16.x | 18.x | `createRoot` API |
| `react-dom` | 16.x | 18.x | Same |
| `react-router-dom` | 5.x | 6.x | `Switch`→`Routes`, `component=`→`element=` |
| `http-proxy-middleware` | 1.x | **removed** | Replaced by Vite proxy config |
| `@testing-library/*` | old | 14.x | Updated; tests not in scope |

### Code changes

1. **`client/src/index.js`** — Replace `ReactDOM.render(...)` with React 18's `createRoot` API:
   ```js
   import { createRoot } from "react-dom/client";
   createRoot(document.getElementById("root")).render(<Routes />);
   ```

2. **`client/src/Routes.js`** — Migrate from react-router-dom v5 to v6:
   - `<Switch>` → `<Routes>`
   - Each `<Route path="..." component={X}>` → `<Route path="..." element={<X />} />`
   - Remove all `exact` props (default in v6)
   - Wrap `AdminRoute` and `PrivateRoute` usages in a layout route pattern

3. **`client/src/auth/PrivateRoute.js`** — Rewrite from v5 render-prop wrapper to v6 layout route:
   - Component renders `<Outlet />` if authenticated, otherwise `<Navigate to="/signin" />`

4. **`client/src/auth/AdminRoutes.js`** — Same rewrite pattern as PrivateRoute but checks admin role.

5. **`client/setupProxy.js`** — Delete. Replaced by Vite proxy.

6. **`client/vite.config.js`** — Create new:
   ```js
   import { defineConfig } from "vite";
   import react from "@vitejs/plugin-react";
   export default defineConfig({
     plugins: [react()],
     server: { proxy: { "/api": "http://localhost:5000" } },
   });
   ```

7. **`client/index.html`** — Move from `client/public/index.html` to `client/index.html` (Vite root). Update `<script>` tag to `<script type="module" src="/src/index.js"></script>`.

8. **`client/src/config.js`** — Audit any `process.env.REACT_APP_*` references and replace with `import.meta.env.VITE_*`.

9. **`client/src/serviceWorker.js`** — Delete (CRA artifact).

10. **`client/package.json`** — Replace `react-scripts` scripts with Vite equivalents:
    - `"start": "vite"`
    - `"build": "vite build"`
    - `"preview": "vite preview"`

### Root-level changes

- Root `package.json` `"client"` script stays as `npm run start --prefix client` (Vite's `start` script is `vite`, same interface)
- `"heroku-postbuild"` can stay as-is; Render uses the `build` script instead

---

## What Is NOT Changing

- All MongoDB schemas (User, Product, Category, Order) — no data model changes
- All API routes — endpoints remain identical
- All UI components and styling — no visual changes
- Business logic in controllers — only async/await refactor, no behavior changes
- Auth flow (JWT + cookies) — same mechanism

---

## Success Criteria

1. `npm run dev` starts both backend (port 5000) and frontend (Vite dev server, port 5173) without errors
2. User can sign up, sign in, browse products, add to cart, and complete a Braintree sandbox payment
3. Admin can add/edit/delete products, categories, and view orders
4. `npm run build` produces a production build
5. App deploys to Render and is accessible at the public URL
