"use client";

import { Pin } from 'lucide-react';
import { formatRelativeDate } from '../utils/formatters';

const InstagramEmbed = ({ url }) => {
  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl) return "";
    if (rawUrl.includes("/reel/")) {
      const id = rawUrl.split("/reel/")[1].split("/")[0];
      return `https://www.instagram.com/reel/${id}/embed`;
    }
    if (rawUrl.includes("/p/")) {
      const id = rawUrl.split("/p/")[1].split("/")[0];
      return `https://www.instagram.com/p/${id}/embed`;
    }
    return rawUrl;
  };

  return (
    <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-xl mt-3 border border-slate-200 dark:border-slate-800">
      <iframe
        title="Instagram post embed"
        src={getEmbedUrl(url)}
        className="w-full h-full"
        style={{ border: 0 }}
        allowTransparency="true"
        allow="encrypted-media"
      />
    </div>
  );
};

const PostCard = ({ post }) => {
  if (!post) return null;

  const author = post.posted_by || post.author || 'Library Desk';
  const content = post.body || post.content || '';
  const title = post.title || '';
  const dateStr = post.cr_dt ? formatRelativeDate(post.cr_dt) : (post.date || '');

  return (
    <article className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-5 shadow-xs hover:border-[#004B87]/40 dark:hover:border-blue-500/50 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#004B87] dark:text-blue-400 font-semibold flex items-center justify-center text-xs select-none shrink-0">
            {author?.[0]?.toUpperCase() || 'L'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{author}</p>
            {dateStr && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{dateStr}</p>
            )}
          </div>
        </div>

        {post.pinned && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Pin size={11} className="rotate-45" />
            <span>PINNED</span>
          </span>
        )}
      </div>

      {title && (
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
          {title}
        </h3>
      )}

      {content && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {content}
        </p>
      )}

      {post.image_url && (
        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 max-h-80">
          <img
            src={post.image_url}
            alt={title || "Notice attachment"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {post.url && <InstagramEmbed url={post.url} />}
    </article>
  );
};

export default PostCard;
