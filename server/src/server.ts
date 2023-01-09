import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import path from "path";

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
    migrations: [path.join(__dirname, "./migrations/*")],
})
AppDataSource.initialize();