import app from "./app.js";
import express from "express";
import cors from "cors";
import path from "path";
import router from "./router.js";
import crypto from "crypto";
// 1. GLOBAL SETTINGS
if (!global.crypto) {
  global.crypto = crypto;
}

//const __dirname = path.resolve();
// 2. MIDDLEWARE (Must come BEFORE routes)
app.use(cors({
  origin: 'http://localhost:1002',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'] // Added Authorization just in case
}));

// Set limits once here
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 3. STATIC FILES
// This allows the browser to actually see the images in the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static(path.join(__dirname, 'client/build'))); 

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
// 4. API ROUTES
// Using both prefixes is fine, but /api is cleaner for your React fetch calls
app.use("/", router); 
app.use('/api', router);

// 5. FRONTEND SERVING (The Catch-All MUST BE LAST)
// Only enable this if you have a built production folder
/*
app.use(express.static(path.join(__dirname, 'client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
*/

module.exports = app;