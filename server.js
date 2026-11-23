require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// Serve only the page itself, never the whole folder (.env would be exposed)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("Database Connected"))
  .catch(err => console.log(err));

const Product = mongoose.model("Product", {
  id: String,
  name: String,
  category: String,
  brand: String,
  price: Number,
  stock: Number,
  description: String
});

// Only allow these fields from the client
const pick = b => ({
  id: b.id, name: b.name, category: b.category, brand: b.brand,
  price: b.price, stock: b.stock, description: b.description
});

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

app.post("/add", async (req, res) => {
  try {
    await new Product(pick(req.body)).save();
    res.send("Product Added");
  } catch (err) {
    res.status(500).send("Error Adding Product");
  }
});

app.get("/view", async (req, res) => {
  try {
    res.json(await Product.find());
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/search/:name", async (req, res) => {
  try {
    const products = await Product.find({
      name: { $regex: escapeRegex(req.params.name), $options: "i" }
    });
    res.json(products);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send("Invalid ID");
    const product = await Product.findByIdAndUpdate(
      req.params.id, pick(req.body), { new: true, runValidators: true }
    );
    res.send(product ? "Product Updated" : "Product Not Found");
  } catch (err) {
    res.status(500).send("Error Updating Product");
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).send("Invalid ID");
    const product = await Product.findByIdAndDelete(req.params.id);
    res.send(product ? "Product Deleted" : "Product Not Found");
  } catch (err) {
    res.status(500).send("Error Deleting Product");
  }
});

app.listen(3000, () => console.log("Server Started on http://localhost:3000"));
