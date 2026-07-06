import express from 'express';
import connectDB from './db.js'
import dotenv from 'dotenv';
dotenv.config();
import aiRouter from './routes/ai.route.js';
import userRouter from './routes/user.routes.js'
import apiRouter from './routes/api.route.js'
import cors from 'cors'
const app=express();
import dns from "dns";


dns.setServers(["8.8.8.8", "8.8.4.4"]);
app.use(cors({origin:process.env.FRONTEND_URL, methods: ['GET', 'POST', 'PUT', 'DELETE'], credentials: true}));
app.use(express.json());

connectDB();

app.get('/', (req,res)=>{
    res.send('API is running')
})
app.use('/api/user',userRouter);
app.use('/api/ai',aiRouter);
app.use('/api/api',apiRouter)

const PORT= 5000

app.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
})