import {PrismaClient} from "@prisma/client";
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
        
        // Remove fullName from destructuring
        const { email, password } = data; 
        
        const user = await prisma.user.create({
            data:{
                // fullName, // <--- REMOVE THIS
                email,
                password,
                // role will automatically default to 'APPLICANT'
            }
        })
        console.log("User created", user);
        return user;
        
    } catch (error) {
        console.log("Error creating user:", error); // Log the specific error
        throw error;   
    }
}
export {loginService, registerService};
