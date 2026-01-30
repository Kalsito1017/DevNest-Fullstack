import React, { useState, useEffect } from 'react';
import './Company.css';

const Company = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch companies from API
    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📡 Fetching companies from API...');
            const response = await fetch('http://localhost:5099/api/company');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`✅ Loaded ${data.length} companies:`, data);
            setCompanies(data);
            
        } catch (err) {
            console.error('❌ Error fetching companies:', err);
            setError(err.message);
            setCompanies([]);
        } finally {
            setLoading(false);
        }
    };

    // Load companies on component mount
    useEffect(() => {
        fetchCompanies();
    }, []);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('bg-BG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Handle retry
    const handleRetry = () => {
        fetchCompanies();
    };

    // Open API in new tab
    const openApiInBrowser = () => {
        window.open('http://localhost:5099/api/company', '_blank');
    };

    if (loading) {
        return (
            <div className="company-page">
                <div className="container">
                    <div className="page-header">
                        <h1>Компании</h1>
                        <button onClick={openApiInBrowser} className="api-btn">
                            🔗 Виж API данни
                        </button>
                    </div>
                    
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Зареждане на компании...</p>
                        <p className="loading-sub">Свързване с API на порт 5099</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="company-page">
                <div className="container">
                    <div className="page-header">
                        <h1>Компании</h1>
                        <button onClick={openApiInBrowser} className="api-btn">
                            🔗 Тествай API
                        </button>
                    </div>
                    
                    <div className="error-container">
                        <div className="error-icon">❌</div>
                        <h3>Грешка при зареждане</h3>
                        <p className="error-message">{error}</p>
                        
                        <div className="debug-info">
                            <h4>Debug информация:</h4>
                            <p><strong>API URL:</strong> http://localhost:5099/api/company</p>
                            <p><strong>React порт:</strong> 5173</p>
                            <p><strong>Статус:</strong> Неуспешно свързване</p>
                        </div>
                        
                        <div className="action-buttons">
                            <button onClick={handleRetry} className="primary-btn">
                                🔄 Опитай отново
                            </button>
                            <button onClick={openApiInBrowser} className="secondary-btn">
                                📡 Тествай API в браузър
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="company-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <div>
                        <h1>Компании</h1>
                        <p className="page-subtitle">
                            Открийте ИТ компании в България ({companies.length} общо)
                        </p>
                    </div>
                    <div className="header-actions">
                        <button onClick={fetchCompanies} className="refresh-btn">
                            🔄 Обнови
                        </button>
                        <button onClick={openApiInBrowser} className="api-btn">
                            📊 API данни
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="stat-item">
                        <span className="stat-label">Общо компании:</span>
                        <span className="stat-value">{companies.length}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Активни:</span>
                        <span className="stat-value">
                            {companies.filter(c => c.isActive).length}
                        </span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Добавени:</span>
                        <span className="stat-value">
                            {formatDate(companies[0]?.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Companies Grid */}
                {companies.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>Няма компании</h3>
                        <p>Базата данни е празна или няма активни компании.</p>
                        <button onClick={handleRetry} className="primary-btn">
                            🔍 Провери отново
                        </button>
                    </div>
                ) : (
                    <div className="companies-grid">
                        {companies.map((company) => (
                            <div key={company.id} className="company-card">
                                {/* Company Header */}
                                <div className="company-header">
                                    <div className="company-avatar">
                                        {company.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="company-basic-info">
                                        <h3 className="company-name">{company.name}</h3>
                                        <div className="company-meta">
                                            {company.location && (
                                                <span className="meta-item">
                                                    📍 {company.location}
                                                </span>
                                            )}
                                            {company.size && (
                                                <span className="meta-item">
                                                    👥 {company.size}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {company.isActive && (
                                        <span className="active-badge">Активна</span>
                                    )}
                                </div>

                                {/* Company Body */}
                                <div className="company-body">
                                    <p className="company-description">
                                        {company.description || 'Няма описание'}
                                    </p>
                                    
                                    {/* Tech Stack */}
                                    {company.techStack && (
                                        <div className="tech-section">
                                            <h4>Технологии:</h4>
                                            <div className="tech-tags">
                                                {company.techStack
                                                    .split(',')
                                                    .map((tech, index) => (
                                                        <span key={index} className="tech-tag">
                                                            {tech.trim()}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Info */}
                                    <div className="contact-section">
                                        {company.email && (
                                            <div className="contact-item">
                                                <span className="contact-label">Email:</span>
                                                <a 
                                                    href={`mailto:${company.email}`}
                                                    className="contact-value"
                                                >
                                                    {company.email}
                                                </a>
                                            </div>
                                        )}
                                        {company.phone && (
                                            <div className="contact-item">
                                                <span className="contact-label">Телефон:</span>
                                                <span className="contact-value">
                                                    {company.phone}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Social Links */}
                                    <div className="social-links">
                                        {company.website && (
                                            <a 
                                                href={company.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link website"
                                            >
                                                🌐 Уебсайт
                                            </a>
                                        )}
                                        {company.linkedInUrl && (
                                            <a 
                                                href={company.linkedInUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link linkedin"
                                            >
                                                💼 LinkedIn
                                            </a>
                                        )}
                                        {company.githubUrl && (
                                            <a 
                                                href={company.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="social-link github"
                                            >
                                                💻 GitHub
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Company Footer */}
                                <div className="company-footer">
                                    <div className="footer-info">
                                        <span className="created-date">
                                            Добавена: {formatDate(company.createdAt)}
                                        </span>
                                        <span className="company-id">
                                            ID: {company.id}
                                        </span>
                                    </div>
                                    <button className="view-jobs-btn">
                                        Виж обяви ({company.jobs?.length || 0})
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination/Filters (for future) */}
                <div className="page-footer">
                    <p>
                        Показване на всички {companies.length} компании от API
                    </p>
                    <div className="api-info">
                        <code>GET http://localhost:5099/api/company</code>
                        <span className="api-status">✅ Работи</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Company;