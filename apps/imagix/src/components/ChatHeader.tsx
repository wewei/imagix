import React from 'react';
import Image from "next/image";

export const ChatHeader: React.FC = () => {
  return (
    <header className="p-4 border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Imagix Chat</h1>
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={80}
          height={20}
          priority
        />
      </div>
    </header>
  );
};