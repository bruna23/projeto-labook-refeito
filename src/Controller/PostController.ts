import { Request, Response } from "express"
// import { afterEach } from "node:test"
import { PostBusiness } from "../business/PostBusiness"
import { CreatePostInputDTO, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, LikeOrDislikePostInputDTO } from "../dtos/postDTO"

export class PostController {
    constructor(private postBusiness: PostBusiness){}

    public getPosts = async (req: Request, res: Response) => {
        try {
          const input: GetPostsInputDTO = {
            q: req.query.q as string | undefined,
            token: req.headers.authorization
        }

        const output = await this.postBusiness.getPosts(input)

          res.status(200).send(output)
        
        } catch (error) {
            console.log(error)

            if (error instanceof Error) {
              res.status(500).send(error.message)
            } else {
              res.status(500).send("Erro inesperado")
            }            
        }
    }

    public createPost = async (req: Request, res: Response) => {
      try {

        const input: CreatePostInputDTO = {
          content: req.body.content,
          token: req.headers.authorization
        }

        const output = await this.postBusiness.createPost(input)

        res.status(201).send(output)
        
      } catch (error) {
        console.log(error)

            if (error instanceof Error) {
              res.status(500).send(error.message)
            } else {
              res.status(500).send("Erro inesperado")
            }        
      }
    }

    public editPost = async (req: Request, res: Response) => {
      try {
        const input: EditPostInputDTO = {
          idToEdit: req.params.id,
          content: req.body.content,
          token: req.headers.authorization as string
        }
       
        await this.postBusiness.editPost(input)
    
        res.status(200).end()        

      } catch (error) {
        console.log(error)

        if (error instanceof Error) {
          res.status(500).send(error.message)
        } else {
          res.status(500).send("Erro inesperado")
        }            
    }
  }

  public deletePost = async (req: Request, res: Response) => {
    try {
      const input: DeletePostInputDTO = {
        idToDelete: req.params.id,
        token: req.headers.authorization
      }
      
      await this.postBusiness.deletePost(input)

      res.status(200).end()
      
    } catch (error) {
      console.log(error)

        if (error instanceof Error) {
          res.status(500).send(error.message)
        } else {
          res.status(500).send("Erro inesperado")
        }         
    }
  }

  public likeOrDislikePost = async (req: Request, res: Response) => {
    try {
      const input: LikeOrDislikePostInputDTO = {
        idToLikeOrDislike: req.params.id,
        token: req.headers.authorization,
        like: req.body.like
      }

      await this.postBusiness.likeOrDislikePost(input)

      res.status(200).end()
      
    } catch (error) {
      console.log(error)

        if (error instanceof Error) {
          res.status(500).send(error.message)
        } else {
          res.status(500).send("Erro inesperado")
        }         
    }
  }


}