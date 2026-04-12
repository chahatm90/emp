import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { departments } from '../services/api.js';
import toast from 'react-hot-toast';

export default function AddDepartment() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ name: '', description: '', location: '', manager: '' });

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => ({ ...er, [k]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors({ name: 'Required' }); return; }
    setSaving(true);
    try {
      await departments.create(form);
      toast.success('Department created!');
      navigate('/departments');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input className="form-input" placeholder="Engineering" value={form.name} onChange={set('name')} />
            {errors.name && <div className="error-msg">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="form-input" placeholder="Software development and infrastructure" value={form.description} onChange={set('description')} />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Manager</label>
              <input className="form-input" placeholder="Jane Smith" value={form.manager} onChange={set('manager')} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="New York, NY" value={form.location} onChange={set('location')} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Creating...' : 'Create Department'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/departments')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
