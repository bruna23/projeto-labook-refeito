import { PostDatabase } from "../database/PostDatabase";
import {CreatePostInputDTO, CreatePostOutput, DeletePostInputDTO, EditPostInputDTO, GetPostsInputDTO, LikeOrDislikePostInputDTO} from "../dtos/postDTO";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { Post } from "../Models/Post";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";
import { LikeDislikeDB, PostDB, POST_LIKE, USER_ROLES } from "../types";

export class PostBusiness {
  constructor(
    private postDatabase: PostDatabase,
    private idGenerator: IdGenerator,
    private tokenManager: TokenManager,
    private hashManager: HashManager
  ) {}

  public getPosts = async (input: GetPostsInputDTO) => {
    const { q, token } = input;

    if (!token) {
      throw new BadRequestError("Token não enviado!");
    }

    const payload = this.tokenManager.getPayload(token as string);

    if (payload === null) {
      throw new BadRequestError("Token inválido!");
    }

    if (typeof q !== "string" && q !== undefined) {
      throw new BadRequestError("'q' deve ser uma string ou undefined");
    }

    const { postsDB, usersDB } = await this.postDatabase.getPostsAndUsers(q);

    const posts = postsDB.map((postDB) => {
      const post = new PostDB(
        postDB.id,
        postDB.content,
        postDB.likes,
        postDB.dislikes,
        postDB.created_at,
        postDB.updated_at,
        getCreator(postDB.creator_id)
      );
      return post.toBusinessModel();
    });

    function getCreator(creatorId: string) {
      const creator = usersDB.find((UserDB) => {
        return UserDB.id === creatorId;
      });

      return {
        id: creator.id,
        name: creator.name,
      };
    }
    // modela o DTO para a resposta
    return posts;
  };

  public createPost = async (
    input: CreatePostInputDTO
  ): Promise<CreatePostOutput> => {
    const { content, token } = input;
    const payload = this.tokenManager.getPayload(token as string);

    if (payload === null) {
      throw new BadRequestError("Usuário não logado");
    }

    if (typeof content !== "string") {
      throw new BadRequestError("Post deve ser uma string.");
    }

    if (content.length === 0) {
      throw new BadRequestError("Post não pode ser vazio.");
    }

    const id = this.idGenerator.generate();

    const newPost = new Post(
      id,
      content,
      0,
      0,
      new Date().toISOString(),
      new Date().toISOString(),
      payload
    );

    const postDB = newPost.toDBModel();

    await this.postDatabase.createPost(postDB);

    const output: CreatePostOutput = {
      message: "Post enviado com sucesso.",
    };

    return output;
  };

  public editPost = async (input: EditPostInputDTO): Promise<void> => {
    const { idToEdit, token, content } = input;

    if (token === undefined) {
      throw new BadRequestError("Token ausente!");
    }

    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new BadRequestError("Token inválido");
    }

    if (typeof content !== "string") {
      throw new BadRequestError("'content' deve ser string");
    }

    const postDB = await this.postDatabase.findById(idToEdit);

    if (!postDB) {
      throw new NotFoundError("'id' não encontrado");
    }

    if (postDB.creator_id !== payload.id) {
      throw new BadRequestError("somente quem criou o post pode editá-lo");
    }

    const post = new Post(
      postDB.id,
      postDB.content,
      postDB.likes,
      postDB.dislikes,
      postDB.created_at,
      postDB.updated_at,
      payload
    );

    post.setContent(content);
    post.setUpdatedAt(new Date().toISOString());

    const updatePostDatabase = post.toDBModel();

    await this.postDatabase.update(idToEdit, updatePostDatabase);
  };

  public deletePost = async (input: DeletePostInputDTO): Promise<void> => {
    const { idToDelete, token } = input;

    if (token === undefined) {
      throw new BadRequestError("Token ausente!");
    }
    const payload = this.tokenManager.getPayload(token);

    if (payload === null) {
      throw new BadRequestError("Token inválido");
    }
    const postDB = await this.postDatabase.findById(idToDelete);

    if (!postDB) {
      throw new NotFoundError("'id' não encontrado");
    }

    if (payload.role !== USER_ROLES.ADMIN && postDB.creator_id !== payload.id) {
      throw new BadRequestError("somente quem criou o post pode deletá-lo.");
    }

    await this.postDatabase.deleteById(idToDelete);
  };

  public likeOrDislikePost = async (
    input: LikeOrDislikePostInputDTO
  ): Promise<void> => {
    const { idToLikeOrDislike, token, like } = input;

    if (token === undefined) {
      throw new BadRequestError("Token ausente!");
    }
    const payload = this.tokenManager.getPayload(token as string);

    if (payload === null) {
      throw new BadRequestError("Token inválido");
    }

    if (typeof like !== "boolean") {
      throw new BadRequestError("'like' deve ser boolean");
    }

    const postWithCreatorDB = await this.postDatabase.findPostWithCreatorById(idToLikeOrDislike);

    if (!postWithCreatorDB) {
      throw new NotFoundError("'id' não encontrado");
    }

    if (postWithCreatorDB.creator_id === payload.id) {
      throw new BadRequestError("O criador do post não pode curti-lo");
    }

    const likeSQLite = like ? 1 : 0;

    const likeDislikeDB: LikeDislikeDB = {
      user_id: payload.id,
      post_id: postWithCreatorDB.id,
      like: likeSQLite
    }


    const usersDB = await this.postDatabase.getAllUsers();

    function getCreator(creatorId: string) {
      const creator = usersDB.find((UserDB) => {
        return UserDB.id === creatorId;
      });

      return {
        id: creator.id,
        name: creator.name,
      };
    }

    const post = new Post(
      postWithCreatorDB.id,
      postWithCreatorDB.content,
      postWithCreatorDB.likes,
      postWithCreatorDB.dislikes,
      postWithCreatorDB.created_at,
      postWithCreatorDB.updated_at,
      getCreator(postWithCreatorDB.creator_id)
    );

    const likeDislikeExists = await this.postDatabase.findLikeDislike(likeDislikeDB)

    if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) {
      if (like) {
        await this.postDatabase.removeLikeDislike(likeDislikeDB)
        post.removeLike()
      } else {
        await this.postDatabase.updateLikeDislike(likeDislikeDB)
        post.removeLike()
        post.addDislike()
      }

    } else if (likeDislikeExists === POST_LIKE.ALREADY_DISLIKED) {
      if (like) {
        await this.postDatabase.updateLikeDislike(likeDislikeDB)
        post.removeDislike()
        post.addLike()
      } else {
        await this.postDatabase.removeLikeDislike(likeDislikeDB)
        post.removeDislike()
      }

    } else {
      await this.postDatabase.likeOrDislikePost(likeDislikeDB)

      like ? post.addLike() : post.addDislike()      
    }

    const updatePostDB = post.toDBModel()

    await this.postDatabase.update(idToLikeOrDislike, updatePostDB)
  }
}