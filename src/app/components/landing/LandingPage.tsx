import { LandingNav } from './LandingNav';
import { Hero } from './Hero';
import { Ticker } from './Ticker';
import { Features } from './Features';
import { Security } from './Security';
import { Pricing } from './Pricing';
import { Testimonials } from './Testimonials';
import { Company } from './Company';
import { CTA } from './CTA';
import { Footer } from './Footer';

export function LandingPage() {
  return (
    <div style={{ background: '#050B14' }}>
      <LandingNav />
      <Hero />
      <Ticker />
      <Features />
      <Security />
      <Pricing />
      <Testimonials />
      <Company />
      <CTA />
      <Footer />
    </div>
  );
}
