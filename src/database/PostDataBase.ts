import { LikeDislikeDB, PostDB, PostWithCreatorDB, POST_LIKE } from "../types";
import { BaseDatabase } from "./BaseDataBase";
import { UserDataBase } from "./UserDataBase";

export class PostDatabase extends BaseDatabase {
    public static TABLE_POSTS = "posts"
    public static TABLE_LIKES_DISLIKES = "likes_dislikes"

    public getAllPosts = async () => {
        const postsDB = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select()
        return postsDB    
    }
    public getAllUsers = async () => {
        const usersDB = await BaseDatabase
            .connection(UserDataBase.TABLE_USERS)
            .select()
        return usersDB        
    }

    public getPostsAndUsers = async (q: string | undefined) => {

        let postsDB: PostDB[]

       
        postsDB = await this.getAllPosts()
       
        const usersDB = await BaseDatabase
        .connection(UserDataBase.TABLE_USERS)
        .select()
        
        return {
            postsDB,
            usersDB
        }
    }

    public createPost = async (post: PostDB): Promise<void> => {
        await BaseDatabase  
            .connection(PostDatabase.TABLE_POSTS)
            .insert(post)
    }

    public findById = async (id: string): Promise<PostDB | undefined> => {
        const result: PostDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select()
            .where({ id })
        
        return result[0]
    }

    public update = async (
        id: string,
        postDB: PostDB
    ): Promise<void> => {
        await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
            .update(postDB)
            .where({ id })
    }

    public deleteById = async (id: string): Promise<void> => {
        await BaseDatabase.connection(PostDatabase.TABLE_POSTS)
        .delete()
        .where({ id })
    } 

    public findPostWithCreatorById = async (
        postId: string
        ): Promise<PostWithCreatorDB | undefined> => {
        const result: PostWithCreatorDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                    "posts.id",
                    "posts.creator_id",
                    "posts.content",
                    "posts.likes",
                    "posts.dislikes",
                    "posts.created_at",
                    "posts.updated_at"
                )
                .join("users", "posts.creator_id", "=", "users.id")
                .where("posts.id", postId)

            return result[0]
    }

    public likeOrDislikePost = async (
        likeDislike: LikeDislikeDB
    ): Promise<void> => {
        await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .insert(likeDislike)
    }

    public findLikeDislike = async (
        likeDislikeDBToFind: LikeDislikeDB
    ): Promise<POST_LIKE | null> => {
        const [likeDislikeDB]: LikeDislikeDB[] = await BaseDatabase
            .connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .select()
            .where({
                user_id: likeDislikeDBToFind.user_id,
                post_id: likeDislikeDBToFind.post_id
            })

            if (likeDislikeDB){
                return likeDislikeDB.like === 1 
                ? POST_LIKE.ALREADY_LIKED
                : POST_LIKE.ALREADY_DISLIKED

            } else {
                return null
            }       
    }

    public removeLikeDislike = async (
        likeDislikeDB: LikeDislikeDB
    ): Promise<void> => {
        await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .delete()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })
    }

    public updateLikeDislike = async (
        likeDislikeDB: LikeDislikeDB
    ) => {
        await BaseDatabase.connection(PostDatabase.TABLE_LIKES_DISLIKES)
            .update(likeDislikeDB)
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })       
    }   
}
