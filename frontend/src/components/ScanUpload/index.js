import { useState } from 'react';
import Loader from '../Loader';
import Header from '../Header';
import './index.css';

const ScanUpload = () => {
  const [form, setForm] = useState({
    patient_name: '',
    patient_id: '',
    scan_type: 'RGB',
    region: 'Frontal',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('patient_name', form.patient_name);
    formData.append('patient_id', form.patient_id);
    formData.append('scan_type', form.scan_type);
    formData.append('region', form.region);
    formData.append('image', form.image);

    try {
      const response = await fetch('https://healthcare-2-thxd.onrender.com/scans', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      setMessage('Scan uploaded successfully!');
      setForm({
        patient_name: '',
        patient_id: '',
        scan_type: 'RGB',
        region: 'Frontal',
        image: null,
      });
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="scan-upload-container">
        <div className="scan-upload-card">
        <h2>Upload Patient Scan</h2>
        {loading ? <Loader /> : (
          <form className="scan-upload-form" onSubmit={handleSubmit}>
            <label>Patient Name</label>
            <input name="patient_name" value={form.patient_name} onChange={handleChange} required />
            <label>Patient ID</label>
            <input name="patient_id" value={form.patient_id} onChange={handleChange} required />
            <label>Scan Type</label>
            <select name="scan_type" value={form.scan_type} onChange={handleChange}>
              <option value="RGB">RGB</option>
            </select>
            <label>Region</label>
            <select name="region" value={form.region} onChange={handleChange}>
              <option value="Frontal">Frontal</option>
              <option value="Upper Arch">Upper Arch</option>
              <option value="Lower Arch">Lower Arch</option>
            </select>
            <label>Scan Image</label>
            <input type="file" name="image" accept="image/png, image/jpeg" onChange={handleChange} required />
            <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Scan'}</button>
          </form>
        )}
        {message && <p className="message">{message}</p>}
      </div>
      </div>
    </>
  );
};

export default ScanUpload;