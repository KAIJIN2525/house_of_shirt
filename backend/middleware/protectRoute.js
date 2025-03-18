import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

// Protect Route MiddleWare
export const protectRoute = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select("-password");

            next();
        } catch (error) {
            console.error("Token verification failed", error);
            res.status(400).json({message: "Not authorized, token failed"});
        }
    } else {
        res.status(400).json({message: "Not authorized, no token"});
    }
}

export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        res.status(403).json({ message: "Not Authorized as an admin"})
    }
}

