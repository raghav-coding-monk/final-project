
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();
import app from "./app";
async function start() {
  try {
    // 1. Connect using Mongoose (This powers your Post and User models)
    await mongoose.connect(process.env.CONNECTIONSTRING);
    
    console.log("✅ Connected to MongoDB Atlas");

    // 2. ONLY start the server AFTER the database is ready
    
    // Use a fallback port if .env isn't loaded
    const port = process.env.PORT || 5005; 
    
    app.listen(port, () => {
      console.log(`📡 Server is running on port ${port}`);
    });

  } catch (e) {
    console.error("❌ DATABASE CONNECTION ERROR:", e.message);
    // If the DB fails, the app shouldn't start
    process.exit(1); 
  }
}

start();