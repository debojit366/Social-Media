export const sendFollowRequest = async (req, res, next) => {
  // Prevent user from sending a request to themselves
  if (req.user.id === req.params.id) {
    return res.status(403).json("You cannot send a request to yourself.");
  }

  try {
    const userToRequest = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);
    // Check if they are already followers
    if (userToRequest.followers.includes(req.user.id)) {
      return res.status(400).json("You are already following this user.");
    }

    // Check if a request is already pending
    if (userToRequest.friendRequests.includes(req.user.id)) {
      return res.status(400).json("Follow request already sent.");
    }

    // Push current user's ID into the target user's pending requests
    await userToRequest.updateOne({ $push: { friendRequests: req.user.id } });
    res.status(200).json("Follow request has been sent successfully! 📩");
  } catch (err) {
    next(err);
  }
};



export const acceptFollowRequest = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id); // The one accepting
    const requesterUser = await User.findById(req.params.id); // The one who sent the request

    // Check if the request actually exists in the array
    if (currentUser.friendRequests.includes(req.params.id)) {
      
      // 1. Add requester to current user's followers
      await currentUser.updateOne({ $push: { followers: req.params.id } });
      
      // 2. Add current user to requester's followings
      await requesterUser.updateOne({ $push: { followings: req.user.id } });
      
      // 3. Remove the ID from pending friendRequests
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
    
    // Just remove the ID from the friendRequests array
    await currentUser.updateOne({ $pull: { friendRequests: req.params.id } });
    
    res.status(200).json("Follow request declined.");
  } catch (err) {
    next(err);
  }
};
export const getPendingRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Use Promise.all to fetch details of all users who sent requests
    const list = await Promise.all(
      user.friendRequests.map((id) => {
        // We only fetch needed fields like name and profile pic for better performance
        return User.findById(id).select("firstName lastName profilePicture");
      })
    );

    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};