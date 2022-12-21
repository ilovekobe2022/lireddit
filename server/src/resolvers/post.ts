import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import{Post} from "../entities/Post";
import { MyContext } from "../types";

@Resolver()
export class PostResolver{
    @Query(() => [Post])
    posts( @Ctx() {em}: MyContext ): Promise<Post[]>{
        const fork = em.fork();
        return fork.find(Post,{});
    }

    @Query(() => Post, { nullable: true })
    post(
        @Arg("id", () => Int) id: number,
        @Ctx() { em }: MyContext
    ): Promise<Post | null>{
        const fork = em.fork();
        return fork.findOne(Post, {id});
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title") title:string,
        @Ctx(){em}: MyContext
    ): Promise<Post>{
        const post = em.fork().create(Post, {title} as Post);
        await em.fork().persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, {nullable: true})
    async updatePost(
        @Arg("id") id:number,
        @Arg("title", () => String, {nullable: true}) title:string,
        @Ctx(){em}: MyContext
    ): Promise<Post>{
        const post = await em.fork().findOne(Post, {id} as Post);
        if (!post) {
            return null as any;
        }
        if (typeof title !== "undefined"){
            post.title = title;
            await em.fork().persistAndFlush(post);
        }
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id:number,
        @Ctx(){em}: MyContext
    ): Promise<boolean>{
        await em.nativeDelete(Post, {id})
        return true;
    }
}