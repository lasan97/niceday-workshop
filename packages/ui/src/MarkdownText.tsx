import type { CSSProperties, ReactNode } from 'react';

type MarkdownTextProps = {
  content: string;
  className?: string;
};

const blockStartPatterns = [/^#{1,6}\s+/, /^>\s?/, /^[-*+]\s+/, /^\d+\.\s+/, /^```/];

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function parseInline(text: string): ReactNode[] {
  const pattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g;
  const segments = text.split(pattern);
  const nodes: ReactNode[] = [];

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (!segment) {
      continue;
    }

    const key = `${segment}-${index}`;
    const linkMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      nodes.push(
        <a
          key={key}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-sky-700 underline underline-offset-2"
        >
          {linkMatch[1]}
        </a>,
      );
      continue;
    }

    if (segment.startsWith('`') && segment.endsWith('`')) {
      nodes.push(
        <code key={key} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.95em] text-slate-700">
          {segment.slice(1, -1)}
        </code>,
      );
      continue;
    }

    if (
      (segment.startsWith('**') && segment.endsWith('**'))
      || (segment.startsWith('__') && segment.endsWith('__'))
    ) {
      nodes.push(<strong key={key}>{segment.slice(2, -2)}</strong>);
      continue;
    }

    if (
      (segment.startsWith('*') && segment.endsWith('*'))
      || (segment.startsWith('_') && segment.endsWith('_'))
    ) {
      nodes.push(<em key={key}>{segment.slice(1, -1)}</em>);
      continue;
    }

    nodes.push(segment);
  }

  return nodes;
}

function renderBlocks(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) {
        index += 1;
      }
      blocks.push(
        <pre
          key={`code-${index}`}
          className="overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-xs text-slate-100"
        >
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingClassNames = {
        1: 'text-2xl font-bold text-slate-900',
        2: 'text-xl font-bold text-slate-900',
        3: 'text-lg font-bold text-slate-900',
        4: 'text-base font-bold text-slate-900',
        5: 'text-sm font-bold text-slate-900',
        6: 'text-sm font-bold uppercase tracking-wide text-slate-700',
      } as const;
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      blocks.push(
        <Tag key={`heading-${index}`} className={headingClassNames[level as keyof typeof headingClassNames]}>
          {parseInline(headingMatch[2])}
        </Tag>,
      );
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-4 border-sky-200 bg-sky-50/60 px-4 py-2 text-slate-700"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={`quote-line-${quoteIndex}`}>{parseInline(quoteLine)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^[-*+]\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ul key={`ul-${index}`} className="list-disc space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`ul-item-${itemIndex}`}>{parseInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      blocks.push(
        <ol key={`ol-${index}`} className="list-decimal space-y-1 pl-5">
          {items.map((item, itemIndex) => (
            <li key={`ol-item-${itemIndex}`}>{parseInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && lines[index].trim() && !blockStartPatterns.some((pattern) => pattern.test(lines[index]))) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="whitespace-pre-wrap">
        {parseInline(paragraphLines.join('\n'))}
      </p>,
    );
  }

  return blocks;
}

export function markdownToPlainText(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const twoLineClampStyle: CSSProperties = {
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 2,
  overflow: 'hidden',
};

export function MarkdownText({ content, className }: MarkdownTextProps) {
  return <div className={joinClassNames('space-y-3 text-sm leading-6 text-slate-700', className)}>{renderBlocks(content)}</div>;
}
