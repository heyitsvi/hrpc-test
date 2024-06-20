import RPC from '@hyperswarm/rpc';
import Fastify from 'fastify';

const serverPublicKey = '45996bcb52a9936524fb86b25b5ba58c62d6f93cc18fb90b267b2f1741f3a4df';

const fastify = Fastify({
  logger: false
});

// Initialize HRPC client
const rpc = new RPC();
const client = rpc.connect(Buffer.from(serverPublicKey, 'hex'));

// Define the /hello endpoint
fastify.post('/hello', async (request, reply) => {
  const { name } = request.body;
  try {
    // Send a request to the 'hello' method of Backend 1 via HRPC
    const reqBuffer = Buffer.from(JSON.stringify({ name }));
    const responseBuffer = await client.request('hello', reqBuffer);
    const response = responseBuffer.toString();

    await client.request('logRequest', reqBuffer);

    reply.send(response); // Send the response from Backend 1 back to the client
  } catch (err) {
    reply.status(500).send(err); 
}});

// Define the /log endpoint to get logs from Backend 1
fastify.get('/log', async (request, reply) => {
  try {
    const responseBuffer = await client.request('getLogs');
    const logs = JSON.parse(responseBuffer.toString());
    reply.send(logs); // Send the logs from Backend 1 back to the client
  } catch (err) {
    reply.status(500).send(err); 
  }
});

// Run the server
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server is now listening on ${address}`);
});
