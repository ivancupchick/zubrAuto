import { readFileSync } from "fs";
import { Connection, ConnectionOptions, createConnection } from "mysql2";
import { Client, ConnectConfig } from "ssh2";

import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

export const SSHConnection = new Promise<Connection>((resolve, reject) => {
  const isProd = !!(+process.env.ON_PROD);

  const dbServer = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  }

  if (!isProd) {
    const tunnelConfig: ConnectConfig = {
      host: process.env.DB_SSH_HOST,
      passphrase: process.env.DB_SSH_PASSPHRASE,
      username: process.env.DB_SSH_USER,
      privateKey: readFileSync('id_rsa')
    }
    const forwardConfig = {
      srcHost: '127.0.0.1',
      srcPort: 3306,
      dstHost: dbServer.host,
      dstPort: 3306
    };

    const sshClient = new Client();
    sshClient.on('ready', () => {
      sshClient.forwardOut(
        forwardConfig.srcHost,
        forwardConfig.srcPort,
        forwardConfig.dstHost,
        forwardConfig.dstPort,
      (err, stream) => {
        if (err) reject(err);
        const updatedDbServer: ConnectionOptions = {
          ...dbServer,
          stream
        };
        resolve(
          createConnection(updatedDbServer)
        );
      });
    }).connect(tunnelConfig);
  } else {
    resolve(
      createConnection(dbServer)
    );
  }
});
