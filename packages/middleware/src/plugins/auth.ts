import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AuthService } from '../services/auth.service';

declare module 'fastify' {
    interface FastifyInstance {
        authService: AuthService;
        authenticate: (request: any, reply: any) => Promise<void>;
    }
    interface FastifyRequest {
        user: {
            userId: string;
            email: string;
        };
    }
}

const authPlugin: FastifyPluginAsync<{ authService: AuthService }> = async (fastify, options) => {
    fastify.decorate('authService', options.authService);

    fastify.decorate('authenticate', async (request: any, reply: any) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                throw new Error('No token provided');
            }

            const token = authHeader.replace('Bearer ', '');
            const decoded = options.authService.verifyToken(token);
            request.user = decoded;
        } catch (err) {
            reply.code(401).send({ error: 'Unauthorized' });
        }
    });
};

export default fp(authPlugin);
