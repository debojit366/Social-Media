import Post from "../models/postModel.js";
/*
@desc    Create a new post
@route   POST /api/v1/posts/
*/
const createPost = async (req, res, next) => { // 'next' add kiya error ke liye
  try {
    // 1. Naya object banao, saara req.body lo (... spread operator)
    // 2. userId ko zabardasti req.user.id se replace kar do
    const newPost = new Post({
      ...req.body, 
      userId: req.user.id // Ye ID token se aayi hai, isse koi badal nahi sakta!
    });

    const savedPost = await newPost.save();
    
    res.status(200).json({
        success: true,
        message: "Post created successfully",
        post: savedPost
    });
  } 
  catch (err) {
    next(err); // error middleware
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
        { $set: req.body }, //poori post ko delete karke naya mat banao, balki sirf wahi cheezein badlo jo req.body mein aayi hain.
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

    // Security Check: req.user.id humein verifyToken se mil raha hai
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
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("no post found");
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
};
export {createPost, updatePost,deletePost,getPost};