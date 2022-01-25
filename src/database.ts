import { Pool } from 'pg';
import { Client, ClientChannel, ConnectConfig } from 'ssh2';
import mysql, { ConnectionOptions } from 'mysql2';
import fs from 'fs';

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

export const pg_db = new Pool({
  host: "ec2-52-2-118-38.compute-1.amazonaws.com",
  user: "sprseivmltxfdq",
  port: 5432,
  ssl: { rejectUnauthorized: false },
  database: "dc0tjv7m1flhff",
  password: "ce7c5f45fd20b65707370ab84f41d7f7335965309c47cfb09a675a86dc25ad36",
  connectionString: process.env.DATABASE_URL,
})


// const sshClient = new Client();
// const dbServer = {
//     host: 'localhost', // process.env.DB_HOST,
//     user: 'izyby_zubr_leas', // process.env.DB_USERNAME,
//     password: '6587erdf@', // process.env.DB_PASSWORD,
//     database: 'izyby_modern_db' // process.env.DB_DATABASE
// }
// const tunnelConfig: ConnectConfig = {
//     host: '93.125.99.123', // process.env.DB_SSH_HOST,
//     passphrase: '6587erdf@',
//     // port: 22,
//     username: 'izyby', // process.env.DB_SSH_USER,
//     // password: process.env.DB_SSH_PASSWORD
//     privateKey: fs.readFileSync('id_rsa')
// }
// const forwardConfig = {
//     srcHost: '127.0.0.1',
//     srcPort: 3306,
//     dstHost: dbServer.host,
//     dstPort: 3306
// };
/*
mysqlssh.connect({
  host: '93.125.99.123',
  user: 'izyby',
  privateKey: fs.readFileSync('dist/id_rsa'),
  passphrase: '6587erdf@'
}, {
  host: 'localhost',
  user: 'izyby_zubr_leas',
  password: '6587erdf@',
  database: 'izyby_modern_db'
})
*/

// export const SSHConnection = new Promise<mysql.Pool>((resolve, reject) => {
//   sshClient.on('ready', () => {
//     sshClient.forwardOut(
//       forwardConfig.srcHost,
//       forwardConfig.srcPort,
//       forwardConfig.dstHost,
//       forwardConfig.dstPort,
//     (err, stream) => {
//           if (err) reject(err);
//           const updatedDbServer: ConnectionOptions = {
//               ...dbServer,
//               stream
//         };
//         resolve(
//           mysql.createPool(updatedDbServer)
//         );
//     });
//   }).connect(tunnelConfig);
// });
