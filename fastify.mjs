import RPC from '@hyperswarm/rpc';
import Fastify from 'fastify';
import { serverPublicKey } from './hrpc.mjs';

const fastify = Fastify({
    logger: false
  })

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

