import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import{Post} from "../entities/Post";

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
    async posts(): Promise<Post[]>{
        return Post.find();
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