import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { login } from "../controllers/auth.controller.js";

const router = Router();
router.post("/register", register);
router.post("/login", login);

router.route('/me').get((req, res) => {
    res.json("me");
})

export default router;
