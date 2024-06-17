import RPC from '@hyperswarm/rpc';

const rpc = new RPC();

const server = rpc.createServer();
await server.listen();
console.log("HRPC Server is running");

server.respond('hello', (req) => {
    const {name} = req;
    return `Hello ${name}`;
})

export const serverPublicKey = server.publicKey;
