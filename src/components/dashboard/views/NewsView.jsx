'use client';

import { useState, useEffect, useCallback } from "react";
import moment from "moment";
import {
  Newspaper, RefreshCw, AlertTriangle, ArrowRight,
  Search, Bookmark, BookmarkCheck, Clock, X, ExternalLink
} from "lucide-react";
import { LoadingRow } from "../shared";

/* ── Module-level cache (survives re-renders) ── */
const _newsCache = {};
const NEWS_CACHE_TTL = 3 * 60 * 1000;
const BOOKMARKS_KEY  = 'news_bookmarks';
const ITEMS_PER_PAGE = 6;

const sortByDate   = (items) => [...items].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
const stripHtml    = (html)  => html?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim() || '';
const sanitizeHtml = (html)  => html?.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/g, '') || '';

const readTime = (item) => {
  const text = stripHtml((item.content || '') + ' ' + (item.description || ''));
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins  = Math.max(1, Math.round(words / 200));
  return `${mins} min read`;
};

const isNew = (pubDate) => moment().diff(moment(pubDate), 'hours') < 6;

const getThumb = (item) => {
  if (item.thumbnail && item.thumbnail !== 'false' && /^https?:\/\//.test(item.thumbnail)) return item.thumbnail;
  const enc = item.enclosure?.link;
  if (enc && /^https?:\/\//.test(enc) && (item.enclosure.type?.startsWith('image') || /\.(jpe?g|png|gif|webp)(\?|$)/i.test(enc))) return enc;
  return null;
};

const loadBookmarks = () => {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '{}'); } catch { return {}; }
};
const saveBookmarks = (bm) => {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); } catch { /* ignore */ }
};

/* ── Sources ── */
const SOURCES = [
  {
    id: 'bbc', name: 'BBC News', domain: 'bbc.com',
    categories: [
      { id: 'top',        label: 'Top News', url: 'https://feeds.bbci.co.uk/news/rss.xml' },
      { id: 'world',      label: 'World',    url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
      { id: 'technology', label: 'Tech',     url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
      { id: 'economy',    label: 'Economy',  url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
      { id: 'science',    label: 'Science',  url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
      { id: 'sports',     label: 'Sports',   url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
    ],
  },
  {
    id: 'hindu', name: 'The Hindu', domain: 'thehindu.com',
    categories: [
      { id: 'top',      label: 'Top News',   url: 'https://www.thehindu.com/feeder/default.rss' },
      { id: 'national', label: 'National',   url: 'https://www.thehindu.com/news/national/feeder/default.rss' },
      { id: 'world',    label: 'World',      url: 'https://www.thehindu.com/news/international/feeder/default.rss' },
      { id: 'business', label: 'Business',   url: 'https://www.thehindu.com/business/feeder/default.rss' },
      { id: 'science',  label: 'Sci & Tech', url: 'https://www.thehindu.com/sci-tech/feeder/default.rss' },
      { id: 'sports',   label: 'Sports',     url: 'https://www.thehindu.com/sport/feeder/default.rss' },
    ],
  },
  {
    id: 'toi', name: 'Times of India', domain: 'timesofindia.com',
    categories: [
      { id: 'top',    label: 'Top Stories', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms' },
      { id: 'world',  label: 'World',       url: 'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms' },
      { id: 'tech',   label: 'Tech',        url: 'https://timesofindia.indiatimes.com/rssfeeds/66949542.cms' },
      { id: 'sports', label: 'Sports',      url: 'https://timesofindia.indiatimes.com/rssfeeds/4719161.cms' },
    ],
  },
  {
    id: 'ndtv', name: 'NDTV', domain: 'ndtv.com',
    categories: [
      { id: 'top',    label: 'Top News', url: 'https://feeds.feedburner.com/ndtvnews-top-stories' },
      { id: 'india',  label: 'India',    url: 'https://feeds.feedburner.com/ndtvnews-india-news' },
      { id: 'world',  label: 'World',    url: 'https://feeds.feedburner.com/ndtvnews-world-news' },
      { id: 'sports', label: 'Sports',   url: 'https://feeds.feedburner.com/ndtvnews-sports' },
    ],
  },
  {
    id: 'et', name: 'Economic Times', domain: 'economictimes.com',
    categories: [
      { id: 'top',      label: 'Top Stories', url: 'https://economictimes.indiatimes.com/rssfeedsdefault.cms' },
      { id: 'markets',  label: 'Markets',     url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
      { id: 'politics', label: 'Politics',    url: 'https://economictimes.indiatimes.com/news/politics-and-nation/rssfeeds/38.cms' },
      { id: 'tech',     label: 'Tech',        url: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms' },
    ],
  },
  {
    id: 'guardian', name: 'The Guardian', domain: 'theguardian.com',
    categories: [
      { id: 'world',    label: 'World',    url: 'https://www.theguardian.com/world/rss' },
      { id: 'tech',     label: 'Tech',     url: 'https://www.theguardian.com/technology/rss' },
      { id: 'business', label: 'Business', url: 'https://www.theguardian.com/business/rss' },
      { id: 'science',  label: 'Science',  url: 'https://www.theguardian.com/science/rss' },
      { id: 'sports',   label: 'Sports',   url: 'https://www.theguardian.com/sport/rss' },
    ],
  },
  {
    id: 'aljazeera', name: 'Al Jazeera', domain: 'aljazeera.com',
    categories: [
      { id: 'top', label: 'All News', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
    ],
  },
];

/* ── Article card ── */
const ArticleCard = ({ item, bookmarks, onToggleBookmark, onSelect }) => {
  const thumb   = getThumb(item);
  const fresh   = isNew(item.pubDate);
  const saved   = !!bookmarks[item.link];

  return (
    <div className="group bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl overflow-hidden hover:border-[#1C3A2B] hover:shadow-xs transition duration-200 flex flex-col">
      <button onClick={() => onSelect(item)} className="block w-full text-left cursor-pointer">
        <div className="aspect-video bg-[#FAF8F5] dark:bg-[#111A14] border-b border-[#E5DFD5] dark:border-[#26362D] flex-shrink-0 overflow-hidden w-full relative">
          {thumb ? (
            <img src={thumb} alt={item.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              onError={e => { e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-[#FAF8F5] dark:bg-[#111A14] flex items-center justify-center text-[#6D8374] dark:text-[#8CA093]"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg></div>'; }} />
          ) : (
            <div className="w-full h-full bg-[#FAF8F5] dark:bg-[#111A14] flex items-center justify-center text-[#6D8374] dark:text-[#8CA093]">
              <Newspaper size={28} />
            </div>
          )}
          {fresh && (
            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#1C3A2B] text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-xs">
              Dispatch
            </span>
          )}
        </div>
      </button>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between text-[11px] text-[#5D645E] dark:text-[#9FB1A6]">
          <span>{moment(item.pubDate).fromNow()}</span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#6D8374] dark:text-[#8CA093]">
              <Clock size={11} /> {readTime(item)}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleBookmark(item); }}
              title={saved ? "Remove bookmark" : "Save for later"}
              className={`p-1 rounded-md transition-colors cursor-pointer ${saved ? 'text-[#1C3A2B] dark:text-[#8FD4AE] bg-[#E8EFEA] dark:bg-[#1E2E25]' : 'text-[#8A948D] hover:text-[#1C1E1B] hover:bg-[#FAF8F5] dark:hover:bg-[#1E2E25]'}`}
            >
              {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
            </button>
          </div>
        </div>

        <button onClick={() => onSelect(item)} className="text-left flex-1 cursor-pointer">
          <h3 className="font-serif-lib font-bold text-sm text-[#1C1E1B] dark:text-white leading-snug line-clamp-2 group-hover:text-[#1C3A2B] dark:group-hover:text-[#8FD4AE] transition-colors">
            {item.title}
          </h3>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] leading-relaxed line-clamp-2 mt-1.5">
            {stripHtml(item.description)}
          </p>
        </button>

        <button onClick={() => onSelect(item)} className="text-xs text-[#1C3A2B] dark:text-[#8FD4AE] font-semibold mt-auto pt-2 flex items-center gap-1.5 self-start hover:underline cursor-pointer">
          Read dispatch <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

/* ── Main component ── */
export default function NewsView() {
  const [newsItems,    setNewsItems]    = useState([]);
  const [newsLoading,  setNewsLoading]  = useState(false);
  const [newsError,    setNewsError]    = useState(null);
  const [newsSource,   setNewsSource]   = useState('bbc');
  const [newsCategory, setNewsCategory] = useState('top');
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsPage,     setNewsPage]     = useState(0);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [activeTab,    setActiveTab]    = useState('feed');
  const [bookmarks,    setBookmarks]    = useState(loadBookmarks);

  const activeSrc = SOURCES.find(s => s.id === newsSource) || SOURCES[0];
  const activeCat = activeSrc.categories.find(c => c.id === newsCategory) || activeSrc.categories[0];

  const fetchNews = useCallback(async (feedUrl, force = false) => {
    const cached = _newsCache[feedUrl];
    if (!force && cached && Date.now() - cached.ts < NEWS_CACHE_TTL) {
      setNewsItems(sortByDate(cached.items));
      setNewsError(null);
      return;
    }
    setNewsLoading(true);
    setNewsError(null);
    try {
      const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`);
      if (res.status === 429) {
        if (cached) { setNewsItems(sortByDate(cached.items)); setNewsError('Showing cached results (rate limit reached). Try again in a minute.'); }
        else setNewsError('Too many requests. Please wait a moment before switching sources.');
        return;
      }
      const data = await res.json();
      if (data.status === 'ok') {
        const items = sortByDate(data.items || []);
        _newsCache[feedUrl] = { items, ts: Date.now() };
        setNewsItems(items);
      } else {
        setNewsError('Unable to fetch news feed. Please try again later.');
      }
    } catch {
      setNewsError('Unable to connect to news feed. Please verify your connection.');
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    setSelectedNews(null);
    setNewsPage(0);
    fetchNews('https://feeds.bbci.co.uk/news/rss.xml');
  }, [fetchNews]);

  const handleSourceChange = (srcId) => {
    const src = SOURCES.find(s => s.id === srcId) || SOURCES[0];
    setNewsSource(srcId);
    setNewsCategory(src.categories[0].id);
    setSelectedNews(null);
    setNewsPage(0);
    setSearchQuery('');
    fetchNews(src.categories[0].url);
  };

  const handleCategoryChange = (cat) => {
    setNewsCategory(cat.id);
    setSelectedNews(null);
    setNewsPage(0);
    setSearchQuery('');
    fetchNews(cat.url);
  };

  const handleToggleBookmark = (item) => {
    setBookmarks(prev => {
      const next = { ...prev };
      if (next[item.link]) delete next[item.link];
      else next[item.link] = { title: item.title, link: item.link, pubDate: item.pubDate, description: item.description, thumbnail: getThumb(item), source: activeSrc.name };
      saveBookmarks(next);
      return next;
    });
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredItems = q
    ? newsItems.filter(i => i.title?.toLowerCase().includes(q) || stripHtml(i.description)?.toLowerCase().includes(q))
    : newsItems;

  const savedList    = Object.values(bookmarks);
  const displayItems = activeTab === 'saved' ? savedList : filteredItems;
  const totalPages   = Math.ceil(displayItems.length / ITEMS_PER_PAGE);
  const pagedItems   = displayItems.slice(newsPage * ITEMS_PER_PAGE, (newsPage + 1) * ITEMS_PER_PAGE);

  const switchTab = (tab) => { setActiveTab(tab); setNewsPage(0); setSearchQuery(''); setSelectedNews(null); };

  /* ── Detail view ── */
  if (selectedNews) {
    const savedInDetail = !!bookmarks[selectedNews.link];
    const srcDomain = SOURCES.find(s => s.name === selectedNews._sourceName)?.domain || activeSrc.domain;
    const srcName   = selectedNews._sourceName || activeSrc.name;

    return (
      <div className="w-full max-w-3xl space-y-6 bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl p-6 md:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] dark:border-[#26362D]">
          <button onClick={() => setSelectedNews(null)} className="flex items-center gap-2 text-xs font-semibold text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C3A2B] dark:hover:text-[#8FD4AE] transition group cursor-pointer">
            <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-0.5 transition-transform" /> Back to Periodicals Desk
          </button>
          <button
            onClick={() => handleToggleBookmark(selectedNews)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
              savedInDetail
                ? 'bg-[#E8EFEA] dark:bg-[#1E2E25] border-[#1C3A2B]/20 text-[#1C3A2B] dark:text-[#8FD4AE]'
                : 'bg-[#FAF8F5] dark:bg-[#111A14] border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B] hover:border-[#1C3A2B]'
            }`}
          >
            {savedInDetail ? <><BookmarkCheck size={13} /> Bookmarked</> : <><Bookmark size={13} /> Bookmark for Later</>}
          </button>
        </div>

        {getThumb(selectedNews) && (
          <div className="w-full rounded-2xl overflow-hidden aspect-video bg-[#FAF8F5] dark:bg-[#111A14] border border-[#E5DFD5] dark:border-[#26362D]">
            <img src={getThumb(selectedNews)} alt={selectedNews.title} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
          </div>
        )}

        {selectedNews.categories?.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedNews.categories.filter(Boolean).map((c, i) => (
              <span key={i} className="px-2.5 py-0.5 bg-[#F4EFE6] dark:bg-[#203126] text-[#2D312E] dark:text-[#8FD4AE] border border-[#E5DFD5] dark:border-[#2B4032] rounded-md text-[11px] font-medium">{c}</span>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-xs text-[#5D645E] dark:text-[#9FB1A6] flex-wrap">
            <span className="flex items-center gap-1.5 font-medium text-[#1C1E1B] dark:text-white">
              <img src={`https://www.google.com/s2/favicons?domain=${srcDomain}&sz=32`} alt="" className="w-3.5 h-3.5 rounded-sm" />
              {srcName}
            </span>
            <span>·</span>
            <span>{moment(selectedNews.pubDate).format('DD MMMM YYYY [·] HH:mm')}</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#6D8374] dark:text-[#8CA093]"><Clock size={11} /> {readTime(selectedNews)}</span>
          </div>
          <h1 className="text-2xl font-serif-lib font-bold text-[#1C1E1B] dark:text-white leading-tight">{selectedNews.title}</h1>
        </div>

        <div
          className="text-[#2D312E] dark:text-[#E2ECE5] text-sm leading-7 font-sans pt-2 border-t border-[#F4EFE6] dark:border-[#26362D]
            [&_p]:mb-4 [&_p]:leading-7
            [&_figure]:my-4 [&_figure]:rounded-lg [&_figure]:overflow-hidden
            [&_img]:w-full [&_img]:rounded-lg [&_img]:my-3
            [&_figcaption]:text-xs [&_figcaption]:text-[#5D645E] [&_figcaption]:mt-1
            [&_h2]:text-base [&_h2]:font-serif-lib [&_h2]:font-bold [&_h2]:text-[#1C1E1B] [&_h2]:mt-6 [&_h2]:mb-2
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5
            [&_li]:leading-6
            [&_a]:text-[#1C3A2B] dark:[&_a]:text-[#8FD4AE] [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedNews.content || selectedNews.description) }}
        />

        <div className="pt-4 border-t border-[#E5DFD5] dark:border-[#26362D] flex items-center justify-between">
          <a href={selectedNews.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C3A2B] hover:bg-[#13221A] dark:bg-[#2A4D3B] text-white rounded-xl text-xs font-semibold transition shadow-xs">
            Open Original Publication on {srcName} <ExternalLink size={13} />
          </a>
          <button onClick={() => setSelectedNews(null)} className="text-xs font-medium text-[#5D645E] dark:text-[#9FB1A6] hover:underline cursor-pointer">
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  /* ── Grid view ── */
  return (
    <div className="space-y-6 w-full max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5] dark:border-[#26362D]">
        <div>
          <h2 className="text-xl font-serif-lib font-bold text-[#1C1E1B] dark:text-white flex items-center gap-2.5">
            <Newspaper size={22} className="text-[#1C3A2B] dark:text-[#8FD4AE]" /> Current Affairs &amp; Periodicals Desk
          </h2>
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-1">Curated real-time broadsheets and digests for competitive exam preparation (UPSC, JKPSC, SSC, Banking).</p>
        </div>
        {activeTab === 'feed' && (
          <button onClick={() => fetchNews(activeCat.url, true)} disabled={newsLoading}
            title="Refresh current feed"
            className="self-start sm:self-auto p-2 rounded-xl bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5] text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B] transition disabled:opacity-50 shadow-xs cursor-pointer">
            <RefreshCw size={15} className={newsLoading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Feed / Saved tabs */}
      <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-xl p-1 w-fit">
        <button onClick={() => switchTab('feed')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${activeTab === 'feed' ? 'bg-[#1C3A2B] text-white shadow-xs dark:bg-[#2A4D3B]' : 'text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B]'}`}>
          Broadsheet Feed
        </button>
        <button onClick={() => switchTab('saved')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'saved' ? 'bg-[#1C3A2B] text-white shadow-xs dark:bg-[#2A4D3B]' : 'text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B]'}`}>
          <Bookmark size={12} /> Reading List
          {savedList.length > 0 && (
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-[#E5DFD5] dark:bg-[#26362D] text-[#1C1E1B] dark:text-white'}`}>
              {savedList.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'feed' && (
        <>
          {/* Source Selectors */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {SOURCES.map(src => (
              <button key={src.id} onClick={() => handleSourceChange(src.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0 transition border shadow-xs cursor-pointer ${
                  newsSource === src.id
                    ? 'bg-[#1C3A2B] border-[#1C3A2B] text-white dark:bg-[#2A4D3B]'
                    : 'bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:border-[#1C3A2B]/40 hover:text-[#1C1E1B]'
                }`}>
                <img src={`https://www.google.com/s2/favicons?domain=${src.domain}&sz=32`} alt={src.name} className="w-3.5 h-3.5 rounded-sm flex-shrink-0" />
                {src.name}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5">
            {activeSrc.categories.map(cat => (
              <button key={cat.id} onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition border cursor-pointer ${
                  activeCat.id === cat.id
                    ? 'bg-[#E8EFEA] dark:bg-[#1E2E25] border-[#1C3A2B]/30 text-[#1C3A2B] dark:text-[#8FD4AE] font-semibold'
                    : 'bg-white dark:bg-[#16211B] border-[#E5DFD5] dark:border-[#26362D] text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B] hover:border-[#1C3A2B]/30'
                }`}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          {newsItems.length > 0 && !newsLoading && (
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A948D]" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setNewsPage(0); }}
                placeholder={`Search loaded dispatches from ${activeSrc.name}…`}
                className="w-full bg-white dark:bg-[#16211B] border border-[#D9D2C5] dark:border-[#26362D] rounded-xl pl-9 pr-9 py-2 text-xs text-[#1C1E1B] dark:text-white placeholder-[#9CA3AF] shadow-xs"
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); setNewsPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A948D] hover:text-[#1C1E1B] dark:hover:text-white transition cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>
          )}
        </>
      )}

      {newsLoading && <LoadingRow text="Fetching latest press wires…" />}

      {newsError && (
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-4 py-3 rounded-xl text-xs">
          <AlertTriangle size={15} /> {newsError}
        </div>
      )}

      {activeTab === 'saved' && savedList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-[#D9D2C5] dark:border-[#26362D] rounded-2xl bg-white dark:bg-[#16211B] text-center p-6">
          <div className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-[#203126] border border-[#E5DFD5] dark:border-[#2B4032] flex items-center justify-center text-[#6D8374] dark:text-[#8FD4AE]">
            <Bookmark size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1E1B] dark:text-white">No saved articles yet</p>
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6] mt-0.5">Click the bookmark icon on any dispatch to save it to your local reading list for offline study.</p>
          </div>
        </div>
      )}

      {activeTab === 'feed' && !newsLoading && searchQuery && filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
          <Search size={24} className="text-[#8A948D]" />
          <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">No articles match your query "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')} className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline cursor-pointer">Clear search filter</button>
        </div>
      )}

      {!newsLoading && pagedItems.length > 0 && (
        <>
          {activeTab === 'feed' && searchQuery && filteredItems.length > 0 && (
            <p className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">{filteredItems.length} article{filteredItems.length !== 1 ? 's' : ''} matching "{searchQuery}"</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedItems.map((item, i) => (
              activeTab === 'saved' ? (
                <div key={item.link || i} className="bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] rounded-2xl overflow-hidden hover:border-[#1C3A2B] transition duration-200 flex flex-col shadow-xs">
                  {item.thumbnail && (
                    <div className="aspect-video bg-[#FAF8F5] dark:bg-[#111A14] border-b border-[#E5DFD5] dark:border-[#26362D] overflow-hidden">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover"
                        onError={e => { e.currentTarget.parentElement.style.display = 'none'; }} />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-[#5D645E] dark:text-[#9FB1A6]">
                      <span>{moment(item.pubDate).fromNow()}</span>
                      <button onClick={() => handleToggleBookmark(item)} className="p-1 rounded-md text-[#1C3A2B] dark:text-[#8FD4AE] hover:text-red-600 transition cursor-pointer" title="Remove from list">
                        <BookmarkCheck size={14} />
                      </button>
                    </div>
                    <h3 className="font-serif-lib font-bold text-sm text-[#1C1E1B] dark:text-white leading-snug line-clamp-3">{item.title}</h3>
                    {item.source && <p className="text-[11px] text-[#6D8374] dark:text-[#8CA093] font-medium">{item.source}</p>}
                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#1C3A2B] dark:text-[#8FD4AE] hover:underline mt-auto pt-2 flex items-center gap-1 self-start">
                      Open original <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ) : (
                <ArticleCard
                  key={item.link || i}
                  item={item}
                  bookmarks={bookmarks}
                  onToggleBookmark={handleToggleBookmark}
                  onSelect={(it) => setSelectedNews({ ...it, _sourceName: activeSrc.name })}
                />
              )
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-[#E5DFD5] dark:border-[#26362D]">
              <button onClick={() => setNewsPage(p => p - 1)} disabled={newsPage === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5] text-xs font-medium text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer">
                <ArrowRight size={13} className="rotate-180" /> Previous
              </button>
              <span className="text-xs text-[#5D645E] dark:text-[#9FB1A6]">Page {newsPage + 1} of {totalPages}</span>
              <button onClick={() => setNewsPage(p => p + 1)} disabled={newsPage >= totalPages - 1}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#16211B] border border-[#E5DFD5] dark:border-[#26362D] hover:bg-[#FAF8F5] text-xs font-medium text-[#5D645E] dark:text-[#9FB1A6] hover:text-[#1C1E1B] disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs cursor-pointer">
                Next <ArrowRight size={13} />
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'feed' && !newsLoading && !searchQuery && (
        <p className="text-[11px] text-[#8A948D] dark:text-[#7A8A7F] text-center pt-2">Source: {activeSrc.name} · Real-time syndicated feeds for academic reference</p>
      )}
    </div>
  );
}
