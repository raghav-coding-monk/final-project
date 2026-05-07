const fs = require("fs")
const path = require("path")
const express = require("express")
const router = express.Router()
const multer = require("multer")
const User = require("./models/User")

const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
console.log("Is postController defined?", postController)
console.log("Is the create function defined?", postController.create)

//
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 2. Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.get('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Now 'User' is defined and can talk to MongoDB
        const userData = await User.findOne({ username: userId });

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            username: userData.username,
            profileImage: userData.profileImage 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// --- PROFILE IMAGE UPLOAD ---
// If React calls: http://localhost:5005/api/upload-profile-pic
router.get('/user-profile/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // 💡 IMPORTANT: Replace this with your actual database call
    // Example (if using MongoDB/Mongoose):
    // const user = await User.findById(userId);
    // const savedImageUrl = user.profileImage;
    
    const savedImageUrl = ""; // This should come from your DB

    if (savedImageUrl) {
      res.json({ profileImage: savedImageUrl });
    } else {
      // Return default if nothing is in DB
      res.json({ profileImage: '/default-avatar.png' });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log("Received Request for User ID:", userId);
    console.log("User ID from body:", req.body.userId); 
    console.log("Body:", req.body); // Multer puts text fields here
   console.log("File:", req.file); // Multer puts file here
   
  
    if (!req.file) return res.status(400).send('No file uploaded.');

    if (!req.body.userId || req.body.userId === "undefined") {
      return res.status(400).json({ msg: "User ID missing" });
   }
    const imagePath = `/uploads/${req.file.filename}`;

    // Try to update and catch the specific error if it fails
// ✅ Use findOneAndUpdate when searching by { username: ... }
  // ✅ Correct way to search by username string instead of ObjectId
// Use a basic object search and turn off "cast" validation for this specific call
const updatedUser = await User.findOneAndUpdate(
  { username: userId }, 
  { profileImage: imagePath }, 
  { returnDocument: 'after' } // replaces { new: true }
);
    if (!updatedUser) {
      // This will trigger if no user exists with the username "evam"
      console.log(`Error: Username "${userId}" not found in database.`);
      return res.status(404).json({ message: "User not found. Check if the username is correct." });
    }

    res.json({ success: true, imageUrl: `http://localhost:5005${imagePath}` });

  } catch (error) {
    console.error("Full Upload Error:", error); // Check your VS Code terminal for this!
    res.status(500).json({ message: "Upload failed during database update", error: error.message });
  }
});

// POST: Handle profile image upload
// Example: routes/userRoutes.js
//
router.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
// USER ROUTES
router.get("/", userController.home)
router.post("/register", userController.register)
// ✅ Correct
router.post("/login", userController.login);
// Is there a middle function here?
//router.post("/create-post", userController.mustBeLoggedIn, postController.create)
router.post("/create-post", postController.create)
router.post("/profile/:username", userController.profile)

router.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN ROUTE (This is what was giving you the 404)
// backend/controllers/userController.js
exports.mustBeLoggedIn = function(req, res, next) {
  if (req.body.token) {
    // Basic logic to check if a token exists
    next() 
  } else {
    res.status(401).send("You must be logged in to create a post.")
  }
}
console.log("User Controller check:", userController.mustBeLoggedIn)


// POST ROUTES
router.get("/post/:id", postController.viewSingle)
router.get("/profile/:username/posts", postController.profilePosts)

// This links the URL "/register" to the function we just wrote


module.exports = router