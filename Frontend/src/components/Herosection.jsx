import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      className="relative bg-cover bg-center bg-no-repeat min-h-screen w-full text-white flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1470&q=80')",
      }}>
      {/* Fullscreen Black Overlay */}
      <div className="absolute inset-0 bg-black/60 bg-opacity-60 z-10" />

      {/* Content Layer */}
      <div className="relative z-20 w-full h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Smart Employee Attendance
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 text-gray-100">
            Track employee presence with real-time GPS, punctuality scores, and seamless check-in.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-blue-600 px-6 py-3 rounded text-white font-semibold hover:bg-blue-700 transition">
            <a href="/login">Get Started</a>            
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
