
import { jsPDF } from 'jspdf';
import './index.css';

const PDFReport = ({ scan, onClose }) => {

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Patient Scan Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Patient Name: ${scan.patient_name}`, 20, 35);
    doc.text(`Patient ID: ${scan.patient_id}`, 20, 45);
    doc.text(`Scan Type: ${scan.scan_type}`, 20, 55);
    doc.text(`Region: ${scan.region}`, 20, 65);
    doc.text(`Upload Date: ${new Date(scan.upload_date).toLocaleString()}`, 20, 75);

    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.src = scan.image_url;
    img.onload = function () {
      doc.addImage(img, 'JPEG', 20, 85, 80, 80);
      doc.save(`ScanReport_${scan.patient_id}.pdf`);
    };
  };

  return (
    <div className="pdf-modal">
      <div className="pdf-content">
        <h3>PDF Report</h3>
        <button onClick={handleDownload}>Download PDF</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default PDFReport;