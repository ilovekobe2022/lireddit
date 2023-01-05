import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "0000",
    database: "lireddit2",
    synchronize: true,
    logging: true,
    entities: [Post,User],
    subscribers: [],
    migrations: [],
})
AppDataSource.initialize();