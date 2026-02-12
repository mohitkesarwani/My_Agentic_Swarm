import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { apiClient } from '../api/client.js';
import type { Project, BuildRequest } from '@agentic-swarm/shared';

interface DashboardStats {
  totalProjects: number;
  totalBuilds: number;
  runningBuilds: number;
  completedBuilds: number;
  failedBuilds: number;
}

export function DashboardScreen() {
  const [recentBuilds, setRecentBuilds] = useState<Array<BuildRequest & { projectName: string; projectId: string }>>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalBuilds: 0,
    runningBuilds: 0,
    completedBuilds: 0,
    failedBuilds: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    // Refresh every 5 seconds for running builds
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await apiClient<{ data: Project[] }>('/v1/projects');
      const projectsData = response.data;

      // Calculate stats
      const totalProjects = projectsData.length;
      const allBuilds = projectsData.flatMap((p) =>
        p.buildRequests.map((b) => ({ ...b, projectName: p.name, projectId: p.id }))
      );

      const stats: DashboardStats = {
        totalProjects,
        totalBuilds: allBuilds.length,
        runningBuilds: allBuilds.filter((b) => b.status === 'running').length,
        completedBuilds: allBuilds.filter((b) => b.status === 'completed').length,
        failedBuilds: allBuilds.filter((b) => b.status === 'failed').length,
      };

      setStats(stats);

      // Get recent builds (last 10)
      const sortedBuilds = allBuilds.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRecentBuilds(sortedBuilds.slice(0, 10));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
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

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: '#666', margin: 0 }}>Welcome back, {user?.name}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/projects')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Projects
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

      {/* Stats Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Projects
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 600, color: '#007bff' }}>
            {stats.totalProjects}
          </p>
        </div>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Builds
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>{stats.totalBuilds}</p>
        </div>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Running
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 600, color: '#007bff' }}>
            {stats.runningBuilds}
          </p>
        </div>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Completed
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 600, color: '#28a745' }}>
            {stats.completedBuilds}
          </p>
        </div>

        <div
          style={{
            padding: '1.5rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Failed
          </p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 600, color: '#dc3545' }}>
            {stats.failedBuilds}
          </p>
        </div>
      </div>

      {/* Recent Builds */}
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Builds</h2>
        {recentBuilds.length > 0 ? (
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {recentBuilds.map((build) => (
              <div
                key={`${build.projectId}-${build.requestId}`}
                onClick={() => navigate(`/projects/${build.projectId}/builds/${build.requestId}`)}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'white',
                  transition: 'all 0.2s',
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
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong>{build.projectName}</strong>
                      <span style={{ fontSize: '0.875rem', color: '#999' }}>
                        Build #{build.requestId.substring(0, 8)}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#666',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {build.prompt}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: getStatusColor(build.status) + '20',
                      color: getStatusColor(build.status),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getStatusLabel(build.status)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#999' }}>
                  <span>Created {new Date(build.createdAt).toLocaleString()}</span>
                  {build.agentActivities && build.agentActivities.length > 0 && (
                    <span>{build.agentActivities.length} agent activities</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              color: '#666',
            }}
          >
            <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No builds yet</p>
            <p>Create a project and start building!</p>
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
              Go to Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
