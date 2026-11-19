import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

/** Works in both server and client components (used for the live editor preview). */
export function Markdown({
  children,
  className = "",
  slugs = false,
}: {
  children: string;
  className?: string;
  /** Add id attributes to headings (for the reader's table of contents). */
  slugs?: boolean;
}) {
  return (
    <div className={`prose-khaw ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={slugs ? [rehypeSlug, [rehypeHighlight, { detect: false }]] : [[rehypeHighlight, { detect: false }]]}
        components={{
          a: ({ href, children: c, ...rest }) => {
            const external = /^https?:\/\//.test(href ?? "");
            return (
              <a href={href} {...rest} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {c}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
