const mongoose = require("mongoose");
// ❌ REMOVE THIS LINE: const Post = require("./models/Post");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: String, required: true, lowercase: true, trim: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);