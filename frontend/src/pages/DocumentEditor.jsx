import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getDocument, updateDocument, deleteDocument, togglePublish } from '../services/documentService';
import { getComments, addComment } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save, Globe, Trash2, MessageSquare, Send } from 'lucide-react';

const DocumentEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Comment State
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);

  const fetchData = async () => {
    try {
      const docRes = await getDocument(id);
      setDocument(docRes.data);
      setTitle(docRes.data.title);
      setContent(docRes.data.content || '');
      
      const commRes = await getComments(id);
      setComments(commRes.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDocument(id, { title, content });
      setLastSaved(new Date());
    } catch (err) {
      alert('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      await togglePublish(id);
      fetchData(); // Refresh to get updated status
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(id);
        navigate(`/workspace/${document.workspaceId?._id || document.workspaceId}`);
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete');
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      await addComment({ documentId: id, comment: newComment });
      setNewComment('');
      // Refresh comments
      const commRes = await getComments(id);
      setComments(commRes.data);
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  if (loading) return <><Navbar /><div className="page-container container"><div className="spinner"></div></div></>;
  if (!document) return null;

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        
        {/* Editor Area */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <Link to={`/workspace/${document.workspaceId?._id || document.workspaceId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <ArrowLeft size={16} /> Back
            </Link>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {lastSaved && <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Last saved: {lastSaved.toLocaleTimeString()}</span>}
              <button className="btn btn-outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <div className="spinner" style={{width: 14, height: 14}}></div> : <Save size={16} />} Save
              </button>
              <button className={`btn ${document.status === 'published' ? 'btn-outline' : 'btn-primary'}`} onClick={handleTogglePublish}>
                <Globe size={16} /> {document.status === 'published' ? 'Unpublish' : 'Publish'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowComments(!showComments)}>
                <MessageSquare size={16} /> Comments
              </button>
              <button className="btn btn-danger" style={{ padding: '10px' }} onClick={handleDelete}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '2rem', overflow: 'hidden' }}>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ 
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-color)', 
                color: 'var(--text-primary)', fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem',
                outline: 'none', padding: '0.5rem 0', fontFamily: 'inherit'
              }}
              placeholder="Document Title"
            />
            
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
                fontSize: '1.1rem', lineHeight: 1.6, outline: 'none', resize: 'none', fontFamily: 'inherit',
                padding: '0.5rem 0'
              }}
              placeholder="Start writing..."
            />
          </div>
        </div>

        {/* Comments Sidebar */}
        {showComments && (
          <div style={{ 
            width: '350px', background: 'rgba(15, 23, 42, 0.95)', borderLeft: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', padding: '20px'
          }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} /> Comments
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>No comments yet.</p>
              ) : (
                comments.map(c => (
                  <div key={c._id} className="glass-panel" style={{ padding: '15px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.userId?.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{c.comment}</p>
                  </div>
                ))
              )}
            </div>
            
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                className="input-field" 
                style={{ flex: 1 }}
                placeholder="Add a comment..." 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '10px' }} disabled={!newComment.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentEditor;
