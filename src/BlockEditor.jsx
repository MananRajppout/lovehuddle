import React, { useState, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';

/* ────────────────────────────────────────────────────────────
   Block-based article editor.

   Each "block" is one section of the article: a heading, a
   paragraph, an image, a Q&A, a pull-quote, a gallery, etc.
   The non-technical author edits each one in its own card —
   no Markdown to learn.

   On save, blocks are serialised to Markdown so the published
   blog renders with the same components it already uses.
   ──────────────────────────────────────────────────────────── */

/* Block factory — every new block of a given type starts here */
const NEW_BLOCK = {
  heading:   () => ({ id: makeId(), type: 'heading',   level: 2, text: '' }),
  paragraph: () => ({ id: makeId(), type: 'paragraph', text: '' }),
  image:     () => ({ id: makeId(), type: 'image',     url: '', caption: '' }),
  quote:     () => ({ id: makeId(), type: 'quote',     text: '', by: '' }),
  qa:        () => ({ id: makeId(), type: 'qa',        items: [{ q: '', a: '' }] }),
  gallery:   () => ({ id: makeId(), type: 'gallery',   items: [{ url: '', caption: '' }, { url: '', caption: '' }] }),
  callout:   () => ({ id: makeId(), type: 'callout',   text: '' }),
  quiz:      () => ({ id: makeId(), type: 'quiz',      question: '', options: ['', '', ''], result: '' }),
  safety:    () => ({ id: makeId(), type: 'safety',    title: 'LoveHuddle Safety — While You Read', subtitle: 'How we protect every user, every Huddle', items: [{ icon: '🛡', label: '', desc: '' }] }),
  divider:   () => ({ id: makeId(), type: 'divider' }),
};

const BLOCK_LABELS = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  image: 'Image',
  quote: 'Pull quote',
  qa: 'Q & A',
  gallery: 'Photo gallery',
  callout: 'Callout',
  quiz: 'Quiz',
  safety: 'Safety panel',
  divider: 'Divider',
};

const BLOCK_ICONS = {
  heading: 'H',
  paragraph: '¶',
  image: '🖼',
  quote: '❝',
  qa: '💬',
  gallery: '▦',
  callout: '✦',
  quiz: '◎',
  safety: '🛡',
  divider: '—',
};

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ────────────────────────────────────────────────────────────
   Block-list → Markdown serialisation. Storage stays as a
   single Markdown string in `content`, so the published-blog
   renderer needs no changes.
   ──────────────────────────────────────────────────────────── */

export function blocksToMarkdown(blocks) {
  const parts = [];
  for (const b of (blocks || [])) {
    if (!b || !b.type) continue;
    switch (b.type) {
      case 'heading': {
        const lvl = b.level === 3 ? '###' : '##';
        const t = (b.text || '').trim();
        if (t) parts.push(`${lvl} ${t}`);
        break;
      }
      case 'paragraph': {
        const t = (b.text || '').trim();
        if (t) parts.push(t);
        break;
      }
      case 'image': {
        const url = (b.url || '').trim();
        const cap = (b.caption || '').trim();
        if (url) parts.push(`![${cap}](${url})`);
        break;
      }
      case 'quote': {
        const t = (b.text || '').trim();
        const by = (b.by || '').trim();
        if (t) {
          const lines = ['```quote', t];
          if (by) lines.push(`— ${by}`);
          lines.push('```');
          parts.push(lines.join('\n'));
        }
        break;
      }
      case 'qa': {
        const items = (b.items || []).filter(it => (it.q || '').trim() || (it.a || '').trim());
        if (items.length) {
          const lines = ['```qa'];
          items.forEach((it, i) => {
            if (i > 0) lines.push('');
            if (it.q?.trim()) lines.push(`Q: ${it.q.trim()}`);
            if (it.a?.trim()) lines.push(`A: ${it.a.trim()}`);
          });
          lines.push('```');
          parts.push(lines.join('\n'));
        }
        break;
      }
      case 'gallery': {
        const items = (b.items || []).filter(it => (it.url || '').trim());
        if (items.length) {
          const lines = ['```gallery'];
          items.forEach(it => {
            const u = it.url.trim();
            const c = (it.caption || '').trim();
            lines.push(c ? `${u} | ${c}` : u);
          });
          lines.push('```');
          parts.push(lines.join('\n'));
        }
        break;
      }
      case 'callout': {
        const t = (b.text || '').trim();
        if (t) parts.push('```callout\n' + t + '\n```');
        break;
      }
      case 'quiz': {
        const q = (b.question || '').trim();
        const opts = (b.options || []).map(o => (o || '').trim()).filter(Boolean);
        if (q && opts.length) {
          const lines = ['```quiz', q];
          opts.forEach(o => lines.push(`- ${o}`));
          const res = (b.result || '').trim();
          if (res) lines.push(`Result: ${res}`);
          lines.push('```');
          parts.push(lines.join('\n'));
        }
        break;
      }
      case 'safety': {
        const items = (b.items || []).filter(it => (it.label || '').trim());
        if (items.length) {
          const lines = ['```safety'];
          if (b.title?.trim()) lines.push(`Title: ${b.title.trim()}`);
          if (b.subtitle?.trim()) lines.push(`Subtitle: ${b.subtitle.trim()}`);
          items.forEach(it => {
            const icon = (it.icon || '').trim();
            const label = (it.label || '').trim();
            const desc = (it.desc || '').trim();
            const body = desc ? `${label} | ${desc}` : label;
            lines.push(`- ${icon ? icon + ' ' : ''}${body}`);
          });
          lines.push('```');
          parts.push(lines.join('\n'));
        }
        break;
      }
      case 'divider':
        parts.push('---');
        break;
      default:
        break;
    }
  }
  return parts.join('\n\n');
}

/* ────────────────────────────────────────────────────────────
   Markdown → blocks (best-effort, used when editing existing
   posts that were authored in the old textarea editor).
   Anything we can't classify stays as a paragraph so no
   content is ever lost.
   ──────────────────────────────────────────────────────────── */

export function markdownToBlocks(md) {
  if (!md || !md.trim()) return [];
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    /* Code-fence with a known block language */
    const fence = line.match(/^```(\w+)\s*$/);
    if (fence) {
      const lang = fence[1].toLowerCase();
      const inner = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        inner.push(lines[i]);
        i++;
      }
      i++; // closing fence
      const raw = inner.join('\n');
      const parsed = parseFencedBlock(lang, raw);
      if (parsed) blocks.push(parsed);
      else blocks.push({ id: makeId(), type: 'paragraph', text: raw });
      continue;
    }

    /* Headings */
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) { blocks.push({ id: makeId(), type: 'heading', level: 2, text: h2[1].trim() }); i++; continue; }
    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) { blocks.push({ id: makeId(), type: 'heading', level: 3, text: h3[1].trim() }); i++; continue; }
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) { blocks.push({ id: makeId(), type: 'heading', level: 2, text: h1[1].trim() }); i++; continue; }

    /* Divider */
    if (/^---\s*$/.test(line)) { blocks.push({ id: makeId(), type: 'divider' }); i++; continue; }

    /* Standalone image */
    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (img) { blocks.push({ id: makeId(), type: 'image', url: img[2].trim(), caption: img[1].trim() }); i++; continue; }

    /* Blockquote — collect consecutive `>` lines */
    if (/^>\s*/.test(line)) {
      const qLines = [];
      while (i < lines.length && /^>\s*/.test(lines[i])) {
        qLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ id: makeId(), type: 'quote', text: qLines.join(' ').trim(), by: '' });
      continue;
    }

    /* Blank line */
    if (!line.trim()) { i++; continue; }

    /* Paragraph — collect consecutive non-blank, non-special lines */
    const pLines = [];
    while (i < lines.length) {
      const l = lines[i];
      if (!l.trim()) break;
      if (/^```(\w+)\s*$/.test(l)) break;
      if (/^#{1,3}\s+/.test(l)) break;
      if (/^---\s*$/.test(l)) break;
      if (/^!\[[^\]]*\]\([^)]+\)\s*$/.test(l)) break;
      if (/^>\s*/.test(l)) break;
      pLines.push(l);
      i++;
    }
    if (pLines.length) blocks.push({ id: makeId(), type: 'paragraph', text: pLines.join('\n').trim() });
  }

  return blocks;
}

function parseFencedBlock(lang, raw) {
  const lines = raw.replace(/\r\n/g, '\n').split('\n');
  switch (lang) {
    case 'quote': {
      const nonEmpty = lines.map(l => l.trim()).filter(Boolean);
      const attrIdx = nonEmpty.findIndex(l => /^[—–-]\s+/.test(l));
      let text, by = '';
      if (attrIdx >= 0) {
        text = nonEmpty.slice(0, attrIdx).join(' ');
        by = nonEmpty[attrIdx].replace(/^[—–-]\s+/, '').trim();
      } else {
        text = nonEmpty.join(' ');
      }
      return { id: makeId(), type: 'quote', text, by };
    }
    case 'callout':
      return { id: makeId(), type: 'callout', text: raw.trim() };
    case 'qa': {
      const items = [];
      let cur = null;
      for (const l of lines) {
        const qm = l.match(/^\s*Q\s*[:\-—]\s*(.*)$/i);
        const am = l.match(/^\s*A\s*[:\-—]\s*(.*)$/i);
        if (qm) { if (cur) items.push(cur); cur = { q: qm[1].trim(), a: '' }; }
        else if (am && cur) { cur.a = (cur.a ? cur.a + ' ' : '') + am[1].trim(); }
        else if (cur && l.trim()) {
          if (cur.a) cur.a += ' ' + l.trim(); else cur.q += ' ' + l.trim();
        }
      }
      if (cur) items.push(cur);
      return { id: makeId(), type: 'qa', items: items.length ? items : [{ q: '', a: '' }] };
    }
    case 'gallery': {
      const items = lines.map(l => l.trim()).filter(Boolean).map(l => {
        const [url, ...rest] = l.split('|');
        return { url: (url || '').trim(), caption: rest.join('|').trim() };
      }).filter(it => it.url);
      return { id: makeId(), type: 'gallery', items: items.length ? items : [{ url: '', caption: '' }] };
    }
    case 'quiz': {
      let question = '';
      const options = [];
      let result = '';
      let mode = 'q';
      for (const l of lines) {
        const t = l.trim();
        if (!t) continue;
        const optM = t.match(/^[-*•]\s+(.*)$/);
        const resM = t.match(/^Result\s*[:\-—]\s*(.*)$/i);
        if (resM) { result = resM[1].trim(); mode = 'r'; }
        else if (mode === 'r') { result += ' ' + t; }
        else if (optM) { options.push(optM[1].trim()); mode = 'opts'; }
        else if (mode === 'q') { question = question ? question + ' ' + t : t; }
      }
      return { id: makeId(), type: 'quiz', question, options: options.length ? options : ['', '', ''], result };
    }
    case 'safety': {
      let title = '';
      let subtitle = '';
      const items = [];
      for (const l of lines) {
        const t = l.trim();
        if (!t) continue;
        const tm = t.match(/^Title\s*[:\-—]\s*(.*)$/i);
        const sm = t.match(/^Subtitle\s*[:\-—]\s*(.*)$/i);
        const im = t.match(/^[-*•]\s+(.*)$/);
        if (tm) { title = tm[1].trim(); continue; }
        if (sm) { subtitle = sm[1].trim(); continue; }
        if (im) {
          const body = im[1].trim();
          const pipe = body.indexOf('|');
          let label = pipe >= 0 ? body.slice(0, pipe).trim() : body;
          let desc = pipe >= 0 ? body.slice(pipe + 1).trim() : '';
          const iconMatch = label.match(/^(\p{Extended_Pictographic}️?|.)\s+(.*)$/u);
          let icon = '';
          if (iconMatch && /\p{Extended_Pictographic}/u.test(iconMatch[1])) {
            icon = iconMatch[1];
            label = iconMatch[2];
          }
          items.push({ icon, label, desc });
        }
      }
      return {
        id: makeId(),
        type: 'safety',
        title: title || 'LoveHuddle Safety — While You Read',
        subtitle: subtitle || 'How we protect every user, every Huddle',
        items: items.length ? items : [{ icon: '🛡', label: '', desc: '' }],
      };
    }
    default:
      return null;
  }
}

/* ────────────────────────────────────────────────────────────
   Shared image-to-Supabase uploader (per-block image upload)
   ──────────────────────────────────────────────────────────── */

async function uploadImage(file) {
  if (!file) throw new Error('No file selected.');
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Image must be under 8MB.');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('lovehuddle')
    .upload(safeName, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (uploadError) {
    const msg = (uploadError.message || '').toLowerCase();
    if (msg.includes('bucket') || msg.includes('not found')) {
      throw new Error('Storage isn\'t set up yet. Open the Supabase dashboard → SQL Editor and run the file `supabase-setup.sql` from this repo. Then try again.');
    }
    throw uploadError;
  }
  const { data: pub } = supabase.storage.from('lovehuddle').getPublicUrl(safeName);
  return pub.publicUrl;
}

/* ────────────────────────────────────────────────────────────
   Per-block UI components
   ──────────────────────────────────────────────────────────── */

function HeadingBlock({ block, update }) {
  return (
    <div className="be-fields">
      <div className="be-field-row">
        <label className="be-field be-field-narrow">
          <span>Size</span>
          <select value={block.level} onChange={(e) => update({ level: Number(e.target.value) })}>
            <option value={2}>Large heading</option>
            <option value={3}>Small heading</option>
          </select>
        </label>
        <label className="be-field be-field-grow">
          <span>Heading text</span>
          <input
            type="text"
            value={block.text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="e.g. Why we started LoveHuddle"
          />
        </label>
      </div>
    </div>
  );
}

function ParagraphBlock({ block, update }) {
  return (
    <div className="be-fields">
      <label className="be-field">
        <span>Paragraph text</span>
        <textarea
          rows={5}
          value={block.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="Write a paragraph. Leave a blank line if you want to break into another paragraph inside this block."
        />
      </label>
    </div>
  );
}

function ImageBlock({ block, update, setError }) {
  const [busy, setBusy] = useState(false);
  const onFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      update({ url });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    }
    setBusy(false);
  };
  return (
    <div className="be-fields">
      {block.url && (
        <div className="be-image-preview">
          <img src={block.url} alt={block.caption || ''} />
        </div>
      )}
      <div className="be-field-row">
        <label className={`be-upload-btn ${busy ? 'busy' : ''}`}>
          {busy ? 'Uploading…' : (block.url ? 'Replace image' : 'Upload image')}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </label>
        <label className="be-field be-field-grow">
          <span>…or paste an image URL</span>
          <input
            type="url"
            value={block.url}
            onChange={(e) => update({ url: e.target.value })}
            placeholder="https://…"
          />
        </label>
      </div>
      <label className="be-field">
        <span>Caption (optional)</span>
        <input
          type="text"
          value={block.caption}
          onChange={(e) => update({ caption: e.target.value })}
          placeholder="Shown under the picture"
        />
      </label>
    </div>
  );
}

function QuoteBlock({ block, update }) {
  return (
    <div className="be-fields">
      <label className="be-field">
        <span>Quote text</span>
        <textarea
          rows={3}
          value={block.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="A short, memorable line worth pausing on."
        />
      </label>
      <label className="be-field">
        <span>Attribution (optional)</span>
        <input
          type="text"
          value={block.by}
          onChange={(e) => update({ by: e.target.value })}
          placeholder="Who said it?"
        />
      </label>
    </div>
  );
}

function QABlock({ block, update }) {
  const setItem = (idx, patch) => {
    const items = block.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
    update({ items });
  };
  const addItem = () => update({ items: [...block.items, { q: '', a: '' }] });
  const removeItem = (idx) => update({ items: block.items.filter((_, i) => i !== idx) });

  return (
    <div className="be-fields">
      {block.items.map((it, idx) => (
        <div className="be-subcard" key={idx}>
          <div className="be-subcard-head">
            <span>Pair {idx + 1}</span>
            {block.items.length > 1 && (
              <button type="button" className="be-mini-btn" onClick={() => removeItem(idx)}>Remove</button>
            )}
          </div>
          <label className="be-field">
            <span>Question</span>
            <input
              type="text"
              value={it.q}
              onChange={(e) => setItem(idx, { q: e.target.value })}
              placeholder="The question"
            />
          </label>
          <label className="be-field">
            <span>Answer</span>
            <textarea
              rows={2}
              value={it.a}
              onChange={(e) => setItem(idx, { a: e.target.value })}
              placeholder="The answer"
            />
          </label>
        </div>
      ))}
      <button type="button" className="be-add-row-btn" onClick={addItem}>+ Add another Q&amp;A pair</button>
    </div>
  );
}

function GalleryBlock({ block, update, setError }) {
  const setItem = (idx, patch) => {
    const items = block.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
    update({ items });
  };
  const addItem = () => update({ items: [...block.items, { url: '', caption: '' }] });
  const removeItem = (idx) => update({ items: block.items.filter((_, i) => i !== idx) });

  const onFile = async (idx, file) => {
    if (!file) return;
    try {
      const url = await uploadImage(file);
      setItem(idx, { url });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    }
  };

  return (
    <div className="be-fields">
      {block.items.map((it, idx) => (
        <div className="be-subcard" key={idx}>
          <div className="be-subcard-head">
            <span>Photo {idx + 1}</span>
            {block.items.length > 1 && (
              <button type="button" className="be-mini-btn" onClick={() => removeItem(idx)}>Remove</button>
            )}
          </div>
          {it.url && (
            <div className="be-image-preview be-image-preview-small">
              <img src={it.url} alt={it.caption || ''} />
            </div>
          )}
          <div className="be-field-row">
            <label className="be-upload-btn">
              {it.url ? 'Replace' : 'Upload'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => { onFile(idx, e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
            <label className="be-field be-field-grow">
              <span>…or paste URL</span>
              <input
                type="url"
                value={it.url}
                onChange={(e) => setItem(idx, { url: e.target.value })}
                placeholder="https://…"
              />
            </label>
          </div>
          <label className="be-field">
            <span>Caption (optional)</span>
            <input
              type="text"
              value={it.caption}
              onChange={(e) => setItem(idx, { caption: e.target.value })}
              placeholder="Caption shown under the photo"
            />
          </label>
        </div>
      ))}
      <button type="button" className="be-add-row-btn" onClick={addItem}>+ Add another photo</button>
    </div>
  );
}

function CalloutBlock({ block, update }) {
  return (
    <div className="be-fields">
      <label className="be-field">
        <span>Callout text</span>
        <textarea
          rows={3}
          value={block.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder="A highlighted thought you want the reader to pause on."
        />
      </label>
    </div>
  );
}

function QuizBlock({ block, update }) {
  const setOption = (idx, value) => {
    const options = block.options.map((o, i) => i === idx ? value : o);
    update({ options });
  };
  const addOption = () => update({ options: [...block.options, ''] });
  const removeOption = (idx) => update({ options: block.options.filter((_, i) => i !== idx) });

  return (
    <div className="be-fields">
      <label className="be-field">
        <span>Quiz question</span>
        <input
          type="text"
          value={block.question}
          onChange={(e) => update({ question: e.target.value })}
          placeholder="What matters most to you in a connection?"
        />
      </label>
      <div className="be-field">
        <span>Answer options</span>
        {block.options.map((opt, idx) => (
          <div className="be-option-row" key={idx}>
            <span className="be-option-letter">{String.fromCharCode(65 + idx)}</span>
            <input
              type="text"
              value={opt}
              onChange={(e) => setOption(idx, e.target.value)}
              placeholder={`Option ${String.fromCharCode(65 + idx)}`}
            />
            {block.options.length > 2 && (
              <button type="button" className="be-mini-btn" onClick={() => removeOption(idx)}>×</button>
            )}
          </div>
        ))}
        <button type="button" className="be-add-row-btn" onClick={addOption}>+ Add another option</button>
      </div>
      <label className="be-field">
        <span>Reflection shown after they pick (optional)</span>
        <textarea
          rows={2}
          value={block.result}
          onChange={(e) => update({ result: e.target.value })}
          placeholder="There is no wrong answer — but the way you answer says something about…"
        />
      </label>
    </div>
  );
}

function SafetyBlock({ block, update }) {
  const setItem = (idx, patch) => {
    const items = block.items.map((it, i) => i === idx ? { ...it, ...patch } : it);
    update({ items });
  };
  const addItem = () => update({ items: [...block.items, { icon: '🛡', label: '', desc: '' }] });
  const removeItem = (idx) => update({ items: block.items.filter((_, i) => i !== idx) });

  return (
    <div className="be-fields">
      <label className="be-field">
        <span>Title</span>
        <input
          type="text"
          value={block.title}
          onChange={(e) => update({ title: e.target.value })}
        />
      </label>
      <label className="be-field">
        <span>Subtitle</span>
        <input
          type="text"
          value={block.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
        />
      </label>
      {block.items.map((it, idx) => (
        <div className="be-subcard" key={idx}>
          <div className="be-subcard-head">
            <span>Safety item {idx + 1}</span>
            {block.items.length > 1 && (
              <button type="button" className="be-mini-btn" onClick={() => removeItem(idx)}>Remove</button>
            )}
          </div>
          <div className="be-field-row">
            <label className="be-field be-field-narrow">
              <span>Icon</span>
              <input
                type="text"
                value={it.icon}
                onChange={(e) => setItem(idx, { icon: e.target.value })}
                placeholder="🛡"
              />
            </label>
            <label className="be-field be-field-grow">
              <span>Label</span>
              <input
                type="text"
                value={it.label}
                onChange={(e) => setItem(idx, { label: e.target.value })}
                placeholder="e.g. Identity Verification"
              />
            </label>
          </div>
          <label className="be-field">
            <span>Description</span>
            <input
              type="text"
              value={it.desc}
              onChange={(e) => setItem(idx, { desc: e.target.value })}
              placeholder="e.g. Every profile is verified before they can Huddle."
            />
          </label>
        </div>
      ))}
      <button type="button" className="be-add-row-btn" onClick={addItem}>+ Add another safety item</button>
    </div>
  );
}

function DividerBlock() {
  return <div className="be-divider-preview">— · — · —</div>;
}

const BLOCK_COMPONENTS = {
  heading: HeadingBlock,
  paragraph: ParagraphBlock,
  image: ImageBlock,
  quote: QuoteBlock,
  qa: QABlock,
  gallery: GalleryBlock,
  callout: CalloutBlock,
  quiz: QuizBlock,
  safety: SafetyBlock,
  divider: DividerBlock,
};

/* ────────────────────────────────────────────────────────────
   Add-block menu
   ──────────────────────────────────────────────────────────── */

function AddBlockMenu({ onAdd }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="be-add-wrap" ref={ref}>
      <button type="button" className="be-add-btn" onClick={() => setOpen(o => !o)}>
        + Add block
      </button>
      {open && (
        <div className="be-add-menu" role="menu">
          {Object.keys(BLOCK_LABELS).map(type => (
            <button
              type="button"
              key={type}
              className="be-add-menu-item"
              onClick={() => { onAdd(type); setOpen(false); }}
            >
              <span className="be-add-menu-icon" aria-hidden="true">{BLOCK_ICONS[type]}</span>
              <span>{BLOCK_LABELS[type]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Top-level BlockEditor
   ──────────────────────────────────────────────────────────── */

export default function BlockEditor({ blocks, onChange, onError }) {
  const list = blocks || [];

  const updateAt = (idx, patch) => {
    const next = list.map((b, i) => i === idx ? { ...b, ...patch } : b);
    onChange(next);
  };
  const removeAt = (idx) => onChange(list.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const j = idx + dir;
    if (j < 0 || j >= list.length) return;
    const next = list.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  const addBlock = (type) => {
    const make = NEW_BLOCK[type];
    if (!make) return;
    onChange([...list, make()]);
  };
  const addBlockAt = (idx, type) => {
    const make = NEW_BLOCK[type];
    if (!make) return;
    const next = list.slice();
    next.splice(idx + 1, 0, make());
    onChange(next);
  };

  const setError = (msg) => { if (onError) onError(msg); };

  return (
    <div className="be-root">
      {list.length === 0 && (
        <div className="be-empty">
          <p>This article is empty. Add your first block below.</p>
          <AddBlockMenu onAdd={addBlock} />
        </div>
      )}

      {list.map((block, idx) => {
        const Comp = BLOCK_COMPONENTS[block.type];
        if (!Comp) return null;
        return (
          <div className="be-block" key={block.id}>
            <div className="be-block-head">
              <span className="be-block-type">
                <span className="be-block-type-icon" aria-hidden="true">{BLOCK_ICONS[block.type]}</span>
                {BLOCK_LABELS[block.type]}
              </span>
              <div className="be-block-actions">
                <button type="button" className="be-mini-btn" onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up">↑</button>
                <button type="button" className="be-mini-btn" onClick={() => move(idx, +1)} disabled={idx === list.length - 1} title="Move down">↓</button>
                <button type="button" className="be-mini-btn be-mini-btn-danger" onClick={() => removeAt(idx)} title="Delete block">✕</button>
              </div>
            </div>
            <div className="be-block-body">
              <Comp
                block={block}
                update={(patch) => updateAt(idx, patch)}
                setError={setError}
              />
            </div>
            <div className="be-block-foot">
              <AddBlockMenu onAdd={(type) => addBlockAt(idx, type)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
