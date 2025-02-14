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
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-10">
        <h1 className="text-lg font-bold">Sorvx AI Chat</h1>
      </header>

      {/* Main Container with top padding so messages don't overlap the header */}
      <main className="pt-24 pb-6">
        <div className="flex flex-row justify-center">
          <div className="flex flex-col justify-between items-center gap-4 w-full">
            <div
              ref={messagesContainerRef}
              className="flex flex-col gap-4 h-dvh w-dvw items-center overflow-y-scroll"
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

            <form
              className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0"
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
        </div>
      </main>
    </div>
  );
}
