import mongoose from "mongoose";
// 1. Define the Schema
const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: String,
    img: String,
    likes: { type: Array, default: [] }
}, { timestamps: true });

// 2. Syntax for Indexing 
postSchema.index({ userId: 1 }); 

export default mongoose.model("Post", postSchema);