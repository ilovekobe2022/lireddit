import'reflect-metadata';
import { COOKIE_NAME, __prod__ } from "./constants";
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import cors from 'cors';
import Redis from "ioredis";
import { AppDataSource } from './server';
import { createUserLoader } from './utils/createUserLoader';
import { createUpdootLoader } from './utils/createUpdootLoader';

const main = async () => { 

    // Ben's code
    // const conn = await createConnection ({
    //     type: 'postgres',
    //     database: 'lireddit2',
    //     username:'postgres',
    //     password:'postgres',
    //     logging: true,
    //     synchronize:true,
    //     entities:[Post,User]
    // })
    
    // createConnection solution
    try {
        await AppDataSource.initialize();
     } catch (error) {
       console.log(error)
     }
     await AppDataSource.runMigrations();

    //  await Post.delete({});

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis(); 
    // app.set("mykey", "value");  
    app.set("trust proxy", 1);
    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials:true,
        })
    )

    app.use(
        session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
            client: redis as any,
            disableTTL: true,
            disableTouch: true
         }),
        cookie:{
            maxAge: 1000*60*60*24*365*10,  // 10 years
            httpOnly: true,
            sameSite: 'lax', // csrf
            secure: __prod__ // cookie only works in https
        },
        saveUninitialized: false,
        secret: "keyboard cat",
        resave: false,
        })
    );
    
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver,PostResolver,UserResolver],
            validate: false
        }),
        context:({req, res}) => ({ 
            req, 
            res, 
            redis,
            userLoader: createUserLoader(),
            updootLoader: createUpdootLoader(),
         }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground({
              // options
            }),
          ],
    });

    

    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });

    app.listen(4000, ()=>{
        console.log('server started on local:4000')
    })
};

main().catch((err) => {
    console.error(err);
});
