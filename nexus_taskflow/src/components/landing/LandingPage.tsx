import Header from './Header';
import Hero from './Hero';
import BentoGrid from './BentoGrid';
import Features from './Features';
import About from './About';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import CTA from './CTA';
import Contact from './Contact';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="dark min-h-screen bg-black text-white antialiased selection:bg-blue-500 selection:text-white">
      <Header />
      <main className="relative">
        <Hero />
        <BentoGrid />
        <div className="relative bg-black">
          <Features />
          <About />
          <Testimonials />
          <Pricing />
          <CTA />
          <Contact />
        </div>
      </main>
      <Footer />
    </div>
  );
}
