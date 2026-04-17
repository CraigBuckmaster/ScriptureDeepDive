/**
 * services/amicus/exportThread.ts — Export an Amicus thread to Markdown
 * (#1472, Partner+ exclusive).
 *
 * The returned string is a self-contained conversation transcript suitable
 * for sharing via the OS share sheet, pasting into notes apps, or
 * round-tripping through a Markdown → PDF pipeline.
 */
import { getAmicusThread, listAmicusMessages } from '@/db/userQueries';
import type { AmicusCitation, AmicusMessage, AmicusThread } from '@/types';

export interface ThreadExportPayload {
  threadId: string;
  title: string;
  markdown: string;
  filename: string;
}

export interface ExportOptions {
  /** Override the generated-at line. Useful for deterministic tests. */
  generatedAt?: Date;
}

/** Public entry: load a thread + its messages and format as Markdown. */
export async function exportThreadToMarkdown(
  threadId: string,
  opts: ExportOptions = {},
): Promise<ThreadExportPayload> {
  const thread = await getAmicusThread(threadId);
  if (!thread) {
    throw new Error(`thread_not_found: ${threadId}`);
  }
  const messages = await listAmicusMessages(threadId);
  const markdown = formatThreadMarkdown(thread, messages, opts);
  return {
    threadId,
    title: thread.title,
    markdown,
    filename: buildFilename(thread, opts.generatedAt ?? new Date()),
  };
}

/** Pure formatter — split out so the Markdown shape is unit-testable. */
export function formatThreadMarkdown(
  thread: AmicusThread,
  messages: AmicusMessage[],
  opts: ExportOptions = {},
): string {
  const generatedAt = (opts.generatedAt ?? new Date()).toISOString();
  const lines: string[] = [];
  lines.push(`# ${thread.title}`);
  lines.push('');
  lines.push(`*Exported from Amicus · ${generatedAt}*`);
  if (thread.chapter_ref) {
    lines.push(`*Context: ${thread.chapter_ref}*`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  if (messages.length === 0) {
    lines.push('_No messages in this thread yet._');
    lines.push('');
    return lines.join('\n');
  }

  for (const msg of messages) {
    lines.push(msg.role === 'user' ? '## You' : '## Amicus');
    lines.push('');
    lines.push(msg.content.trim());
    lines.push('');

    const citations = msg.citations ?? [];
    if (citations.length > 0) {
      lines.push('**Sources:**');
      for (const c of citations) {
        lines.push(`- ${formatCitation(c)}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

function formatCitation(c: AmicusCitation): string {
  const label = c.display_label.trim();
  const scholar = c.scholar_id ? ` (${c.scholar_id})` : '';
  return `${label}${scholar}`;
}

function buildFilename(thread: AmicusThread, when: Date): string {
  const slug = slugify(thread.title) || 'amicus-thread';
  const date = when.toISOString().slice(0, 10);
  return `${slug}-${date}.md`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
