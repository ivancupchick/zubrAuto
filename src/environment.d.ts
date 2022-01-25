declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      JWT_ACCESS_SECRET: string;
      JWT_REFRESH_SECRET: string;
      SMTP_HOST: string;
      SMTP_PORT: number;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      API_URL: string;
      CLIENT_URL: string;
      CARS_INFO_LINK: string;
      CARS_PHONE_LINK: string;
      AWS_BUCKET_NAME: string;
      AWS_BUCKET_REGION: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_KEY: string;
      ON_PROD: string;
      DB_HOST: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_DATABASE: string;
      DB_SSH_HOST: string;
      DB_SSH_PASSPHRASE: string;
      DB_SSH_USER: string;
    }
  }
}

export {};
