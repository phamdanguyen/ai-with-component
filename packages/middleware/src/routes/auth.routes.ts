import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

const authRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/auth/register', async (request, reply) => {
        try {
            const result = await fastify.authService.register(request.body as any);
            reply.send(result);
        } catch (error: any) {
            reply.code(400).send({ error: error.message });
        }
    });

    fastify.post('/auth/login', async (request, reply) => {
        try {
            const result = await fastify.authService.login(request.body as any);
            reply.send(result);
        } catch (error: any) {
            reply.code(401).send({ error: error.message });
        }
    });

    fastify.get('/auth/me', {
        preValidation: [fastify.authenticate]
    }, async (request, reply) => {
        reply.send({ user: request.user });
    });
};

export default authRoutes;
