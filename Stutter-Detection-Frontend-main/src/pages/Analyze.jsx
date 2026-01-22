"use client"

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mic,
  Upload,
  Loader,
  Play,
  Pause,
  FileAudio,
  AlertCircle,
  Camera,
  CheckCircle,
  StopCircle,
  RotateCcw,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReadableText from "@/components/ReadableText";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import ConsentPage from "./ConsentPage";
import sentencesData from "../data/sentences.json";

export default function Analyze() {
  const { currentUser, isPatient, isSLP } = useAuth();
  const navigate = useNavigate();

  // State management
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [gradeLevel, setGradeLevel] = useState("Class_1_3");
  const [language, setLanguage] = useState("english");
  const [sentences, setSentences] = useState([]);
  const [showConsent, setShowConsent] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [isUserDetailsSubmitted, setIsUserDetailsSubmitted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [slps, setSlps] = useState([]);
  const [selectedSlp, setSelectedSlp] = useState("");
  const [mySlp, setMySlp] = useState(null);

  // User details form
  const [userDetails, setUserDetails] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    age: "",
    gender: "",
  });

  // Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Load sentences based on language and grade level
  useEffect(() => {
    try {
      if (sentencesData && sentencesData[language] && sentencesData[language][gradeLevel]) {
        setSentences(sentencesData[language][gradeLevel]);
      } else {
        setSentences([]);
      }
    } catch (err) {
      console.error("Error loading sentences:", err);
      setSentences([]);
    }
  }, [language, gradeLevel]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  // Fetch SLPs and current SLP
  useEffect(() => {
    if (isPatient && currentUser) {
      fetch("/api/slps")
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") setSlps(data.slps);
        });
      
      fetch(`/api/my_slp/${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.slp) {
            setMySlp(data.slp);
            setSelectedSlp(data.slp._id);
          }
        });
    }
  }, [isPatient, currentUser]);

  // Camera/mic setup
  useEffect(() => {
    async function setupMedia() {
      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
        setError(null);
      } catch (err) {
        console.error("Media setup error:", err);
        setError(
          "Unable to access camera or microphone. Please check your permissions and ensure your browser has camera/microphone access."
        );
      }
    }

    if (isUserDetailsSubmitted && !isRecording && !file && !mediaRecorderRef.current) {
      setupMedia();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isUserDetailsSubmitted, isRecording, file]);

  // File upload handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (
      selectedFile &&
      (selectedFile.type.startsWith("audio/") ||
        selectedFile.type.startsWith("video/"))
    ) {
      setFile(selectedFile);
      setError(null);
      setSuccess("File selected successfully!");

      if (selectedFile.type.startsWith("video/") && videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = URL.createObjectURL(selectedFile);
        videoRef.current.muted = false;
      }
    } else {
      setError("Please select a valid audio or video file.");
    }
  };

  // Recording handlers
  const startRecording = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Get fresh stream for recording
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = newStream;

      // Display stream in video element
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.muted = true;
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }

      // Check for audio tracks
      const audioTracks = newStream.getAudioTracks();
      if (audioTracks.length === 0) {
        setError("No microphone detected. Please check your audio input device.");
        return;
      }

      // Create media recorder
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
        ? "video/webm;codecs=vp8"
        : "video/webm";

      mediaRecorderRef.current = new MediaRecorder(newStream, {
        mimeType: mimeType,
      });

      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        saveRecording(blob);
        
        // Stop tracks after recording is saved to ensure data is captured
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.onerror = (event) => {
        console.error("Recording error:", event.error);
        setError(`Recording error: ${event.error}`);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setSuccess("Recording started...");
    } catch (err) {
      console.error("Start recording error:", err);
      setError(`Recording error: ${err.message}`);
    }
  };

  const stopRecording = () => {
    try {
      console.log("STOP CLICKED");

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }

      setIsRecording(false);
      setSuccess("Recording stopped. Processing...");
    } catch (err) {
      console.error("Stop recording error:", err);
      setError(`Error stopping recording: ${err.message}`);
    }
  };

  const downloadRecording = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `stutter_recording_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const saveRecording = (blob) => {
    try {
      const url = URL.createObjectURL(blob);
      const newFile = new File([blob], "recorded_video.webm", {
        type: "video/webm",
      });
      setFile(newFile);

      // Update video element to show recorded video
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
      }

      setSuccess("Recording saved successfully!");
      setError(null);
    } catch (err) {
      console.error("Save recording error:", err);
      setError(`Error saving recording: ${err.message}`);
    }
  };

  const resetRecording = () => {
    try {
      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // Clear file
      setFile(null);
      setSuccess(null);
      setError(null);
      setIsPlaying(false);
      setRecordingTime(0);

      // Reset video element and restart stream
      if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.srcObject = null;
      }

      // Restart camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Setup fresh stream
      setTimeout(() => {
        setupMedia();
      }, 500);
    } catch (err) {
      console.error("Reset error:", err);
      setError(`Error resetting: ${err.message}`);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const setupMedia = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err);
        });
      }
    } catch (err) {
      console.error("Setup media error:", err);
      setError("Unable to access camera or microphone.");
    }
  };

  // Handle user details submission
  const handleUserDetailsSubmit = (e) => {
    e.preventDefault();
    if (!userDetails.name || !userDetails.email || !userDetails.age || !userDetails.gender) {
      setError("Please fill in all details");
      return;
    }
    setIsUserDetailsSubmitted(true);
    setError(null);
  };

  // Handle analysis submission
  const handleSubmit = async () => {
    if (!file) {
      setError("Please select or record an audio/video file.");
      return;
    }

    if (!consentAccepted) {
      setShowConsent(true);
      return;
    }

    try {
      setError(null);
      setIsAnalyzing(true);

      // Create task ID
      const newTaskId = `${currentUser?.id || "user"}_${Date.now()}`;
      setTaskId(newTaskId);

      // Assign SLP if changed
      if (selectedSlp && (!mySlp || selectedSlp !== mySlp._id)) {
        await fetch("/api/assign_slp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patient_id: currentUser.id, slp_id: selectedSlp })
        });
      }

      // Upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("task_id", newTaskId);
      formData.append("user_id", currentUser?.id || "");
      formData.append("user_details", JSON.stringify(userDetails));

      const response = await fetch(`/api/upload_audio/${newTaskId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setSuccess("File uploaded successfully! Analysis in progress...");
      setFile(null);

      // Redirect to results after a delay
      setTimeout(() => {
        navigate("/results", { state: { taskId: newTaskId } });
      }, 2000);
    } catch (err) {
      setError(`Error: ${err.message}`);
      setIsAnalyzing(false);
    }
  };

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Patient view
  if (isPatient) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Speech Analysis</h1>
            <p className="text-gray-600">Record or upload your speech for analysis</p>
          </motion.div>

          {/* Consent Modal */}
          <AnimatePresence>
            {showConsent && (
              <ConsentPage
                onAccept={() => {
                  setConsentAccepted(true);
                  setShowConsent(false);
                  handleSubmit();
                }}
                onDecline={() => setShowConsent(false)}
              />
            )}
          </AnimatePresence>

          {/* User Details Section */}
          {!isUserDetailsSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUserDetailsSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={userDetails.name}
                          onChange={(e) =>
                            setUserDetails({ ...userDetails, name: e.target.value })
                          }
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userDetails.email}
                          onChange={(e) =>
                            setUserDetails({ ...userDetails, email: e.target.value })
                          }
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={userDetails.age}
                          onChange={(e) =>
                            setUserDetails({ ...userDetails, age: e.target.value })
                          }
                          placeholder="Your age"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={userDetails.gender}
                          onValueChange={(value) =>
                            setUserDetails({ ...userDetails, gender: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="slp">Choose your SLP (Therapist)</Label>
                        <Select
                          value={selectedSlp}
                          onValueChange={setSelectedSlp}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an SLP" />
                          </SelectTrigger>
                          <SelectContent>
                            {slps.map((slp) => (
                              <SelectItem key={slp._id} value={slp._id}>
                                {slp.name} ({slp.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Main Content - Video Left, Sentences Right */}
          {isUserDetailsSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Success Alert */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{success}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT SIDE - VIDEO RECORDING */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  {/* Video Preview */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Video Recording
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Video Element */}
                      <div className="bg-black rounded-lg overflow-hidden relative group">
                        <video
                          ref={videoRef}
                          className="w-full h-96 object-cover"
                          onEnded={() => setIsPlaying(false)}
                          controls={!!file}
                        />
                      </div>

                      {/* Recording Timer */}
                      {isRecording && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
                        >
                          <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                          <span className="font-semibold text-red-600">
                            Recording: {formatTime(recordingTime)}
                          </span>
                        </motion.div>
                      )}

                      {/* Recording Controls */}
                      <div className="flex gap-2">
                        {!isRecording ? (
                          <Button
                            onClick={startRecording}
                            disabled={!!file}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Mic className="w-4 h-4 mr-2" />
                            Start Recording
                          </Button>
                        ) : (
                          <Button
                            onClick={stopRecording}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            <StopCircle className="w-4 h-4 mr-2" />
                            Stop Recording
                          </Button>
                        )}

                        {file && (
                          <Button
                            onClick={togglePlayPause}
                            variant="outline"
                            className="flex-1"
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Play
                              </>
                            )}
                          </Button>
                        )}

                        {file && (
                          <Button
                            onClick={resetRecording}
                            variant="outline"
                            className="flex-1"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        )}
                        
                        {file && (
                          <Button
                            onClick={downloadRecording}
                            variant="outline"
                            className="flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>

                      {/* File Upload Option */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-muted-foreground">
                            Or upload a file
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Input
                          type="file"
                          accept="audio/*,video/*"
                          onChange={handleFileChange}
                          disabled={isRecording || !!file}
                          className="cursor-pointer"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* RIGHT SIDE - SENTENCES & SETTINGS */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  {/* Language & Grade Selection */}
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">🇬🇧 English</SelectItem>
                            <SelectItem value="hindi">🇮🇳 हिंदी (Hindi)</SelectItem>
                            <SelectItem value="marathi">🇮🇳 मराठी (Marathi)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="grade">Grade Level</Label>
                        <Select value={gradeLevel} onValueChange={setGradeLevel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Class_1_3">Class 1-3</SelectItem>
                            <SelectItem value="Class_4_6">Class 4-6</SelectItem>
                            <SelectItem value="Class_7_9">Class 7-9</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sentences Display */}
                  <Card className="shadow-lg flex-1">
                    <CardHeader>
                      <CardTitle>Sentences to Read</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReadableText
                        gradeLevel={gradeLevel}
                        language={language}
                        sentences={sentences}
                      />
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!file || isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-semibold"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }

  // SLP view
  const [slpTasks, setSlpTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (isSLP && currentUser) {
      setLoadingTasks(true);
      fetch(`/api/tasks?slp_id=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") setSlpTasks(data.tasks);
        })
        .finally(() => setLoadingTasks(false));
    }
  }, [isSLP, currentUser]);

  if (isSLP) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Therapist Dashboard</h1>
            <Button onClick={() => {
              setLoadingTasks(true);
              fetch(`/api/tasks?slp_id=${currentUser.id}`)
                .then(res => res.json())
                .then(data => {
                  if (data.status === "success") setSlpTasks(data.tasks);
                })
                .finally(() => setLoadingTasks(false));
            }}>Refresh</Button>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Patient Recordings</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <div className="py-12 text-center">
                  <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                  <p>Loading patient records...</p>
                </div>
              ) : slpTasks.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-600">No patient recordings found for you yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-4 px-4 font-semibold">Task ID</th>
                        <th className="py-4 px-4 font-semibold">Status</th>
                        <th className="py-4 px-4 font-semibold">Date</th>
                        <th className="py-4 px-4 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slpTasks.map((task) => (
                        <tr key={task.task_id} className="border-b hover:bg-blue-50/50 transition">
                          <td className="py-4 px-4 font-mono text-sm">{task.task_id}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'failed' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {new Date(task.timestamp).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate("/results", { state: { taskId: task.task_id } })}
                              disabled={task.status !== 'completed'}
                            >
                              View Results
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  // Not logged in
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="shadow-lg">
        <CardContent className="py-8 text-center">
          <p className="text-gray-600 mb-4">Please log in to access the analysis page</p>
          <Button onClick={() => navigate("/login")}>Go to Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
