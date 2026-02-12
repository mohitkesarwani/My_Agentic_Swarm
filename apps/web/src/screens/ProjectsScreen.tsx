import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { apiClient } from '../api/client.js';
import type { Project } from '@agentic-swarm/shared';

export function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await apiClient<{ data: Project[] }>('/v1/projects');
      setProjects(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await apiClient<{ data: Project }>('/v1/projects', {
        method: 'POST',
        body: JSON.stringify({ name: createName, description: createDescription }),
      });
      setProjects([response.data, ...projects]);
      setShowCreateForm(false);
      setCreateName('');
      setCreateDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Projects</h1>
          <p style={{ color: '#666', margin: 0 }}>
            Welcome, {user?.name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ← Dashboard
          </button>
          <button
            onClick={logout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00',
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + New Project
          </button>
        ) : (
          <div style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="projectName" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  maxLength={100}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="projectDesc" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Description (optional)
                </label>
                <textarea
                  id="projectDesc"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={creating}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: creating ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: creating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateName('');
                    setCreateDescription('');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          color: '#666',
        }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No projects yet</p>
          <p>Create your first project to get started building with Agentic Swarm</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              style={{
                padding: '1.5rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#007bff';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                {project.name}
              </h3>
              {project.description && (
                <p style={{ color: '#666', margin: 0, marginBottom: '0.75rem' }}>
                  {project.description}
                </p>
              )}
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#999' }}>
                <span>{project.buildRequests.length} builds</span>
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
