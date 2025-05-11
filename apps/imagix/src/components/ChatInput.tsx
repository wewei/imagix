import React, { FormEvent } from 'react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: FormEvent) => Promise<void>;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  input, 
  setInput, 
  isLoading, 
  onSubmit 
}) => {
  return (
    <div className="border-t bg-white dark:bg-gray-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};