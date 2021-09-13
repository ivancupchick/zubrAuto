import { App } from './app'
// import { connect } from './database'

const PORT = process.env.PORT || 3080;

async function main() {
    const app = new App(PORT);
    await app.listen();
}

main();