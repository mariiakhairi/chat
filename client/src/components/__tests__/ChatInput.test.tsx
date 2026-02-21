import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '../ChatInput';

describe('ChatInput Component', () => {
  it('renders correctly with default props', () => {
    render(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByPlaceholderText('Ask a question about your document...')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  it('enables the send button when there is input', () => {
    render(<ChatInput onSend={jest.fn()} />);
    const textarea = screen.getByPlaceholderText('Ask a question about your document...');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(sendButton).not.toBeDisabled();
  });

  it('calls onSend and clears input on send button click', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask a question about your document...');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Hello');
    expect(textarea).toHaveValue('');
  });

  it('handles Enter key press to send message', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask a question about your document...');

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(mockOnSend).toHaveBeenCalledWith('Hello');
    expect(textarea).toHaveValue('');
  });

  it('does not send message on Enter key press with Shift', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask a question about your document...');

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello');
  });

  it('does not send message when disabled', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} disabled={true} />);

    const textarea = screen.getByPlaceholderText('Ask a question about your document...');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(textarea, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello');
  });

  it('does not send whitespace-only messages', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask a question about your document...');
    const sendButton = screen.getByTestId('send-button');

    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('   ');
  });

  it('does not send whitespace-only message on Enter key press', () => {
    const mockOnSend = jest.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const textarea = screen.getByPlaceholderText('Ask a question about your document...');

    fireEvent.change(textarea, { target: { value: '  \n  ' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea).toHaveValue('  \n  ');
  });
});