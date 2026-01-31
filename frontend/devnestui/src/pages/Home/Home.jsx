import { useEffect, useMemo, useRef, useState } from 'react';
import './Home.css';

const API_BASE_URL = 'http://localhost:5099/api';

const safeLower = (v) => (typeof v === 'string' ? v.toLowerCase() : '');

const slugify = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

/** Fix false matches like "c" inside "react" */
const textHasTech = (text, token) => {
  if (!text || !token) return false;

  const t = token.toLowerCase().trim();
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // short tokens => word boundary match
  if (t.length <= 2) {
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    return re.test(text);
  }

  return text.includes(t);
};

// ✅ Your DB categories (Name / Slug / Description / IconUrl)
// NOTE: Description stays in data, but we DO NOT render it in the UI.
const baseCategories = [
  {
    name: 'Junior / Intern',
    slug: 'junior-intern',
    description: 'Entry-level roles and internships',
    iconUrl:
      'https://th.bing.com/th/id/OIP.S2UPqdHdN4Vgi93KjW7wdQAAAA?w=141&h=150&c=7&r=0&o=7&dpr=1.1&pid=1.7&rm=3',
  },
  {
    name: 'BackEnd Development',
    slug: 'backend-development',
    description: 'Server-side development roles',
    iconUrl:
      'https://static.vecteezy.com/system/resources/previews/012/687/166/original/coding-icon-design-free-vector.jpg',
  },
  {
    name: 'FrontEnd Development',
    slug: 'frontend-development',
    description: 'UI and client-side development roles',
    iconUrl:
      'https://static.vecteezy.com/system/resources/previews/012/854/443/original/frontend-development-icon-style-vector.jpg',
  },
  {
    name: 'Fullstack Development',
    slug: 'fullstack-development',
    description: 'Frontend + Backend combined roles',
    iconUrl:
      'https://cdn.iconscout.com/icon/premium/png-256-thumb/fullstack-development-1182876.png',
  },
  {
    name: 'Infrastructure',
    slug: 'infrastructure',
    description: 'DevOps, Cloud, SysAdmin, Networking',
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/8463/8463692.png',
  },
  {
    name: 'Quality Assurance',
    slug: 'quality-assurance',
    description: 'Manual and automation QA roles',
    iconUrl:
      'https://static.vecteezy.com/system/resources/previews/019/820/701/non_2x/security-scanner-icon-vector.jpg',
  },
  {
    name: 'PM/BA and more',
    slug: 'pm-ba-and-more',
    description: 'Product, Project, Business Analysis roles',
    iconUrl:
      'https://tse1.mm.bing.net/th/id/OIP.CocKBsoElgKHRfLeDtoOEwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    name: 'Mobile Development',
    slug: 'mobile-development',
    description: 'iOS, Android, mobile frameworks',
    iconUrl:
      'https://static.vecteezy.com/system/resources/previews/026/330/673/non_2x/mobile-app-development-icon-vector.jpg',
  },
  {
    name: 'Data Science',
    slug: 'data-science',
    description: 'Data analysis, BI, ML roles',
    iconUrl:
      'https://tse4.mm.bing.net/th/id/OIP.UnNFLCjVRjWgSwkSw1JNBQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    name: 'ERP / CRM Development',
    slug: 'erp-crm-development',
    description: 'ERP/CRM development and integrations',
    iconUrl:
      'https://static.vecteezy.com/system/resources/previews/007/679/520/large_2x/settings-gears-line-icon-vector.jpg',
  },
  {
    name: 'Hardware and Engineering',
    slug: 'hardware-and-engineering',
    description: 'Embedded systems and hardware roles',
    iconUrl:
      'https://www.clipartmax.com/png/middle/238-2381085_computer-science-engineering-logos.png',
  },
  {
    name: 'Customer Support',
    slug: 'customer-support',
    description: 'Customer success and support roles',
    iconUrl:
      'https://tse4.mm.bing.net/th/id/OIP.5oQXixQHLvfgzhJlTP4gvAHaE3?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    name: 'Technical Support',
    slug: 'technical-support',
    description: 'Technical and IT support roles',
    iconUrl: 'https://cdn-icons-png.freepik.com/512/11748/11748582.png',
  },
  {
    name: 'UI/UX, Arts',
    slug: 'ui-ux-arts',
    description: 'Design, UX, visual and creative roles',
    iconUrl:
      'https://cdn2.iconfinder.com/data/icons/business-icons-36/48/designer-4-512.png',
  },
  {
    name: 'IT Management',
    slug: 'it-management',
    description: 'IT leadership and management roles',
    iconUrl:
      'https://png.pngtree.com/png-clipart/20230330/original/pngtree-management-services-line-icon-png-image_9009405.png',
  },
];

// ✅ Static sub-tech lists (like DEV.BG).
// Counts are optional (Backend/Frontend currently without counts as you requested).
const CATEGORY_TECHS = {
  'backend-development': [
    { name: '.NET' },
    { name: 'Java' },
    { name: 'Python' },
    { name: 'Ruby' },
    { name: 'PHP' },
    { name: 'C/C++/Embedded' },
    { name: 'Go' },
  ],
  'frontend-development': [
    { name: 'JS' },
    { name: 'React' },
    { name: 'Vue.js' },
    { name: 'Angular' },
  ],
  infrastructure: [
    { name: 'DevOps', count: 166 },
    { name: 'Database Engineer', count: 41 },
    { name: 'Cybersecurity', count: 88 },
    { name: 'SysAdmin', count: 34 },
  ],
  'quality-assurance': [
    { name: 'Automation QA', count: 99 },
    { name: 'Manual QA', count: 22 },
  ],
  'pm-ba-and-more': [
    { name: 'IT Project Management', count: 47 },
    { name: 'IT Business Analyst', count: 34 },
    { name: 'Product Management', count: 21 },
    { name: 'Product Owner', count: 26 },
    { name: 'Tech Writer', count: 2 },
  ],
  'mobile-development': [
    { name: 'iOS', count: 8 },
    { name: 'Android', count: 15 },
  ],
  'data-science': [
    { name: 'ETL/Data warehouse', count: 43 },
    { name: 'Big Data', count: 5 },
    { name: 'BI/Data visualization', count: 56 },
    { name: 'ML/AI/Data modelling', count: 101 },
  ],
  'erp-crm-development': [
    { name: 'SAP', count: 37 },
    { name: 'SalesForce', count: 18 },
  ],
};

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [techs, setTechs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);

  const categoriesRef = useRef(null);

  // Build lookup: tech name/slug => logoUrl, + tokens for matching
  const techIndex = useMemo(() => {
    const byKey = new Map(); // lower => {name, slug, logoUrl}
    const tokens = []; // [{ token, displayName }]

    (techs || []).forEach((t) => {
      const name = (t.name ?? t.Name ?? '').toString().trim();
      const slug = (t.slug ?? t.Slug ?? '').toString().trim();
      const logoUrl = (t.logoUrl ?? t.LogoUrl ?? '').toString().trim();

      if (name) byKey.set(name.toLowerCase(), { name, slug, logoUrl });
      if (slug) byKey.set(slug.toLowerCase(), { name: name || slug, slug, logoUrl });

      const token = (slug || name).toString().trim().toLowerCase();
      if (token) tokens.push({ token, displayName: name || slug });
    });

    // Extra aliases users expect
    const dotnetLogo =
      byKey.get('dotnetcore')?.logoUrl ||
      byKey.get('dot-net')?.logoUrl ||
      byKey.get('csharp')?.logoUrl ||
      byKey.get('entityframeworkcore')?.logoUrl ||
      '';

    if (dotnetLogo) {
      [
        '.net',
        'dotnet',
        'dotnet core',
        'asp.net',
        'asp.net core',
        'c#',
        'entity framework',
        'ef core',
        'efcore',
      ].forEach((k) => byKey.set(k, { name: k, slug: slugify(k), logoUrl: dotnetLogo }));

      [
        '.net',
        'dotnet',
        'dotnetcore',
        'dot-net',
        'asp.net',
        'aspnet',
        'aspnetcore',
        'c#',
        'csharp',
        'ef',
        'efcore',
      ].forEach((tok) => tokens.push({ token: tok, displayName: tok }));
    }

    return { byKey, tokens };
  }, [techs]);

  const getTechLogoUrl = (techDisplayName) => {
    const key = (techDisplayName || '').toLowerCase().trim();
    return techIndex.byKey.get(key)?.logoUrl || null;
  };

  const getJobCategorySlug = (job) => {
    const raw =
      job?.category?.slug ??
      job?.category?.Slug ??
      job?.categorySlug ??
      job?.CategorySlug ??
      job?.category?.name ??
      job?.category?.Name ??
      job?.categoryName ??
      job?.CategoryName ??
      '';

    return raw ? slugify(raw) : '';
  };

  const getJobTextForMatching = (j) => {
    const title = safeLower(j.title ?? j.Title);
    const desc = safeLower(j.description ?? j.Description);
    const reqs = safeLower(j.requirements ?? j.Requirements);
    const techStack = safeLower(j.techStack ?? j.TechStack);
    const techArr = Array.isArray(j.techs ?? j.Techs) ? (j.techs ?? j.Techs).map(safeLower) : [];
    return `${reqs} ${title} ${desc} ${techStack} ${techArr.join(' ')}`.trim();
  };

  const computeCategories = (jobsData) => {
    const countByCat = new Map();

    for (const j of jobsData) {
      const catSlug = getJobCategorySlug(j);
      if (!catSlug) continue;
      countByCat.set(catSlug, (countByCat.get(catSlug) || 0) + 1);
    }

    return baseCategories.map((c) => {
      const count = countByCat.get(c.slug) || 0;

      const techsForCat = (CATEGORY_TECHS[c.slug] || []).map((t) => ({
        ...t,
        slug: slugify(t.name),
      }));

      return {
        id: c.slug,
        name: c.name,
        iconUrl: c.iconUrl,
        count,
        techs: techsForCat,
      };
    });
  };

  const fetchAllData = async () => {
    try {
      setIsLoading(true);

      const [jobsRes, techsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/jobs/latest?take=500`),
        fetch(`${API_BASE_URL}/techs`),
      ]);

      if (!jobsRes.ok) throw new Error('Failed to fetch jobs');

      const jobsRaw = await jobsRes.json();
      const jobsData = Array.isArray(jobsRaw) ? jobsRaw : jobsRaw.items || [];

      const techsData = techsRes.ok ? await techsRes.json() : [];

      setJobs(jobsData);
      setTechs(Array.isArray(techsData) ? techsData : []);
      setCategories(computeCategories(jobsData));
    } catch (err) {
      console.error('Error loading data:', err);
      setJobs([]);
      setTechs([]);
      setCategories(baseCategories.map((c) => ({ ...c, id: c.slug, count: 0, techs: [] })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // show the scroll FAB shortly after load
  useEffect(() => {
    const timer = setTimeout(() => setShowScrollPrompt(true), 900);
    return () => clearTimeout(timer);
  }, []);

  // hide FAB when categories are in view
  useEffect(() => {
    if (!showScrollPrompt) return;

    const onScroll = () => {
      const rect = categoriesRef.current?.getBoundingClientRect();
      if (!rect) return;
      if (rect.top <= window.innerHeight * 0.65) setShowScrollPrompt(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [showScrollPrompt]);

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setShowScrollPrompt(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/jobs/search?q=${encodeURIComponent(term)}&page=1&pageSize=200`
      );
      if (!response.ok) throw new Error('Search failed');

      const result = await response.json();
      const jobsData = Array.isArray(result) ? result : result.items || [];

      setJobs(jobsData);
      setCategories(computeCategories(jobsData));
      scrollToCategories();
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const companyCount = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      const name = j.company?.name || j.companyName || j.CompanyName;
      if (name) set.add(name);
    });
    return set.size;
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="home">
        <div className="home-loading">
          <div className="spinner"></div>
          <p>Зареждане на обяви...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="home-hero">
        <div className="hero-content">
          <h1>
            <span className="hero-title">Job Board </span>
            За IT общността
          </h1>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Търси по ключова дума"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button type="submit" className="search-button" aria-label="Search">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="search-icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>

        {showScrollPrompt && (
          <button
            type="button"
            className="scroll-circle-fab"
            onClick={scrollToCategories}
            aria-label="Scroll to categories"
          >
            <span className="scroll-circle-text">Виж обявите</span>
            <span className="scroll-circle-arrow">↓</span>
          </button>
        )}
      </section>

      <section className="categories-section" ref={categoriesRef}>
        <p className="section-subtitle">
          Общо <b>{jobs.length}</b> обяви · <b>{companyCount}</b> компании
        </p>

        <div className="dept-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="dept-card">
              <div className="dept-head">
                <div className="dept-title-wrap">
                  <div className="dept-title-row">
                    {cat.iconUrl && (
                      <img className="dept-icon" src={cat.iconUrl} alt={cat.name} loading="lazy" />
                    )}
                    <h3 className="dept-title">{cat.name}</h3>
                  </div>
                </div>

                <span className="dept-count">{cat.count}</span>
              </div>

              {/* ✅ NO description rendered here */}

              {cat.techs?.length > 0 && (
                <div className="dept-techs">
                  {cat.techs.map((t) => {
                    const logo = getTechLogoUrl(t.name);
                    return (
                      <button
                        key={t.slug}
                        type="button"
                        className="dept-tech-pill"
                        title={`Виж ${t.name} обяви`}
                      >
                        <span className="dept-tech-left">
                          {logo && (
                            <img src={logo} alt={t.name} className="dept-tech-icon" loading="lazy" />
                          )}
                          <span className="dept-tech-name">{t.name}</span>
                        </span>

                        {typeof t.count === 'number' && (
                          <span className="dept-tech-count">{t.count}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <button type="button" className="dept-seeall">
                Виж всички →
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
