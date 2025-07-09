import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import plantImage from '../assets/plants.png';
import { ArrowLeft } from 'lucide-react';
import googleIcon from '../assets/google.png';
import appleIcon from '../assets/apple.png';
import Axios from 'axios';

const Login = () => {
  const [loginemail, setloginEmail] = useState('');
  const [loginpassword, setloginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const navigate = useNavigate();

  const loginUser = (e) => {
    e.preventDefault();
    Axios.post('http://localhost:3002/login', {
      LoginEmail: loginemail,
      LoginPassword: loginpassword
    })
      .then((response) => {
        if (response.data.message) {
          setLoginError('Credentials do not exist');
        } else {
          setLoginError('');
          // Clear form
          setloginEmail('');
          setloginPassword('');
          navigate('/dashboard');
        }
      })
      .catch(() => {
        setLoginError('Something went wrong. Try again.');
      });
  };

  // Hide error message after 4 seconds
  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => {
        setLoginError('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-end pr-10 bg-white z-0">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-20 ml-[-5] mt-2 gap-40">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-700 hover:text-black flex items-center"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-black text-white rounded-[10px] px-2 py-1 text-lg">Logo</div>
          </div>

          <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
          <p className="text-sm font-bold text-gray-600 mb-6">
            Enter your credentials to access your account
          </p>

          {/* Error Message */}
          {loginError && (
            <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 font-bold text-center">
              {loginError}
            </div>
          )}

          <label className="block font-bold text-sm text-gray-700 mb-1">Email address</label>
          <input
            type="email"
            value={loginemail}
            placeholder="Enter your email"
            onChange={(e) => setloginEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <div className="flex justify-between items-end mb-1">
            <label className="block text-sm text-gray-700 font-bold">Password</label>
            <a href="#" className="text-sm text-blue-600 font-bold">Forgot password?</a>
          </div>
          <input
            type="password"
            value={loginpassword}
            placeholder="Enter your password"
            onChange={(e) => setloginPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <div className="flex justify-between items-center text-sm mb-4">
            <label className="font-bold">
              <input type="checkbox" className="mr-1" /> Remember for 30 days
            </label>
          </div>

          <button
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mb-4 font-bold"
            onClick={loginUser}
          >
            Login
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500 font-bold">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-2 mb-4">
            <button className="border px-4 py-2 rounded flex-1 flex items-center justify-center gap-2 font-bold">
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
            <button className="border px-4 py-2 rounded flex-1 flex items-center justify-center gap-2 font-bold">
              <img src={appleIcon} alt="Apple" className="w-5 h-5" />
              Sign in with Apple
            </button>
          </div>

          <p className="text-sm font-bold text-center">
            Don’t have an account?{' '}
            <a className="text-blue-600 font-bold" href="/signup">
              Sign Up
            </a>
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 flex items-center justify-end">
        <img
          src={plantImage}
          alt="plant"
          className="h-full object-contain rounded-tl-lg rounded-bl-lg"
        />
      </div>
    </div>
  );
};

export default Login;
