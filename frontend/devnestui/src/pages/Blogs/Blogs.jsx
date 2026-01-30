import { useEffect, useMemo, useRef, useState } from 'react';
import './Blogs.css';

const DEVTO_API_BASE = 'https://dev.to/api';

const safeArray = (v) => (Array.isArray(v) ? v : []);
const normalizeTag = (t) => String(t || '').trim().toLowerCase();

const Blogs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [latest, setLatest] = useState([]);
  const [trending, setTrending] = useState([]);
  const [tagged, setTagged] = useState([]);

  const [activeTab, setActiveTab] = useState('latest'); // latest | trending | tag
  const [activeTag, setActiveTag] = useState('react');
  const [query, setQuery] = useState('');

  // Pagination: 12 per page, max 10 pages
  const PER_PAGE = 12;
  const MAX_PAGES = 10;
  const [page, setPage] = useState(1);

  const abortRef = useRef(null);

  const popularTags = useMemo(
    () => [
      'react',
      'javascript',
      'typescript',
      'dotnet',
      'csharp',
      'python',
      'devops',
      'sql',
      'career',
    ],
    []
  );

  const fetchDevto = async (pathAndQuery, signal) => {
    const res = await fetch(`${DEVTO_API_BASE}${pathAndQuery}`, {
      signal,
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`Dev.to request failed: ${res.status}`);
    return res.json();
  };

  const fetchBlogData = async ({ tag = activeTag, pageParam = page } = {}) => {
    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const [latestRes, trendingRes, taggedRes] = await Promise.all([
        fetchDevto(`/articles?per_page=${PER_PAGE}&page=${pageParam}`, controller.signal),
        fetchDevto(`/articles?top=7&per_page=${PER_PAGE}&page=${pageParam}`, controller.signal),
        fetchDevto(
          `/articles?tag=${encodeURIComponent(tag)}&per_page=${PER_PAGE}&page=${pageParam}`,
          controller.signal
        ),
      ]);

      setLatest(safeArray(latestRes));
      setTrending(safeArray(trendingRes));
      setTagged(safeArray(taggedRes));
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.error('Error fetching Dev.to:', err);
      setError('Грешка при зареждане от Dev.to. Моля, опитайте отново.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchBlogData({ pageParam: 1 });
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // reset pagination when switching tabs
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    // refresh only the tagged feed when tag changes (always back to page 1)
    (async () => {
      try {
        setLoading(true);
        setError(null);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const taggedRes = await fetchDevto(
          `/articles?tag=${encodeURIComponent(activeTag)}&per_page=${PER_PAGE}&page=1`,
          controller.signal
        );
        setTagged(safeArray(taggedRes));
        setPage(1);
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error('Error fetching Dev.to tag:', err);
        setError('Грешка при зареждане на таговете от Dev.to.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag]);

  useEffect(() => {
    // fetch the right feed when page changes
    (async () => {
      try {
        setLoading(true);
        setError(null);

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        const safePage = Math.min(MAX_PAGES, Math.max(1, page));

        if (activeTab === 'latest') {
          const latestRes = await fetchDevto(
            `/articles?per_page=${PER_PAGE}&page=${safePage}`,
            controller.signal
          );
          setLatest(safeArray(latestRes));
        } else if (activeTab === 'trending') {
          const trendingRes = await fetchDevto(
            `/articles?top=7&per_page=${PER_PAGE}&page=${safePage}`,
            controller.signal
          );
          setTrending(safeArray(trendingRes));
        } else {
          const taggedRes = await fetchDevto(
            `/articles?tag=${encodeURIComponent(activeTag)}&per_page=${PER_PAGE}&page=${safePage}`,
            controller.signal
          );
          setTagged(safeArray(taggedRes));
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error('Error fetching Dev.to page:', err);
        setError('Грешка при зареждане от Dev.to. Моля, опитайте отново.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const raw = query.trim();
    if (!raw) return;

    // Tag search (works for any single-token tag, e.g. "#react" or "react")
    const looksLikeTag = raw.startsWith('#') || (!raw.includes(' ') && raw.length <= 30);
    const normalized = normalizeTag(raw.startsWith('#') ? raw.slice(1) : raw);

    if (looksLikeTag) {
      setActiveTab('tag');
      setActiveTag(normalized);
      setQuery('');
      return;
    }

    // Otherwise: keep as local text filter (title/desc/tags) for the current page
  };

  const filterByQuery = (articles) => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;

    return articles.filter((a) => {
      const title = String(a?.title || '').toLowerCase();
      const desc = String(a?.description || '').toLowerCase();
      const tags = safeArray(a?.tag_list).map(normalizeTag).join(' ');
      return title.includes(q) || desc.includes(q) || tags.includes(q);
    });
  };

  const activeArticles = useMemo(() => {
    const base =
      activeTab === 'trending'
        ? trending
        : activeTab === 'tag'
        ? tagged
        : latest;

    return filterByQuery(base);
  }, [activeTab, latest, trending, tagged, query]);

  // Dev.to endpoint doesn't return total count reliably, so:
  // - cap UI to MAX_PAGES
  // - if current page returns < PER_PAGE, treat as last page
  const canGoPrev = page > 1;
  const canGoNext = page < MAX_PAGES && activeArticles.length === PER_PAGE;

  const visiblePages = useMemo(() => {
    const last = Math.min(MAX_PAGES, Math.max(1, page + 4));
    const first = Math.max(1, last - 4);
    const pages = [];
    for (let p = first; p <= last; p++) pages.push(p);
    return pages;
  }, [page, MAX_PAGES]);

  const renderArticleCard = (a) => {
    const cover = a?.cover_image || a?.social_image || null;
    const tags = safeArray(a?.tag_list);

    return (
      <article key={a.id} className="article-card">
        {cover ? (
          <div className="article-cover">
            <img src={cover} alt={a.title} loading="lazy" />
          </div>
        ) : (
          <div className="article-cover article-cover--placeholder" />
        )}

        <div className="article-body">
          <div className="article-meta">
            <span className="article-date">{a.readable_publish_date || '—'}</span>
            <span className="article-author">{a?.user?.name || 'Dev.to'}</span>
          </div>

          <h3 className="article-title">{a.title}</h3>

          {a.description ? <p className="article-desc">{a.description}</p> : null}

          {tags.length > 0 ? (
            <div className="article-tags">
              {tags.slice(0, 4).map((t) => (
                <span key={t} className="mini-tag">
                  #{t}
                </span>
              ))}
            </div>
          ) : null}

          <div className="article-footer">
            <div className="article-stats">
              <span title="Reactions" className="stat-pill">
                ❤️ {a.positive_reactions_count ?? 0}
              </span>
              <span title="Comments" className="stat-pill">
                💬 {a.comments_count ?? 0}
              </span>
            </div>

            <a
              className="read-more"
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Read on Dev.to: ${a.title}`}
            >
              Read on Dev.to →
            </a>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="blog-section" aria-labelledby="devnest-blog-title">
      <div className="blog-header">
        <h2 id="devnest-blog-title" className="blog-title">
          Блог
        </h2>
      </div>

      <div className="blog-shell">
        <div className="blog-toolbar">
          <div className="blog-tabs">
            <button
              className={`tab-btn ${activeTab === 'latest' ? 'active' : ''}`}
              onClick={() => setActiveTab('latest')}
              type="button"
            >
              Latest
            </button>
            <button
              className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
              onClick={() => setActiveTab('trending')}
              type="button"
            >
              Trending
            </button>
            <button
              className={`tab-btn ${activeTab === 'tag' ? 'active' : ''}`}
              onClick={() => setActiveTab('tag')}
              type="button"
            >
              Tag
            </button>
          </div>

          <form className="blog-search" onSubmit={handleSearchSubmit} role="search">
            <input
              className="blog-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Търси в заглавия/описания/тагове…"
              aria-label="Search articles by title, description, or tag"
            />
            <button className="search-btn" type="submit" aria-label="Search">
              Search
            </button>
          </form>
        </div>

        {activeTab === 'tag' && (
          <div className="tag-row">
            {popularTags.map((t) => (
              <button
                key={t}
                type="button"
                className={`tag-btn ${activeTag === t ? 'active' : ''}`}
                onClick={() => setActiveTag(t)}
              >
                #{t}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="loading-state">Зареждане от Dev.to…</div>}

        {error && (
          <div className="error-state">
            <div>{error}</div>
            <button className="retry-button" onClick={() => fetchBlogData({ pageParam: page })} type="button">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && activeArticles.length === 0 && (
          <div className="empty-state">Няма резултати.</div>
        )}

        {!loading && !error && activeArticles.length > 0 && (
          <>
            <div className="articles-grid">{activeArticles.map(renderArticleCard)}</div>

            <nav className="pagination" aria-label="Articles pagination">
              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!canGoPrev}
              >
                Prev
              </button>

              <div className="page-numbers">
                {visiblePages.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`page-number ${p === page ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="page-btn"
                onClick={() => setPage((p) => Math.min(MAX_PAGES, p + 1))}
                disabled={!canGoNext}
              >
                Next
              </button>
            </nav>
          </>
        )}
      </div>
    </section>
  );
};

export default Blogs;
