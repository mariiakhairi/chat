import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import FileUploadZone from '@/components/FileUploadZone';
import FilePreviewCard from '@/components/FilePreviewCard';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import EmptyState from '@/components/EmptyState';
import LoadingIndicator from '@/components/LoadingIndicator';
import ThemeToggle from '@/components/ThemeToggle';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Message, UploadedDocument } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

export default function Home() {
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: documentsData } = useQuery({
    queryKey: ['/api/documents'],
  });

  const documents = (documentsData as { documents: UploadedDocument[] } | undefined)?.documents || [];

  const { data: messagesData } = useQuery({
    queryKey: ['/api/messages'],
    enabled: documents.length > 0,
  });
  const serverMessages = (messagesData as { messages: Message[] } | undefined)?.messages || [];
  const allMessages = [...serverMessages, ...optimisticMessages];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, isAiTyping]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({
        title: "Document uploaded",
        description: `${data.document.name} is ready for questions`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message,
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/chat', { question });
      return response.json();
    },
    onSuccess: () => {
      setOptimisticMessages([]);
      setIsAiTyping(false);
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error: Error) => {
      setOptimisticMessages([]);
      setIsAiTyping(false);
      toast({
        variant: "destructive",
        title: "Failed to get answer",
        description: error.message || "Please try again",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/documents/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/documents');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const handleFileSelect = async (file: File) => {
    const MAX_SIZE = 1024 * 1024;
    
    if (file.size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 1MB",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleRemoveDocument = (id: string) => {
    deleteDocumentMutation.mutate(id);
  };

  const handleClearAll = () => {
    clearAllMutation.mutate();
  };

  const handleSendMessage = (content: string) => {
    if (documents.length === 0) return;

    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setOptimisticMessages([optimisticUserMessage]);
    setIsAiTyping(true);
    chatMutation.mutate(content);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Document Chat</h1>
          <p className="text-sm text-muted-foreground">AI-powered document Q&A</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-hidden">
        {documents.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
              <FileUploadZone 
                onFileSelect={handleFileSelect} 
                disabled={uploadMutation.isPending}
              />
              {uploadMutation.isPending && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">Uploading document...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="border-b px-6 py-3 bg-muted/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{documents.length}</span>
                    <span className="hidden sm:inline">document{documents.length !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-background rounded-md border text-xs whitespace-nowrap"
                      >
                        <span className="truncate max-w-[120px]">{doc.name}</span>
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <FileUploadZone 
                    onFileSelect={handleFileSelect} 
                    disabled={uploadMutation.isPending}
                    compact
                  />
                  
                  {documents.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto p-6">
                {allMessages.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-6">
                    {allMessages.map((message, index) => (
                      <ChatMessage key={message.id} message={message} index={index} />
                    ))}
                    {isAiTyping && <LoadingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            <ChatInput
              onSend={handleSendMessage}
              disabled={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
