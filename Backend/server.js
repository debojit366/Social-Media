import 'dotenv/config'
import express from "express"
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
const app = express()
app.use(express.json())
connectDB()



app.use("/api/v1/auth",authRoutes)



const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
