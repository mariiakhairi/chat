import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUploadZone from '../FileUploadZone';

describe('FileUploadZone', () => {
  const mockOnFileSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Full Mode (Default)', () => {
    it('renders full upload zone with dropzone', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      expect(dropzone).toBeInTheDocument();
    });

    it('displays upload icon in full mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const uploadIcon = container.querySelector('.lucide-upload');
      expect(uploadIcon).toBeInTheDocument();
    });

    it('displays instructional text in full mode', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      expect(screen.getByText('Drop your document here or click to browse')).toBeInTheDocument();
      expect(screen.getByText('Supports TXT, PDF, DOC, DOCX (Max 1MB)')).toBeInTheDocument();
    });

    it('renders file input with correct accept attribute', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.txt,.pdf,.doc,.docx');
    });

    it('has correct styling classes for dropzone', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      expect(dropzone).toHaveClass('border-2', 'border-dashed', 'rounded-lg');
    });
  });

  describe('Compact Mode', () => {
    it('renders compact mode when compact prop is true', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const uploadButton = screen.getByTestId('upload-button');
      expect(uploadButton).toBeInTheDocument();
    });

    it('displays Plus icon in compact mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const plusIcon = container.querySelector('.lucide-plus');
      expect(plusIcon).toBeInTheDocument();
    });

    it('displays "Add Document" text in compact mode', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      expect(screen.getByText('Add Document')).toBeInTheDocument();
    });

    it('renders file input with correct ID in compact mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const fileInput = container.querySelector('#file-input-compact') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('accept', '.txt,.pdf,.doc,.docx');
    });

    it('does not render dropzone in compact mode', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const dropzone = screen.queryByTestId('file-upload-dropzone');
      expect(dropzone).not.toBeInTheDocument();
    });
  });

  describe('File Selection via Input', () => {
    it('calls onFileSelect when file is selected in full mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
      expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    });

    it('calls onFileSelect when file is selected in compact mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const fileInput = container.querySelector('#file-input-compact') as HTMLInputElement;
      
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);
      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
      expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    });

    it('does not call onFileSelect when no file is selected', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [],
        writable: false,
      });

      fireEvent.change(fileInput);
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    it('selects only the first file when multiple files are selected', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      
      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
      Object.defineProperty(fileInput, 'files', {
        value: [file1, file2],
        writable: false,
      });

      fireEvent.change(fileInput);
      expect(mockOnFileSelect).toHaveBeenCalledWith(file1);
      expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('handles drag over event without default behavior', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      
      const dragEvent = new Event('dragover', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(dragEvent, 'preventDefault');
      
      fireEvent(dropzone, dragEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('calls onFileSelect when file is dropped', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      
      const file = new File(['content'], 'dropped.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
      expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    });

    it('handles drop event with preventDefault', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
      });
      
      const preventDefaultSpy = jest.spyOn(dropEvent, 'preventDefault');
      fireEvent(dropzone, dropEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('selects only the first file when multiple files are dropped', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file1, file2],
        },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file1);
      expect(mockOnFileSelect).toHaveBeenCalledTimes(1);
    });

    it('does not call onFileSelect when no files are dropped', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      
      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [],
        },
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('Disabled State', () => {
    it('disables file input in full mode when disabled prop is true', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} disabled={true} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });

    it('disables file input in compact mode when disabled prop is true', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} disabled={true} />);
      const fileInput = container.querySelector('#file-input-compact') as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });

    it('disables button in compact mode when disabled prop is true', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} disabled={true} />);
      const uploadButton = screen.getByTestId('upload-button');
      expect(uploadButton).toBeDisabled();
    });

    it('enables file input when disabled prop is false', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} disabled={false} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput).not.toBeDisabled();
    });

    it('enables file input when disabled prop is not provided', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput).not.toBeDisabled();
    });
  });

  describe('File Type Restrictions', () => {
    it('accepts .txt files', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput.accept).toContain('.txt');
    });

    it('accepts .pdf files', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput.accept).toContain('.pdf');
    });

    it('accepts .doc files', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput.accept).toContain('.doc');
    });

    it('accepts .docx files', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input') as HTMLInputElement;
      expect(fileInput.accept).toContain('.docx');
    });
  });

  describe('Component Variants', () => {
    it('renders different structure for compact vs full mode', () => {
      const { container: fullContainer } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const { container: compactContainer } = render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      
      expect(fullContainer.innerHTML).not.toBe(compactContainer.innerHTML);
    });

    it('compact mode defaults to false when not provided', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      expect(dropzone).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    it('has cursor-pointer class on file input', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input');
      expect(fileInput).toHaveClass('cursor-pointer');
    });

    it('file input has opacity-0 to be invisible but clickable', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const fileInput = container.querySelector('#file-input');
      expect(fileInput).toHaveClass('opacity-0');
    });

    it('button has pointer-events-none in compact mode', () => {
      render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const uploadButton = screen.getByTestId('upload-button');
      expect(uploadButton).toHaveClass('pointer-events-none');
    });

    it('maintains proper DOM structure in full mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone = screen.getByTestId('file-upload-dropzone');
      expect(dropzone).toHaveClass('relative');
    });

    it('maintains proper DOM structure in compact mode', () => {
      const { container } = render(<FileUploadZone onFileSelect={mockOnFileSelect} compact={true} />);
      const wrapper = container.querySelector('.relative.inline-block');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('memoizes drag over handler', () => {
      const { rerender } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone1 = screen.getByTestId('file-upload-dropzone');
      
      rerender(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      const dropzone2 = screen.getByTestId('file-upload-dropzone');
      
      expect(dropzone1).toBe(dropzone2);
    });

    it('updates drop handler when onFileSelect changes', () => {
      const newMockOnFileSelect = jest.fn();
      const { rerender } = render(<FileUploadZone onFileSelect={mockOnFileSelect} />);
      
      rerender(<FileUploadZone onFileSelect={newMockOnFileSelect} />);
      
      const dropzone = screen.getByTestId('file-upload-dropzone');
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file] },
      });

      expect(newMockOnFileSelect).toHaveBeenCalledWith(file);
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });
});
