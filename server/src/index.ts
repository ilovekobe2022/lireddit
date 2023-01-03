import'reflect-metadata';
import { MikroORM }  from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
import micoConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
// import * as redis from 'redis';
// import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import cors from 'cors';
import Redis from "ioredis";

const main = async () => { 
    const orm = await MikroORM.init(micoConfig);
    await orm.getMigrator().up();   //get migrator restart

    const app = express();

    const RedisStore = connectRedis(session);
    const redis = new Redis();   
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
        context:({req, res}) => ({ em: orm.em, req, res, redis }),
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


