import { useCallback } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  compact?: boolean;
}

export default function FileUploadZone({ onFileSelect, disabled, compact = false }: FileUploadZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  if (compact) {
    return (
      <div className="relative inline-block">
        <input
          type="file"
          id="file-input-compact"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileInput}
          accept=".txt,.pdf,.doc,.docx"
          disabled={disabled}
        />
        <Button
          data-testid="upload-button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="pointer-events-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>
    );
  }

  return (
    <div
      data-testid="file-upload-dropzone"
      className="relative border-2 border-dashed rounded-lg p-8 text-center hover-elevate transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-input"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
        accept=".txt,.pdf,.doc,.docx"
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className="rounded-full bg-primary/10 p-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <p className="text-base font-medium">
            Drop your document here or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports TXT, PDF, DOC, DOCX (Max 1MB)
          </p>
        </div>
      </div>
    </div>
  );
}
