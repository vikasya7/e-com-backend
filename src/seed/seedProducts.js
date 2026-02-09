import mongoose from "mongoose";
import dotenv from "dotenv";
import { Item } from "../models/item.models.js";
import { DB_NAME } from "../../constants.js";


dotenv.config();

await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

// realistic data
const brands = ["Sony", "Samsung", "Apple", "Boat", "Nike", "Adidas", "LG", "HP"];

const categories = [
  "mobile",
  "electronics",
  "fashion",
  "kitchen"
];

const keywords = {
  mobile: "smartphone,mobile,phone",
  electronics: "headphones,gadget,electronics,tech",
  fashion: "tshirt,clothes,fashion,apparel",
  kitchen: "kitchen,appliance,blender,cookware"
};

const descriptions = [
  "Premium build quality with long-lasting durability.",
  "Top-rated product with modern design and performance.",
  "Best value for money with excellent features.",
  "Customer favorite with high reliability.",
  "Designed for everyday comfort and efficiency."
];

const products = [];

for (let i = 1; i <= 40; i++) {
  const category = categories[i % categories.length];
  const brand = brands[i % brands.length];

  products.push({
    name: `${brand} ${category} Pro ${i}`,
    description: descriptions[i % descriptions.length],
    price: Math.floor(Math.random() * 4000) + 999,
    stock: Math.floor(Math.random() * 60) + 10,
    category,
    brand,
    image: `https://source.unsplash.com/400x400/?${keywords[category]},product`
  });
}

// clear old (optional)
await Item.deleteMany();

await Item.insertMany(products);

console.log("✅ 40 realistic products added");
process.exit();
