import React, { useState } from 'react';
import plantImage from '../assets/plants.png';
import { ArrowLeft } from 'lucide-react';
import googleIcon from '../assets/google.png';
import appleIcon from '../assets/apple.png';
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const createUser = () => {
    Axios.post('http://localhost:3002/signup', {
      Email: email,
      Name: name,
      Password: password,
    })
      .then(() => {
        setSuccessMessage('Account created successfully! Redirecting to login...');
        // Clear form
        setEmail('');
        setName('');
        setPassword('');
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setSuccessMessage('Signup failed. Please try again.');
      });
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 flex items-center justify-end pr-10 bg-white z-0">
        <div className="w-full max-w-md relative">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-black mb-20"
          >
            <ArrowLeft className="mr-1" size={20} />
          </button>

          <h2 className="text-3xl font-bold mb-2">Get Started Now</h2>
          <p className="text-sm text-gray-600 mb-6 font-bold">
            Enter your credentials to create a new account
          </p>

          {successMessage && (
            <div className="bg-green-100 text-green-800 font-semibold px-4 py-2 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <label className="text-sm font-bold mb-1 block">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="text-sm font-bold mb-1 block">Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="text-sm font-bold mb-1 block">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          <label className="text-sm mb-4 block font-bold">
            <input type="checkbox" className="mr-2" />
            Remember for 30 days
          </label>

          <button
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 font-semibold"
            onClick={createUser}
          >
            Sign Up
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex gap-2 mb-4 font-bold">
            <button className="border px-4 py-2 rounded flex-1 flex items-center justify-center gap-2">
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Google
            </button>
            <button className="border px-4 py-2 rounded flex-1 flex items-center justify-center gap-2">
              <img src={appleIcon} alt="Apple" className="w-5 h-5" />
              Apple
            </button>
          </div>

          <p className="text-sm text-center font-bold">
            Already have an account?{' '}
            <a className="text-blue-600" href="/login">
              Login
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

export default Signup;
