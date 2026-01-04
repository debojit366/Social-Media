import Post from "../models/postModel.js";

export const createPost = async (req, res) => {
  const newPost = new Post(req.body); // Body mein desc, img aur userId aayega
  try {
    const savedPost = await newPost.save();
    res.status(200).json({
        success: true,
        message: "Post created successfully",
        post: savedPost
    });
  }
  catch (err) {
    res.status(500).json(err);
  }
};