import { useEffect, useState } from 'react';
import PDFReport from '../PDFReport';
import Loader from '../Loader';
import Header from '../Header';
import './index.css';

const ScanViewer = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchScans = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('https://healthcare-2-thxd.onrender.com/scans', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setScans(data);
      setLoading(false);
    };
    fetchScans();
  }, []);

  const filteredScans = scans.filter(scan => {
    const searchText = search.toLowerCase();
    return (
      scan.patient_name.toLowerCase().includes(searchText) ||
      scan.region.toLowerCase().includes(searchText) ||
      scan.scan_type.toLowerCase().includes(searchText) ||
      scan.patient_id.toLowerCase().includes(searchText)
    );
  });

  return (
    <>
      <Header />
      <div className="scan-viewer-container">
        <div className="scan-viewer-header">
          <h2 style={{ textAlign: 'left' }}>Patient Scans</h2>
          <div className="scan-search-bar">
            <input
              type="text"
              placeholder="Search by Name, Region, Type, or ID"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="scan-list">
            {filteredScans.length === 0 ? (
              <div className="no-scans">No records to show at the moment.</div>
            ) : (
              filteredScans.map(scan => (
                <div key={scan.id} className="scan-card">
                  <img src={scan.image_url} alt="Scan" className="scan-thumb" />
                  <div className="scan-details">
                    <div><strong>Name:</strong> {scan.patient_name}</div>
                    <div><strong>ID:</strong> {scan.patient_id}</div>
                    <div><strong>Type:</strong> {scan.scan_type}</div>
                    <div><strong>Region:</strong> {scan.region}</div>
                    <div><strong>Date:</strong> {new Date(scan.upload_date).toLocaleString()}</div>
                  </div>
                  <button onClick={() => setSelectedScan(scan)}>View PDF</button>
                  <a href={scan.image_url} target="_blank" rel="noopener noreferrer">
                    <button>View Full Image</button>
                  </a>
                </div>
              ))
            )}
          </div>
        )}
        {selectedScan && (
          <PDFReport scan={selectedScan} onClose={() => setSelectedScan(null)} />
        )}
      </div>
    </>
  );
};

export default ScanViewer;