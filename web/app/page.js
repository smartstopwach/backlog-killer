'use client';
import LenisProvider from '../components/LenisProvider';
import Chrome from '../components/Chrome';
import Preloader from '../components/Preloader';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import Story from '../components/Story';
import Duo from '../components/Duo';
import Horizontal from '../components/Horizontal';
import Gallery from '../components/Gallery';
import Stats from '../components/Stats';
import Faq from '../components/Faq';
import Cta from '../components/Cta';
import Footer from '../components/Footer';

export default function Page() {
  return (
    <LenisProvider>
      <Chrome />
      <Preloader />
      <main id="main">
        <Hero />
        <Marquee />
        <Story />
        <Duo />
        <Horizontal />
        <Gallery />
        <Stats />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </LenisProvider>
  );
}
