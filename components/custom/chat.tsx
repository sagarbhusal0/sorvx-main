"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
}: {
  id: string;
  initialMessages: Array<Message>;
}) {
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: { id },
      initialMessages,
      maxSteps: 10,
      onFinish: () => {
        window.history.replaceState({}, "", `/chat/${id}`);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header 
      <header className="fixed top-0 left-0 w-full shadow-md p-2 sm:p-4 z-20">
        <h1 className="text-base sm:text-lg font-bold">Sorvx AI
</h1>
      </header>*/}

      {/* Main Container */}
      {/* 
          pt-14 (56px) for mobile and pt-16 (64px) for larger screens
          These values should roughly match the header’s height so content starts right below it.
      */}
      <main className="pt-14 sm:pt-16 pb-4">
        <div className="flex flex-col items-center px-2 sm:px-4">
          {/* Messages Container */}
          {/* h-[calc(100vh-64px)] ensures the container fills the viewport minus the header height */}
          <div
            ref={messagesContainerRef}
            className="flex flex-col gap-2 w-full max-w-md h-[calc(100vh-64px)] overflow-y-auto"
          >
            {messages.length === 0 && <Overview />}

            {messages.map((message) => (
              <PreviewMessage
                key={message.id}
                chatId={id}
                role={message.role}
                content={message.content}
                attachments={message.experimental_attachments}
                toolInvocations={message.toolInvocations}
              />
            ))}

            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>

          {/* Input Form */}
          <form
            className="flex flex-row gap-2 items-end w-full max-w-md mt-2"
            onSubmit={handleSubmit}
          >
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
            />
          </form>
        </div>
      </main>
    </div>
  );
}
