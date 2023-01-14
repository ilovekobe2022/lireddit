import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import{Post} from "../entities/Post";
import { AppDataSource } from "../server";
import { Updoot } from "../entities/Updoot";

@InputType()
class PostInput {
    @Field()
    title!: string
    @Field()
    text!: string
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts!: Post[]
    @Field()
    hasMore!: boolean;
}

@Resolver(Post)
export class PostResolver{
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0,50);
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const isUpdoot = value !== -1;
        const realValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOneBy({
            postId:postId,
            userId:userId,
        })

        // the user has voted on the post before
        // and they are changing their vote
        if (updoot && updoot.value !== realValue) {
          await AppDataSource.transaction(async (tm) => {
            await tm.query(`
            update updoot
            set value = $1
            where "postId" = $2 and "userId"=$3
            `,[realValue, postId, userId]
            );

            await tm.query(`
            update post
            set points = points + $1
            where id = $2
            `,[2 * realValue, postId]
            );
          })
        } else if (!updoot) {
          // has never voted before
          await AppDataSource.transaction(async (tm) => {
            await tm.query(`
            insert into updoot ("userId", "postId", value)
            values ($1, $2, $3)
            `,[userId, postId, realValue]
            );

            await tm.query(`
            update post
            set points = points + $1
            where id = $2
            `,[realValue, postId]
            );
          })
        }
        return true;
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Ctx() {req}: MyContext
    ): Promise<PaginatedPosts>{
        // 20 -> 21
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replacements: any[] = [realLimitPlusOne];

        if (req.session.userId) {
          replacements.push(req.session.userId);
        }

        let cursorIdx = 3;
        if (cursor) {
          replacements.push(new Date(parseInt(cursor)));
          cursorIdx = replacements.length;
        }

        const posts = await AppDataSource.query(
            `
          select p.*,
          json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
            ) creator
          ${
            req.session.userId 
            ? ',(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"' 
            : 'null as "voteStatus"'
          }
          from post p
          inner join public.user u on u.id = p."creatorId"
          ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
          order by p."createdAt" DESC
          limit $1
          `,
            replacements
          );

        // Ben's code
        // getConnection()
        // .getRepository(Post)
        // .createQueryBuilder("p")
        // // .where("user.id = :id", { id:1 })
        // .orderBy("createdAt")
        // .getMany()

        // solution for getConnection deprecation
        // const qb = AppDataSource
        // .getRepository(Post)
        // .createQueryBuilder("p")
        // .innerJoinAndSelect("p.creator","u",'u.id = p."creatorId"')
        // .orderBy(' p."createdAt" ', "DESC")
        // .take(realLimitPlusOne);

        // if (cursor) {
        //     qb.where( 'p."createdAt" < :cursor', {
        //         cursor: new Date(parseInt(cursor)),
        //     });
        // }
    
        // const posts = await qb.getMany();

        // console.log("posts: ",posts);

        return { 
            posts: posts.slice(0, realLimit), 
            hasMore: posts.length === realLimitPlusOne,
        };
    }

    // @Query(() => Post, { nullable: true })
    // post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    //     return Post.findOne(id as any);
    // }
    @Query(() => Post)
    async post(@Arg("id", () => Int) id: number): Promise<Post> {
      const post = await Post.find({
          where: { id: id as any },
          relations: {creator: true}
        });
        return post[0];
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
    @UseMiddleware(isAuth)
    async deletePost(
      @Arg("id", () => Int) id:number, 
      @Ctx() { req }: MyContext
      ): Promise<boolean>{

        // not cascade way
        // const post = await Post.findOneBy({id: id});
        // if (!post) {
        //   return false;
        // }
        // if (post.creatorId !== req.session.userId) {
        //   throw new Error("not authorized");
        // }

        // await Updoot.delete({ postId: id });
        // await Post.delete({ id });

        await Post.delete({ id: id, creatorId: req.session.userId });
    
        return true;
    }
}