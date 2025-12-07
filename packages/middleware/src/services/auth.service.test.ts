import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;
    let prisma: PrismaClient;

    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        // Create a mock PrismaClient
        prisma = {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
        } as unknown as PrismaClient;

        authService = new AuthService(prisma);
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Setup mocks
            (prisma.user.findUnique as any).mockResolvedValue(null);
            (bcrypt.hash as any).mockResolvedValue('hashed-password');
            (prisma.user.create as any).mockResolvedValue(mockUser);
            (jwt.sign as any).mockReturnValue('mock-token');

            const result = await authService.register({
                email: 'test@example.com',
                password: 'password123',
                name: 'Test User',
            });

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(prisma.user.create).toHaveBeenCalled();
            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    name: mockUser.name,
                },
                token: 'mock-token',
            });
        });

        it('should throw error if user already exists', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);

            await expect(authService.register({
                email: 'test@example.com',
                password: 'password123',
            })).rejects.toThrow('User already exists');
        });
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(true);
            (jwt.sign as any).mockReturnValue('mock-token');

            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123',
            });

            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.passwordHash);
            expect(result.token).toBe('mock-token');
        });

        it('should throw error with invalid password', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(false);

            await expect(authService.login({
                email: 'test@example.com',
                password: 'wrongpassword',
            })).rejects.toThrow('Invalid email or password');
        });

        it('should throw error if user not found', async () => {
            (prisma.user.findUnique as any).mockResolvedValue(null);

            await expect(authService.login({
                email: 'notfound@example.com',
                password: 'password123',
            })).rejects.toThrow('Invalid email or password');
        });
    });
});
