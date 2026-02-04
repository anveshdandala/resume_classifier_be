import {loginService, registerService} from "../services/auth.service.js";

export const login = async (req, res) => {
    try {
        const data = req.body;
        const user = await loginService(data);
        if (user === null) {
            res.status(400).json({message: "Invalid credentials"});
            return;
        }
        res.user = user;
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error in controller"});
    }
}

export const register = async (req, res) => {
    try {
        console.log("Register endpoint hit");
        const data = req.body;
        const user = await registerService(data);
        if(user === null){
            res.status(400).json({message: "User already exists"});
            return;
        }
        res.user = user;
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error in controller"});
    }
}
