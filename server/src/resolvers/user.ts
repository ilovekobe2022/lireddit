import { Field, InputType, Resolver,Arg, Mutation, Ctx, ObjectType } from "type-graphql";
import { User } from "../entities/User";
import { MyContext } from "../types";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput{
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError{
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse{
    @Field(() => [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(() => User, {nullable: true})
    user?: User;
    
}

@Resolver()
export class UserResolver{
    @Mutation(()=>UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext
    ) : Promise<UserResponse> {
        if (options.username.length <= 2){
            return{
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }

        if (options.password.length <= 2){
            return{
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 2",
                    },
                ],
            };
        }

        const hashedPassword = await argon2.hash(options.password);
        const user = em.fork().create(User,{
            username: options.username, 
            password: hashedPassword} as User);
            
        try{
            await em.fork().persistAndFlush(user);
        } catch (err){
            if (err.code === '23505'){
                return {
                    errors: [
                        {
                            field:"username",
                            message:"username already taken",
                        }
                    ]
                }
            }
        }
        
        return {user};
    }

    @Mutation(()=>UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em, req}: MyContext
    ): Promise<UserResponse> {
        const user = await em.fork().findOne(User, {username: options.username});
        if (!user){
            return {
                errors: [
                    {
                    field: "username",
                    message: "that username doesn't exit",
                },
              ],
            };
        }
        const valid = await argon2.verify(user.password, options.password);  // options.password get from @Arg('options') 
        if (!valid) {
            return {
                errors: [
                    {
                    field: "password",
                    message: "incorrect password",
                },
              ],
            };
        }

        req.session.userId = user.id;

        return {
            user,
        };
    }
}