import {loginService, registerService} from "../services/auth.service.js";
export const login = (req, res) => {
    try {
        const email = "[EMAIL_ADDRESS]";
        const password = "123456";
        const user = loginService(email, password);
        res.user = user;
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error in controller"});
    }
}

export const register = (req, res) => {
    try {
        const email = "[EMAIL_ADDRESS]";
        const password = "123456";
        const user = register(email, password);
        res.user = user;
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Internal server error in controller"});
    }
}