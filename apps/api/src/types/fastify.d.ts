import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      sub: string; // userId
      email: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string; // userId
      email: string;
    };
    user: {
      sub: string;
      email: string;
    };
  }
}
