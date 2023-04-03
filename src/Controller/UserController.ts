import { Request, Response } from "express"
import { UserBusiness } from "../business/UserBusiness"
import { LoginInput, SignupInput } from "../dtos/userDTO"

export class UserController {
    constructor(
        private userBusiness: UserBusiness
    ) {}

    public signup = async (req: Request, res: Response) => {
        try {
            const input: SignupInput = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            
            const output = await this.userBusiness.Gsignup(input)
    
            res.status(201).send(output)
        } catch (error) {
            console.log(error)
    
            if (req.statusCode === 200) {
                res.status(500)
            }
    
            if (error instanceof Error) {
                res.send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }

    public login = async (req: Request, res: Response) => {
        try {
            const input: LoginInput = {
                email: req.body.email,
                password: req.body.password
            }

            const output = await this.userBusiness.loginInput(input)
    
            res.status(200).send(output)
        } catch (error) {
            console.log(error)
    
            if (req.statusCode === 200) {
                res.status(500)
            }
    
            if (error instanceof Error) {
                res.send(error.message)
            } else {
                res.send("Erro inesperado")
            }
        }
    }
}