import 'dotenv/config'
import express from "express"
import connectDB from './config/db.js'
const app = express()
app.use(express.json())
app.get("/", (req, res) => {
  res.send("API is running 🚀")
})
connectDB()
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
