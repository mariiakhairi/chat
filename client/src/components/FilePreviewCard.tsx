import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FilePreviewCardProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

export default function FilePreviewCard({ fileName, fileSize, onRemove }: FilePreviewCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card data-testid="file-preview-card" className="p-4">
      <div className="flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-3">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{fileName}</p>
          <p className="text-sm text-muted-foreground">{formatFileSize(fileSize)}</p>
        </div>
        
        <Button
          data-testid="remove-file-button"
          size="icon"
          variant="ghost"
          onClick={onRemove}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
