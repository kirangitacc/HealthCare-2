import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import './index.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const onChange = event => {
    const { name, value } = event.target;
    if (name === 'username') setUsername(value);
    else if (name === 'password') setPassword(value);
    else if (name === 'gender') setGender(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'phone') setPhone(value);
    else if (name === 'address') setAddress(value);
    else if (name === 'role') setRole(value);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const userData = { username, email, password, gender, phone, address, role };

    const url = 'https://healthcare-2-thxd.onrender.com/register';

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    };

    try {
      const req = await fetch(url, options);
      const res = await req.json();

      if (req.ok) {
        setSuccessMsg(res.message || 'Registration successful!');
        setErrorMsg('');
        setUsername('');
        setPassword('');
        setGender('');
        setEmail('');
        setPhone('');
        setAddress('');
        setRole('');
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
        setSuccessMsg('');
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred. Please try again.');
      setSuccessMsg('');
    }
  };

  return (
    <>
      <Header />
      <div className="register-con">
        <div className="register-card">
          <form className="register-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="username">USERNAME</label>
              <input type="text" name="username" value={username} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">EMAIL</label>
              <input type="email" name="email" value={email} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <input type="password" name="password" value={password} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="gender">GENDER</label>
              <select name="gender" value={gender} onChange={onChange} required>
                <option value="">None</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="phone">PHONE</label>
              <input type="text" name="phone" value={phone} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="address">ADDRESS</label>
              <input type="text" name="address" value={address} onChange={onChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="role">ROLE</label>
              <select name="role" value={role} onChange={onChange} required>
                <option value="">Select Role</option>
                <option value="Technician">Technician</option>
                <option value="Dentist">Dentist</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className='btn-register'>Register</button>
              <Link to="/">
                <button type="button" className="btn-login">Login</button>
              </Link>
              {errorMsg && <p className="error-msg">{errorMsg}</p>}
              {successMsg && (
                <Link to="/">
                  <p className="success-msg">{successMsg} Click here to login</p>
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
