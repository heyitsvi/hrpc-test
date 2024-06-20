import RPC from '@hyperswarm/rpc';
import Hyperbee from 'hyperbee';
import Hypercore from 'hypercore';

// Create an RPC server
const rpc = new RPC();
const server = rpc.createServer();
await server.listen();

// Initialize Hypercore and Hyperbee for storing logs
const core = new Hypercore('./mydb');
await core.ready();
const db = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'json'
});

// Method to handle 'hello' requests
server.respond('hello', async (req) => {
  const { name } = JSON.parse(req.toString());
  return Buffer.from(`Hello ${name}`);
});

// Method to log requests
server.respond('logRequest', async (req) => {
  const { name } = JSON.parse(req.toString());
  const countEntry = await db.get(name);
  const count = countEntry ? countEntry.value : 0;
  await db.put(name, count + 1);
  return Buffer.from('Logged');
});

// Method to get logs
server.respond('getLogs', async () => {
  const stream = db.createReadStream();
  const logs = [];
  for await (const { key, value } of stream) {
    logs.push({ name: key, count: value });
  }
  return Buffer.from(JSON.stringify(logs));
});

console.log('HRPC server is running');

// Log the public key
console.log(`Server Public Key: ${server.publicKey.toString('hex')}`);

// Export the server's public key as a string
export const serverPublicKey = server.publicKey.toString('hex');

