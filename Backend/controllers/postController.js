import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { handleUpload, deleteFromCloudinary } from "../config/cloudinary.js";
import fs from "fs";
/*
@desc    Create a new post
@route   POST /api/v1/posts/
*/
const createPost = async (req, res, next) => {
  try {
    let imageData = {};

    if (req.file) {
      const result = await handleUpload(req.file.path);
      imageData.img = result.secure_url;
      imageData.cloudinaryId = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    const newPost = new Post({
      ...req.body,
      ...imageData,
      userId: req.user.id
    });

    const savedPost = await newPost.save();
    res.status(200).json({ success: true, post: savedPost });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};

/*
@desc    Update an existing post
@route   PUT /api/v1/posts/:id
*/ 

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("No post found");

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json("Unauthorized action");
    }

    let updateData = {
      description: req.body.description,
    };

    if (req.file) {
      if (post.cloudinaryId) {
        await deleteFromCloudinary(post.cloudinaryId);
      }
      const result = await handleUpload(req.file.path);
      updateData.img = result.secure_url;
      updateData.cloudinaryId = result.public_id;

      fs.unlinkSync(req.file.path);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, 
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Post updated!",
      updatedPost
    });

  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};


/*
@desc    Delete an existing post
@route   DELETE /api/v1/posts/:id
*/


const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("No post found");

    if (post.userId.toString() === req.user.id) {
      
      if (post.cloudinaryId) {
        await deleteFromCloudinary(post.cloudinaryId);
      }

      await post.deleteOne();
      res.status(200).json({
        success: true,
        message: "Post and image deleted successfully"
      });
    }

    
    else {
      res.status(403).json("Unauthorized action");
    }
  } catch (err) {
    next(err);
  }
};


/*
@desc    Get a post by ID
@route   GET /api/v1/posts/:id
*/
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("no post found");
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};
/*
@desc    Like a post
@route   GET /api/v1/posts/:id/like
*/
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json("No post found");
    }
    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json("Post has been liked! ❤️");
    } else {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json("Post has been unliked!");
    }
  } catch (err) {
    next(err);
  }
};
/* 
@desc    Get user profile posts
@route   GET /api/v1/posts/user-posts
*/


export const getUserProfilePosts = async (req, res) => {
  try {
    const targetUserId = req.params.id || req.user.id; 

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    const isOwner = targetUserId === req.user.id;
    const isFollower = targetUser.followers.includes(req.user.id);

    if (targetUser.isPrivate && !isOwner && !isFollower) {
       return res.status(200).json([]);
    }

    const posts = await Post.find({ userId: targetUserId })
      .populate("userId", "firstName lastName profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);

  } catch (error) {
    res.status(500).json({ message: "error while finding posts", error: error.message });
  }
};





export const getTimelinePosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    const allIds = [currentUser._id, ...currentUser.followings];

    const timelinePosts = await Post.find({ userId: { $in: allIds } })
  .populate("userId", "firstName lastName profilePicture")
  .sort({ createdAt: -1 });

    res.status(200).json(timelinePosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Timeline fetch failed" });
  }
};
export {createPost, updatePost,deletePost,getPost,likePost};