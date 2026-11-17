import React, { useState } from 'react';
import { Block, InlineToken, parseRichText } from '../../utils/richText';

interface RichTextProps {
  content: string;
  inverted?: boolean;
  myUsername?: string;
}

const Spoiler: React.FC<{ inverted?: boolean; children: React.ReactNode }> = ({ inverted, children }) => {
  const [revealed, setRevealed] = useState(false);
  if (revealed) {
    return <span className={`rounded px-0.5 ${inverted ? 'bg-indigo-800/50' : 'bg-slate-200'}`}>{children}</span>;
  }
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setRevealed(true);
      }}
      title="Spoiler: haz clic para verlo"
      aria-label="Spoiler oculto. Haz clic para mostrarlo"
      className={`rounded px-1 align-baseline text-transparent select-none ${inverted ? 'bg-indigo-950' : 'bg-slate-700'}`}
    >
      {children}
    </button>
  );
};

const renderInline = (tokens: InlineToken[], props: RichTextProps, keyPrefix: string): React.ReactNode[] =>
  tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`;
    switch (token.type) {
      case 'text':
        return <React.Fragment key={key}>{token.value}</React.Fragment>;
      case 'bold':
        return <strong key={key}>{renderInline(token.children, props, key)}</strong>;
      case 'italic':
        return <em key={key}>{renderInline(token.children, props, key)}</em>;
      case 'strike':
        return <s key={key}>{renderInline(token.children, props, key)}</s>;
      case 'spoiler':
        return (
          <Spoiler key={key} inverted={props.inverted}>
            {renderInline(token.children, props, key)}
          </Spoiler>
        );
      case 'code':
        return (
          <code
            key={key}
            className={`rounded px-1 py-0.5 font-mono text-[0.85em] ${props.inverted ? 'bg-indigo-800/60' : 'bg-slate-200 text-slate-800'}`}
          >
            {token.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={key}
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 break-all ${props.inverted ? 'text-white' : 'text-indigo-600'}`}
          >
            {token.href}
          </a>
        );
      case 'mention': {
        const isMe = props.myUsername?.toLowerCase() === token.username.toLowerCase();
        return (
          <span
            key={key}
            className={`rounded px-0.5 font-semibold ${
              isMe ? 'bg-amber-100 text-amber-800' : props.inverted ? 'text-indigo-100' : 'text-indigo-600'
            }`}
          >
            @{token.username}
          </span>
        );
      }
      default:
        return null;
    }
  });

const renderBlock = (block: Block, index: number, props: RichTextProps) => {
  const key = `b${index}`;
  if (block.type === 'codeBlock') {
    return (
      <pre
        key={key}
        className={`my-1 overflow-x-auto rounded-lg p-2 font-mono text-xs whitespace-pre ${
          props.inverted ? 'bg-indigo-900/60' : 'bg-slate-800 text-slate-100'
        }`}
      >
        {block.value}
      </pre>
    );
  }
  if (block.type === 'list') {
    const List = block.ordered ? 'ol' : 'ul';
    return (
      <List key={key} className={`my-0.5 space-y-0.5 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'}`}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderInline(item, props, `${key}-${itemIndex}`)}</li>
        ))}
      </List>
    );
  }
  return (
    <p key={key}>
      {block.lines.map((line, lineIndex) => (
        <React.Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {renderInline(line, props, `${key}-${lineIndex}`)}
        </React.Fragment>
      ))}
    </p>
  );
};

export const RichText: React.FC<RichTextProps> = (props) => (
  <div className="space-y-1">{parseRichText(props.content).map((block, index) => renderBlock(block, index, props))}</div>
);
