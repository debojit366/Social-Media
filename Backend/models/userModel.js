import mongoose from 'mongoose'
const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 30,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Others","male","female","others"],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      minlength: 10,
      maxlength: 10,
      match: [/^[0-9]+$/, 'Please fill a valid phone number' ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    coverPicture: {
      type: String,
      default: "",
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    friendRequests: {
    type: Array,
    default: [],
    },
    isPrivate: {
    type: Boolean,
    default: false,
    },
    cloudinaryId: {
    type: String,
    default: ""
  }
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;