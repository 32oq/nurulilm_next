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
    <div className="w-full aspect-[4/5] bg-[#F4EFE6] dark:bg-[#142019] overflow-hidden rounded-xl mt-3 border border-[#E5DFD5] dark:border-[#24382D]">
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
    <article className="bg-white dark:bg-[#131E18] border border-[#E5DFD5] dark:border-[#22352B] rounded-xl overflow-hidden p-5 shadow-xs hover:border-[#1C3A2B]/40 dark:hover:border-[#367252]/50 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#EDF3EE] dark:bg-[#1A2E23] text-[#1C3A2B] dark:text-[#8FD4AE] font-semibold flex items-center justify-center text-xs select-none shrink-0">
            {author?.[0]?.toUpperCase() || 'L'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#1C1E1B] dark:text-[#E8F0EB] truncate">{author}</p>
            {dateStr && (
              <p className="text-[11px] text-[#7F8781] dark:text-[#889C90]">{dateStr}</p>
            )}
          </div>
        </div>

        {post.pinned && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EAF2EC] dark:bg-[#1E3025] text-[#2D5A3F] dark:text-[#8FD4AE] border border-[#CDE0D3] dark:border-[#2C4A37]">
            <Pin size={11} className="rotate-45" />
            <span>PINNED</span>
          </span>
        )}
      </div>

      {title && (
        <h3 className="font-medium text-sm text-[#1C1E1B] dark:text-[#F0F5F2] mb-1.5">
          {title}
        </h3>
      )}

      {content && (
        <p className="text-xs sm:text-sm text-[#383E39] dark:text-[#CAD6CF] leading-relaxed whitespace-pre-line">
          {content}
        </p>
      )}

      {post.image_url && (
        <div className="mt-3 rounded-lg overflow-hidden border border-[#E5DFD5] dark:border-[#22352B] max-h-80">
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
