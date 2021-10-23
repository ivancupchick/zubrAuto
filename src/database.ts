import { Pool } from 'pg';

// export async function connect(): Promise<Client> {
//   const client = new Client({
//     host: "ec2-52-2-118-38.compute-1.amazonaws.com",
//     user: "sprseivmltxfdq",
//     port: 5432,
//     ssl: { rejectUnauthorized: false },
//     database: "dc0tjv7m1flhff",
//     password: "ce7c5f45fd20b65707370ab84f41d7f7335965309c47cfb09a675a86dc25ad36",
//     connectionString: process.env.DATABASE_URL,
//   });

//   await client.connect()
//     .then(res => {
//       console.log(res);
//     })
//     .catch(e => {
//       console.log(e);
//     });

//   return client;
// }

export const db = new Pool({
  host: "ec2-52-2-118-38.compute-1.amazonaws.com",
  user: "sprseivmltxfdq",
  port: 5432,
  ssl: { rejectUnauthorized: false },
  database: "dc0tjv7m1flhff",
  password: "ce7c5f45fd20b65707370ab84f41d7f7335965309c47cfb09a675a86dc25ad36",
  connectionString: process.env.DATABASE_URL,
})