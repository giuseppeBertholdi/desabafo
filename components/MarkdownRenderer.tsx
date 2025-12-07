'use client'

import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          // Customizar estilos dos elementos markdown
          p: ({ children }) => (
            <p className="text-[15px] sm:text-base font-light leading-[1.7] text-slate-700 dark:text-slate-200 mb-3 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-medium text-slate-900 dark:text-slate-100">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 dark:text-slate-200">
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-3 text-slate-700 dark:text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-3 text-slate-700 dark:text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] sm:text-base font-light leading-relaxed">
              {children}
            </li>
          ),
          h1: ({ children }) => (
            <h1 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2 mt-4 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100 mb-2 mt-3 first:mt-0">
              {children}
            </h3>
          ),
          code: ({ children, className, ...props }: any) => {
            const isInline = !className || !className.includes('language-')
            if (isInline) {
              return (
                <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className="block bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-200 overflow-x-auto my-3" {...props}>
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-pink-300 dark:border-pink-600 pl-4 my-3 italic text-slate-600 dark:text-slate-300">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 underline"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-4 border-slate-200 dark:border-slate-700" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

