import { Arg, Mutation, Query, Resolver } from "type-graphql";
import{Post} from "../entities/Post";

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
    async createPost(@Arg("title") title:string,): Promise<Post> {
        // 2 sql queries
        return Post.create({ title }).save();
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