// src/components/ImageGallery.jsx
import { useEffect, useState } from "react";
import api from "./services/api"; // Your axios instance

export default function ImageGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true);
                const response = await api.get("/images");

                // Transform PascalCase to camelCase, or access directly
                const normalizedImages = response.data.map(img => ({
                    // Use PascalCase directly since that's what backend returns
                    id: img.Id,       // PascalCase: Id
                    url: img.Url,     // PascalCase: Url
                    altText: img.AltText, // PascalCase: AltText
                    createdOn: img.CreatedOn // PascalCase: CreatedOn
                }));

                console.log('Processed images:', normalizedImages); // Debug
                setImages(normalizedImages);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch images:", err);
                setError("Failed to load images. Please try again.");
                setImages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, []);

    if (loading) {
        return (
            <div style={{
                padding: "40px",
                textAlign: "center",
                color: "#4a5568"
            }}>
                <div className="spinner" style={{
                    display: "inline-block",
                    width: "40px",
                    height: "40px",
                    border: "3px solid #e2e8f0",
                    borderTop: "3px solid #4299e1",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "15px"
                }}></div>
                <p>Loading images...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: "20px",
                textAlign: "center",
                background: "#fff5f5",
                border: "1px solid #fed7d7",
                borderRadius: "8px",
                margin: "20px",
                color: "#c53030"
            }}>
                <p>{error}</p>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div style={{
                padding: "40px",
                textAlign: "center",
                color: "#718096"
            }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>📷</div>
                <h3>No images found</h3>
                <p>Upload some images to get started!</p>
            </div>
        );
    }

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "20px",
            padding: "20px"
        }}>
            {images.map(img => (
                <div key={img.id} style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "15px",
                    background: "white",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s, box-shadow 0.2s"
                }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                    }}>
                    {/* Image Container */}
                    <div style={{
                        height: "180px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        marginBottom: "12px",
                        background: "#f7fafc"
                    }}>
                        <img
                            src={img.url}
                            alt={img.altText}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block"
                            }}
                            onError={(e) => {
                                e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='180' viewBox='0 0 250 180'%3E%3Crect width='250' height='180' fill='%23edf2f7'/%3E%3Ctext x='125' y='90' font-family='Arial' font-size='14' text-anchor='middle' fill='%23a0aec0' dy='.3em'%3E${encodeURIComponent(img.altText)}%3C/text%3E%3C/svg%3E`;
                            }}
                        />
                    </div>

                    {/* Image Info */}
                    <div>
                        <h4 style={{
                            margin: "0 0 8px 0",
                            fontSize: "16px",
                            color: "#2d3748",
                            fontWeight: "600"
                        }}>
                            {img.altText}
                        </h4>

                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "12px",
                            color: "#718096"
                        }}>
                            <span>ID: {img.id}</span>
                            {img.createdOn && (
                                <span>
                                    {new Date(img.createdOn).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}