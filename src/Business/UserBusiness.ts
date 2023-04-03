import { IdGenerator } from "../services/IdGenerator"
import { LoginInput, LoginOutput, SignupInput, SignupOutput } from "../dtos/userDto"
import { BadRequestError } from "../errors/BadRequestError"
import { NotFoundError } from "../errors/NotFoundError"
import { TokenPayload, USER_ROLES } from "../types"
import { TokenManager } from "../services/TokenManager"
import { UserDataBase } from "../database/UserDataBase"
import { User } from "../Models/userModels"
import { HashManager } from "../services/HashManager"

export class UserBusiness {
    constructor(
        private userDatabase: UserDataBase,
        private idGenerator: IdGenerator,
        private tokenMananger: TokenManager,
        private hashManager: HashManager
    ) {}    

    public Gsignup = async (input: SignupInput): Promise<SignupOutput> => {
        const { name, email, password } = input
        
        if (typeof name !== "string") {
            throw new BadRequestError("'name' deve ser string")
        }

        if (typeof email !== "string") {
            throw new BadRequestError("'email' deve ser string")
        }

        if (typeof password !== "string") {
            throw new BadRequestError("'password' deve ser string")
        }

        const hashedPassword = await this.hashManager.hash(password)

        const id = this.idGenerator.generate()

        const newUser = new User(
            id,
            name,
            email,
            hashedPassword,
            USER_ROLES.NORMAL, 
            new Date().toISOString()
        )

        const newUsersDB = newUser.toDBModel()
        await this.userDatabase.insertUser(newUsersDB)

        const payloads: TokenPayload = {
            id: newUser.getId(),
            name: newUser.getName(),
            role: newUser.getRole()
        }

        const tokens = this.tokenMananger.createToken(payloads)

        const Signoutput: SignupOutput = {
            message: "Cadastro realizado com sucesso",
            tokens
        }

        return Signoutput
    }

    public loginInput = async (input: LoginInput): Promise<LoginOutput> => {
        const { email, password } = input

        if (typeof email !== "string") {
            throw new Error("'email' deve ser string")
        }

        if (typeof password !== "string") {
            throw new Error("'password' deve ser string")
        }

        const userDB = await this.userDatabase.findUserByEmail(email)

        if (!userDB) {
            throw new NotFoundError("'email' não encontrado")
        }

        // if (password !== userDB.password) {
        //     throw new BadRequestError("'email' ou 'password' incorretos")
        // }

        const hash = await this.hashManager.compare(password, userDB.password)
     
        if(!hash){
            throw new BadRequestError("Email ou senha incorretos!")
        }
        const user = new User(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        )

        const Tokenpayload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const tokens = this.tokenMananger.createToken(Tokenpayload)


        const Loginoutput: LoginOutput = {
            message: "Login realizado com sucesso",
            tokens
        }

        return Loginoutput
    }
}