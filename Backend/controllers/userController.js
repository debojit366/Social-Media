import User from "../models/userModel.js";
export const sendFollowRequest = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (userToFollow.isPrivate) {
      if (!userToFollow.friendRequests.includes(req.user.id)) {
        await userToFollow.updateOne({ $push: { friendRequests: req.user.id } });
        res.status(200).json("Follow request sent!");
      } else {
        res.status(400).json("Request already pending!");
      }
    } else {
      if (!userToFollow.followers.includes(req.user.id)) {
        await userToFollow.updateOne({ $push: { followers: req.user.id } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("Started following!");
      } else {
        res.status(400).json("Already following!");
      }
    }
  } catch (err) {
    next(err);
  }
};



export const acceptFollowRequest = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requesterUser = await User.findById(req.params.id);

    if (currentUser.friendRequests.includes(req.params.id)) {
      
      await currentUser.updateOne({ $push: { followers: req.params.id } });
      
      await requesterUser.updateOne({ $push: { followings: req.user.id } });
      
      await currentUser.updateOne({ $pull: { friendRequests: req.params.id } });

      res.status(200).json("Request accepted! You are now friends. 🤝");
    } else {
      res.status(404).json("No such follow request found.");
    }
  } catch (err) {
    next(err);

  }
};

/*
@desc    Reject a follow request
@route   POST /api/v1/users/reject-request/:id
*/
export const rejectFollowRequest = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    
    await currentUser.updateOne({ $pull: { friendRequests: req.params.id } });
    
    res.status(200).json("Follow request declined.");
  } catch (err) {
    next(err);
  }
};
export const getPendingRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    const pendingUsers = await User.find({
      _id: { $in: user.friendRequests }
    }).select("firstName lastName profilePicture");

    const formattedList = pendingUsers.map((u) => {
      return {
        id: u._id,
        fullName: `${u.firstName} ${u.lastName}`,
        profilePic: u.profilePicture || "default.png"
      };
    });

    res.status(200).json(formattedList);
  } catch (err) {
    next(err);
  }
};
/*
@desc    Update user profile
@route    /api/v1/users/update/:id
*/


export const updateUser = async (req, res, next) => {
  
  if (req.params.id === req.user.id.toString()) {
    try {
      if(req.body.password){
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      ).select("-password");

      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return res.status(403).json("You can only update your own account!");
  }
};


/*
@desc    get user profile
@route   PUT /api/v1/users/find/:id
*/


export const getUserProfile = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.id).select("-password");
    if (!targetUser) return res.status(404).json("User not found!");

    const currentUserId = req.user.id;
    const isFollower = targetUser.followers.includes(currentUserId);
    const isOwnProfile = targetUser._id.toString() === currentUserId;

    if (targetUser.isPrivate && !isFollower && !isOwnProfile) {
      return res.status(200).json({
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        profilePicture: targetUser.profilePicture,
        isPrivate: true,
        message: "This account is private. Follow to see their photos and videos."
      });
    }
    res.status(200).json(targetUser);
  } catch (err) {
    next(err);
  }
};