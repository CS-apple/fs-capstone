import {Router} from "express";
import requireBody from "#middleware/requireBody";
import { createUser, getUserWithUsernameAndPassword } from "#db/queries/grid-users";
import {createToken, verifyToken } from "#utils/jwt"
const router = Router();

router.get("/", (req,res)=>{
    res.send("reached user route")
})

router.post("/register", requireBody(["username", "password"]), async (req,res) => {
    // res.send("you are registered")
    //create user using db create user as done for seed
    // create token based on user id using util/jwt/createtoekn
    //return 201 with token 
    const{username, password} = req.body;
    const newUser = await createUser(username, password);
    const token = createToken({id:newUser.id});
    res.status(201).json({token});
});

router.post("/login",requireBody(["username", "password"]), async (req,res) => {
    // res.send("login route")
    //uery db for user and compare password input to hashed password
    // if both are true, create the token and return it
    //else return error
    const {username, password} = req.body;
    const user = await getUserWithUsernameAndPassword(username, password)
    if(!user)return res.status(401).send("invalid username or password")
    const token = createToken({id:user.id})
    res.status(200).json({token})
})

 export default router;

 // /users router

//     POST /users/register
//         sends 400 if request body is missing username or password
//         creates a new user with the provided credentials and sends a token
//         the password should be hashed in the database
//     POST /users/login
//         sends 400 if request body is missing username or password
//         sends a token if the provided credentials are valid