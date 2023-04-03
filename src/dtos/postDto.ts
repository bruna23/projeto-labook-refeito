export interface CreatePostInputDTO {
    content: string,
    token: string | undefined
}

export interface CreatePostOutput {
    message: string    
}


export interface GetPostsInputDTO {
    q: unknown
    token: string | undefined
}

export interface EditPostInputDTO {
    idToEdit: string,
    content: string | undefined,
    token: string | undefined    
}

export interface DeletePostInputDTO {
    idToDelete: string,
    token: string | undefined
}

export interface LikeOrDislikePostInputDTO {
    idToLikeOrDislike: string,
    token: string | undefined,
    like: number
}