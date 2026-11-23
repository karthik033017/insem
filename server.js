
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.static("public"));

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

app.post("/add", async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.send("Product Added");
    } catch (err) {
        res.status(500).send("Error Adding Product");
    }
});

app.get("/view", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.get("/search/:name", async (req, res) => {
    const products = await Product.find({
        name: { $regex: req.params.name, $options: "i" }
    });
    res.json(products);
});

app.put("/update/:id", async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.send(product ? "Product Updated" : "Product Not Found");
});

app.delete("/delete/:id", async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.send(product ? "Product Deleted" : "Product Not Found");
});

app.listen(3000, () => {
    console.log("Server Started");
});
