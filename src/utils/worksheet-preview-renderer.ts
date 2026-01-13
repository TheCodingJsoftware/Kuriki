import rehypeKatex from "rehype-katex";
import rehypeFormat from "rehype-format";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkDirective from "remark-directive";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    // IMPORTANT: disable single-$ inline math so currency works
    .use(remarkMath, { singleDollarTextMath: false })
    // OPTIONAL: make single newlines render as <br>
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeFormat)
    .use(rehypeSanitize)
    .use(rehypeKatex)
    .use(rehypeStringify);

// Only unescape the specific "\$\$" -> "$$" case (don’t touch "\$")
function normalizeLatex(md: string) {
    return md.replaceAll("\\$\\$", "$$");
}

export async function renderWorksheetMarkdown(markdown = ""): Promise<string> {
    const file = await processor.process(normalizeLatex(markdown).trim());
    return String(file);
}
