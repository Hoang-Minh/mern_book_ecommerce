const https = require("https");
const http = require("http");
const mongoose = require("mongoose");
const keys = require("../config/keys");
const User = require("../models/users");
const Category = require("../models/category");
const Product = require("../models/product");

// Fetch a URL and return the response body as a Buffer, following redirects
function fetchBuffer(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    if (redirects === 0) return reject(new Error("Too many redirects: " + url));
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(fetchBuffer(res.headers.location, redirects - 1));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

const categories = [
  { name: "Fiction" },
  { name: "Non-Fiction" },
  { name: "Science" },
  { name: "History" },
];

// Open Library cover images — free, no API key required
// URL pattern: https://covers.openlibrary.org/b/isbn/{ISBN}-M.jpg
const productDefs = (categoryMap) => [
  {
    name: "The Great Gatsby",
    description:
      "A classic novel set in the Jazz Age, exploring themes of wealth, class, and the American Dream through the eyes of narrator Nick Carraway.",
    price: 12.99,
    category: categoryMap["Fiction"],
    quantity: 50,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780743273565-M.jpg",
  },
  {
    name: "To Kill a Mockingbird",
    description:
      "Harper Lee's Pulitzer Prize-winning novel about racial injustice and moral growth in the American South, seen through the eyes of young Scout Finch.",
    price: 14.99,
    category: categoryMap["Fiction"],
    quantity: 35,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780446310789-M.jpg",
  },
  {
    name: "1984",
    description:
      "George Orwell's dystopian masterpiece about a totalitarian society where Big Brother watches your every move and independent thought is a crime.",
    price: 11.99,
    category: categoryMap["Fiction"],
    quantity: 60,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg",
  },
  {
    name: "Sapiens",
    description:
      "Yuval Noah Harari's sweeping history of humankind, from the Stone Age to the present, exploring how Homo sapiens came to dominate the planet.",
    price: 18.99,
    category: categoryMap["History"],
    quantity: 40,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg",
  },
  {
    name: "A Brief History of Time",
    description:
      "Stephen Hawking's landmark work on cosmology, explaining concepts like black holes, the Big Bang, and the nature of time for a general audience.",
    price: 16.99,
    category: categoryMap["Science"],
    quantity: 25,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780553380163-M.jpg",
  },
  {
    name: "The Selfish Gene",
    description:
      "Richard Dawkins introduces the gene-centred view of evolution and coins the concept of the meme in this influential and accessible science book.",
    price: 15.99,
    category: categoryMap["Science"],
    quantity: 20,
    shipping: false,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780192860927-M.jpg",
  },
  {
    name: "Atomic Habits",
    description:
      "James Clear's practical guide to building good habits and breaking bad ones through tiny changes that compound into remarkable results over time.",
    price: 19.99,
    category: categoryMap["Non-Fiction"],
    quantity: 80,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg",
  },
  {
    name: "Thinking, Fast and Slow",
    description:
      "Daniel Kahneman explores the two systems that drive the way we think — fast, intuitive thinking and slow, deliberate reasoning — and their impact on decisions.",
    price: 17.99,
    category: categoryMap["Non-Fiction"],
    quantity: 30,
    shipping: true,
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg",
  },
];

const users = [
  {
    name: "Admin User",
    email: "admin@bookstore.com",
    password: "admin123",
    role: 1,
  },
  {
    name: "Alice Johnson",
    email: "alice@example.com",
    password: "password123",
    role: 0,
  },
  {
    name: "Bob Smith",
    email: "bob@example.com",
    password: "password123",
    role: 0,
  },
];

async function seed() {
  try {
    await mongoose.connect(keys.MONGO_URI);
    console.log("Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);
    console.log("Cleared existing data");

    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    createdCategories.forEach((c) => {
      categoryMap[c.name] = c._id;
    });
    console.log(`Created ${createdCategories.length} categories`);

    const defs = productDefs(categoryMap);
    for (const def of defs) {
      const { coverUrl, ...fields } = def;
      const product = new Product(fields);

      process.stdout.write(`  Fetching cover for "${def.name}"... `);
      try {
        const imageBuffer = await fetchBuffer(coverUrl);
        if (imageBuffer.length < 1000) throw new Error("placeholder returned");
        product.photo.data = imageBuffer;
        product.photo.contentType = "image/jpeg";
        console.log(`${imageBuffer.length} bytes`);
      } catch (err) {
        console.log(`failed (${err.message}), skipping photo`);
      }

      await product.save();
    }
    console.log(`Created ${defs.length} products`);

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log(`Created ${users.length} users`);

    console.log("\n--- Seed complete ---");
    console.log("Admin login:  admin@bookstore.com / admin123");
    console.log("User login:   alice@example.com / password123");
    console.log("User login:   bob@example.com / password123");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
