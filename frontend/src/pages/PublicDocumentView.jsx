import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css'; // For basic styling if we use HTML output

const API_URL = 'http://localhost:5000/api';

const PublicDocumentView = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await axios.get(`${API_URL}/documents/public/${id}`);
        setDocument(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Document not found or not public');
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id]);

  if (loading) return <div className="page-container container"><div className="spinner"></div></div>;

  if (error) {
    return (
      <div className="page-container container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <h2 style={{ color: 'var(--error-color)' }}>{error}</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Go Home</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '12px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: 'var(--text-primary)' }}>{document.title}</h1>
        <div style={{ color: 'var(--text-secondary)', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
          By {document.author?.name} • Published {new Date(document.updatedAt).toLocaleDateString()}
        </div>
        
        {/* Render HTML content safely */}
        <div 
          className="ql-editor" 
          style={{ padding: 0 }}
          dangerouslySetInnerHTML={{ __html: document.content }} 
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link to="/" className="btn btn-outline">Powered by Collaborative Workspace</Link>
      </div>
    </div>
  );
};

export default PublicDocumentView;
