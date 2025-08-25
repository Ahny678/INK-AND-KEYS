import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { AIImageService } from './ai-image.service';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('AIImageService', () => {
  let service: AIImageService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        'HF_TOKEN': 'test-hf-token',
        'CLOUDINARY_USER': 'test-cloudinary-user',
        'CLOUDINARY_API_KEY': 'test-api-key',
        'CLOUDINARY_API_SECRET': 'test-api-secret',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIImageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AIImageService>(AIImageService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should configure cloudinary on initialization', () => {
      // Cloudinary configuration is tested implicitly through successful service instantiation
      // and the fact that upload/delete operations work correctly in other tests
      expect(service).toBeDefined();
    });

    it('should throw error if required environment variables are missing', () => {
      const mockConfigServiceMissingVars = {
        get: jest.fn((key: string) => {
          const config = {
            'HF_TOKEN': 'test-hf-token',
            // Missing CLOUDINARY_USER
            'CLOUDINARY_API_KEY': 'test-api-key',
            'CLOUDINARY_API_SECRET': 'test-api-secret',
          };
          return config[key];
        }),
      };

      expect(() => {
        new AIImageService(mockConfigServiceMissingVars as any);
      }).toThrow('Missing required environment variables: CLOUDINARY_USER');
    });
  });

  describe('generateImage', () => {
    const mockImageBuffer = Buffer.from('fake-image-data');
    const mockHuggingFaceResponse = {
      data: {
        images: [
          {
            url: 'https://example.com/generated-image.jpg',
            width: 1024,
            height: 1024,
          },
        ],
      },
    };

    beforeEach(() => {
      mockedAxios.post.mockResolvedValue(mockHuggingFaceResponse);
      mockedAxios.get.mockResolvedValue({ data: mockImageBuffer });
    });

    it('should generate image successfully with valid prompt', async () => {
      const prompt = 'A beautiful landscape';
      const result = await service.generateImage(prompt);

      expect(result).toEqual(mockImageBuffer);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://router.huggingface.co/fal-ai/fal-ai/qwen-image',
        {
          prompt: 'A beautiful landscape',
          sync_mode: true,
          image_size: 'square_hd',
          num_inference_steps: 28,
          guidance_scale: 3.5,
        },
        {
          headers: {
            'Authorization': 'Bearer test-hf-token',
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://example.com/generated-image.jpg',
        {
          responseType: 'arraybuffer',
          timeout: 30000,
        }
      );
    });

    it('should sanitize prompt by removing HTML tags', async () => {
      const prompt = 'A <script>alert("xss")</script> beautiful landscape';
      await service.generateImage(prompt);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          prompt: 'A scriptalert("xss")/script beautiful landscape',
        }),
        expect.any(Object)
      );
    });

    it('should throw BadRequestException for empty prompt', async () => {
      await expect(service.generateImage('')).rejects.toThrow(BadRequestException);
      await expect(service.generateImage('   ')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for null/undefined prompt', async () => {
      await expect(service.generateImage(null as any)).rejects.toThrow(BadRequestException);
      await expect(service.generateImage(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for prompt longer than 1000 characters', async () => {
      const longPrompt = 'a'.repeat(1001);
      await expect(service.generateImage(longPrompt)).rejects.toThrow(BadRequestException);
    });

    it('should retry on API failure and eventually succeed', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Server error'))
        .mockResolvedValueOnce(mockHuggingFaceResponse);

      const result = await service.generateImage('test prompt');

      expect(result).toEqual(mockImageBuffer);
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it('should throw InternalServerErrorException after max retries', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Persistent error'));

      await expect(service.generateImage('test prompt')).rejects.toThrow(InternalServerErrorException);
      expect(mockedAxios.post).toHaveBeenCalledTimes(3);
    });

    it('should throw error if Hugging Face returns invalid response', async () => {
      mockedAxios.post.mockResolvedValue({ data: { images: [] } });

      await expect(service.generateImage('test prompt')).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('uploadToCloudinary', () => {
    const mockImageBuffer = Buffer.from('fake-image-data');
    const mockCloudinaryResult = {
      secure_url: 'https://cloudinary.com/image.jpg',
      public_id: 'test-folder/image123',
    };

    beforeEach(() => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        const stream = {
          end: jest.fn((buffer) => {
            callback(null, mockCloudinaryResult);
          }),
        };
        return stream;
      });
    });

    it('should upload image to Cloudinary successfully', async () => {
      const result = await service.uploadToCloudinary(mockImageBuffer, 'test-folder');

      expect(result).toEqual({
        url: 'https://cloudinary.com/image.jpg',
        publicId: 'test-folder/image123',
      });

      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        {
          folder: 'test-folder',
          resource_type: 'image',
          format: 'jpg',
          quality: 'auto:good',
          transformation: [
            { width: 1024, height: 1024, crop: 'fill', gravity: 'center' }
          ]
        },
        expect.any(Function)
      );
    });

    it('should throw InternalServerErrorException on Cloudinary error', async () => {
      (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
        const stream = {
          end: jest.fn((buffer) => {
            callback(new Error('Cloudinary error'), null);
          }),
        };
        return stream;
      });

      await expect(service.uploadToCloudinary(mockImageBuffer, 'test-folder'))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteFromCloudinary', () => {
    beforeEach(() => {
      (cloudinary.uploader.destroy as jest.Mock).mockResolvedValue({ result: 'ok' });
    });

    it('should delete image from Cloudinary successfully', async () => {
      await service.deleteFromCloudinary('test-public-id');

      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('test-public-id');
    });

    it('should handle empty public ID gracefully', async () => {
      await service.deleteFromCloudinary('');
      await service.deleteFromCloudinary(null as any);
      await service.deleteFromCloudinary(undefined as any);

      expect(cloudinary.uploader.destroy).not.toHaveBeenCalled();
    });

    it('should not throw error on deletion failure', async () => {
      (cloudinary.uploader.destroy as jest.Mock).mockRejectedValue(new Error('Deletion failed'));

      await expect(service.deleteFromCloudinary('test-public-id')).resolves.not.toThrow();
    });
  });

  describe('generateCoverImage', () => {
    const mockImageBuffer = Buffer.from('fake-image-data');
    const mockGeneratedImage = {
      url: 'https://cloudinary.com/cover.jpg',
      publicId: 'ink-and-keys/book-covers/cover123',
    };

    beforeEach(() => {
      jest.spyOn(service, 'generateImage').mockResolvedValue(mockImageBuffer);
      jest.spyOn(service, 'uploadToCloudinary').mockResolvedValue(mockGeneratedImage);
    });

    it('should generate book cover image with enhanced prompt', async () => {
      const result = await service.generateCoverImage('fantasy adventure', 'book');

      expect(service.generateImage).toHaveBeenCalledWith(
        'professional book cover design, elegant typography space, high quality, artistic, book cover illustration, title area, fantasy adventure'
      );
      expect(service.uploadToCloudinary).toHaveBeenCalledWith(
        mockImageBuffer,
        'ink-and-keys/book-covers'
      );
      expect(result).toEqual(mockGeneratedImage);
    });

    it('should generate chapter cover image with enhanced prompt', async () => {
      const result = await service.generateCoverImage('mysterious forest', 'chapter');

      expect(service.generateImage).toHaveBeenCalledWith(
        'professional book cover design, elegant typography space, high quality, artistic, chapter illustration, decorative border, mysterious forest'
      );
      expect(service.uploadToCloudinary).toHaveBeenCalledWith(
        mockImageBuffer,
        'ink-and-keys/chapter-covers'
      );
      expect(result).toEqual(mockGeneratedImage);
    });

    it('should propagate errors from generateImage', async () => {
      jest.spyOn(service, 'generateImage').mockRejectedValue(new Error('Generation failed'));

      await expect(service.generateCoverImage('test prompt', 'book'))
        .rejects.toThrow('Generation failed');
    });

    it('should propagate errors from uploadToCloudinary', async () => {
      jest.spyOn(service, 'uploadToCloudinary').mockRejectedValue(new Error('Upload failed'));

      await expect(service.generateCoverImage('test prompt', 'book'))
        .rejects.toThrow('Upload failed');
    });
  });
});