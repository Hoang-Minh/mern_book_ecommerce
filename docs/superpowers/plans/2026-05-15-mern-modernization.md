# MERN Book E-Commerce Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all broken dependencies and migrate the frontend from CRA to Vite + React 18, so the app runs locally and can be published to Render.

**Architecture:** Layer-by-layer — backend packages and code fixed first (Phase 1), then frontend migrated from CRA to Vite + React 18 + Router v6 (Phase 2). Each phase ends with a smoke test before moving on.

**Tech Stack:** Node 20, Express 4, Mongoose 8, express-jwt 8, braintree 3, uuid 9, formidable 3 — React 18, Vite 5, react-router-dom 6, deployed to Render with MongoDB Atlas.

---

## File Map

### Phase 1 — Backend

| File | Action | What changes |
|---|---|---|
| `package.json` | Modify | Engine, scripts, dependency versions |
| `index.js` | Modify | Remove deprecated Mongoose connection options |
| `config/dev.js` | Create | Local env config template (gitignored) |
| `controllers/auth.js` | Modify | express-jwt named import; async/await |
| `controllers/braintree.js` | Modify | BraintreeGateway constructor; fix `err` typo |
| `models/users.js` | Modify | uuidv1 → uuid |
| `controllers/product.js` | Modify | formidable v3 API; deleteOne; fix typos; async/await |
| `controllers/user.js` | Modify | async/await throughout |
| `controllers/category.js` | Modify | async/await; deleteOne; fix `.satus` typo |
| `controllers/order.js` | Modify | async/await; Order.updateOne |
| `render.yaml` | Create | Render deployment config |

### Phase 2 — Frontend

| File | Action | What changes |
|---|---|---|
| `client/package.json` | Modify | Remove react-scripts; add vite, React 18, Router v6 |
| `client/vite.config.js` | Create | Vite config with /api proxy |
| `client/index.html` | Create | Move from public/; add module script tag |
| `client/src/index.js` | Modify | createRoot API (React 18) |
| `client/src/Routes.js` | Modify | v6 router: Routes, Route element=, layout routes |
| `client/src/auth/PrivateRoute.js` | Modify | v6 Outlet pattern |
| `client/src/auth/AdminRoutes.js` | Modify | v6 Outlet pattern |
| `client/setupProxy.js` | Delete | Replaced by vite.config.js proxy |
| `client/src/serviceWorker.js` | Delete | CRA artifact |
| `client/public/index.html` | Delete | Moved to client/index.html |

---

## Phase 1 — Backend

---

### Task 1: Update root package.json and reinstall backend dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Replace package.json content**

```json
{
  "name": "ecommerce",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "engines": {
    "node": ">=20.0.0"
  },
  "scripts": {
    "start": "node index.js",
    "test": "echo \"Error: no test specified\" && exit 1",
    "client": "npm run start --prefix client",
    "server": "nodemon index.js",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "build": "npm install --prefix client && npm run build --prefix client",
    "heroku-postbuild": "NPM_CONFIG_PRODUCTION=false npm i --prefix client && npm run build --prefix client"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "braintree": "^3.0.0",
    "cookie-parser": "^1.4.6",
    "express": "^4.18.2",
    "express-jwt": "^8.4.1",
    "express-validator": "^7.0.1",
    "formidable": "^3.5.1",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "lodash": "^4.17.21",
    "moment": "^2.29.4",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "concurrently": "^8.2.2",
    "nodemon": "^3.0.2"
  }
}
```

- [ ] **Step 2: Delete node_modules and reinstall**

```bash
rm -rf node_modules
npm install
```

Expected: clean install with no peer dependency errors. Ignore any deprecation warnings about `querystring` (it was removed from dependencies — `express` provides it internally).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade backend dependencies to current versions"
```

---

### Task 2: Fix Mongoose connection options in index.js

**Files:**
- Modify: `index.js`

- [ ] **Step 1: Remove deprecated Mongoose options**

Replace the `mongoose.connect` call:

```js
mongoose
  .connect(keys.MONGO_URI)
  .then(() => console.log("database connected"))
  .catch((err) => console.error("database connection error", err));
```

Mongoose 8 no longer accepts `useNewUrlParser`, `useCreateIndex`, `useUnifiedTopology`, or `useFindAndModify` — passing them throws an error.

- [ ] **Step 2: Verify syntax**

```bash
node -e "require('./index.js')" 2>&1 | head -5
```

Expected: either "database connected" (if MONGO_URI is set) or a connection error — no syntax errors or "option useCreateIndex is not supported" errors.

- [ ] **Step 3: Commit**

```bash
git add index.js
git commit -m "fix: remove deprecated Mongoose connection options"
```

---

### Task 3: Create config/dev.js template

**Files:**
- Create: `config/dev.js`

- [ ] **Step 1: Create the file**

```js
module.exports = {
  MONGO_URI: "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority",
  JWT_SECRET: "your-local-jwt-secret",
  BRAINTREE_MERCHANT_ID: "your-merchant-id",
  BRAINTREE_PUBLIC_KEY: "your-public-key",
  BRAINTREE_PRIVATE_KEY: "your-private-key",
};
```

- [ ] **Step 2: Fill in your real values**

Edit `config/dev.js` and replace the placeholder values with your actual MongoDB Atlas URI, a JWT secret string (any random string works locally), and your Braintree sandbox credentials.

- [ ] **Step 3: Ensure dev.js is gitignored**

```bash
grep "dev.js" .gitignore
```

If nothing is returned, add it:

```bash
echo "config/dev.js" >> .gitignore
```

- [ ] **Step 4: Commit .gitignore update only (never commit dev.js)**

```bash
git add .gitignore
git commit -m "chore: ensure config/dev.js is gitignored"
```

---

### Task 4: Fix express-jwt import in controllers/auth.js and convert to async/await

**Files:**
- Modify: `controllers/auth.js`

- [ ] **Step 1: Rewrite the file**

```js
const jwt = require("jsonwebtoken");
const { expressjwt } = require("express-jwt");
const User = require("../models/users");
const { errorHandler } = require("../helpers/dbErrorHandler");
const keys = require("../config/keys");

exports.signup = async (req, res) => {
  try {
    const user = new User(req.body);
    const createdUser = await user.save();
    createdUser.salt = undefined;
    createdUser.hashed_password = undefined;
    res.json({ createdUser });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ error: "User with email does not exist. Please sign up" });

    if (!user.authenticate(password))
      return res.status(401).json({ error: "Email and password don't match" });

    const token = jwt.sign({ _id: user._id }, keys.JWT_SECRET);
    res.cookie("t", token, { expire: new Date() + 9999 });

    const { _id, name, email: userEmail, role } = user;
    return res.json({ token, user: { _id, email: userEmail, name, role } });
  } catch (error) {
    return res.status(400).json({ error: "Error signing in" });
  }
};

exports.signOut = (req, res) => {
  res.clearCookie("t");
  res.json({ message: "Signout success" });
};

exports.requireSignIn = expressjwt({
  secret: keys.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth",
});

exports.isAuth = (req, res, next) => {
  const user = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!user) return res.status(403).json({ error: "Access denied" });
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0)
    return res.status(403).json({ error: "Admin resource. Access denied" });
  next();
};
```

- [ ] **Step 2: Verify no syntax error**

```bash
node -e "require('./controllers/auth.js')"
```

Expected: no output (module loads cleanly).

- [ ] **Step 3: Commit**

```bash
git add controllers/auth.js
git commit -m "fix: update express-jwt to named import and convert auth to async/await"
```

---

### Task 5: Fix braintree controller

**Files:**
- Modify: `controllers/braintree.js`

The old `braintree.connect()` API was removed in braintree SDK v3. Use `new braintree.BraintreeGateway({})`. Also fix the `err` reference bug in `generateToken` (the variable is named `error`).

- [ ] **Step 1: Rewrite the file**

```js
const braintree = require("braintree");
const keys = require("../config/keys");

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: keys.BRAINTREE_MERCHANT_ID,
  publicKey: keys.BRAINTREE_PUBLIC_KEY,
  privateKey: keys.BRAINTREE_PRIVATE_KEY,
});

exports.generateToken = (req, res) => {
  gateway.clientToken.generate({}, function (error, response) {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(response);
    }
  });
};

exports.processPayment = (req, res) => {
  const nonceFromTheClient = req.body.paymentMethodNonce;
  const amountFromTheClient = req.body.amount;

  gateway.transaction.sale(
    {
      amount: amountFromTheClient,
      paymentMethodNonce: nonceFromTheClient,
      options: { submitForSettlement: true },
    },
    (error, result) => {
      if (error) return res.status(500).json(error);
      res.json(result);
    }
  );
};
```

- [ ] **Step 2: Verify no syntax error**

```bash
node -e "require('./controllers/braintree.js')"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add controllers/braintree.js
git commit -m "fix: update braintree SDK v3 constructor and fix err reference bug"
```

---

### Task 6: Fix models/users.js (uuidv1 → uuid)

**Files:**
- Modify: `models/users.js`

- [ ] **Step 1: Replace the uuidv1 import**

Change line 3 from:
```js
const uuidv1 = require("uuidv1");
```
to:
```js
const { v1: uuidv1 } = require("uuid");
```

Everything else in the file stays the same — the function signature `uuidv1()` is identical.

- [ ] **Step 2: Verify**

```bash
node -e "require('./models/users.js')"
```

Expected: no output (no errors loading the model).

- [ ] **Step 3: Commit**

```bash
git add models/users.js
git commit -m "fix: replace deprecated uuidv1 package with uuid v1"
```

---

### Task 7: Fix controllers/product.js (formidable v3 + async/await)

**Files:**
- Modify: `controllers/product.js`

Key changes:
- `new formidable.IncomingForm()` → `new formidable.Formidable({ keepExtensions: true })`
- formidable v3 fields and files are arrays: `fields.name[0]`, `files.photo[0]`
- File properties renamed: `.path` → `.filepath`, `.type` → `.mimetype`
- `product.remove()` → `product.deleteOne()` (removed in Mongoose 7+)
- Fix `res.satus(400)` typo (appears twice)
- All Mongoose queries converted to async/await

- [ ] **Step 1: Rewrite the file**

```js
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.productById = async (req, res, next, id) => {
  try {
    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(400).json({ error: "Product not found" });
    req.product = product;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Product not found" });
  }
};

exports.create = (req, res) => {
  const form = new formidable.Formidable({ keepExtensions: true });
  form.parse(req, async (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    const flatFields = Object.fromEntries(
      Object.entries(fields).map(([key, val]) => [key, val?.[0]])
    );

    const { name, description, price, category, quantity, shipping } = flatFields;
    if (!name || !description || !price || !category || !quantity || !shipping)
      return res.status(400).json({ error: "All fields are required" });

    const product = new Product(flatFields);

    const photo = files.photo?.[0];
    if (photo) {
      if (photo.size > 1000000)
        return res.status(400).json({ error: "Image size must be less than 1 MB" });
      product.photo.data = fs.readFileSync(photo.filepath);
      product.photo.contentType = photo.mimetype;
    }

    try {
      const result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
  });
};

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.remove = async (req, res) => {
  try {
    await req.product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.update = (req, res) => {
  const form = new formidable.Formidable({ keepExtensions: true });
  form.parse(req, async (error, fields, files) => {
    if (error)
      return res.status(400).json({ error: "Image could not be uploaded" });

    const flatFields = Object.fromEntries(
      Object.entries(fields).map(([key, val]) => [key, val?.[0]])
    );

    let product = req.product;
    product = _.extend(product, flatFields);

    const photo = files.photo?.[0];
    if (photo) {
      if (photo.size > 1000000)
        return res.status(400).json({ error: "Image size must be less than 1 MB" });
      product.photo.data = fs.readFileSync(photo.filepath);
      product.photo.contentType = photo.mimetype;
    }

    try {
      const result = await product.save();
      res.json(result);
    } catch (err) {
      return res.status(400).json({ error: errorHandler(err) });
    }
  });
};

exports.list = async (req, res) => {
  const order = req.query.order || "asc";
  const sortBy = req.query.sortBy || "_id";
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;
  try {
    const products = await Product.find()
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .limit(limit);
    res.json(products);
  } catch (error) {
    return res.status(400).json({ error: "Products not found" });
  }
};

exports.listRelated = async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;
  try {
    const products = await Product.find({
      _id: { $ne: req.product._id },
      category: req.product.category,
    })
      .limit(limit)
      .populate("category", "_id name");
    res.json(products);
  } catch (error) {
    return res.status(400).json({ error: "Product not found" });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (error) {
    return res.status(400).json({ error: "Categories not found" });
  }
};

exports.listBySearch = async (req, res) => {
  const order = req.body.order || "desc";
  const sortBy = req.body.sortBy || "_id";
  const limit = req.body.limit ? parseInt(req.body.limit) : 100;
  const skip = parseInt(req.body.skip);
  const findArgs = {};

  for (let key in req.body.filters) {
    if (req.body.filters[key].length > 0) {
      if (key === "price") {
        findArgs[key] = {
          $gte: req.body.filters[key][0],
          $lte: req.body.filters[key][1],
        };
      } else {
        findArgs[key] = req.body.filters[key];
      }
    }
  }

  try {
    const data = await Product.find(findArgs)
      .select("-photo")
      .populate("category")
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit);
    res.json({ size: data.length, data });
  } catch (error) {
    return res.status(400).json({ error: "Products not found" });
  }
};

exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.listSearch = async (req, res) => {
  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: "i" };
    if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }
    try {
      const products = await Product.find(query).select("-photo");
      res.json(products);
    } catch (error) {
      return res.status(400).json({ error: errorHandler(error) });
    }
  }
};

exports.decreaseQuantity = async (req, res, next) => {
  const bulkOps = req.body.order.products.map((item) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $inc: { quantity: -item.count, sold: +item.count } },
    },
  }));
  try {
    await Product.bulkWrite(bulkOps);
    next();
  } catch (error) {
    return res.status(400).json({ error: "Could not update product" });
  }
};
```

- [ ] **Step 2: Verify**

```bash
node -e "require('./controllers/product.js')"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add controllers/product.js
git commit -m "fix: formidable v3 API, deleteOne, fix typos, async/await in product controller"
```

---

### Task 8: Fix controllers/user.js (async/await)

**Files:**
- Modify: `controllers/user.js`

Note: `sort("-created")` is changed to `sort("-createdAt")` — the schema uses `timestamps: true` which creates `createdAt`, not `created`.

- [ ] **Step 1: Rewrite the file**

```js
const User = require("../models/users");
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.userById = async (req, res, next, id) => {
  try {
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ error: "User not found" });
    req.profile = user;
    next();
  } catch (error) {
    return res.status(400).json({ error: "User not found" });
  }
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.update = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $set: req.body },
      { new: true }
    );
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "You are not authorized to perform this action" });
  }
};

exports.purchaseHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.profile._id })
      .populate("user", "_id name")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
```

- [ ] **Step 2: Verify**

```bash
node -e "require('./controllers/user.js')"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add controllers/user.js
git commit -m "fix: async/await in user controller, fix sort field and hashed_password typo"
```

---

### Task 9: Fix controllers/category.js (async/await + deleteOne + typo)

**Files:**
- Modify: `controllers/category.js`

Fixes: `category.remove()` → `category.deleteOne()`, `res.satus(400)` → `res.status(400)`, double `res.status(400)` call in `create`, async/await throughout.

- [ ] **Step 1: Rewrite the file**

```js
const Category = require("../models/category");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.categoryById = async (req, res, next, id) => {
  try {
    const data = await Category.findById(id);
    if (!data) return res.status(400).json({ error: "Category does not exist" });
    req.category = data;
    next();
  } catch (error) {
    return res.status(400).json({ error: "Category does not exist" });
  }
};

exports.create = async (req, res) => {
  const category = new Category(req.body);
  try {
    const data = await category.save();
    res.json({ data });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.read = (req, res) => {
  return res.json(req.category);
};

exports.update = async (req, res) => {
  const category = req.category;
  category.name = req.body.name;
  try {
    const data = await category.save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.remove = async (req, res) => {
  const category = req.category;
  try {
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.list = async (req, res) => {
  try {
    const data = await Category.find();
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
```

Note: the original file had a typo `Cateogry` (misspelled) for the variable name and also `require("../models/category")` — check that `models/category.js` exports a model named `Category`. If the model file exports it as something else, match accordingly. The require path stays `../models/category`.

- [ ] **Step 2: Verify**

```bash
node -e "require('./controllers/category.js')"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add controllers/category.js
git commit -m "fix: async/await, deleteOne, and typo fixes in category controller"
```

---

### Task 10: Fix controllers/order.js (async/await + Order.updateOne)

**Files:**
- Modify: `controllers/order.js`

`Order.update()` was removed in Mongoose 8 — replace with `Order.updateOne()`. Also fix `sort("-created")` → `sort("-createdAt")`.

- [ ] **Step 1: Rewrite the file**

```js
const { Order } = require("../models/order");
const { errorHandler } = require("../helpers/dbErrorHandler");
const User = require("../models/users");

exports.orderById = async (req, res, next, id) => {
  try {
    const order = await Order.findById(id).populate("products.product", "name price");
    if (!order) return res.status(400).json({ error: "Order not found" });
    req.order = order;
    next();
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.create = async (req, res) => {
  req.body.order.user = req.profile;
  const order = new Order(req.body.order);
  try {
    const data = await order.save();
    res.json(data);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.addOrderToUserHistory = async (req, res, next) => {
  const history = req.body.order.products.map((item) => ({
    _id: item._id,
    name: item.name,
    description: item.description,
    category: item.category,
    quantity: item.count,
    transaction_id: req.body.order.transaction_id,
    amount: req.body.order.amount,
  }));
  try {
    await User.findOneAndUpdate(
      { _id: req.profile._id },
      { $push: { history } },
      { new: true }
    );
    next();
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Could not update user purchase history" });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "_id name address")
      .sort("-createdAt");
    res.json(orders);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};

exports.getStatusValue = (req, res) => {
  res.json(Order.schema.path("status").enumValues);
};

exports.updateStatusOrder = async (req, res) => {
  try {
    const order = await Order.updateOne(
      { _id: req.body.orderId },
      { $set: { status: req.body.status } }
    );
    return res.json(order);
  } catch (error) {
    return res.status(400).json({ error: errorHandler(error) });
  }
};
```

- [ ] **Step 2: Verify**

```bash
node -e "require('./controllers/order.js')"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add controllers/order.js
git commit -m "fix: async/await, Order.updateOne, and sort field in order controller"
```

---

### Task 11: Add render.yaml deployment config

**Files:**
- Create: `render.yaml`

- [ ] **Step 1: Create the file**

```yaml
services:
  - type: web
    name: mern-book-ecommerce
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: BRAINTREE_MERCHANT_ID
        sync: false
      - key: BRAINTREE_PUBLIC_KEY
        sync: false
      - key: BRAINTREE_PRIVATE_KEY
        sync: false
```

- [ ] **Step 2: Commit**

```bash
git add render.yaml
git commit -m "chore: add render.yaml for Render deployment"
```

---

### Task 12: Backend smoke test

- [ ] **Step 1: Start the backend server**

Ensure `config/dev.js` has your real MongoDB Atlas URI and credentials, then run:

```bash
npm run server
```

Expected output:
```
[nodemon] starting `node index.js`
Server is running on 5000
database connected
```

- [ ] **Step 2: Test auth endpoint**

In a new terminal:

```bash
curl -s -X POST http://localhost:5000/api/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test1234"}' | head -c 200
```

Expected: JSON response with `createdUser` object (no `hashed_password` or `salt` fields).

- [ ] **Step 3: Test signin**

```bash
curl -s -X POST http://localhost:5000/api/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}' | head -c 200
```

Expected: JSON with `token` and `user` fields.

- [ ] **Step 4: Test categories list**

```bash
curl -s http://localhost:5000/api/categories | head -c 200
```

Expected: `[]` (empty array) or a list of existing categories — no server error.

If all three pass, the backend is working. Stop the server (`Ctrl+C`) before continuing to Phase 2.

---

## Phase 2 — Frontend

---

### Task 13: Update client/package.json for Vite + React 18 + Router v6

**Files:**
- Modify: `client/package.json`

- [ ] **Step 1: Replace client/package.json content**

```json
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.2",
    "braintree-web-drop-in-react": "^1.2.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  },
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "echo \"No tests configured\" && exit 0"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  }
}
```

- [ ] **Step 2: Delete client node_modules and reinstall**

```bash
rm -rf client/node_modules
cd client && npm install && cd ..
```

Expected: clean install. `vite` and `@vitejs/plugin-react` should appear in `client/node_modules/.bin/`.

- [ ] **Step 3: Commit**

```bash
git add client/package.json client/package-lock.json
git commit -m "chore: replace CRA with Vite, upgrade React 18 and react-router-dom v6"
```

---

### Task 14: Create client/vite.config.js

**Files:**
- Create: `client/vite.config.js`

- [ ] **Step 1: Create the file**

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add client/vite.config.js
git commit -m "chore: add Vite config with /api proxy"
```

---

### Task 15: Move index.html from public/ to client root

Vite expects `index.html` at the project root (i.e., `client/index.html`), not inside `public/`.

**Files:**
- Create: `client/index.html`
- Delete: `client/public/index.html`

- [ ] **Step 1: Create client/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Book E-commerce" />
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.1/css/bootstrap.min.css"
      integrity="sha384-VCmXjywReHh4PwowAiWNagnWcLhlEJLA5buUprzK8rxFgeH0kww/aWY76TfkUoSX"
      crossorigin="anonymous"
    />
    <title>Book E-commerce</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Delete the old public/index.html**

```bash
rm client/public/index.html
```

- [ ] **Step 3: Commit**

```bash
git add client/index.html
git rm client/public/index.html
git commit -m "chore: move index.html to Vite project root and add module script tag"
```

---

### Task 16: Delete CRA artifacts

**Files:**
- Delete: `client/setupProxy.js`
- Delete: `client/src/serviceWorker.js`

- [ ] **Step 1: Delete the files**

```bash
rm client/setupProxy.js
rm client/src/serviceWorker.js
```

- [ ] **Step 2: Commit**

```bash
git rm client/setupProxy.js client/src/serviceWorker.js
git commit -m "chore: remove CRA-specific setupProxy and serviceWorker files"
```

---

### Task 17: Update client/src/index.js for React 18 createRoot

**Files:**
- Modify: `client/src/index.js`

- [ ] **Step 1: Rewrite the file**

```js
import React from "react";
import { createRoot } from "react-dom/client";
import AppRoutes from "./Routes";

const root = createRoot(document.getElementById("root"));
root.render(<AppRoutes />);
```

- [ ] **Step 2: Commit**

```bash
git add client/src/index.js
git commit -m "fix: update React entry point to createRoot API (React 18)"
```

---

### Task 18: Update client/src/Routes.js for react-router-dom v6

**Files:**
- Modify: `client/src/Routes.js`

Key changes from v5 → v6:
- `<Switch>` → `<Routes>`
- `<Route component={X}>` → `<Route element={<X />} />`
- `exact` prop removed (v6 is exact by default)
- Protected routes use layout route pattern: `<Route element={<PrivateRoute />}>` wrapping child routes
- `Test` import removed (unused component)

- [ ] **Step 1: Rewrite the file**

```js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./user/Signup";
import Signin from "./user/Signin";
import Home from "./core/Home";
import PrivateRoute from "./auth/PrivateRoute";
import AdminRoute from "./auth/AdminRoutes";
import AdminDashboard from "./user/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import AddCategory from "./admin/AddCategory";
import AddProduct from "./admin/AddProduct";
import Shop from "./core/Shop";
import Product from "./core/Product";
import Cart from "./core/Cart";
import Orders from "./admin/Order";
import Profile from "./user/Profile";
import ManageProducts from "./admin/ManageProducts";
import UpdateProduct from "./admin/UpdateProduct";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/create/category" element={<AddCategory />} />
          <Route path="/create/product" element={<AddProduct />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/products" element={<ManageProducts />} />
          <Route path="/admin/product/update/:productId" element={<UpdateProduct />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/profile/:userId" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/Routes.js
git commit -m "fix: migrate Routes to react-router-dom v6 syntax"
```

---

### Task 19: Rewrite PrivateRoute for react-router-dom v6

**Files:**
- Modify: `client/src/auth/PrivateRoute.js`

In v6, protected routes are layout routes. The component renders `<Outlet />` (the matched child route) if authenticated, or redirects to `/signin` if not.

- [ ] **Step 1: Rewrite the file**

```js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./index";

const PrivateRoute = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default PrivateRoute;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/auth/PrivateRoute.js
git commit -m "fix: rewrite PrivateRoute for react-router-dom v6 Outlet pattern"
```

---

### Task 20: Rewrite AdminRoute for react-router-dom v6

**Files:**
- Modify: `client/src/auth/AdminRoutes.js`

Same Outlet pattern as PrivateRoute, but additionally checks `user.role === 1`.

- [ ] **Step 1: Rewrite the file**

```js
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "./index";

const AdminRoute = () => {
  const auth = isAuthenticated();
  return auth && auth.user.role === 1 ? (
    <Outlet />
  ) : (
    <Navigate to="/signin" replace />
  );
};

export default AdminRoute;
```

- [ ] **Step 2: Commit**

```bash
git add client/src/auth/AdminRoutes.js
git commit -m "fix: rewrite AdminRoute for react-router-dom v6 Outlet pattern"
```

---

### Task 21: Frontend smoke test (local dev)

- [ ] **Step 1: Start the full dev stack**

In one terminal:
```bash
npm run dev
```

Expected: both backend (nodemon on port 5000) and frontend (Vite on port 5173) start without errors.

- [ ] **Step 2: Open the app**

Navigate to `http://localhost:5173` in a browser.

Expected: the Home page loads with the book e-commerce UI (navbar, product listings or empty state).

- [ ] **Step 3: Test sign up**

Go to `/signup`, create a new account. Expected: redirected to the home or sign-in page, no console errors.

- [ ] **Step 4: Test sign in**

Go to `/signin`, sign in with the account you just created. Expected: redirected to the user dashboard.

- [ ] **Step 5: Test admin routes**

Sign in with an admin account (role=1). Navigate to `/admin/dashboard`. Expected: admin dashboard loads, not redirected to `/signin`.

- [ ] **Step 6: Test shop and cart**

Go to `/shop`. Expected: product listings or empty state with filter sidebar. Add a product to cart if products exist.

If all steps pass, the app is working locally.

---

### Task 22: Deploy to Render

- [ ] **Step 1: Push to GitHub**

If the repo doesn't have a remote yet:
```bash
git remote add origin https://github.com/<your-username>/mern-book-ecommerce.git
git push -u origin master
```

If it already has a remote:
```bash
git push
```

- [ ] **Step 2: Create a Render Web Service**

1. Go to https://render.com and sign in.
2. Click **New → Web Service**.
3. Connect your GitHub repo.
4. Set:
   - **Name:** `mern-book-ecommerce`
   - **Branch:** `master`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node version:** 20 (set in environment settings)

- [ ] **Step 3: Add environment variables in Render dashboard**

Under **Environment → Environment Variables**, add:
- `NODE_ENV` = `production`
- `MONGO_URI` = your Atlas connection string
- `JWT_SECRET` = your JWT secret
- `BRAINTREE_MERCHANT_ID` = your merchant ID
- `BRAINTREE_PUBLIC_KEY` = your public key
- `BRAINTREE_PRIVATE_KEY` = your private key

- [ ] **Step 4: Deploy and verify**

Click **Deploy**. Wait for the build to complete (~3-5 minutes).

Expected: Render shows "Live" status. Navigate to the provided `.onrender.com` URL and verify the home page loads and you can sign in.

- [ ] **Step 5: Final commit (if any config tweaks were needed)**

```bash
git add -A
git commit -m "chore: final deployment config tweaks for Render"
git push
```
