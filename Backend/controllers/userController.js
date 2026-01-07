import User from "../models/userModel.js";
export const sendFollowRequest = async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return res.status(403).json("You cannot send a request to yourself.");
  }

  try {
    const userToRequest = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    if (userToRequest.followers.includes(req.user.id)) {
      return res.status(400).json("You are already following this user.");
    }

    if (userToRequest.friendRequests.includes(req.user.id)) {
      return res.status(400).json("Follow request already sent.");
    }

    await userToRequest.updateOne({ $push: { friendRequests: req.user.id } });
    res.status(200).json("Follow request has been sent successfully! 📩");
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
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json("User not found!");

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};