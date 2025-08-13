import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let service: AppService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return hello message', () => {
    expect(service.getHello()).toBe('Ink & Keys Backend API is running!');
  });

  it('should return healthy status when database is connected', async () => {
    mockPrismaService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    const result = await service.getHealth();

    expect(result.status).toBe('healthy');
    expect(result.database).toBe('connected');
    expect(result.timestamp).toBeDefined();
  });

  it('should return unhealthy status when database is disconnected', async () => {
    const error = new Error('Database connection failed');
    mockPrismaService.$queryRaw.mockRejectedValue(error);

    const result = await service.getHealth();

    expect(result.status).toBe('unhealthy');
    expect(result.database).toBe('disconnected');
    expect(result.error).toBe('Database connection failed');
    expect(result.timestamp).toBeDefined();
  });
});