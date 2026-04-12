import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, Trash2 } from 'lucide-react';
import { employees } from '../services/api.js';
import toast from 'react-hot-toast';

export default function Employees() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    employees.getAll()
      .then(r => setList(r.data?.data || []))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    try {
      await employees.delete(id);
      toast.success('Employee deactivated');
      load();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const filtered = list.filter(e =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.position} ${e.departmentName}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Employees</div>
          <div className="page-subtitle">{list.length} total employees</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/employees/new')}>
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#718096' }} />
            <input
              className="search-input"
              style={{ paddingLeft: 34 }}
              placeholder="Search employees..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No employees found</h3>
            <p>Try a different search or add a new employee</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Location</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
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
                  <td>{emp.hireDate ? new Date(emp.hireDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-green' : emp.status === 'ON_LEAVE' ? 'badge-yellow' : 'badge-gray'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(emp.id, `${emp.firstName} ${emp.lastName}`)}
                    >
                      <Trash2 size={13} />
                    </button>
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
