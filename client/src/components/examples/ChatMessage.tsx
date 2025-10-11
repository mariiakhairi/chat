import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  const userMessage = {
    id: '1',
    role: 'user' as const,
    content: 'What is the main topic of this document?',
    timestamp: new Date(),
  };

  const aiMessage = {
    id: '2',
    role: 'ai' as const,
    content: 'Based on the document, the main topic discusses artificial intelligence and its applications in modern software development.',
    timestamp: new Date(),
  };

  return (
    <div className="space-y-4 p-4">
      <ChatMessage message={userMessage} index={0} />
      <ChatMessage message={aiMessage} index={1} />
    </div>
  );
}
