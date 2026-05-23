import { Hero } from "@/components/Hero";
import { TrustStrip } from "@/components/TrustStrip";
import { AIFeatures } from "@/components/AIFeatures";
import { CoursesSnapshot } from "@/components/CoursesSnapshot";
import { CareerIntel } from "@/components/CareerIntel";
import { Outcomes } from "@/components/Outcomes";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <AIFeatures />
      <CoursesSnapshot />
      <CareerIntel />
      <Outcomes />
    </>
  );
}
