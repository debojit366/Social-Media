import 'dotenv/config'
import express from "express"
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/post.js'
import userRoutes from './routes/user.js'
import errorMiddleware from './middleware/error.js'
import testRoutes from './routes/test.js'
const app = express()
app.use(express.json())
connectDB()


app.use("/api/v1/test", testRoutes)
app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/posts",postRoutes)
app.use("/api/v1/users",userRoutes)


const PORT = process.env.PORT || 5000
app.use(errorMiddleware)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
