import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import plantImage from '../assets/plants.png';
import { ArrowLeft } from 'lucide-react';
import googleIcon from '../assets/google.png';
import appleIcon from '../assets/apple.png';
import Axios from 'axios';
import * as faceapi from 'face-api.js'; 

const Login = () => {
  const [loginemail, setloginEmail] = useState('');
  const [loginpassword, setloginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [status, setStatus] = useState(''); // 🔹 for face login feedback
  const [modelsLoaded, setModelsLoaded] = useState(false); // 🔹 check if models ready
  const videoRef = useRef(); // 🔹 camera video ref
  const navigate = useNavigate();

  // Load face-api models on mount
  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setModelsLoaded(true);
        console.log('✅ Face models loaded');
      } catch (err) {
        console.error('Model loading error:', err);
      }
    }
    loadModels();
  }, []);

  // normal email/password login
  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await Axios.post('http://localhost:3002/login', {
        LoginEmail: loginemail,
        LoginPassword: loginpassword,
      });

      const data = response.data;

      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('✅ Token stored:', data.token);
        setloginEmail('');
        setloginPassword('');
        setLoginError('');
        navigate('/dashboard');
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Something went wrong. Try again.');
    }
  };

  // 🔹 FACE LOGIN LOGIC BELOW

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  }

  async function handleFaceLogin() {
    try {
      setStatus('📸 Opening camera...');
      await startCamera();

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('❌ No face detected! Try again.');
        return;
      }

      const desc = Array.from(detection.descriptor);
      setStatus('🔍 Verifying face...');

      const res = await fetch('http://localhost:4000/api/face-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ face_encoding: desc }),
      });

      const data = await res.json();

      if (data.matched) {
        setStatus(`✅ Welcome ${data.username}`);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
      } else {
        setStatus('❌ Face not recognized.');
      }
    } catch (err) {
      console.error(err);
      setStatus('⚠️ Error: ' + err.message);
    }
  }

  useEffect(() => {
    if (loginError) {
      const timer = setTimeout(() => setLoginError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-6 py-8">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="relative mb-6 flex items-center justify-center">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 text-gray-700 hover:text-black flex items-center"
            >
              <ArrowLeft size={26} />
            </button>
            <div className="bg-black text-white rounded-[10px] px-4 py-2 text-lg font-bold">
              Logo
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome!</h2>
          <p className="text-sm font-bold text-gray-600 mb-4">
            Enter your credentials to access your account
          </p>

          {loginError && (
            <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 font-bold text-center">
              {loginError}
            </div>
          )}

          {/* Normal Login */}
          <label className="block font-bold text-sm text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            value={loginemail}
            placeholder="Enter your email"
            onChange={(e) => setloginEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-3"
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
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <button
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mb-3 font-bold"
            onClick={loginUser}
          >
            Login
          </button>

          {/* 🔹 FACE LOGIN SECTION */}
          <div className="flex flex-col items-center mt-4 mb-3">
            <p className="text-gray-600 font-bold mb-2">OR</p>
            <button
              onClick={handleFaceLogin}
              disabled={!modelsLoaded}
              className="bg-gray-800 text-white w-full py-2 rounded hover:bg-gray-900 font-bold"
            >
              Login with Face
            </button>
            <p className="text-sm mt-2 text-gray-600">{status}</p>
            <video
              ref={videoRef}
              autoPlay
              muted
              width={280}
              height={180}
              style={{ display: 'block', marginTop: '10px', borderRadius: '8px' }}
            />
          </div>

          {/* Social Signup */}
          <div className="flex items-center my-3">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500 font-bold">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-2 font-bold">
            <button className="w-full py-2 rounded border flex items-center justify-center gap-2">
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              Signup with Google
            </button>
            <button className="w-full py-2 rounded border flex items-center justify-center gap-2">
              <img src={appleIcon} alt="Apple" className="w-5 h-5" />
              Signup with Apple
            </button>
          </div>

          <p className="text-sm font-bold text-center mt-2">
            Don’t have an account?{' '}
            <Link to="/signup" className="text-blue-600 font-bold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="hidden md:flex w-1/2 items-center justify-end p-4">
        <img
          src={plantImage}
          alt="plant"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default Login;
