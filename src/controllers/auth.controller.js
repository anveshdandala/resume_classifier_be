import {loginService, registerService} from "../services/auth.service.js";
export const login = (req, res) => {
    try {
        const { email, password} = req.body;
        const user = loginService(email, password);
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
        console.log("Headers:", req.headers['content-type']);
        const data = req.body;
        console.log("Body:", data);
        const user = await registerService(data);
        res.user = user;
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error in controller"});
    }
}