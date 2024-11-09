import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import passport from "passport"

const app = express()

dotenv.config({
    path:"../.env"
})

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//initialising passport
app.use(passport.initialize());


//importing routes
import userRouter from './routes/user.routes.js'
import songRouter from './routes/song.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import { googleAuth, googleAuthCallback } from './controllers/user.controller.js'


app.get('/',(req,res)=>{
    res.send("Server is live")
})

//router declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/search",songRouter)
app.use("/api/v1/playlist",playlistRouter)
//google route declartion
app.get('/auth/google', googleAuth);
app.get('/auth/google/callback', googleAuthCallback);



export{ app }
