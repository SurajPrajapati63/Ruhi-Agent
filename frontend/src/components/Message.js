import React from "react";
import { formatDistanceToNow } from "date-fns";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter }
from "react-syntax-highlighter";

import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";

const Message = ({ message }) => {

  const isUser = message.role === "user";

  return (

    <div
      className={`flex gap-3 ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >

      {/* Avatar */}
      <div className="text-2xl min-w-[2rem]">
        {isUser ? "👤" : "🤖"}
      </div>

      {/* Message Bubble */}
      <div
        className={`
          ${
            isUser
              ? "bg-blue-600 text-white rounded-2xl rounded-br-none"
              : "bg-slate-800 text-slate-100 rounded-2xl rounded-bl-none"
          }

          p-5
          max-w-[80%]
          shadow-lg
        `}
      >

        {/* Image */}
        {message.imageUrl && (
          <div className="mb-4">
            <img
              src={message.imageUrl}
              alt={
                message.analysis?.caption ||
                "uploaded"
              }
              className="
                w-full
                max-w-[350px]
                rounded-xl
                border
                border-slate-700
              "
            />
          </div>
        )}

        {/* Markdown Content */}
        {message.content && (

          <div
            className="
              prose
              prose-invert
              max-w-none

              prose-h1:text-4xl
              prose-h1:font-bold
              prose-h1:mb-5
              prose-h1:text-white

              prose-h2:text-3xl
              prose-h2:font-bold
              prose-h2:mt-8
              prose-h2:mb-4
              prose-h2:text-white

              prose-h3:text-2xl
              prose-h3:font-semibold
              prose-h3:mt-6
              prose-h3:mb-3
              prose-h3:text-white

              prose-p:text-base
              prose-p:leading-7

              prose-li:text-base

              prose-strong:text-white

              prose-code:text-green-400
              prose-code:bg-slate-900
              prose-code:px-1
              prose-code:py-0.5
              prose-code:rounded

              prose-pre:bg-transparent
            "
          >

            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{

                code({
                  inline,
                  className,
                  children,
                  ...props
                }) {

                  const match =
                    /language-(\w+)/.exec(
                      className || ""
                    );

                  return !inline && match ? (

                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-xl"
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>

                  ) : (

                    <code
                      className={className}
                      {...props}
                    >
                      {children}
                    </code>

                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>

          </div>
        )}

        {/* Image Analysis */}
        {message.analysis && (

          <div className="mt-4 space-y-2">

            {message.analysis.caption && (
              <p className="text-sm text-slate-300">
                <strong className="text-white">
                  Caption:
                </strong>{" "}
                {message.analysis.caption}
              </p>
            )}

            {message.analysis.description && (
              <p className="text-sm text-slate-300">
                <strong className="text-white">
                  Description:
                </strong>{" "}
                {message.analysis.description}
              </p>
            )}

            {message.analysis.objectDetection && (
              <p className="text-sm text-slate-300">
                <strong className="text-white">
                  Objects:
                </strong>{" "}
                {message.analysis.objectDetection}
              </p>
            )}

            {message.analysis.summary && (
              <p className="text-sm text-slate-300">
                <strong className="text-white">
                  Summary:
                </strong>{" "}
                {message.analysis.summary}
              </p>
            )}

          </div>
        )}

        {/* Timestamp */}
        <span
          className="
            block
            text-xs
            text-slate-400
            mt-4
          "
        >
          {formatDistanceToNow(
            new Date(message.timestamp),
            { addSuffix: true }
          )}
        </span>

      </div>
    </div>
  );
};

export default Message;