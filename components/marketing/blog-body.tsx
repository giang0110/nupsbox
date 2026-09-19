import type {ReactNode} from 'react';

type BlogNode = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
  attrs?: unknown;
  marks?: unknown;
};

function nodeRecord(value: unknown): BlogNode {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as BlogNode
    : {};
}

function contentArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function attrsRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function safeHref(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (value.startsWith('/')) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

function renderText(node: BlogNode, key: string): ReactNode {
  const text = typeof node.text === 'string' ? node.text : '';
  let rendered: ReactNode = text;
  const marks = contentArray(node.marks).map(nodeRecord);

  marks.forEach((mark, index) => {
    const markType = typeof mark.type === 'string' ? mark.type : '';
    const markKey = key + '-mark-' + index;
    if (markType === 'bold' || markType === 'strong') {
      rendered = <strong key={markKey}>{rendered}</strong>;
    } else if (markType === 'italic' || markType === 'em') {
      rendered = <em key={markKey}>{rendered}</em>;
    } else if (markType === 'code') {
      rendered = <code key={markKey} className="rounded bg-[var(--nupsbox-surface)] px-1 py-0.5 text-[0.92em]">{rendered}</code>;
    } else if (markType === 'link') {
      const href = safeHref(attrsRecord(mark.attrs).href);
      if (href) {
        const external = href.startsWith('http');
        rendered = (
          <a
            key={markKey}
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noreferrer' : undefined}
            className="font-semibold text-[var(--nupsbox-blue)] underline underline-offset-2"
          >
            {rendered}
          </a>
        );
      }
    }
  });

  return <span key={key}>{rendered}</span>;
}

function renderChildren(node: BlogNode, key: string): ReactNode[] {
  return contentArray(node.content).map((child, index) => renderNode(child, key + '-' + index));
}

function renderNode(value: unknown, key: string): ReactNode {
  const node = nodeRecord(value);
  const type = typeof node.type === 'string' ? node.type : '';

  if (type === 'text') return renderText(node, key);
  if (type === 'hardBreak') return <br key={key} />;

  const children = renderChildren(node, key);

  if (type === 'doc') return <div key={key} className="grid gap-5">{children}</div>;
  if (type === 'paragraph') return <p key={key} className="leading-8 text-[var(--nupsbox-slate)]">{children}</p>;
  if (type === 'blockquote') {
    return (
      <blockquote key={key} className="border-l-4 border-[var(--nupsbox-blue)] pl-4 text-[var(--nupsbox-slate)]">
        {children}
      </blockquote>
    );
  }
  if (type === 'bulletList') return <ul key={key} className="grid list-disc gap-2 pl-6 text-[var(--nupsbox-slate)]">{children}</ul>;
  if (type === 'orderedList') return <ol key={key} className="grid list-decimal gap-2 pl-6 text-[var(--nupsbox-slate)]">{children}</ol>;
  if (type === 'listItem') return <li key={key} className="pl-1">{children}</li>;

  if (type === 'heading') {
    const rawLevel = Number(attrsRecord(node.attrs).level);
    const level = Number.isFinite(rawLevel) ? Math.min(Math.max(rawLevel, 2), 4) : 2;
    if (level === 3) {
      return <h3 key={key} className="pt-2 text-xl font-black tracking-[-0.025em] text-[var(--nupsbox-navy)]">{children}</h3>;
    }
    if (level === 4) {
      return <h4 key={key} className="pt-1 text-lg font-black text-[var(--nupsbox-navy)]">{children}</h4>;
    }
    return <h2 key={key} className="pt-3 text-2xl font-black tracking-[-0.035em] text-[var(--nupsbox-navy)]">{children}</h2>;
  }

  return children.length ? <div key={key}>{children}</div> : null;
}

function hasRenderableContent(body: Record<string, unknown>): boolean {
  return contentArray(body.content).length > 0;
}

export function BlogBody({
  body,
  fallback
}: {
  body: Record<string, unknown>;
  fallback?: string | null;
}) {
  if (!hasRenderableContent(body)) {
    return fallback ? (
      <p className="text-base leading-8 text-[var(--nupsbox-slate)]">{fallback}</p>
    ) : null;
  }

  return <div className="grid gap-5">{contentArray(body.content).map((node, index) => renderNode(node, 'blog-node-' + index))}</div>;
}
