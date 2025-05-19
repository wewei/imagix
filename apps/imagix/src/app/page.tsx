"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessages } from "@/components/ChatMessages";
import { ChatInput } from "@/components/ChatInput";
import { Message, Chunk } from "@/agent/types";
import { makeSSEAgent } from "@/agent/SSEAgent";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const agent = useRef(makeSSEAgent());
  // Auto-scroll to the bottom of the messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup any existing SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Close any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create temporary message for streaming response
      const aiMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Setup SSE connection using the agent
      const messageGenerator = agent.current(input, {});
      
      // Start processing the stream
      let isDone = false;
      
      while (!isDone) {
        const { value, done } = await messageGenerator.next();
        
        if (done) {
          isDone = true;
          continue;
        }
        
        // Update the streaming message
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content += value.content || '';
          }
          
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error from SSE Agent:", error);
      
      // Replace the assistant message with an error if it's empty
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant' && !lastMessage.content) {
          const newMessages = [...prev.slice(0, -1)];
          newMessages.push({
            role: 'assistant',
            content: "Sorry, I couldn't process your request. Please try again.",
            timestamp: Date.now()
          });
          return newMessages;
        }
        
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ChatHeader />
      <ChatMessages 
        messages={messages} 
        isLoading={isLoading} 
        messagesEndRef={messagesEndRef} 
      />
      <ChatInput 
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
