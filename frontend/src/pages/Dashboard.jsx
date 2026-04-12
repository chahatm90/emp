import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, UserCheck, TrendingUp } from 'lucide-react';
import { employees, departments } from '../services/api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, active: 0, depts: 0 });
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([employees.getAll(), departments.getAll()])
      .then(([empRes, deptRes]) => {
        const emps = empRes.data?.data || [];
        const depts = deptRes.data?.data || [];
        const active = emps.filter(e => e.status === 'ACTIVE').length;
        setStats({ total: emps.length, active, depts: depts.length });
        setRecentEmployees(emps.slice(-5).reverse());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ebf8ff' }}>
            <Users size={24} color="#2b6cb0" />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f0fff4' }}>
            <UserCheck size={24} color="#276749" />
          </div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#faf5ff' }}>
            <Building2 size={24} color="#6b46c1" />
          </div>
          <div>
            <div className="stat-value">{stats.depts}</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffaf0' }}>
            <TrendingUp size={24} color="#c05621" />
          </div>
          <div>
            <div className="stat-value">{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%</div>
            <div className="stat-label">Active Rate</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Employees</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/employees')}>View All</button>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : recentEmployees.length === 0 ? (
          <div className="empty-state">
            <h3>No employees yet</h3>
            <p>Add your first employee to get started</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/employees/new')}>Add Employee</button>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: 12, color: '#718096' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.position}</td>
                  <td>{emp.departmentName || '-'}</td>
                  <td>{emp.location || '-'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-green' : emp.status === 'ON_LEAVE' ? 'badge-yellow' : 'badge-gray'}`}>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
