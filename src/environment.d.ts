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
    }
  }
}

export {};
