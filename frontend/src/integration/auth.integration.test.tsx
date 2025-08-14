import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts'
import { Button } from '@/components'
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

// Simple test component that demonstrates auth integration
const AuthTestComponent = () => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false)

    const handleLogin = async () => {
        try {
            await authService.login({ email: 'test@example.com', password: 'password' })
            setIsLoggedIn(true)
        } catch (error) {
            console.error('Login failed')
        }
    }

    const handleLogout = async () => {
        try {
            await authService.logout()
            setIsLoggedIn(false)
        } catch (error) {
            console.error('Logout failed')
        }
    }

    return (
        <div>
            <div data-testid="auth-status">
                {isLoggedIn ? 'Logged In' : 'Logged Out'}
            </div>
            {!isLoggedIn ? (
                <Button onClick={handleLogin} data-testid="login-btn">
                    Login
                </Button>
            ) : (
                <Button onClick={handleLogout} data-testid="logout-btn">
                    Logout
                </Button>
            )}
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

describe('Authentication Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(authService.getToken).mockReturnValue(null)
    })

    it('should handle complete login/logout flow', async () => {
        const mockUser = {
            id: '1',
            email: 'test@example.com',
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01'
        }
        const mockAuthResponse = { user: mockUser, token: 'auth-token' }

        vi.mocked(authService.login).mockResolvedValue(mockAuthResponse)
        vi.mocked(authService.logout).mockResolvedValue()

        renderWithProviders(<AuthTestComponent />)

        // Initially logged out
        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
            expect(screen.getByTestId('login-btn')).toBeInTheDocument()
        })

        // Click login
        fireEvent.click(screen.getByTestId('login-btn'))

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password'
            })
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In')
            expect(screen.getByTestId('logout-btn')).toBeInTheDocument()
        })

        // Click logout
        fireEvent.click(screen.getByTestId('logout-btn'))

        await waitFor(() => {
            expect(authService.logout).toHaveBeenCalled()
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
            expect(screen.getByTestId('login-btn')).toBeInTheDocument()
        })
    })

    it('should handle authentication errors gracefully', async () => {
        vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'))

        renderWithProviders(<AuthTestComponent />)

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
        })

        fireEvent.click(screen.getByTestId('login-btn'))

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalled()
            // Should remain logged out on error
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out')
        })
    })
})