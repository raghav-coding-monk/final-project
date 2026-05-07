const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: '/default-avatar.png' }
});

// 1. REGISTER: Hash password before saving
UserSchema.methods.register = function() {
  return new Promise(async (resolve, reject) => {
    // Basic validation
    if (this.username == "" || this.password == "") {
      return reject(["Username and password are required."]);
    }

    try {
      // Hash the password so it's not plain text in DB
      let salt = bcrypt.genSaltSync(10);
      this.password = bcrypt.hashSync(this.password, salt);
      
      await this.save();
      resolve(); 
    } catch (e) {
      if (e.code === 11000) {
        reject(["Username or Email already taken."]);
      } else {
        reject(["Database error. Please try again."]);
      }
    }
  });
};

// 2. LOGIN: Compare hashed password
UserSchema.methods.login = function() {
  return new Promise(async (resolve, reject) => {
    try {
      const attemptedUser = await mongoose.model('User').findOne({ username: this.username });
      
      // Use bcrypt.compareSync to check the hashed password
      if (attemptedUser && bcrypt.compareSync(this.password, attemptedUser.password)) {
        resolve({ 
          token: "dummy-token-123", 
          username: attemptedUser.username,
          userId: attemptedUser._id, // Return the ID for React to store
          avatar: attemptedUser.profileImage
        });
      } else {
        reject("Invalid username / password.");
      }
    } catch (e) {
      reject("Server error.");
    }
  });
};

const User = mongoose.model('User', UserSchema);
module.exports = User;