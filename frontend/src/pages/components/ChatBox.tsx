import { useEffect, useRef } from "react";

interface Message {
  type: string;
  username?: string;
  message: string;
}

interface ChatBoxProps {
  messages: Message[];
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  handleMessageSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const ChatBox = ({
  messages,
  currentMessage,
  setCurrentMessage,
  handleMessageSubmit,
}: ChatBoxProps) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-64 bg-white rounded shadow flex flex-col">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-2 text-sm"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-1 ${
              msg.type === "system"
                ? "text-gray-500 italic"
                : msg.type === "guess"
                ? "text-green-600 font-medium"
                : ""
            }`}
          >
            {msg.type !== "system" && (
              <span className="font-bold mr-1">{msg.username}:</span>
            )}
            {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={handleMessageSubmit} className="p-2 border-t">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          placeholder="Type your guess here..."
          className="w-full p-2 border rounded text-sm"
        />
      </form>
    </div>
  );
};

export default ChatBox;
