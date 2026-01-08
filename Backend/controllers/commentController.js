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

    let savedComment = await newComment.save();


    savedComment = await savedComment.populate("user", "username profilePicture");

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


export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json("Comment does not exist");

    const post = await Post.findById(comment.post);
    if (!post) return res.status(404).json("Associated post not found");

    const isCommentOwner = comment.user.toString() === userId;
    const isPostOwner = post.userId.toString() === userId;

    if (isCommentOwner || isPostOwner) {
      await Comment.findByIdAndDelete(commentId);

      await Post.findByIdAndUpdate(comment.post, {
        $pull: { comments: commentId }
      });

      return res.status(200).json({
        success: true,
        message: isPostOwner && !isCommentOwner 
          ? "Post owner deleted this comment" 
          : "Comment deleted successfully"
      });
    } else {
      return res.status(403).json("You are not authorized to delete this comment");
    }

  } catch (err) {
    res.status(500).json(err.message);
  }
};