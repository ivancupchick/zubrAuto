import { Client } from 'pg';

const client = new Client({
  host: "ec2-52-2-118-38.compute-1.amazonaws.com",
  user: "sprseivmltxfdq",
  port: 5432,
  ssl: true,
  database: "dc0tjv7m1flhff",
  password: "ce7c5f45fd20b65707370ab84f41d7f7335965309c47cfb09a675a86dc25ad36",
  connectionString: process.env.DATABASE_URL,
});

export async function connect(): Promise<Client> {
    // const connection = await createPool({
    //     host: 'localhost',
    //     user: 'root1',
    //     database: 'main',
    //     password: "root",
    //     connectionLimit: 10
    // });
    client.connect();
    return client;
}
