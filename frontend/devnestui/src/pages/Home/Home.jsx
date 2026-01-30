import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const normalizeTechKey = (t) => safeLower(t).trim();

/** Fix false matches like "c" inside "react" */
const textHasTech = (text, token) => {
  if (!text || !token) return false;

  const t = token.toLowerCase().trim();
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (t.length <= 2) {
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    return re.test(text);
  }

  return text.includes(t);
};

// Categories (your “big groups”)
const categoryDefinitions = [
  {
    id: 'backend-development',
    name: 'BackEnd Development',
    techKeywords: ['java', '.net', 'dotnet', 'c#', 'php', 'embedded', 'python', 'ruby', 'go', 'node', 'node.js', 'c++', 'cpp'],
    displayTechs: [
      { name: 'Java', match: ['java'] },
      { name: '.NET', match: ['.net', 'dotnet', 'dotnetcore', 'c#', 'csharp', 'asp.net'] },
      { name: 'PHP', match: ['php'] },
      { name: 'C/C++/Embedded', match: ['c++', 'cpp', 'embedded', 'firmware', 'microcontroller'] }, // avoid plain "c" here
      { name: 'Python', match: ['python'] },
      { name: 'Ruby', match: ['ruby'] },
      { name: 'Go', match: ['go'] },
      { name: 'Node.js', match: ['node', 'node.js'] },
    ],
  },
  {
    id: 'frontend-development',
    name: 'FrontEnd Development',
    techKeywords: ['javascript', 'react', 'angular', 'vue', 'vue.js', 'typescript'],
    displayTechs: [
      { name: 'JavaScript', match: ['javascript'] },
      { name: 'React', match: ['react'] },
      { name: 'Angular', match: ['angular'] },
      { name: 'Vue.js', match: ['vue', 'vue.js'] },
      { name: 'TypeScript', match: ['typescript'] },
    ],
  },
  {
    id: 'fullstack-development',
    name: 'Fullstack Development',
    techKeywords: ['javascript', 'typescript', 'react', 'node', 'node.js', '.net', 'dotnet', 'java', 'sql'],
    displayTechs: [
      { name: 'JavaScript', match: ['javascript'] },
      { name: 'TypeScript', match: ['typescript'] },
      { name: 'React', match: ['react'] },
      { name: 'Node.js', match: ['node', 'node.js'] },
      { name: '.NET', match: ['.net', 'dotnet', 'dotnetcore', 'c#', 'csharp', 'asp.net'] },
      { name: 'Java', match: ['java'] },
      { name: 'SQL', match: ['sql', 'mysql', 'postgres', 'sqlite', 'postgresql'] },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    techKeywords: ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'database', 'cyber', 'security', 'sysadmin', 'terraform', 'linux'],
    displayTechs: [
      { name: 'DevOps', match: ['devops', 'docker', 'kubernetes', 'terraform'] },
      { name: 'Database Engineer', match: ['database', 'sql', 'postgres', 'postgresql', 'mysql', 'oracle', 'mongodb'] },
      { name: 'Cybersecurity', match: ['cyber', 'security'] },
      { name: 'SysAdmin', match: ['sysadmin', 'linux', 'windows', 'ubuntu'] },
    ],
  },
  {
    id: 'quality-assurance',
    name: 'Quality Assurance',
    techKeywords: ['qa', 'automation', 'manual', 'testing', 'test', 'selenium', 'cypress', 'playwright'],
    displayTechs: [
      { name: 'Automation QA', match: ['automation', 'selenium', 'cypress', 'playwright'] },
      { name: 'Manual QA', match: ['manual', 'qa', 'testing', 'test case', 'test cases'] },
    ],
  },
  {
    id: 'data-science',
    name: 'Data Science',
    techKeywords: ['etl', 'data warehouse', 'big data', 'bi', 'visualization', 'ml', 'ai', 'model', 'pandas', 'python', 'power bi', 'tableau'],
    displayTechs: [
      { name: 'ETL/Data warehouse', match: ['etl', 'data warehouse', 'warehouse', 'dwh', 'ssis', 'airflow'] },
      { name: 'Big Data', match: ['big data', 'spark', 'hadoop'] },
      { name: 'BI/Data visualization', match: ['bi', 'visualization', 'power bi', 'tableau', 'grafana'] },
      { name: 'ML/AI/Data modelling', match: ['ml', 'machine learning', 'ai', 'model', 'pytorch', 'scikitlearn'] },
    ],
  },
  {
    id: 'pm-ba-and-more',
    name: 'PM/BA and more',
    techKeywords: ['project', 'product', 'owner', 'business analyst', 'ba', 'writer'],
    displayTechs: [
      { name: 'IT Project Management', match: ['project management', 'project'] },
      { name: 'IT Business Analyst', match: ['business analyst', ' ba '] },
      { name: 'Product Management', match: ['product management'] },
      { name: 'Product Owner', match: ['product owner'] },
      { name: 'Tech Writer', match: ['writer', 'technical writer'] },
    ],
  },
  {
    id: 'erp-crm-development',
    name: 'ERP / CRM development',
    techKeywords: ['sap', 'salesforce', 'crm', 'erp'],
    displayTechs: [
      { name: 'SAP', match: ['sap'] },
      { name: 'SalesForce', match: ['salesforce', 'sales force'] },
    ],
  },
  {
    id: 'mobile-development',
    name: 'Mobile Development',
    techKeywords: ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter'],
    displayTechs: [
      { name: 'iOS', match: ['ios', 'swift'] },
      { name: 'Android', match: ['android', 'kotlin'] },
      { name: 'React Native', match: ['react native'] },
      { name: 'Flutter', match: ['flutter'] },
    ],
  },
];

const Home = () => {
  const [jobs, setJobs] = useState([]);
  const [techs, setTechs] = useState([]);         // ✅ techs now contain LogoUrl
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollPrompt, setShowScrollPrompt] = useState(false);

  const navigate = useNavigate();
  const categoriesRef = useRef(null);

  const techLogoByName = useMemo(() => {
    const map = new Map();

    (techs || []).forEach((t) => {
      const name = (t.name ?? t.Name ?? '').toString().trim();
      const slug = (t.slug ?? t.Slug ?? '').toString().trim();
      const logoUrl = t.logoUrl ?? t.LogoUrl ?? null;

      if (logoUrl) {
        if (name) map.set(name.toLowerCase(), logoUrl);
        if (slug) map.set(slug.toLowerCase(), logoUrl);
      }
    });
    const sql = map.get('sql') || map.get('azuresqldatabase')

    // ✅ .NET mapping (your allowed logos)
    const dotnetLogo =
      map.get('dotnetcore') ||
      map.get('csharp') ||
      map.get('entityframeworkcore') ||
      null;

    if (dotnetLogo) {
      // User-facing labels
      map.set('.net', dotnetLogo);
      map.set('dotnet', dotnetLogo);
      map.set('dotnet core', dotnetLogo);
      map.set('asp.net', dotnetLogo);
      map.set('asp.net core', dotnetLogo);

      // Common spellings
      map.set('c#', dotnetLogo);
      map.set('csharp', dotnetLogo);
      map.set('entity framework', dotnetLogo);
      map.set('entityframework', dotnetLogo);
      map.set('ef', dotnetLogo);
      map.set('ef core', dotnetLogo);
      map.set('efcore', dotnetLogo);
    }

    // ✅ C/C++/Embedded label: prefer c logo if present
    const cLogo = map.get('c') ?? null;
    if (cLogo) {
      map.set('c/c++/embedded', cLogo);
      map.set('c++', cLogo);
      map.set('cpp', cLogo);
      map.set('embedded', cLogo);
    }

    return map;
  }, [techs]);


  const getTechLogoUrl = (techDisplayName) => {
    const key = (techDisplayName || '').toLowerCase().trim();
    return techLogoByName.get(key) ?? null;
  };

  const buildCategoryCounts = (jobsData, definition) => {
    const rows = jobsData.map((j) => {
      const title = safeLower(j.title ?? j.Title);
      const desc = safeLower(j.description ?? j.Description);
      const reqs = safeLower(j.requirements ?? j.Requirements); // ✅ requirements included
      const techStack = safeLower(j.techStack ?? j.TechStack);

      const techArr = Array.isArray(j.techs ?? j.Techs) ? (j.techs ?? j.Techs).map(safeLower) : [];

      return {
        title,
        desc,
        reqs,
        techStack,
        techs: techArr,
      };
    });

    const countByDisplay = definition.displayTechs.reduce((acc, t) => {
      acc[t.name] = 0;
      return acc;
    }, {});

    const jobMatchesCategory = (row) => {
      // ✅ count logic based primarily on requirements (your rule)
      const text = `${row.reqs} ${row.title} ${row.desc} ${row.techStack} ${row.techs.join(' ')}`;
      return definition.techKeywords.some((k) => textHasTech(text, normalizeTechKey(k)));
    };

    const matchingRows = rows.filter(jobMatchesCategory);

    matchingRows.forEach((row) => {
      const text = `${row.reqs} ${row.title} ${row.desc} ${row.techStack} ${row.techs.join(' ')}`;

      definition.displayTechs.forEach((t) => {
        if (t.match.some((m) => textHasTech(text, normalizeTechKey(m)))) {
          countByDisplay[t.name] += 1;
        }
      });
    });

    const displayTechs = definition.displayTechs
      .map((t) => ({
        name: t.name,
        slug: slugify(t.name),
        count: countByDisplay[t.name] || 0,
      }))
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);

    return { categoryCount: matchingRows.length, displayTechs };
  };

  // ✅ No images anymore; categories are computed only from jobs
  const generateCategories = (jobsData) => {
    return categoryDefinitions
      .map((category) => {
        const { categoryCount, displayTechs } = buildCategoryCounts(jobsData, category);

        return {
          id: category.id,
          name: category.name,
          count: categoryCount,
          techs: displayTechs,
        };
      })
      .filter((c) => c.count > 0);
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

      setCategories(generateCategories(jobsData));
    } catch (err) {
      console.error('Error loading data:', err);
      setJobs([]);
      setTechs([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowScrollPrompt(true), 1200);
    return () => clearTimeout(timer);
  }, []);

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
      setCategories(generateCategories(jobsData));
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

  const handleTechClick = (techNameOrSlug) => {
    navigate(`/jobs?tech=${encodeURIComponent(techNameOrSlug)}`);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/jobs?category=${encodeURIComponent(categoryId)}`);
  };

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
                  <h3 className="dept-title">{cat.name}</h3>
                </div>
                <span className="dept-count">{cat.count}</span>
              </div>

              {cat.techs?.length > 0 && (
                <div className="dept-techs">
                  {cat.techs.slice(0, 6).map((t) => {
                    const logo = getTechLogoUrl(t.name);

                    return (
                      <button
                        key={t.slug}
                        type="button"
                        className="dept-tech-pill"
                        onClick={() => handleTechClick(t.name)}
                        title={`Виж ${t.name} обяви`}
                      >
                        <span className="dept-tech-left">
                          {logo && (
                            <img
                              src={logo}
                              alt={t.name}
                              className="dept-tech-icon"
                              loading="lazy"
                            />
                          )}
                          <span className="dept-tech-name">{t.name}</span>
                        </span>

                        <span className="dept-tech-count">{t.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className="dept-seeall"
                onClick={() => handleCategoryClick(cat.id)}
              >
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
