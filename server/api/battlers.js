
import {Router} from "express";
import { getBattlers, getBattlerById } from "#db/queries/battlers";

const router = Router();

router.get("/", async (req,res)=>{
    const battlers = await getBattlers();
    return res.status(200).json(battlers)
})

router.get("/:battlerId", async (req,res)=>{
    const {battlerId} = req.params
    console.log(battlerId)
    const battler = await getBattlerById(battlerId)
    return res.status(200).json(battler)
})

//get battler id by name? 



export default router