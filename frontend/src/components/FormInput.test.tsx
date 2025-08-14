import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FormInput } from './FormInput'

describe('FormInput', () => {
  const defaultProps = {
    id: 'test-input',
    name: 'testInput',
    type: 'text',
    label: 'Test Input',
    value: '',
    onChange: vi.fn(),
  }

  it('should render input with label', () => {
    render(<FormInput {...defaultProps} />)
    
    expect(screen.getByLabelText('Test Input')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should show required indicator when required', () => {
    render(<FormInput {...defaultProps} required />)
    
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'This field is required'
    render(<FormInput {...defaultProps} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('should apply error styling when error exists', () => {
    render(<FormInput {...defaultProps} error="Error message" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-500')
  })

  it('should call onChange when input value changes', () => {
    const mockOnChange = vi.fn()
    render(<FormInput {...defaultProps} onChange={mockOnChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'new value' } })
    
    expect(mockOnChange).toHaveBeenCalledTimes(1)
  })

  it('should display placeholder text', () => {
    const placeholder = 'Enter your text here'
    render(<FormInput {...defaultProps} placeholder={placeholder} />)
    
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
  })
})