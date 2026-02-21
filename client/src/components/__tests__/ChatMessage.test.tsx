import React from 'react';
import { render, screen } from '@testing-library/react';
import ChatMessage from '../ChatMessage';
import type { Message } from '@shared/schema';

describe('ChatMessage', () => {
  const mockUserMessage: Message = {
    id: '1',
    role: 'user',
    content: 'Hello, this is a user message',
    timestamp: new Date('2024-01-15T10:30:00'),
  };

  const mockAiMessage: Message = {
    id: '2',
    role: 'ai',
    content: 'Hello, this is an AI response',
    timestamp: new Date('2024-01-15T10:30:30'),
  };

  describe('User Messages', () => {
    it('renders user message content correctly', () => {
      render(<ChatMessage message={mockUserMessage} index={0} />);
      expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument();
    });

    it('displays User icon for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} index={0} />);
      // Check for User icon by looking for the specific SVG structure
      const userIcon = container.querySelector('.lucide-user');
      expect(userIcon).toBeInTheDocument();
    });

    it('applies correct styling for user messages', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} index={0} />);
      const messageContainer = container.querySelector('.flex-row-reverse');
      expect(messageContainer).toBeInTheDocument();
    });

    it('applies primary background color to user avatar', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} index={0} />);
      const avatar = container.querySelector('.bg-primary');
      expect(avatar).toBeInTheDocument();
    });

    it('aligns user messages to the right', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} index={0} />);
      const messageContent = container.querySelector('.items-end');
      expect(messageContent).toBeInTheDocument();
    });
  });

  describe('AI Messages', () => {
    it('renders AI message content correctly', () => {
      render(<ChatMessage message={mockAiMessage} index={0} />);
      expect(screen.getByText('Hello, this is an AI response')).toBeInTheDocument();
    });

    it('displays Bot icon for AI messages', () => {
      const { container } = render(<ChatMessage message={mockAiMessage} index={0} />);
      // Check for Bot icon by looking for the specific SVG structure
      const botIcon = container.querySelector('.lucide-bot');
      expect(botIcon).toBeInTheDocument();
    });

    it('applies correct styling for AI messages', () => {
      const { container } = render(<ChatMessage message={mockAiMessage} index={0} />);
      const messageContainer = container.querySelector('.flex-row');
      expect(messageContainer).toBeInTheDocument();
    });

    it('applies accent background color to AI avatar', () => {
      const { container } = render(<ChatMessage message={mockAiMessage} index={0} />);
      const avatar = container.querySelector('.bg-accent');
      expect(avatar).toBeInTheDocument();
    });

    it('aligns AI messages to the left', () => {
      const { container } = render(<ChatMessage message={mockAiMessage} index={0} />);
      const messageContent = container.querySelector('.items-start');
      expect(messageContent).toBeInTheDocument();
    });
  });

  describe('Timestamp', () => {
    it('displays timestamp for user messages', () => {
      render(<ChatMessage message={mockUserMessage} index={0} />);
      // Timestamp format is HH:MM (24-hour)
      const timeString = screen.getByText(/\d{1,2}:\d{2}/);
      expect(timeString).toBeInTheDocument();
    });

    it('displays timestamp for AI messages', () => {
      render(<ChatMessage message={mockAiMessage} index={0} />);
      const timeString = screen.getByText(/\d{1,2}:\d{2}/);
      expect(timeString).toBeInTheDocument();
    });

    it('formats timestamp correctly', () => {
      const message: Message = {
        id: '3',
        role: 'user',
        content: 'Test message',
        timestamp: new Date('2024-01-15T14:30:00'),
      };
      render(<ChatMessage message={message} index={0} />);
      // The exact format depends on locale, but should contain time
      const timeElement = screen.getByText(/\d{1,2}:\d{2}/);
      expect(timeElement).toHaveClass('text-xs');
      expect(timeElement).toHaveClass('text-muted-foreground');
    });
  });

  describe('Message Content', () => {
    it('handles multi-line content with whitespace preservation', () => {
      const multiLineMessage: Message = {
        id: '4',
        role: 'user',
        content: 'Line 1\nLine 2\nLine 3',
        timestamp: new Date(),
      };
      const { container } = render(<ChatMessage message={multiLineMessage} index={0} />);
      const contentElement = container.querySelector('.whitespace-pre-wrap');
      expect(contentElement).toBeInTheDocument();
      // Check that the class for preserving whitespace is applied
      expect(contentElement).toHaveClass('whitespace-pre-wrap');
      // Check that the text content includes the lines
      expect(contentElement?.textContent).toContain('Line 1');
      expect(contentElement?.textContent).toContain('Line 2');
      expect(contentElement?.textContent).toContain('Line 3');
    });

    it('handles long text with word breaking', () => {
      const longMessage: Message = {
        id: '5',
        role: 'ai',
        content: 'This is a very long message that should break words properly when it reaches the maximum width of the container',
        timestamp: new Date(),
      };
      const { container } = render(<ChatMessage message={longMessage} index={0} />);
      const contentElement = container.querySelector('.break-words');
      expect(contentElement).toBeInTheDocument();
    });

    it('handles empty content', () => {
      const emptyMessage: Message = {
        id: '6',
        role: 'user',
        content: '',
        timestamp: new Date(),
      };
      const { container } = render(<ChatMessage message={emptyMessage} index={0} />);
      const contentElement = container.querySelector('p');
      expect(contentElement).toHaveTextContent('');
    });

    it('handles special characters in content', () => {
      const specialMessage: Message = {
        id: '7',
        role: 'ai',
        content: 'Special chars: <>&"\'',
        timestamp: new Date(),
      };
      render(<ChatMessage message={specialMessage} index={0} />);
      expect(screen.getByText('Special chars: <>&"\'')).toBeInTheDocument();
    });
  });

  describe('Index Prop', () => {
    it('renders with different index values', () => {
      const { rerender } = render(<ChatMessage message={mockUserMessage} index={0} />);
      expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument();

      rerender(<ChatMessage message={mockUserMessage} index={5} />);
      expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('renders message content in a paragraph element', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} index={0} />);
      const paragraph = container.querySelector('p');
      expect(paragraph).toBeInTheDocument();
      expect(paragraph).toHaveClass('text-base');
    });

    it('maintains proper DOM structure', () => {
      const { container } = render(<ChatMessage message={mockUserMessage} index={0} />);
      const mainDiv = container.firstChild;
      expect(mainDiv).toHaveClass('flex', 'gap-4');
    });
  });
});
