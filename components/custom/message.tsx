"use client";

import Image from "next/image";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode, useState } from "react";

import { UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { AuthorizePayment } from "../flights/authorize-payment";
import { DisplayBoardingPass } from "../flights/boarding-pass";
import { CreateReservation } from "../flights/create-reservation";
import { FlightStatus } from "../flights/flight-status";
import { ListFlights } from "../flights/list-flights";
import { SelectSeats } from "../flights/select-seats";
import { VerifyPayment } from "../flights/verify-payment";

interface MessageProps {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations?: Array<ToolInvocation>;
  attachments?: Array<Attachment>;
  isFirstMessage?: boolean;
}

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  isFirstMessage = false,
}: MessageProps) => {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      className={`flex items-start gap-4 px-4 w-full md:w-[500px] md:px-0 ${
        isFirstMessage ? "mt-16" : "mt-4"
      } ${isUser ? "justify-end flex-row-reverse" : "justify-start"}`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Avatar */}
      <div className="w-[24px] border rounded-sm p-1 flex justify-center items-center shrink-0 text-zinc-500">
        {isUser ? (
          <UserIcon />
        ) : (
          <Image src="/images/ai.png" height={20} width={20} alt="sorvx logo" />
        )}
      </div>

      {/* Message container */}
      <div
        className={`relative flex flex-col gap-4 w-full p-4 rounded-lg transition-transform duration-200 transform hover:scale-105 shadow-sm ${
          isUser
            ? "bg-white text-zinc-800 border border-gray-200"
            : "bg-black text-white border border-gray-700"
        }`}
      >
        {/* Copy button for bot messages */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-xs text-gray-300 hover:text-gray-100 focus:outline-none"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        )}

        {/* Message content */}
        {content && typeof content === "string" ? (
          <div>
            <Markdown>{content}</Markdown>
          </div>
        ) : (
          <div>{content}</div>
        )}

        {/* Tool invocations */}
        {toolInvocations && toolInvocations.length > 0 && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;
              if (state === "result") {
                const { result } = toolInvocation;
                return (
                  <div key={toolCallId}>
                    {toolName === "getWeather" ? (
                      <Weather weatherAtLocation={result} />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus flightStatus={result} />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} results={result} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} availability={result} />
                    ) : toolName === "createReservation" ? (
                      Object.keys(result).includes("error") ? null : (
                        <CreateReservation reservation={result} />
                      )
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment intent={result} />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass boardingPass={result} />
                    ) : toolName === "verifyPayment" ? (
                      <VerifyPayment result={result} />
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getWeather" ? (
                      <Weather />
                    ) : toolName === "displayFlightStatus" ? (
                      <FlightStatus />
                    ) : toolName === "searchFlights" ? (
                      <ListFlights chatId={chatId} />
                    ) : toolName === "selectSeats" ? (
                      <SelectSeats chatId={chatId} />
                    ) : toolName === "createReservation" ? (
                      <CreateReservation />
                    ) : toolName === "authorizePayment" ? (
                      <AuthorizePayment />
                    ) : toolName === "displayBoardingPass" ? (
                      <DisplayBoardingPass />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {/* Attachments */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
