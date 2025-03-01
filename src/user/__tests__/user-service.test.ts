import { describe, expect, test, beforeEach, spyOn } from "bun:test";
import UserService from '../user-service';
import { PrismaClient, User } from '@prisma/client';
import { UserType } from '../constant';
import UserRepository from '../user-repository';

describe('UserService', () => {
    let userService: UserService;
    let mockPrisma: PrismaClient;
    let mockUserRepository: UserRepository;

    const mockUser: User = {
        id: '1',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        type: UserType.User,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    beforeEach(() => {
        mockPrisma = {} as PrismaClient;
        mockUserRepository = new UserRepository(mockPrisma);

        spyOn(mockUserRepository, 'findById');
        spyOn(mockUserRepository, 'findByEmail');

        userService = new UserService(mockPrisma);
        // @ts-ignore - для тестов игнорируем типы
        userService['userRepository'] = mockUserRepository;
    });

    describe('getUserById', () => {
        test('should return user when found', async () => {
            // Arrange
            mockUserRepository.findById.mockImplementation(async () => mockUser);

            // Act
            const result = await userService.getUserById('1');

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockUserRepository.findById.mock.calls.length).toBe(1);
            expect(mockUserRepository.findById.mock.calls[0][0]).toBe('1');
        });

        test('should return null when user not found', async () => {
            // Arrange
            mockUserRepository.findById.mockImplementation(async () => null);

            // Act
            const result = await userService.getUserById('999');

            // Assert
            expect(result).toBeNull();
            expect(mockUserRepository.findById.mock.calls.length).toBe(1);
            expect(mockUserRepository.findById.mock.calls[0][0]).toBe('999');
        });
    });

    describe('getUserByEmail', () => {
        test('should return user when found', async () => {
            // Arrange
            mockUserRepository.findByEmail.mockImplementation(async () => mockUser);

            // Act
            const result = await userService.getUserByEmail('test@example.com');

            // Assert
            expect(result).toEqual(mockUser);
            expect(mockUserRepository.findByEmail.mock.calls.length).toBe(1);
            expect(mockUserRepository.findByEmail.mock.calls[0][0]).toBe('test@example.com');
        });

        test('should return null when user not found', async () => {
            // Arrange
            mockUserRepository.findByEmail.mockImplementation(async () => null);

            // Act
            const result = await userService.getUserByEmail('nonexistent@example.com');

            // Assert
            expect(result).toBeNull();
            expect(mockUserRepository.findByEmail.mock.calls.length).toBe(1);
            expect(mockUserRepository.findByEmail.mock.calls[0][0]).toBe('nonexistent@example.com');
        });
    });
}); 