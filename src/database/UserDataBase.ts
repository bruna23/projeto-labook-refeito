import { UserDB } from "../types";
import { BaseDatabase } from "./BaseDatabase";

export class UserDataBase extends BaseDatabase {
    public static TABLE_USERS = "users"

    public getAllUsers = async () => {
        const usersDB = await BaseDatabase
            .connection(UserDataBase.TABLE_USERS)
            .select()
        return usersDB    
    }

    public async findUserByEmail(email: string) {
        const [ userDB ]: UserDB[] | undefined[] = await BaseDatabase
            .connection(UserDataBase.TABLE_USERS)
            .where({ email })

        return userDB
    }


    public async insertUser(newUserDB: UserDB) {
        await BaseDatabase
            .connection(UserDataBase.TABLE_USERS)
            .insert(newUserDB)
    }


}