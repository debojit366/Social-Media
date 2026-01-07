import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";

export const addComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("No Post Found");

    const newComment = new Comment({
      content,
      post: postId,
      user: req.user.id
    });

    const savedComment = await newComment.save();

    await Post.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id } 
    });

    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

export const getPostComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json(err.message);
  }
};