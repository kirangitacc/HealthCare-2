import ScanUpload from '../ScanUpload';
import ScanViewer from '../ScanViewer';

const Home = () => {
  const role = localStorage.getItem('role'); // Set this on login

  if (role === 'Technician') {
    return <ScanUpload />;
  } else if (role === 'Dentist') {
    return <ScanViewer />;
  } else {
    return <div>Unauthorized</div>;
  }
};

export default Home;