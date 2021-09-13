import { createPool, Pool } from 'mysql2/promise'

export async function connect(): Promise<Pool> {
    const connection = await createPool({
        host: 'localhost',
        user: 'root1',
        database: 'main',
        password: "root",
        connectionLimit: 10
    });
    return connection;
}