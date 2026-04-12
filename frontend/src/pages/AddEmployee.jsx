import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employees, departments } from '../services/api.js';
import toast from 'react-hot-toast';

export default function AddEmployee() {
  const navigate = useNavigate();
  const [deptList, setDeptList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    position: '', departmentId: '', departmentName: '',
    location: '', hireDate: '', salary: ''
  });

  useEffect(() => {
    departments.getAll()
      .then(r => setDeptList(r.data?.data || []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const updated = { ...f, [k]: val };
      if (k === 'departmentId') {
        const dept = deptList.find(d => d.id === parseInt(val));
        updated.departmentName = dept?.name || '';
      }
      return updated;
    });
    setErrors(er => ({ ...er, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.position.trim()) e.position = 'Required';
    if (!form.departmentId) e.departmentId = 'Required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await employees.create({
        ...form,
        departmentId: parseInt(form.departmentId),
        salary: form.salary ? parseFloat(form.salary) : null,
        hireDate: form.hireDate || null,
      });
      toast.success('Employee added successfully!');
      navigate('/employees');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" placeholder="John" value={form.firstName} onChange={set('firstName')} />
              {errors.firstName && <div className="error-msg">{errors.firstName}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" placeholder="Doe" value={form.lastName} onChange={set('lastName')} />
              {errors.lastName && <div className="error-msg">{errors.lastName}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input className="form-input" type="email" placeholder="john.doe@company.com" value={form.email} onChange={set('email')} />
            {errors.email && <div className="error-msg">{errors.email}</div>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+1-555-0100" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Position *</label>
              <input className="form-input" placeholder="Software Engineer" value={form.position} onChange={set('position')} />
              {errors.position && <div className="error-msg">{errors.position}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Department *</label>
            <select className="form-select" value={form.departmentId} onChange={set('departmentId')}>
              <option value="">Select department...</option>
              {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            {errors.departmentId && <div className="error-msg">{errors.departmentId}</div>}
            {deptList.length === 0 && (
              <div style={{ fontSize: 12, color: '#e53e3e', marginTop: 4 }}>
                No departments found. <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/departments/new')}>Create one first.</span>
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="New York, NY" value={form.location} onChange={set('location')} />
            </div>
            <div className="form-group">
              <label className="form-label">Hire Date</label>
              <input className="form-input" type="date" value={form.hireDate} onChange={set('hireDate')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Salary (USD)</label>
            <input className="form-input" type="number" placeholder="75000" value={form.salary} onChange={set('salary')} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Adding...' : 'Add Employee'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/employees')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
