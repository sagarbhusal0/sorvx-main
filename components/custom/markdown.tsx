import Link from "next/link";
import React, { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// A custom CodeBlock component styled to look like VS Code's code blocks.
const CodeBlock = ({
  node,
  inline,
  className,
  children,
  ...props
}: any) => {
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const codeText = children.join("");
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Render inline code normally.
  if (inline || !match) {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }

  // For block code, mimic VS Code style.
  return (
    <div className="my-4 border rounded-lg overflow-hidden shadow">
      {/* Header bar mimicking VS Code window controls */}
      <div className="flex items-center px-3 py-2 bg-gray-200 dark:bg-gray-800">
        <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
        <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
        <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
        <div className="flex-grow"></div>
        <button
          onClick={copyToClipboard}
          className="text-xs bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {/* Code content */}
      <pre
        {...props}
        className="overflow-x-auto p-3 bg-gray-50 dark:bg-gray-900 text-sm font-mono"
      >
        <code className={match[1]}>{children}</code>
      </pre>
    </div>
  );
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    code: CodeBlock,
    ol: ({ node, children, ...props }: any) => (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }: any) => (
      <li className="py-1" {...props}>
        {children}
      </li>
    ),
    ul: ({ node, children, ...props }: any) => (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    ),
    strong: ({ node, children, ...props }: any) => (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    ),
    a: ({ node, children, ...props }: any) => (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    ),
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
