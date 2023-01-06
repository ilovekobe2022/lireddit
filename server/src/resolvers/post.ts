import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import{Post} from "../entities/Post";
import { AppDataSource } from "../server";

@InputType()
class PostInput {
    @Field()
    title!: string
    @Field()
    text!: string
}

@Resolver()
export class PostResolver{
    @Query(() => [Post])
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    ): Promise<Post[]>{
        const realLimit = Math.min(50, limit);

        // Ben's code
        // getConnection()
        // .getRepository(Post)
        // .createQueryBuilder("p")
        // // .where("user.id = :id", { id:1 })
        // .orderBy("createdAt")
        // .getMany()

        // solution for getConnection deprecation
        const qb = AppDataSource
        .getRepository(Post)
        .createQueryBuilder("p")
        .orderBy(' "createdAt" ', "DESC")
        .take(realLimit);

        if (cursor) {
            qb.where( '"createdAt" < :cursor', {
                cursor: new Date(parseInt(cursor)),
            });
        }

        return qb.getMany();
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id") id: number): Promise<Post | null> {
        return Post.findOne(id as any);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("input") input: PostInput,
        @Ctx() { req }: MyContext
        ): Promise<Post> {       
        return Post.create({ 
          ...input,
          creatorId: req.session.userId,
         }).save();
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg("id") id:number,
        @Arg("title", () => String, {nullable: true}) title:string,
    ): Promise<Post>{
        const post = await Post.findOne(id as any);
        if (!post) {
            return null as any;
        }
        if (typeof title !== "undefined"){
            await Post.update({ id },{ title });
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id") id:number): Promise<boolean>{
        await Post.delete(id);
        return true;
    }
}