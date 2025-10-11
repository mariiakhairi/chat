import ChatInput from '../ChatInput';

export default function ChatInputExample() {
  return (
    <ChatInput
      onSend={(message) => console.log('Message sent:', message)}
    />
  );
}
