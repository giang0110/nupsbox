export type BlogOutlineItem = {
  id: string;
  title: string;
  level: number;
};

type BlogNode = {
  type?: unknown;
  text?: unknown;
  content?: unknown;
  attrs?: unknown;
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

function nodeText(value: unknown): string {
  const node = nodeRecord(value);
  const own = typeof node.text === 'string' ? node.text : '';
  return [own, ...contentArray(node.content).map(nodeText)]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function blogHeadingId(key: string) {
  return 'article-' + key.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function extractBlogOutline(body: Record<string, unknown>): BlogOutlineItem[] {
  const items: BlogOutlineItem[] = [];

  function walk(value: unknown, key: string) {
    const node = nodeRecord(value);
    const type = typeof node.type === 'string' ? node.type : '';

    if (type === 'heading') {
      const rawLevel = Number(attrsRecord(node.attrs).level);
      const level = Number.isFinite(rawLevel) ? Math.min(Math.max(rawLevel, 2), 4) : 2;
      const title = nodeText(node);
      if (title) items.push({id: blogHeadingId(key), title, level});
    }

    contentArray(node.content).forEach((child, index) => walk(child, key + '-' + index));
  }

  contentArray(body.content).forEach((node, index) => walk(node, 'blog-node-' + index));
  return items;
}
