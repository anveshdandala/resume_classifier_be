import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
const loginService = async ()=>{
    try {
        console.log("login services reached")   
    } catch (error) {
        console.log(error)
    }
}
const registerService = async (data)=>{
    try {
        console.log("register services reached with", data);
        
        const {fullname, email, password } = data; 
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({
            data:{
                fullname,
                email,
                password: hashedPass,
            }
        })
        console.log("User created", user);
        return user;
        
    } catch (error) {
        console.log("Error creating user:", error); // Log the specific error
        return null;
    }
}
export {loginService, registerService};
