const Post = require("../models/Post") // Import the model you just shared
const User = require("../models/User")

exports.create = async function(req, res) {
  try {
    const user = await User.findOne({ username: req.body.username })
    if (!user) {
      return res.status(404).send("User not found.")
    }
    let post = new Post({
      title: req.body.title,
      body: req.body.body,
      author: user._id
    })
    const newPost = await post.save()
    res.json(newPost._id)
  } catch (errors) {
    res.status(500).send("Database error.")
  }
}

// postController.js
exports.viewSingle = async function(req, res) {
  try {
    let post = await Post.findById(req.params.id).populate("author", "username avatar")
    if (post) {
       res.json(post)
    } else {
       res.status(404).send("Post not found")
    }
  } catch (e) {
    res.status(404).send("Invalid ID")
  }
}

exports.profilePosts = async function(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username })
    if (!user) {
      return res.status(404).json("User not found.")
    }
    let posts = await Post.find({ author: user._id }).populate("author", "username avatar").sort({ createdDate: -1 })
    res.json(posts)
  } catch (e) {
    res.status(500).json("Something went wrong.")
  }
}
