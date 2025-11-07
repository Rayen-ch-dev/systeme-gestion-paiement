// server.js
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import comptableRoutes from "./routes/comptableRoutes.js";
import ResetPasswordRoutes from "./routes/ResetPasswordRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// db connection
connectDB();

app.get("/", (req, res) => {
  res.send("MongoDB connected to backend successfully!");
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/comptable", comptableRoutes);
app.use("/api/password/resetPassword", ResetPasswordRoutes);

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
