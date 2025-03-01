import { describe, expect, test, beforeEach, spyOn } from "bun:test";
import AuthService from '../auth-service';
import { PrismaClient } from '@prisma/client';
import { UserType } from '../../user/constant';
import UserService from '../../user/user-service';
import { Logger } from '../../logger/logger';

describe('AuthService', () => {
    let authService: AuthService;
    let mockPrisma: PrismaClient;
    let mockUserService: UserService;
    let mockLogger: Logger;

    const mockKV: KVNamespace = {
        get: async () => null,
        put: async () => { },
        delete: async () => { },
        list: async () => ({
            keys: [],
            list_complete: true,
            cursor: '',
            cacheStatus: null
        }),
        getWithMetadata: async () => ({
            value: null,
            metadata: null,
            cacheStatus: null
        })
    };

    const mockEnv: Partial<CloudflareBindings> = {
        JWT_SECRET: 'test-secret',
        CHARACTER_LOGS: mockKV
    };

    beforeEach(() => {
        mockPrisma = {} as PrismaClient;
        mockUserService = new UserService(mockPrisma);
        mockLogger = new Logger(mockEnv.CHARACTER_LOGS!);

        spyOn(mockUserService, 'getUserByEmail');
        spyOn(mockLogger, 'log');

        authService = new AuthService(mockEnv as CloudflareBindings, mockPrisma);
        // @ts-ignore - для тестов игнорируем типы
        authService['userService'] = mockUserService;
        // @ts-ignore - для тестов игнорируем типы
        authService['logger'] = mockLogger;
    });

    describe('login', () => {
        test('should return null when user is not found', async () => {
            // Arrange
            const email = 'nonexistent@example.com';
            const password = 'password123';
            mockUserService.getUserByEmail.mockImplementation(async () => null);

            // Act
            const result = await authService.login(email, password);

            // Assert
            expect(result).toBeNull();
            expect(mockUserService.getUserByEmail.mock.calls.length).toBe(1);
            expect(mockUserService.getUserByEmail.mock.calls[0][0]).toBe(email);
        });

        test('should return null when password is invalid', async () => {
            // Arrange
            const email = 'test@example.com';
            const password = 'wrongpassword';
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'correctpassword',
                name: 'Test User',
                type: UserType.User
            };

            mockUserService.getUserByEmail.mockImplementation(async () => mockUser);

            // Act
            const result = await authService.login(email, password);

            // Assert
            expect(result).toBeNull();
            expect(mockUserService.getUserByEmail.mock.calls.length).toBe(1);
            expect(mockUserService.getUserByEmail.mock.calls[0][0]).toBe(email);
        });

        test('should return JWT token when credentials are valid', async () => {
            // Arrange
            const email = 'test@example.com';
            const password = 'correctpassword';
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'correctpassword',
                name: 'Test User',
                type: UserType.User
            };

            mockUserService.getUserByEmail.mockImplementation(async () => mockUser);

            // Act
            const result = await authService.login(email, password);

            // Assert
            expect(result).toBeTruthy();
            expect(typeof result).toBe('string');
            expect(mockUserService.getUserByEmail.mock.calls.length).toBe(1);
            expect(mockUserService.getUserByEmail.mock.calls[0][0]).toBe(email);
        });
    });
}); 