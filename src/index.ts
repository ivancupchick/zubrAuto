import { App } from './app';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config()
}

const PORT = process.env.PORT || 4205;

async function main() {
    const app = new App(PORT);
    await app.listen();
}

main();
