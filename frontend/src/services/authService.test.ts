import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './authService'
import { api } from './api'

// Mock the api module
vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Clear localStorage
    localStorage.clear()
  })

  describe('token management', () => {
    it('should set and get token from localStorage', () => {
      const token = 'test-token'
      
      authService.setToken(token)
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', token)
      
      vi.mocked(localStorage.getItem).mockReturnValue(token)
      expect(authService.getToken()).toBe(token)
    })

    it('should remove token from localStorage', () => {
      authService.removeToken()
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('should return null when no token exists', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      expect(authService.getToken()).toBeNull()
    })
  })

  describe('authentication methods', () => {
    it('should login successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password' }
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
          token: 'auth-token'
        }
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await authService.login(credentials)

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result).toEqual(mockResponse.data)
    })

    it('should register successfully', async () => {
      const userData = { 
        email: 'test@example.com', 
        password: 'password', 
        confirmPassword: 'password' 
      }
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
          token: 'auth-token'
        }
      }

      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await authService.register(userData)

      // Should only send email and password to backend
      expect(api.post).toHaveBeenCalledWith('/auth/register', { 
        email: 'test@example.com', 
        password: 'password' 
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('should logout successfully', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await authService.logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token')
    })

    it('should get profile successfully', async () => {
      const mockUser = { 
        id: '1', 
        email: 'test@example.com', 
        createdAt: '2023-01-01', 
        updatedAt: '2023-01-01' 
      }
      const mockResponse = { data: mockUser }

      vi.mocked(api.get).mockResolvedValue(mockResponse)

      const result = await authService.getProfile()

      expect(api.get).toHaveBeenCalledWith('/auth/profile')
      expect(result).toEqual(mockUser)
    })
  })
})