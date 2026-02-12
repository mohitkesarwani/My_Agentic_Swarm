import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.js';
import type { BuildRequest, AgentActivity } from '@agentic-swarm/shared';

export function BuildDetailScreen() {
  const { projectId, buildId } = useParams<{ projectId: string; buildId: string }>();
  const navigate = useNavigate();
  const [build, setBuild] = useState<BuildRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'agents'>('overview');

  useEffect(() => {
    loadBuild();
    // Poll for updates every 3 seconds while build is running
    const interval = setInterval(() => {
      if (build?.status === 'running' || build?.status === 'pending') {
        loadBuild();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [projectId, buildId, build?.status]);

  const loadBuild = async () => {
    try {
      const response = await apiClient<{ data: BuildRequest }>(`/v1/projects/${projectId}/builds/${buildId}`);
      setBuild(response.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load build');
    } finally {
      setLoading(false);
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

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'started':
      case 'progress':
        return '#007bff';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading && !build) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading build details...</p>
      </div>
    );
  }

  if (!build) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Build not found</p>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
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
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
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
          ← Back to Project
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              Build #{build.requestId.substring(0, 8)}
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Created {new Date(build.createdAt).toLocaleString()}
            </p>
          </div>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '16px',
            fontSize: '1rem',
            fontWeight: 600,
            backgroundColor: getStatusColor(build.status) + '20',
            color: getStatusColor(build.status),
          }}>
            {getStatusLabel(build.status)}
          </span>
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

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #ddd', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['overview', 'logs', 'agents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                padding: '0.75rem 1rem',
                border: 'none',
                backgroundColor: 'transparent',
                borderBottom: activeTab === tab ? '2px solid #007bff' : '2px solid transparent',
                color: activeTab === tab ? '#007bff' : '#666',
                fontWeight: activeTab === tab ? 600 : 400,
                cursor: 'pointer',
                marginBottom: '-2px',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <div style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Build Prompt</h3>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{build.prompt}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
            }}>
              <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#666' }}>Status</h4>
              <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                {getStatusLabel(build.status)}
              </p>
            </div>

            {build.agentActivities && build.agentActivities.length > 0 && (
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
              }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#666' }}>Agent Activities</h4>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                  {build.agentActivities.length}
                </p>
              </div>
            )}

            {build.artifacts && build.artifacts.length > 0 && (
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
              }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#666' }}>Artifacts</h4>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                  {build.artifacts.length}
                </p>
              </div>
            )}

            {build.completedAt && (
              <div style={{
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
              }}>
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#666' }}>Duration</h4>
                <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                  {Math.round((new Date(build.completedAt).getTime() - new Date(build.createdAt).getTime()) / 1000)}s
                </p>
              </div>
            )}
          </div>

          {build.error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c00',
            }}>
              <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Error</h4>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{build.error}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{
          padding: '1rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
          maxHeight: '600px',
          overflowY: 'auto',
        }}>
          {build.logs && build.logs.length > 0 ? (
            build.logs.map((log: string, index: number) => (
              <div key={index} style={{ padding: '0.25rem 0' }}>
                {log}
              </div>
            ))
          ) : (
            <p style={{ margin: 0, color: '#999' }}>No logs available yet</p>
          )}
        </div>
      )}

      {activeTab === 'agents' && (
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Agent Activities</h3>
          {build.agentActivities && build.agentActivities.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {build.agentActivities.map((activity: AgentActivity, index: number) => (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ marginRight: '0.5rem' }}>{activity.agentRole}</strong>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: getAgentStatusColor(activity.status) + '20',
                        color: getAgentStatusColor(activity.status),
                      }}>
                        {activity.status}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#999' }}>
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#666' }}>{activity.action}</p>
                  {activity.details && (
                    <p style={{ margin: 0, marginTop: '0.5rem', fontSize: '0.875rem', color: '#999' }}>
                      {activity.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              color: '#666',
            }}>
              <p>No agent activities recorded yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
