import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: String,
    img: String,
    likes: { type: Array, default: [] }
}, { timestamps: true });
 
postSchema.index({ userId: 1 }); 

export default mongoose.model("Post", postSchema);