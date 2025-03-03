'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import loginImage from '../Login/login6.jpg';
import './Login.css';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const togglePasswordVisibility = (e: React.MouseEvent<HTMLElement>) => {
    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
    if (input && input.type === 'password') {
      input.type = 'text';
    } else if (input) {
      input.type = 'password';
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const response = await fetch('http://143.110.180.27:8003/client-users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': 'xxAJf365FZZidPt496lk9M2XDbvQCMKevOSuBgx2k6BAjp3ALe4vLTjXtcmgatoQtvsSLED3lx7zEgyHcohd1Wa2iJWTlukzQTuauvTbGYjSgMtFq5AUQLuAcMW44mp', // Add API Key
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('API Response:', data); // Debugging

      if (response.status === 200 && data.user_id) {

        const userName = data.user_name ? data.user_name.trim() : "Unknown User";
        // Store user details in localStorage
        localStorage.setItem('loggedInUserEmail', data.email);
        localStorage.setItem('loggedInUserId', data.user_id); // Fix: Use `user_id`
        localStorage.setItem('loggedInUserRole', data.role);
        localStorage.setItem('client_user_id', data.user_id);
        localStorage.setItem('loggedInUserName', userName); // Store the user's name

        console.log("Stored User Name:", userName); // Debugging: Verify name storage

        toast.success('Login successful!');
        setTimeout(() => {
          router.push('/Dashboard');
        }, 2000);// Redirect to dashboard
      } else {
        console.error('Login failed:', data);
        toast.error(`Login failed: ${data.message || 'Invalid credentials.'}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
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
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <i className="fas fa-eye" onClick={togglePasswordVisibility}></i>
              </div>

              <div className="forgot-password">
                <Link href="/">Forgot password?</Link >
              </div>
              <button type="submit">Login now</button>
            </form>
          
          </div>
        </div>

      </div>
        {/* Toast Notification Container */}
        <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

    </div>
  );
}
