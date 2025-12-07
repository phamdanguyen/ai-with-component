import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export class AuthService {
    private prisma: PrismaClient;
    private jwtSecret: string;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        this.jwtSecret = process.env.JWT_SECRET || 'super-secret-key';
    }

    async register(data: z.infer<typeof registerSchema>) {
        const validatedData = registerSchema.parse(data);

        const existingUser = await this.prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const passwordHash = await bcrypt.hash(validatedData.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: validatedData.email,
                passwordHash,
                name: validatedData.name,
            },
        });

        return this.generateToken(user);
    }

    async login(data: z.infer<typeof loginSchema>) {
        const validatedData = loginSchema.parse(data);

        const user = await this.prisma.user.findUnique({
            where: { email: validatedData.email },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isValidPassword = await bcrypt.compare(validatedData.password, user.passwordHash);

        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        return this.generateToken(user);
    }

    private generateToken(user: User) {
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            this.jwtSecret,
            { expiresIn: '7d' }
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            token,
        };
    }

    verifyToken(token: string) {
        try {
            return jwt.verify(token, this.jwtSecret) as { userId: string; email: string };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}
