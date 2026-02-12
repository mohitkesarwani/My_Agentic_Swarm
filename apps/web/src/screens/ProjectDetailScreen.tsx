import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import type { Project, BuildRequest } from '@agentic-swarm/shared';

export function ProjectDetailScreen() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [buildPrompt, setBuildPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProject();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadProject, 5000);
    return () => clearInterval(interval);
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await apiClient<{ data: Project }>(`/v1/projects/${projectId}`);
      setProject(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBuild = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await apiClient(`/v1/projects/${projectId}/build`, {
        method: 'POST',
        body: JSON.stringify({ prompt: buildPrompt }),
      });
      setBuildPrompt('');
      setShowBuildForm(false);
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit build request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'running':
        return '#007bff';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && !project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate('/projects')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1rem',
          }}
        >
          ← Back to Projects
        </button>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{project.name}</h1>
        {project.description && (
          <p style={{ color: '#666', margin: 0 }}>{project.description}</p>
        )}
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
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Build Requests</h2>
        
        {!showBuildForm ? (
          <button
            onClick={() => setShowBuildForm(true)}
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
            + New Build Request
          </button>
        ) : (
          <div style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            marginBottom: '1rem',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Submit New Build Request</h3>
            <form onSubmit={handleSubmitBuild}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="buildPrompt" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
                  Describe what you want to build
                </label>
                <textarea
                  id="buildPrompt"
                  value={buildPrompt}
                  onChange={(e) => setBuildPrompt(e.target.value)}
                  required
                  maxLength={2000}
                  rows={6}
                  placeholder="E.g., Build me a blog app with user accounts and comments"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
                <small style={{ color: '#666', fontSize: '0.875rem' }}>
                  {buildPrompt.length}/2000 characters
                </small>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: submitting ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Build Request'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBuildForm(false);
                    setBuildPrompt('');
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

      {project.buildRequests.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          color: '#666',
        }}>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No build requests yet</p>
          <p>Submit your first build request to start building with Agentic Swarm</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {project.buildRequests.slice().reverse().map((build: BuildRequest) => (
            <div
              key={build.requestId}
              onClick={() => navigate(`/projects/${projectId}/builds/${build.requestId}`)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Build #{build.requestId.substring(0, 8)}</h3>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  backgroundColor: getStatusColor(build.status) + '20',
                  color: getStatusColor(build.status),
                }}>
                  {getStatusLabel(build.status)}
                </span>
              </div>
              
              <p style={{ color: '#666', margin: 0, marginBottom: '0.75rem' }}>
                {build.prompt.substring(0, 200)}{build.prompt.length > 200 ? '...' : ''}
              </p>
              
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#999' }}>
                <span>Created {new Date(build.createdAt).toLocaleString()}</span>
                {build.completedAt && (
                  <span>Completed {new Date(build.completedAt).toLocaleString()}</span>
                )}
                {build.agentActivities && build.agentActivities.length > 0 && (
                  <span>{build.agentActivities.length} agent activities</span>
                )}
              </div>

              {build.error && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.5rem',
                  backgroundColor: '#fee',
                  border: '1px solid #fcc',
                  borderRadius: '4px',
                  color: '#c00',
                  fontSize: '0.875rem',
                }}>
                  Error: {build.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
