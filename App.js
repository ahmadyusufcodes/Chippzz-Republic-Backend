const express = require("express")
const app = express()
const dotenv = require("dotenv")
const cors = require("cors")
const mongoose = require("mongoose")

// Routes Import
const UserRoutes = require("./routes/UserRoutes")
const AdminRoutes = require("./routes/AdminRoutes")
// Middlewares
dotenv.config()
app.use(cors())
app.use(express.json())

// Constants 
const PORT = process.env.PORT || 5000

// Routes
// app.use("/api/auth", UserRoutes)
app.use("/api/admin", AdminRoutes)
app.use("/api/staff", UserRoutes)

console.log("starting.....")
try {
    mongoose.connect(process.env.DB_URI ,{
        useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true 
      }, () => {
        app.get('/healthz', (req, res) => {
            res.send('Server running okey!')
        })
        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}🔥`)
        })
      })
} catch (error) {
    throw error
}

