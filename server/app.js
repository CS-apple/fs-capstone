import getUserFromToken from "#middleware/getUserFromToken";
import express from "express";
import cors from 'cors'
import {Router} from "express";
import usersRouter from "#api/grid-users"

const app = express();

export default app;

app.use(cors())
app.use(express.json())
app.use(getUserFromToken)

app.use("/users", usersRouter)

app.get("/",(req,res)=>{
    res.send("pinging app")
})

app.use((err, req, res, next)=>{
    console.error(err);
    res.status(500).send("something went wrong")
})