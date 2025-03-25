'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import loginImage from '../Login/logo.jpg';
import './Login.css';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { send } from 'process';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [showVerifyOtpScreen, setShowVerifyOtpScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle password visibility
  };

 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
  
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log('API Response:', data);
  
      if (response.status === 200 && data.user_id) {
        const userName = data.user_name ? data.user_name.trim() : "Unknown User";
        
        // Store user data in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('currentUserData', JSON.stringify({
            email: data.email,
            userId: data.user_id,
            userRole: data.role,
            userName: userName
          }));
        }
  
        console.log("Stored User Name:", userName);
  
        toast.success('Login successful!');
        setTimeout(() => {
          // Determine redirect based on user role
          const role = data.role?.toLowerCase();
          if (role === 'admin') {
            router.push('/Consultant');
          } else if (role === 'user') {
            router.push('/Consultant');
          } else if (role === 'consultant') {
            router.push('/Consultant');
          } else {
            // Default route
            router.push('/Consultant');
          }
        }, 2000);
      } else {
        console.error('Login failed:', data);
        toast.error(`Login failed: ${data.message || 'Invalid credentials.'}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };
  const handleSendOtp = async () => {
    if (!phoneNumber) {
      toast.error("Please enter your phone number.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-users/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.status === 200) {
        toast.success('OTP sent successfully!');
        setShowVerifyOtpScreen(true);
      } else {
        console.error('Failed to send OTP:', data);
        toast.error(`Failed to send OTP: ${data.message || 'Unknown error.'}`);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client-users/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp',
        },
        body: JSON.stringify({ phone_number: phoneNumber, otp }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (response.status === 200 && data.user_id) {
        const userName = data.user_name ? data.user_name.trim() : "Unknown User";
        localStorage.setItem('loggedInUserEmail', data.email);
        localStorage.setItem('loggedInUserId', data.user_id);
        localStorage.setItem('loggedInUserRole', data.role);
        localStorage.setItem('client_user_id', data.user_id);
        localStorage.setItem('loggedInUserName', userName);

        console.log("Stored User Name:", userName);

        toast.success('OTP verified successfully!');
        setTimeout(() => {
          router.push('/Consultant');
        }, 2000);
      } else {
        console.error('OTP verification failed:', data);
        toast.error(`OTP verification failed: ${data.message || 'Invalid OTP.'}`);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="login-page">
      <div className="image-section">
        <div className="overlay">
          <h1>Global Business Solutions <br />with <span>AI Agent</span></h1>
          <div className="form-container">
            <Image src={loginImage} alt="Login" className="logo" />
            <h2 style={{ color: "#313b96", textAlign: "left" }}><b>LOGIN</b></h2>

            {!showOtpForm ? (
              <>
                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <i className="fas fa-envelope"></i>
                  </div>

                  <div className="input-group">
                    <label>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'} // Toggle input type
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <i
                        className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} // Toggle eye icon
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          cursor: 'pointer',
                          color: '#313b96',
                        }}
                        onClick={togglePasswordVisibility} // Toggle visibility on click
                      />
                    </div>
                  </div>

                  <div className="forgot-password">
                    <Link href="/">Forgot password?</Link>
                  </div>
                  <button type="submit">Login now</button>
                </form>

                <div style={{ margin: '10px 0', textAlign: 'center' }}>
                  or
                </div>

                <button
                  onClick={() => setShowOtpForm(true)}
                  style={{ marginTop: '5px', color: "#313b96" }}
                >
                  Sign in with Phone Number
                </button>
              </>
            ) : (
              <>
                {!showVerifyOtpScreen ? (
                  <form>
                    <div className="input-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="submit-button"
                      style={{ margin: '10px 0' }}
                    >
                      Send OTP
                    </button>
                  </form>
                ) : (
                  <form>
                    <div className="input-group">
                      <label>OTP</label>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      className="submit-button"
                      style={{ margin: '10px 0' }}
                    >
                      Verify OTP
                    </button>
                  </form>
                )}
                <div style={{ margin: '10px 0', textAlign: 'center' }}>
                  or
                </div>

                <button
                  onClick={() => setShowOtpForm(false)}
                  style={{ marginTop: '5px', color: "#313b96" }}
                >
                  Sign in with Email
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
 </div>
 );
}
