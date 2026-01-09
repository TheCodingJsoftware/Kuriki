import rehypeKatex from 'rehype-katex'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

const processor = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeFormat)
    .use(rehypeSanitize)
    .use(rehypeKatex)
    .use(rehypeStringify);

function normalizeLatex(md: string) {
    // turn "\$\$" back into "$$" so remark-math can see block math
    return md
        .replaceAll("$$", "\\$\\$")
        .replaceAll("\\$\\$", "$$")
        .replaceAll("\\$", "$"); // optional: only if you also escape single $
}

export async function renderWorksheetMarkdown(markdown = ""): Promise<string> {
    const file = await processor.process(normalizeLatex(markdown).trim());
    return String(file);
}
