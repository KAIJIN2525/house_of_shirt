import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";

import connectDB from "./config/db.js";
import "./config/passport.js";

// import routes
import userRoute from "./routes/user.route.js"
import productRoute from "./routes/product.route.js"
import categoryRoute from "./routes/category.route.js"
import tagRoute from "./routes/tag.route.js"
import cartRoute from "./routes/cart.route.js"
import checkoutRoute from "./routes/checkout.route.js"
import orderRoute from "./routes/order.route.js"
import uploadRoute from "./routes/upload.route.js"
import subscribeRoute from "./routes/subscribe.route.js"
import adminRoute from "./routes/admin.route.js"
import adminProductRoute from "./routes/product.admin.route.js"
import adminOrderRoute from "./routes/admin.order.route.js"

const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

// Initialize passport and session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
); 

app.use(passport.initialize());
app.use(passport.session());

const PORT = process.env.PORT || 3000;

// connect connectDB(): promise<void>

connectDB();

app.get("/", (req,res) => {
    res.send("WELCOME TO HOUSE_OF_SHIRT API:")
});


// API Routes
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/tag", tagRoute);
app.use("/api/cart", cartRoute);
app.use("/api/checkout", checkoutRoute);
app.use("/api/orders", orderRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/subscribe", subscribeRoute);


// Admin route
app.use("/api/admin/users", adminRoute);
app.use("/api/admin/products", adminProductRoute);
app.use("/api/admin/orders", adminOrderRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});