import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as registerService, verifyOTP, resendOTP } from '../services/authService';
import { Layout, Mail, CheckCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1 = Registration, 2 = OTP Verification
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      await registerService(name, email, password);
      // Registration successful, backend sent an OTP email
      setStep(2);
      setSuccessMsg('Registration successful! Please check your email for the OTP.');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    
    try {
      const data = await verifyOTP(email, otpCode);
      // OTP verified successfully, login the user
      login(data.data || data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      await resendOTP(email);
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        
        {step === 1 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Layout size={48} color="var(--primary-accent)" style={{ marginBottom: '1rem' }} />
              <h2>Create Account</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Join the workspace today</p>
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', 
                color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem', fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input 
                  type="text" className="input-field" value={name} onChange={e => setName(e.target.value)}
                  required placeholder="John Doe"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input 
                  type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)}
                  required placeholder="you@example.com"
                />
              </div>
              
              <div className="input-group">
                <label className="input-label">Password</label>
                <input 
                  type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)}
                  required placeholder="••••••••" minLength={6}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : 'Register'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
              <Link to="/login">Sign in</Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <Mail size={48} color="var(--primary-accent)" style={{ marginBottom: '1rem' }} />
              <h2>Verify Email</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                We've sent a 6-digit code to <strong>{email}</strong>
              </p>
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', 
                color: 'var(--danger)', padding: '10px', borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem', fontSize: '0.9rem'
              }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div style={{ 
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', 
                color: 'var(--success)', padding: '10px', borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            <form onSubmit={handleOtpSubmit}>
              <div className="input-group">
                <label className="input-label">Verification Code (OTP)</label>
                <input 
                  type="text" className="input-field" value={otpCode} onChange={e => setOtpCode(e.target.value)}
                  required placeholder="123456" maxLength={6} style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem' }}
                />
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                {isLoading ? <div className="spinner"></div> : 'Verify & Login'}
              </button>
            </form>
            
            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Didn't receive the code? </span>
              <button onClick={handleResendOtp} disabled={isLoading} style={{ background: 'none', border: 'none', color: 'var(--primary-accent)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                Resend OTP
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
              <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                &larr; Back to Registration
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Register;
