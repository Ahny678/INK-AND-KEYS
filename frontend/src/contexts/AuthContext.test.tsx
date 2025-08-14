import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { authService } from '@/services'

// Mock the auth service
vi.mock('@/services', () => ({
  authService: {
    getToken: vi.fn(),
    getProfile: vi.fn(),
    removeToken: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    setToken: vi.fn(),
  },
}))

// Test component that uses the auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="user">{user?.email || 'no user'}</div>
      <button 
        data-testid="login-btn" 
        onClick={() => login('test@example.com', 'password')}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with no user when no token exists', async () => {
    vi.mocked(authService.getToken).mockReturnValue(null)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('no user')
    })
  })

  it('should initialize with user when valid token exists', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com', 
      createdAt: '2023-01-01', 
      updatedAt: '2023-01-01' 
    }
    
    vi.mocked(authService.getToken).mockReturnValue('valid-token')
    vi.mocked(authService.getProfile).mockResolvedValue(mockUser)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should handle invalid token by removing it', async () => {
    vi.mocked(authService.getToken).mockReturnValue('invalid-token')
    vi.mocked(authService.getProfile).mockRejectedValue(new Error('Invalid token'))

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(authService.removeToken).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })

  it('should handle login successfully', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com', 
      createdAt: '2023-01-01', 
      updatedAt: '2023-01-01' 
    }
    const mockResponse = { user: mockUser, token: 'new-token' }

    vi.mocked(authService.getToken).mockReturnValue(null)
    vi.mocked(authService.login).mockResolvedValue(mockResponse)

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })

    fireEvent.click(screen.getByTestId('login-btn'))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
      expect(authService.setToken).toHaveBeenCalledWith('new-token')
    })
  })

  it('should handle logout successfully', async () => {
    const mockUser = { 
      id: '1', 
      email: 'test@example.com', 
      createdAt: '2023-01-01', 
      updatedAt: '2023-01-01' 
    }
    
    vi.mocked(authService.getToken).mockReturnValue('valid-token')
    vi.mocked(authService.getProfile).mockResolvedValue(mockUser)
    vi.mocked(authService.logout).mockResolvedValue()

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    fireEvent.click(screen.getByTestId('logout-btn'))

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalled()
      expect(authService.removeToken).toHaveBeenCalled()
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })
})