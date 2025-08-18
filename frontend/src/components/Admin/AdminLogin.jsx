import { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { AdminLogin, AdminForgotPassword, AdminResetPassword } from '../../api/admin.js';
import '../../styles/AdminLogin.css';

export default function AdminLoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await AdminLogin(email, password);
      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back, admin!',
        confirmButtonColor: '#28a745',
        showConfirmButton: false,
        timer: 1500
      });
      navigate('/admin/dashboard');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error?.response?.data?.message || 'Something went wrong!',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: 'Forgot Password',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'admin@example.com',
      showCancelButton: true,
      confirmButtonText: 'Send OTP',
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter an email address!';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address!';
        }
      }
    });

    if (email) {
      try {
        await AdminForgotPassword(email);
        
        const { value: formValues } = await Swal.fire({
          title: 'Reset Password',
          html: `
            <input id="otp" class="swal2-input" placeholder="Enter 6-digit OTP" maxlength="6">
            <input id="newPassword" class="swal2-input" type="password" placeholder="New Password" minlength="8">
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Reset Password',
          preConfirm: () => {
            const otp = document.getElementById('otp').value;
            const newPassword = document.getElementById('newPassword').value;
            
            if (!otp || otp.length !== 6) {
              Swal.showValidationMessage('Please enter a valid 6-digit OTP');
              return false;
            }
            if (!newPassword || newPassword.length < 8) {
              Swal.showValidationMessage('Password must be at least 8 characters long');
              return false;
            }
            return { otp, newPassword };
          }
        });

        if (formValues) {
          await AdminResetPassword(formValues.otp, formValues.newPassword);
          Swal.fire({
            icon: 'success',
            title: 'Password Reset Successful',
            text: 'You can now login with your new password',
            confirmButtonColor: '#28a745'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error?.response?.data?.message || 'Something went wrong!',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  };

  return (
    <div className="AdminLogin-Container">
      <div className="AdminLogin-Box">
        <h2 className="AdminLogin-Title">Login</h2>
        <form className="AdminLogin-Form" onSubmit={handleSubmit}>
          <div className="AdminLogin-InputGroup">
            <input
              type="text"
              id="username"
              placeholder=" "
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label htmlFor="username">Email</label>
          </div>
          <div className="AdminLogin-InputGroup password-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder=" "
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          <div className='AdminLogin-LoginBtnContainer'>
            <button type="submit" className="AdminLogin-Button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
