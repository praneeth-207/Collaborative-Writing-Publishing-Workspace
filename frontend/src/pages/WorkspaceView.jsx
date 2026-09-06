import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWorkspace, getWorkspaceDocuments, getWorkspaceLogs, manageMembers } from '../services/workspaceService';
import { createDocument } from '../services/documentService';
import { useAuth } from '../context/AuthContext';
import { FileText, Users, Activity, Plus, ArrowLeft, Trash2 } from 'lucide-react';

const WorkspaceView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [workspace, setWorkspace] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(true);

  // New Document state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');

  // Add Member state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');

  const fetchData = async () => {
    try {
      const [wsData, docsData, logsData] = await Promise.all([
        getWorkspace(id),
        getWorkspaceDocuments(id),
        getWorkspaceLogs(id)
      ]);
      setWorkspace(wsData.data);
      setDocuments(docsData.data);
      setLogs(logsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    try {
      const res = await createDocument({ title: docTitle, workspaceId: id });
      setShowDocModal(false);
      navigate(`/document/${res.data._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await manageMembers(id, { email: newMemberEmail, role: newMemberRole, action: 'add' });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (email) => {
    if(window.confirm(`Remove ${email} from workspace?`)) {
      try {
        await manageMembers(id, { email, action: 'remove' });
        fetchData();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove member');
      }
    }
  };

  if (loading) return <><Navbar /><div className="page-container container"><div className="spinner"></div></div></>;
  if (!workspace) return <><Navbar /><div className="page-container container">Workspace not found.</div></>;

  const isOwner = workspace.owner?._id === user?._id;
  
  // Find current user's role
  const currentUserMember = workspace.members.find(m => m.user._id === user._id);
  const role = isOwner ? 'owner' : (currentUserMember?.role || 'viewer');
  const canEdit = role === 'owner' || role === 'editor';

  return (
    <>
      <Navbar />
      <div className="page-container container">
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ marginBottom: '0.5rem' }}>{workspace.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{workspace.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {canEdit && (
                <button className="btn btn-primary" onClick={() => setShowDocModal(true)}>
                  <Plus size={16} /> New Document
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('documents')}
            style={{ 
              background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
              color: activeTab === 'documents' ? 'var(--primary-accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'documents' ? '2px solid var(--primary-accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '1rem'
            }}
          >
            <FileText size={18} /> Documents
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            style={{ 
              background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
              color: activeTab === 'members' ? 'var(--primary-accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'members' ? '2px solid var(--primary-accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '1rem'
            }}
          >
            <Users size={18} /> Members
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            style={{ 
              background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
              color: activeTab === 'logs' ? 'var(--primary-accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'logs' ? '2px solid var(--primary-accent)' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '1rem'
            }}
          >
            <Activity size={18} /> Activity
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'documents' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {documents.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No documents found.</p>
              ) : (
                documents.map(doc => (
                  <Link to={`/document/${doc._id}`} key={doc._id}>
                    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                      onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
                    >
                      <div>
                        <h3 style={{ marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{doc.title}</h3>
                        <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <span>By {doc.author?.name}</span>
                          <span>•</span>
                          <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        background: doc.status === 'published' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: doc.status === 'published' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              {isOwner && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <button className="btn btn-outline" onClick={() => setShowMemberModal(true)}>
                    <Plus size={16} /> Add Member
                  </button>
                </div>
              )}
              <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>User</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Email</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Role</th>
                      <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspace.members.map(member => (
                      <tr key={member.user._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>{member.user.name} {member.user._id === user._id && '(You)'}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{member.user.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                            background: member.role === 'owner' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
                            color: member.role === 'owner' ? 'var(--primary-accent)' : 'var(--text-secondary)'
                          }}>
                            {member.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {isOwner && member.role !== 'owner' && (
                            <button className="btn" style={{ padding: '4px', color: 'var(--danger)', background: 'none' }} onClick={() => handleRemoveMember(member.user.email)}>
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No recent activity.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {logs.map(log => (
                    <div key={log._id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-accent)' }}>
                        <Activity size={18} />
                      </div>
                      <div>
                        <p style={{ marginBottom: '0.2rem' }}>
                          <strong>{log.userId?.name}</strong> {log.action.replace(/_/g, ' ')}
                        </p>
                        {log.details && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{log.details}</p>}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create Document Modal */}
        {showDocModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Create New Document</h3>
              <form onSubmit={handleCreateDocument}>
                <div className="input-group">
                  <label className="input-label">Document Title</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={docTitle} 
                    onChange={e => setDocTitle(e.target.value)} 
                    required 
                    placeholder="Untitled Document"
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowDocModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showMemberModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Add Member</h3>
              <form onSubmit={handleAddMember}>
                <div className="input-group">
                  <label className="input-label">User Email</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={newMemberEmail} 
                    onChange={e => setNewMemberEmail(e.target.value)} 
                    required 
                    placeholder="user@example.com"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Role</label>
                  <select 
                    className="input-field" 
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value)}
                    style={{ appearance: 'auto', background: 'rgba(15, 23, 42, 0.9)' }}
                  >
                    <option value="viewer">Viewer (Read, Comment)</option>
                    <option value="editor">Editor (Write, Publish)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowMemberModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkspaceView;
