import {PrismaClient} from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
const loginService = async (data)=>{
    try {
        console.log("login services reached");
        const {email, password} = data;
        const user = await prisma.user.findUnique({
            where:{
                email,
            }
        });
        if(user === null){
            return null;
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return null;
        }
        return user;
    } catch (error) {
        console.log(error);
        return null;
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
