import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders a single line of Markdown (bold, italic, links, code) without a wrapping paragraph. */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      allowedElements={["p", "strong", "em", "del", "code", "a"]}
      unwrapDisallowed
      components={{
        p: ({ children: c }) => <>{c}</>,
        a: ({ href, children: c }) => (
          <a href={href} className="text-accent underline underline-offset-2" {...(/^https?:\/\//.test(href ?? "") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {c}
          </a>
        ),
        strong: ({ children: c }) => <strong className="font-semibold text-fg">{c}</strong>,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
