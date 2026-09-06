import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getWorkspaces, createWorkspace } from '../services/workspaceService';
import { Plus, Users, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');

  const fetchWorkspaces = async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createWorkspace({ name: newWorkspaceName, description: newWorkspaceDesc });
      setShowModal(false);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2>My Workspaces</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your collaborative environments.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Workspace
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner"></div></div>
        ) : workspaces.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
            <Layout size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3>No workspaces yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create your first workspace to start collaborating.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={18} /> Create Workspace
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {workspaces.map(ws => (
              <Link to={`/workspace/${ws._id}`} key={ws._id} style={{ display: 'block' }}>
                <div className="glass-panel" style={{ 
                  padding: '20px', 
                  height: '100%', 
                  transition: 'transform 0.2s',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{ws.name}</h3>
                    {ws.owner?._id === user?._id && (
                      <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--primary-accent)', borderRadius: '12px' }}>
                        Owner
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                    {ws.description || 'No description provided.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <Users size={16} /> {ws.members?.length || 0} members
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Workspace Modal */}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Create New Workspace</h3>
              <form onSubmit={handleCreate}>
                <div className="input-group">
                  <label className="input-label">Workspace Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newWorkspaceName} 
                    onChange={e => setNewWorkspaceName(e.target.value)} 
                    required 
                    placeholder="e.g. Marketing Team"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Description</label>
                  <textarea 
                    className="input-field" 
                    value={newWorkspaceDesc} 
                    onChange={e => setNewWorkspaceDesc(e.target.value)} 
                    rows="3"
                    placeholder="Brief description..."
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)} style={{ flex: 1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
