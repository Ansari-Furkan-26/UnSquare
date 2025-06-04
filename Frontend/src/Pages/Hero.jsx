
import Navbar from '../components/Navbar';
import HeroSection from '../components/Herosection';
import Footer from '../components/Footer';

function Hero() {
  return (
    <div className="min-h-full w-full flex flex-col">
      <Navbar />
      <HeroSection />
      <Footer />
    </div>
  );
}

export default Hero;
