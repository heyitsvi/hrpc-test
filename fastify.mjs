import RPC from '@hyperswarm/rpc';
import Fastify from 'fastify';
import { serverPublicKey } from './hrpc.mjs';
import Hyperbee from 'hyperbee';
import Hypercore from 'hypercore';

const fastify = Fastify({
    logger: false
  })

const core = new Hypercore('./mydb');
await core.ready();

// Create a Hyperbee instance
const db = new Hyperbee(core, {
  keyEncoding: 'utf-8',
  valueEncoding: 'json'
});

// Endpoint to get logs
fastify.get('/log', async (req, res) => {
  const stream = db.createReadStream();
  const logs = [];
  for await (const { key, value } of stream) {  
    logs.push({ name: key, count: value });
  }
  res.send(logs);
});

// Log requests and update word counts
async function logRequest(key) {
  const countEntry = await db.get(key);
  const count = countEntry ? countEntry.value : 0;
  await db.put(key, count + 1);
}

fastify.get('/', function (request, reply) {
    reply.send({ hello: 'world' })
})

const rpc = new RPC();
const client = rpc.connect(serverPublicKey);

// Define the /hello endpoint
fastify.post('/hello', async (request, reply) => {
    const { name } = request.body; // Extract the 'name' parameter from the request body
    try {
      // Send a request to the 'hello' method of Backend 1 via HRPC
      const reqBuffer = Buffer.from(JSON.stringify({ name }));
      const responseBuffer = await client.request('hello', reqBuffer);
      const response = responseBuffer.toString(); 
      await logRequest(name);
      reply.send(response); // Send the response from Backend 1 back to the client
      // console.log(response);
    } catch (err) {
      reply.status(500).send(err); // Handle any errors that occur during the request
    }
});
  
// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
if (err) {
    fastify.log.error(err)
    process.exit(1)
}
 console.log(`Server is now listening on ${address}`);
})

