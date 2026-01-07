import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    description: { 
        type: String, 
        max: 500,
        trim: true  
    },
    img: { 
        type: String, 
        required: true 
    },
    cloudinaryId: { 
        type: String,
        required: true
    },
    likes: { 
        type: Array, 
        default: [] 
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}, { timestamps: true });

postSchema.index({ userId: 1 }); 

export default mongoose.model("Post", postSchema);