"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileAudio,
  BarChart2,
  Award,
  ArrowLeft,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Share2,
  Loader,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "../contexts/AuthContext";

const API_BASE_URL = "";

export default function Results() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskStatus, setTaskStatus] = useState("pending");

  const location = useLocation();
  const navigate = useNavigate();
  const taskId = location.state?.taskId || new URLSearchParams(location.search).get("task_id");
  const { currentUser, isPatient, isSLP } = useAuth();

  // Fetch results
  useEffect(() => {
    if (!taskId) {
      setError("No task ID provided");
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let pollInterval = null;

    async function fetchResults() {
      try {
        // Check task status
        const statusResponse = await fetch(`${API_BASE_URL}/api/task_status/${taskId}`);
        
        if (!statusResponse.ok) {
          throw new Error(`Failed to fetch task status: ${statusResponse.status}`);
        }

        const statusData = await statusResponse.json();
        
        if (!isMounted) return;

        setTaskStatus(statusData.status);

        if (statusData.status === "completed") {
          // Fetch actual results
          const resultResponse = await fetch(`${API_BASE_URL}/api/get_result/${taskId}`);
          
          if (!resultResponse.ok) {
            throw new Error(`Failed to fetch results: ${resultResponse.status}`);
          }

          const resultData = await resultResponse.json();
          
          if (!isMounted) return;

          // Transform data for display
          const transformedResults = {
            taskId: taskId,
            timestamp: new Date().toISOString(),
            fluencyScore: resultData.fluency_score || 0,
            stutteringEvents: resultData.stuttering_events || [],
            disfluencyTypes: resultData.disfluency_types || {},
            duration: resultData.duration || 0,
            analysisDetails: resultData.analysis_details || {},
          };

          setResults(transformedResults);
          setError(null);
          clearInterval(pollInterval);
        } else if (statusData.status === "failed") {
          setError("Analysis failed. Please try again.");
          setIsLoading(false);
        } else if (statusData.status === "processing") {
          // Keep polling
          return;
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        if (isMounted) {
          setError(err.message || "Failed to load results");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    // Poll for results every 2 seconds
    pollInterval = setInterval(() => {
      if (taskStatus !== "completed" && taskStatus !== "failed") {
        fetchResults();
      }
    }, 2000);

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [taskId, taskStatus]);

  // Mock data for demonstration if no real results
  const mockResults = {
    taskId: taskId || "demo-task",
    timestamp: new Date().toISOString(),
    fluencyScore: 78,
    stutteringEvents: [
      { time: "0:05", type: "Repetition", severity: "Mild" },
      { time: "0:12", type: "Prolongation", severity: "Moderate" },
      { time: "0:28", type: "Block", severity: "Severe" },
    ],
    disfluencyTypes: {
      Repetition: 5,
      Prolongation: 3,
      Block: 2,
    },
    duration: 45,
    analysisDetails: {
      totalWords: 120,
      stutteredWords: 10,
      speechRate: 2.67,
      pauseDuration: 3.2,
    },
  };

  const displayResults = results || mockResults;

  // Chart data
  const disfluencyData = Object.entries(displayResults.disfluencyTypes || {}).map(
    ([type, count]) => ({
      name: type,
      count: count,
    })
  );

  const eventTimeline = (displayResults.stutteringEvents || []).map((event, idx) => ({
    time: event.time || `${idx}:00`,
    severity: event.severity === "Severe" ? 3 : event.severity === "Moderate" ? 2 : 1,
  }));

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"];

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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Analysis Results</h1>
            <p className="text-gray-600">Speech analysis and stutter detection report</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/analyze")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Button>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-96"
          >
            <Card className="shadow-lg">
              <CardContent className="py-12 text-center">
                <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Analyzing your speech...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card className="border-red-200 bg-red-50 shadow-lg">
              <CardContent className="py-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-2">Error Loading Results</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  <Button
                    onClick={() => navigate("/analyze")}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Content */}
        {!isLoading && !error && displayResults && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Fluency Score</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                          {displayResults.fluencyScore}%
                        </p>
                      </div>
                      <Award className="w-12 h-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Stutter Events</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                          {(displayResults.stutteringEvents || []).length}
                        </p>
                      </div>
                      <AlertCircle className="w-12 h-12 text-red-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Duration</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">
                          {displayResults.duration}s
                        </p>
                      </div>
                      <Clock className="w-12 h-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Total Words</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">
                          {displayResults.analysisDetails?.totalWords || 0}
                        </p>
                      </div>
                      <FileAudio className="w-12 h-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Disfluency Distribution */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5" />
                      Disfluency Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {disfluencyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={disfluencyData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No disfluency data available</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Event Timeline */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Event Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {eventTimeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={eventTimeline}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="severity" stroke="#ef4444" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No timeline data available</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Stuttering Events</CardTitle>
                  <CardDescription>
                    Detailed breakdown of detected stuttering events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(displayResults.stutteringEvents || []).length > 0 ? (
                    <div className="space-y-3">
                      {displayResults.stutteringEvents.map((event, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">{event.type}</p>
                            <p className="text-sm text-gray-600">Time: {event.time}</p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              event.severity === "Severe"
                                ? "bg-red-100 text-red-800"
                                : event.severity === "Moderate"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {event.severity}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No stuttering events detected</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Analysis Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Analysis Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="metrics">
                      <AccordionTrigger>Speech Metrics</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Speech Rate</p>
                            <p className="text-lg font-semibold">
                              {displayResults.analysisDetails?.speechRate || 0} words/sec
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Pause Duration</p>
                            <p className="text-lg font-semibold">
                              {displayResults.analysisDetails?.pauseDuration || 0}s
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Stuttered Words</p>
                            <p className="text-lg font-semibold">
                              {displayResults.analysisDetails?.stutteredWords || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Words</p>
                            <p className="text-lg font-semibold">
                              {displayResults.analysisDetails?.totalWords || 0}
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex gap-4 justify-center"
            >
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Results
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/analyze")}
                className="flex items-center gap-2"
              >
                <FileAudio className="w-4 h-4" />
                New Analysis
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
