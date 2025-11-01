import React, { useState, useEffect, useRef } from 'react';
import plantImage from '../assets/plants.png';
import { ArrowLeft } from 'lucide-react';
import googleIcon from '../assets/google.png';
import appleIcon from '../assets/apple.png';
import { useNavigate, Link } from 'react-router-dom';
import Axios from 'axios';
import * as faceapi from 'face-api.js';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);

  const navigate = useNavigate();
  const videoRef = useRef(null);

  // ✅ Load Face API models once
  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setIsModelLoaded(true);
        console.log('✅ Face API models loaded');
      } catch (err) {
        console.error('❌ Error loading face-api models:', err);
      }
    };
    loadModels();
  }, []);

  // ✅ Start the webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('❌ Camera access denied:', err);
      alert('Please allow camera access.');
    }
  };

  // ✅ Capture the user's face descriptor
  const captureFace = async () => {
    if (!isModelLoaded) return alert('Please wait, models are still loading.');

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detection) {
      const descriptor = Array.from(detection.descriptor);
      localStorage.setItem('faceDescriptor', JSON.stringify(descriptor));
      setIsFaceRegistered(true);
      alert('✅ Face captured and registered successfully!');
    } else {
      alert('❌ No face detected. Try again.');
    }
  };

  // ✅ Signup function
  const createUser = async () => {
    if (!isFaceRegistered) {
      return alert('Please register your face before signing up.');
    }

    const faceDescriptor = localStorage.getItem('faceDescriptor');
    if (!faceDescriptor) {
      return alert('Face data missing. Please capture again.');
    }

    try {
      const response = await Axios.post('http://localhost:3002/signup', {
        username: name,
        email: email,
        password: password,
        role: 'user',
        face_encoding: faceDescriptor,
      });

      console.log(response.data);
      setSuccessMessage('✅ Account created successfully! Redirecting to login...');
      setEmail('');
      setName('');
      setPassword('');
      localStorage.removeItem('faceDescriptor');
      setIsFaceRegistered(false);

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('❌ Signup error:', err);
      setSuccessMessage('Signup failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-screen">
      {/* Left side - Signup form */}
      <div className="w-full md:w-1/2 flex justify-center items-center bg-white px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Back button */}
          <div className="relative mb-6 flex items-center justify-center">
            <button
              onClick={() => navigate(-1)}
              className="absolute left-0 text-gray-700 hover:text-black flex items-center"
            >
              <ArrowLeft size={26} />
            </button>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Get Started Now</h2>
          <p className="text-sm font-bold text-gray-600 mb-4">
            Enter your details to create an account
          </p>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 text-green-800 font-semibold px-4 py-2 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          {/* Name Input */}
          <label className="text-sm font-bold mb-1 block">Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          {/* Email Input */}
          <label className="text-sm font-bold mb-1 block">Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          {/* Password Input */}
          <label className="text-sm font-bold mb-1 block">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-4"
          />

          {/* Remember Checkbox */}
          <label className="text-sm mb-4 block font-bold">
            <input type="checkbox" className="mr-2" />
            Remember for 30 days
          </label>

          {/* Face Registration Section */}
          <div className="flex flex-col items-center my-4">
            <video
              ref={videoRef}
              autoPlay
              muted
              width="250"
              height="200"
              className="rounded-lg border mb-3"
            ></video>
            <div className="flex gap-2">
              <button
                onClick={startCamera}
                className="bg-gray-200 px-3 py-1 rounded font-bold"
              >
                Start Camera
              </button>
              <button
                onClick={captureFace}
                className="bg-blue-600 text-white px-3 py-1 rounded font-bold"
              >
                Capture Face
              </button>
            </div>
            {isFaceRegistered && (
              <p className="text-green-600 text-sm mt-2 font-semibold">
                ✅ Face registered successfully!
              </p>
            )}
          </div>

          {/* Signup Button */}
          <button
            className="bg-green-700 text-white w-full py-2 rounded hover:bg-green-800 mb-3 font-semibold"
            onClick={createUser}
          >
            Sign Up
          </button>

          {/* Divider */}
          <div className="flex items-center my-3">
            <hr className="flex-grow border-gray-300" />
            <span className="px-3 text-gray-500">or</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Signup Buttons */}
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

          {/* Redirect to Login */}
          <p className="text-sm font-bold text-center mt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-bold">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side Image */}
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

export default Signup;
