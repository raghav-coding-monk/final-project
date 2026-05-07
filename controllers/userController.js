// backend/controllers/userController.js
const User = require('../models/User');
const Post = require('../models/Post');

// 1. LOGIN
// exports.login = function(req, res) {
//   let user = new User(req.body);
//   user.login()
//     .then(function(result) {
//       // Success: 'result' should be an object: {token: "...", username: "...", avatar: "..."}
//       res.json(result); 
//     })
//     .catch(function(e) {
//       // Failure: Send a 401 Unauthorized status
//       // This ensures your React Axios call goes to the .catch() block
//       res.status(401).json("Invalid username / password.");
//     });
// };

exports.login = function(req, res) {
  // --- DEBUG LOGS ---
  console.log("--- Login Attempt ---");
  console.log("Request Body:", req.body); 
  
  // Basic safety check:
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error("Error: Login request reached backend with an empty body.");
    return res.status(400).json({ error: "No data received" });
  }

  let user = new User(req.body);
  user.login()
    .then(function(result) {
      res.json(result); 
    })
    .catch(function(e) {
      console.error("Login failed for user:", req.body.username);
      res.json(false);
    });
};

// 2. REGISTER
// 2. REGISTER
exports.register = function(req, res) {
  let user = new User(req.body);

  user.register().then(() => {
    res.json({
      status: "success",
      // If 'user' is your Mongoose instance, use user._id
      // If your model stores data in a sub-object, use user.data._id
      userId: user._id || (user.data ? user.data._id : null), 
      username: user.username || (user.data ? user.data.username : "")
    });
  }).catch(errors => {
    res.json({ status: "failed", regErrors: errors });
  });
};

// 2. PROFILE
exports.profile = async function(req, res) {
  try {
    const profileUsername = req.params.username.toLowerCase();
    const profileUser = await User.findOne({ username: profileUsername });

    if (!profileUser) {
      return res.status(404).json("User not found.");
    }

    const posts = await Post.find({ author: profileUsername }).sort({ date: -1 });
    const postCount = await Post.countDocuments({ author: profileUsername });

    // --- ADJUSTED SECTION ---
    const avatarPath = profileUser.profileImage.startsWith('http') 
      ? profileUser.profileImage 
      : `http://localhost:5005${profileUser.profileImage}`;
    // ------------------------

    res.json({
      profileUsername,
      profileAvatar: avatarPath, // Now using your dynamic logic
      isFollowing: false,
      counts: {
        postCount,
        followerCount: 0,
        followingCount: 0
      },
      posts: posts.map(post => ({
        _id: post._id,
        title: post.title,
        body: post.body,
        date: post.date
      }))
    });
  } catch (e) {
    res.status(500).json("Something went wrong.");
  }
};
// 3. REGISTER
// exports.register = function(req, res) {
//   let user = new User(req.body);
  
//   user.register()
//     .then(() => {
//       // Success: Return the user data so React can log them in immediately
//       res.json({
//         token: user.token,
//         username: user.data.username,
//         avatar: user.avatar
//       });
//     })
//     .catch((regErrors) => {
//       // Failure: Send 400 Bad Request if validation fails
//       // regErrors is likely an array of strings
//       res.status(400).json(regErrors);
//     });
// };
// Ensure it says "exports." at the beginning

exports.mustBeLoggedIn = function(req, res, next) {
  if (req.session.user) { // or however you check login status
    next();
  } else {
    res.status(401).send("You must be logged in.");
  }
};
// 3. LOGOUT (Optional but recommended for consistency)
// Most JWT logout logic happens on the client side by destroying the token,
// but you can have a route here if you're using sessions or blacklisting.

// 4. HOME / API Check
exports.home = function(req, res) {
    res.send("Welcome to the API");
};