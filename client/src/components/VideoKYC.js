import React, { useState, useRef, useEffect } from 'react';
import { 
  VideoCameraIcon, 
  StopIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

const VideoKYC = ({ onKYCComplete, onKYCError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions and try again.');
      if (onKYCError) {
        onKYCError(err);
      }
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 9) { // Stop at 10 seconds
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);

      mediaRecorder.start();
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsCompleted(true);
      
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Clear intervals
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      // Simulate KYC completion
      setTimeout(() => {
        if (onKYCComplete) {
          onKYCComplete({
            status: 'VERIFIED',
            timestamp: new Date(),
            duration: 10,
            type: 'VIDEO_KYC'
          });
        }
      }, 1000);
    }
  };

  const resetKYC = () => {
    setIsCompleted(false);
    setIsRecording(false);
    setCountdown(0);
    setRecordingTime(0);
    setError(null);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Video KYC Verification
        </h3>
        <p className="text-sm text-gray-600">
          Complete a 10-second video verification to proceed with your loan request
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Video Preview */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center">
              <div className="text-center">
                <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Camera not started</p>
              </div>
            </div>
          )}

          {/* Countdown Overlay */}
          {countdown > 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-6xl font-bold">
                {countdown}
              </div>
            </div>
          )}

          {/* Recording Overlay */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                REC {recordingTime}s
              </span>
            </div>
          )}

          {/* Completed Overlay */}
          {isCompleted && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
              <div className="text-center">
                <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">KYC Completed!</p>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Make sure your face is clearly visible</li>
            <li>• Speak your full name clearly</li>
            <li>• State your loan purpose briefly</li>
            <li>• Recording will automatically stop after 10 seconds</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!stream && !isCompleted && (
            <button
              onClick={startCamera}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <VideoCameraIcon className="w-5 h-5 mr-2" />
              Start Camera
            </button>
          )}

          {stream && !isRecording && !isCompleted && countdown === 0 && (
            <button
              onClick={startCountdown}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="btn-danger flex-1 flex items-center justify-center"
            >
              <StopIcon className="w-5 h-5 mr-2" />
              Stop Recording
            </button>
          )}

          {isCompleted && (
            <button
              onClick={resetKYC}
              className="btn-outline flex-1 flex items-center justify-center"
            >
              Record Again
            </button>
          )}
        </div>

        {/* Status */}
        <div className="text-center">
          {countdown > 0 && (
            <p className="text-sm text-gray-600">
              Recording will start in {countdown} seconds...
            </p>
          )}
          {isRecording && (
            <p className="text-sm text-red-600">
              Recording... {recordingTime}/10 seconds
            </p>
          )}
          {isCompleted && (
            <p className="text-sm text-green-600">
              ✅ KYC verification completed successfully!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoKYC;
