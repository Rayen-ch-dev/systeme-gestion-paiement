import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import comptableRoutes from "./routes/comptableRoutes.js";
import ResetPasswordRoutes from "./routes/ResetPasswordRoutes.js";
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

//enable cors for all routes
app.use(cors());

//db connection
connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB connected to backend successfully!");
});

//Add user API
app.use("/api/users", userRoutes);

//add comptable api
app.use("/api/comptable", comptableRoutes);


//Reset password router

app.use("/api/password/resetPassword",ResetPasswordRoutes)



const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});