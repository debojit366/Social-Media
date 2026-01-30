import Notification from "../models/notificationModel.js";

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user.id })
      .populate("senderId", "firstName lastName username profilePicture")
      .sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ 
      receiverId: req.user.id, 
      read: false 
    });
    res.status(200).json({ count });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { receiverId: req.user.id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json("Notifications marked as read");
  } catch (err) {
    next(err);
  }
};