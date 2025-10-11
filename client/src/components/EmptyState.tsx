import { MessageSquare } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="rounded-full bg-muted p-6 mb-4">
        <MessageSquare className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
      <p className="text-muted-foreground max-w-md">
        Ask any question about your document and get instant AI-powered answers
      </p>
    </div>
  );
}
