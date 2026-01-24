import 'dotenv/config'
import express from "express"
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/post.js'
import userRoutes from './routes/user.js'
import commentRoute from './routes/comment.js'
import errorMiddleware from './middleware/error.js'
import cors from 'cors'
const app = express()
app.use(express.json())
connectDB()

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/posts",postRoutes)
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/comments",commentRoute)

const PORT = process.env.PORT || 5000
app.use(errorMiddleware)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
