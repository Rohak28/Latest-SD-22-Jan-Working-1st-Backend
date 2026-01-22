"use client"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import {
  Mic,
  BarChart2,
  FileAudio,
  ArrowRight,
  Zap,
  Award,
  Building,
  BookOpen,
  Lightbulb,
  Users,
} from "lucide-react"
import { motion } from "framer-motion"

const FeatureCard = ({ icon: Icon, title, description, delay, image }) => (
  <motion.div
    //className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100"
    className="flex flex-col items-center space-y-4 p-6 bg-card text-card-foreground rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-border"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.05 }}
  >
    {image && <img src={image} alt={title} className="h-16 w-auto object-contain" />}
    <Icon className="h-12 w-12 text-primary" />
    <h3 className="text-xl font-semibold text-center">{title}</h3>
    <p className="text-muted-foreground text-center text-sm">{description}</p>
  </motion.div>
)

const GalleryCard = ({title, description, delay, image }) => (
  <motion.div
    //className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-gray-100"
    className="flex flex-col items-center space-y-4 p-6 bg-card text-card-foreground rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl border border-border"
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.005 }}
  >
    {image && <img src={image} alt={title} className="h-20 w-auto object-contain" />}
    <h1 className="text-xl font-semibold text-center">{title}</h1>
    <p className="text-muted-foreground text-left">{description}</p>
  </motion.div>
)

function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-12 text-center py-16">
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl px-4">
        <motion.div
          className="space-y-6 flex-1 text-left"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Revolutionize Speech Analysis with AI-Powered Stutter Detection
          </motion.h1>
          <motion.p
            className="mt-3 text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Harness the power of artificial intelligence to analyze speech patterns, detect stuttering, and provide
            valuable insights for speech therapy and personal improvement.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105"
            >
              <Link to="/analyze" className="flex items-center">
                Start Your Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="transition-all duration-300 transform hover:scale-105">
              <Link to="/documentation" className="flex items-center">
                Explore Our Technology
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src="/Images/therapy-1.jpg" 
              alt="Speech Therapy Session" 
              className="w-full h-auto object-cover"
            />
          </div>
          <motion.div 
            className="absolute -bottom-6 -right-6 z-20 bg-white p-4 rounded-xl shadow-xl hidden md:block"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Accuracy Rate</p>
                <p className="text-lg font-bold text-gray-800">98.5%</p>
              </div>
            </div>
          </motion.div>
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-100 rounded-full -z-10 blur-2xl opacity-60"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-100 rounded-full -z-10 blur-3xl opacity-60"></div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl px-4">
        <FeatureCard
          icon={Mic}
          title="Advanced Audio Processing"
          description="State-of-the-art analysis of speech patterns from uploaded or recorded audio samples."
          delay={0.6}
        />
        <FeatureCard
          icon={BarChart2}
          title="Comprehensive Visual Results"
          description="Clear, intuitive visualizations of detected stuttering patterns and frequency data."
          delay={0.8}
        />
        <FeatureCard
          icon={FileAudio}
          title="Precise Transcription"
          description="Accurate speech-to-text conversion with highlighted stuttering indicators for in-depth analysis."
          delay={1}
        />
      </div>
      <motion.div
        className="w-full max-w-7xl px-4 py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 text-white overflow-hidden relative">
          <div className="flex-1 space-y-4 z-10">
            <h2 className="text-3xl md:text-4xl font-bold">Empowering Therapists & Patients</h2>
            <p className="text-blue-100 text-lg">
              Our platform bridges the gap between clinical expertise and data-driven analysis, 
              providing a seamless experience for both SLPs and their patients.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-4">
              <Link to="/signup">Join Our Community</Link>
            </Button>
          </div>
          <div className="flex-1 z-10">
            <img 
              src="/Images/slp-pro.jpg" 
              alt="Professional SLP" 
              className="rounded-xl shadow-lg w-full h-64 object-cover"
            />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-32 -mt-32 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full -ml-24 -mb-24 opacity-20"></div>
        </div>
      </motion.div>

    <p></p>
    <p></p>

    <div>
    <motion.div
        className="space-y-6 max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl gradient-text"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Our Collaborations
        </motion.h2>
      </motion.div>
    </div>

    {/* Collaboration Section */}
      <motion.div
        //className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl px-4 bg-gray-50 rounded-lg p-8 shadow-md"
        className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl px-4 bg-card rounded-lg p-8 shadow-md border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <GalleryCard
          title="Project Vision & Collaboration"
          description="Dassault Systèmes, a global leader in AI-driven simulations and digital healthcare innovations, in collaboration with Vishwakarma Institute of Information Technology (VIIT), is driving forward cutting-edge advancements in speech technology. This project, funded by Dassault Systèmes, aims to revolutionize stutter detection through AI-powered fluency assessment and intervention. By combining technological expertise with academic research, the collaboration ensures a robust, clinically validated, and user-centric approach. With VIIT’s strong foundation in research and AI development, this initiative is set to bridge the gap between computational intelligence and speech-language pathology, creating a transformative solution for speech disorder diagnosis and therapy."
          delay={0.6}
          image="/Images/viit-dass.png"
        />
        <GalleryCard
          title="Consulted Expert - Dr. Namita Joshi"
          description="Dr. Namita Joshi, a distinguished Speech-Language Pathologist with over 23 years of experience, has been instrumental in shaping clinical practices and academic advancements in the field. As the Founder & Director of Sampark ePolyclinic, she specializes in comprehensive speech and language assessments, personalized therapy, and interdisciplinary collaboration. Her expertise extends to mentoring students, publishing research, and contributing to national and international conferences. In our project, Dr. Joshi’s insights have significantly enriched our approach to stutter detection, ensuring a research-backed, user-centric solution for speech fluency assessment and intervention."
          delay={0.8}
          image="/Images/dr-namita-joshi.jpg"
        />
      </motion.div>
      
    </div>
  )
}

export default Home;
