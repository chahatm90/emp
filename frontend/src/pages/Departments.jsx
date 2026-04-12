import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderPlus, Building2 } from 'lucide-react';
import { departments } from '../services/api.js';
import toast from 'react-hot-toast';

export default function Departments() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departments.getAll()
      .then(r => setList(r.data?.data || []))
      .catch(() => toast.error('Failed to load departments'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading departments...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Departments</div>
          <div className="page-subtitle">{list.length} departments</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/departments/new')}>
          <FolderPlus size={16} /> Add Department
        </button>
      </div>

      {list.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Building2 size={40} color="#cbd5e0" />
            <h3 style={{ marginTop: 12 }}>No departments yet</h3>
            <p>Create your first department to get started</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/departments/new')}>
              Add Department
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {list.map(dept => (
            <div key={dept.id} className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: '#ebf8ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Building2 size={22} color="#2b6cb0" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{dept.name}</div>
                  <span className={`badge ${dept.status === 'ACTIVE' ? 'badge-green' : 'badge-gray'}`}>
                    {dept.status}
                  </span>
                </div>
              </div>
              {dept.description && (
                <p style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>{dept.description}</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4a5568' }}>
                {dept.manager && <div>👤 <strong>Manager:</strong> {dept.manager}</div>}
                {dept.location && <div>📍 <strong>Location:</strong> {dept.location}</div>}
                <div>👥 <strong>Employees:</strong> {dept.employeeCount || 0}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
