import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { v2 as cloudinary } from 'cloudinary';

export interface GeneratedImage {
  url: string;
  publicId: string;
}

export interface HuggingFaceImageResponse {
  images: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

@Injectable()
export class AIImageService {
  private readonly logger = new Logger(AIImageService.name);
  private readonly huggingFaceEndpoint = 'https://router.huggingface.co/fal-ai/fal-ai/qwen-image';
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000; // 2 seconds

  constructor(private configService: ConfigService) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_USER'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });

    this.validateConfiguration();
  }

  private validateConfiguration(): void {
    const requiredEnvVars = ['HF_TOKEN', 'CLOUDINARY_USER', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missingVars = requiredEnvVars.filter(varName => !this.configService.get<string>(varName));
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }

  /**
   * Validates and sanitizes the text prompt for image generation
   */
  private validatePrompt(prompt: string): string {
    if (!prompt || typeof prompt !== 'string') {
      throw new BadRequestException('Prompt must be a non-empty string');
    }

    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      throw new BadRequestException('Prompt cannot be empty');
    }

    if (trimmedPrompt.length > 1000) {
      throw new BadRequestException('Prompt must be less than 1000 characters');
    }

    // Basic sanitization - remove potentially harmful content
    const sanitizedPrompt = trimmedPrompt
      .replace(/[<>]/g, '') // Remove HTML-like tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, ''); // Remove data: protocol

    return sanitizedPrompt;
  }

  /**
   * Generates an image using Hugging Face Qwen-Image API
   */
  async generateImage(prompt: string): Promise<Buffer> {
    const sanitizedPrompt = this.validatePrompt(prompt);
    const hfToken = this.configService.get<string>('HF_TOKEN');

    this.logger.log(`Generating image for prompt: "${sanitizedPrompt.substring(0, 50)}..."`);

    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response: AxiosResponse<HuggingFaceImageResponse> = await axios.post(
          this.huggingFaceEndpoint,
          {
            prompt: sanitizedPrompt,
            sync_mode: true,
            image_size: 'square_hd', // 1024x1024 for book covers
            num_inference_steps: 28,
            guidance_scale: 3.5,
          },
          {
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000, // 60 second timeout
          }
        );

        if (!response.data?.images?.[0]?.url) {
          throw new Error('Invalid response from Hugging Face API - no image URL returned');
        }

        const imageUrl = response.data.images[0].url;
        this.logger.log(`Successfully generated image, downloading from: ${imageUrl}`);

        // Download the generated image
        const imageResponse = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000, // 30 second timeout for image download
        });

        return Buffer.from(imageResponse.data);

      } catch (error) {
        lastError = error;
        this.logger.warn(`Image generation attempt ${attempt} failed:`, error.message);

        if (attempt < this.maxRetries) {
          this.logger.log(`Retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
        }
      }
    }

    this.logger.error(`Failed to generate image after ${this.maxRetries} attempts:`, lastError.message);
    throw new InternalServerErrorException(`Failed to generate image: ${lastError.message}`);
  }

  /**
   * Uploads an image buffer to Cloudinary
   */
  async uploadToCloudinary(imageBuffer: Buffer, folder: string): Promise<GeneratedImage> {
    try {
      this.logger.log(`Uploading image to Cloudinary folder: ${folder}`);

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: 'image',
            format: 'jpg',
            quality: 'auto:good',
            transformation: [
              { width: 1024, height: 1024, crop: 'fill', gravity: 'center' }
            ]
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(imageBuffer);
      });

      const uploadResult = result as any;
      
      this.logger.log(`Successfully uploaded image to Cloudinary: ${uploadResult.public_id}`);

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };

    } catch (error) {
      this.logger.error('Failed to upload image to Cloudinary:', error.message);
      throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Deletes an image from Cloudinary using its public ID
   */
  async deleteFromCloudinary(publicId: string): Promise<void> {
    if (!publicId) {
      this.logger.warn('Attempted to delete image with empty public ID');
      return;
    }

    try {
      this.logger.log(`Deleting image from Cloudinary: ${publicId}`);

      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        this.logger.log(`Successfully deleted image: ${publicId}`);
      } else {
        this.logger.warn(`Image deletion result: ${result.result} for ${publicId}`);
      }

    } catch (error) {
      this.logger.error(`Failed to delete image ${publicId} from Cloudinary:`, error.message);
      // Don't throw error for deletion failures to avoid breaking the main flow
    }
  }

  /**
   * Generates a cover image and uploads it to Cloudinary
   */
  async generateCoverImage(prompt: string, type: 'book' | 'chapter'): Promise<GeneratedImage> {
    this.logger.log(`Generating ${type} cover image`);

    // Enhance the prompt for better book/chapter cover generation
    const enhancedPrompt = this.enhancePromptForCover(prompt, type);

    // Generate the image
    const imageBuffer = await this.generateImage(enhancedPrompt);

    // Upload to Cloudinary in appropriate folder
    const folder = `ink-and-keys/${type}-covers`;
    const result = await this.uploadToCloudinary(imageBuffer, folder);

    this.logger.log(`Successfully generated and uploaded ${type} cover image: ${result.publicId}`);

    return result;
  }

  /**
   * Enhances the user prompt to create better book/chapter covers
   */
  private enhancePromptForCover(userPrompt: string, type: 'book' | 'chapter'): string {
    const baseEnhancement = 'professional book cover design, elegant typography space, high quality, artistic, ';
    const typeSpecific = type === 'book' 
      ? 'book cover illustration, title area, ' 
      : 'chapter illustration, decorative border, ';
    
    return baseEnhancement + typeSpecific + userPrompt;
  }

  /**
   * Utility method to add delay between retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}