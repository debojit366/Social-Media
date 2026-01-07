import Post from "../models/postModel.js";
/*
@desc    Create a new post
@route   POST /api/v1/posts/
*/
const createPost = async (req, res, next) => {
  try {
    const newPost = new Post({
      ...req.body, 
      userId: req.user.id
    });

    const savedPost = await newPost.save();
    
    res.status(200).json({
        success: true,
        message: "Post created successfully",
        post: savedPost
    });
  } 
  catch (err) {
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

    if (post.userId.toString() === req.user.id) {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json({
          success: true,
          message: "post updated successfully",
          updatedPost
      });
    } else {
      res.status(403).json("unauthorized action");
    }
  } catch (err) {
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
    if (!post) return res.status(404).json("no post found");

    if (post.userId.toString() === req.user.id) {
      await post.deleteOne();
      res.status(200).json({
        success: true,
        message: "post deleted successfully"
      });
    } else {
      res.status(403).json("unauthorized action");
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
export {createPost, updatePost,deletePost,getPost,likePost};