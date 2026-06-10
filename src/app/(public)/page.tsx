import Link from "next/link";
import Image from "next/image";
import { BookingButton } from "@/components/BookingButton";
import { 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Calculator, 
  User, 
  Briefcase, 
  BarChart3,
  Users,
  Award,
  Lock
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-brand-purple pt-8 pb-16 md:pt-12 md:pb-32 overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-700">
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight mb-6">
                Clean Books. Clear Numbers. <span className="text-brand-lavender italic border-b-4 border-brand-lavender/30">Confident Decisions.</span>
              </h1>
              <p className="text-xl text-brand-lavender mb-6 leading-relaxed max-w-xl">
                Professional tax preparation, bookkeeping, payroll, and fractional controller services designed to help individuals and businesses stay compliant, organized, and financially confident.
              </p>
              <p className="text-lg text-brand-lavender/80 mb-10 leading-relaxed max-w-xl">
                Whether you're filing your annual tax return, running a small business, managing rental properties, or looking for stronger financial reporting, Your Tax Source is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/signup"
                  className="bg-brand-black text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
                >
                  Get Started
                </Link>
                <Link
                  href="/services"
                  className="bg-white text-brand-purple px-8 py-4 rounded-xl font-bold text-lg hover:bg-brand-lavender transition-all flex items-center justify-center shadow-md hover:scale-[1.02] active:scale-95"
                >
                  View Services
                </Link>
              </div>
            </div>
            
            <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] animate-in fade-in slide-in-from-right duration-700">
              <div className="absolute inset-0 bg-brand-lavender rounded-[3rem] rotate-3 scale-95 opacity-20 blur-2xl"></div>
              <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/10">
                    <Image
                      src="/images/jenn-hero-desk.png"
                      alt="Jenn Simpson, Your Tax Source"
                      fill
                      className="object-cover object-top"
                      priority
                    />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-brand-soft-gray py-16 md:py-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
               <div className="w-14 h-14 bg-brand-purple/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="text-brand-purple" size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-brand-black text-lg">IRS Authorized</h3>
                  <p className="text-sm text-brand-charcoal/60 font-medium">Professional e-File provider for more than a decade.</p>
                  </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-brand-purple/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lock className="text-brand-purple" size={28} />
                  </div>
                  <div>
                  <h3 className="font-bold text-brand-black text-lg">Bank-Grade Security</h3>
                  <p className="text-sm text-brand-charcoal/60 font-medium">Your data is encrypted and protected.</p>
                  </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-brand-purple/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="text-brand-purple" size={28} />
                  </div>
                  <div>
                  <h3 className="font-bold text-brand-black text-lg">Established Expertise</h3>
                  <p className="text-sm text-brand-charcoal/60 font-medium">More than a decade of trusted tax advisory.</p>
                  </div>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
               <div className="absolute -left-20 -top-20 w-64 h-64 bg-brand-purple/5 rounded-full blur-3xl"></div>
               <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-black mb-8 relative z-10 leading-tight">
                 Welcome to <br/><span className="text-brand-purple">Your Tax Source.</span>
               </h2>
               <div className="space-y-6 text-lg text-brand-charcoal/70 leading-relaxed relative z-10">
                 <p>
                   We believe that getting your taxes done shouldn't feel like a chore. 
                   Our mission is to provide clear, professional, and genuinely helpful 
                   financial services that empower you to make confident decisions.
                 </p>
                 <p>
                   Whether you're a family looking for a smooth filing season or a 
                   growing business needing strategic oversight, we're here to be 
                   your trusted partner every step of the way.
                 </p>
               </div>
               <div className="mt-10">
                <BookingButton />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-6 mt-12">
                  <div className="bg-brand-soft-gray h-64 rounded-3xl overflow-hidden relative shadow-lg group">
                    <Image
                      src="/images/jenn-meeting-clients.png"
                      alt="Jenn meeting with clients"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="bg-brand-purple/10 h-48 rounded-3xl flex items-center justify-center p-8 border border-brand-purple/20">
                     <p className="text-brand-purple font-bold text-center text-lg">Supporting Individuals and Businesses Coast to Coast</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="bg-brand-black h-48 rounded-3xl overflow-hidden relative shadow-xl group">
                    <Image
                      src="/images/jenn-working-laptop.png"
                      alt="Jenn reviewing reports"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="bg-brand-soft-gray h-64 rounded-3xl overflow-hidden relative shadow-lg group">
                    <Image
                      src="/images/jenn-consultation.png"
                      alt="Jenn working in office"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-brand-soft-gray border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-6">Expert Solutions for Your Success</h2>
            <p className="text-lg text-brand-charcoal/70">
              From compliance to strategy, we provide a full suite of services 
              tailored to your unique financial needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard 
              icon={<Calculator className="w-8 h-8 text-brand-purple" />}
              title="Tax Preparation"
              description="Accurate and efficient filings for individuals and businesses, maximizing your savings."
              href="/services#individual"
            />
            <ServiceCard 
              icon={<Briefcase className="w-8 h-8 text-brand-purple" />}
              title="Bookkeeping"
              description="Keep your financial records flawless and ready for tax time, all year round."
              href="/services#business"
            />
            <ServiceCard 
              icon={<Users className="w-8 h-8 text-brand-purple" />}
              title="Payroll Services"
              description="Reliable, compliant payroll solutions that take the administrative burden off your plate."
              href="/services#business"
            />
            <ServiceCard 
              icon={<BarChart3 className="w-8 h-8 text-brand-purple" />}
              title="Fractional Controller"
              description="High-level financial strategy and oversight to help your small business thrive."
              href="/services#advisory"
            />
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="lg:w-1/2">
                  <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-8">Who We Serve</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <ServingItem title="Families & Individuals" description="Personalized tax help for every stage of life." />
                     <ServingItem title="Small Business Owners" description="Comprehensive support for entrepreneurs." />
                     <ServingItem title="Nationwide Clients" description="Digital-first service in all 50 states." />
                     <ServingItem title="Independent Contractors" description="Expert guidance for the self-employed." />
                  </div>
               </div>
               <div className="lg:w-1/2 relative">
                  <div className="absolute inset-0 bg-brand-purple rounded-[3rem] -rotate-3 scale-105"></div>
                  <div className="relative bg-brand-black p-12 rounded-[2.5rem] border border-white/10 text-white overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple rounded-full -mr-16 -mt-16 opacity-20"></div>
                     <h3 className="text-2xl font-bold mb-6">Our Client-First Philosophy</h3>
                     <p className="text-brand-lavender leading-relaxed mb-8">
                        "We treat our clients like neighbors, regardless of where they are on the map. 
                        Our goal is to build long-term relationships based on trust, clarity, and 
                        results."
                     </p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold text-brand-lavender">JS</div>
                        <div>
                           <p className="font-bold">Jenn Simpson</p>
                           <p className="text-xs text-brand-lavender font-bold uppercase tracking-widest">Founder & Lead Advisor</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-brand-purple text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">Why Choose Us?</h2>
            <p className="text-xl text-brand-lavender leading-relaxed">
              We combine the expertise of a large firm with the personalized 
              attention of a neighborhood tax pro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <WhyItem 
              icon={<ShieldCheck className="w-12 h-12 text-brand-lavender" />}
              title="Modern & Secure"
              description="Our encrypted portal makes document sharing effortless and safe from anywhere."
            />
            <WhyItem 
              icon={<CheckCircle2 className="w-12 h-12 text-brand-lavender" />}
              title="Plain-English Clarity"
              description="No tax-speak here. We explain your situation clearly so you're always in the loop."
            />
            <WhyItem 
              icon={<TrendingUp className="w-12 h-12 text-brand-lavender" />}
              title="Proactive Strategy"
              description="We don't just look back at the last year; we help you plan for the next one."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-purple p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden hover:shadow-purple-500/20 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-8">
                Ready to Experience <br/>Stress-Free Tax Filing?
              </h2>
              <p className="text-xl text-brand-lavender mb-12 max-w-2xl mx-auto font-medium">
                Join the hundreds of families and small businesses nationwide who 
                trust Your Tax Source for their financial peace of mind.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link
                  href="/auth/signup"
                  className="bg-brand-black text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider"
                >
                  Start My Intake
                </Link>
                <Link
                  href="/contact"
                  className="bg-white text-brand-purple px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-lavender transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider"
                >
                  Talk to a Human
                </Link>
              </div>
              <p className="mt-10 text-brand-lavender/70 font-bold italic">No hidden fees. Secure & IRS Authorized.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string, href: string }) {
  return (
    <Link href={href} className="flex flex-col gap-4 p-8 rounded-3xl bg-white border border-gray-100 hover:border-brand-purple/30 hover:shadow-xl transition-all group hover:-translate-y-1">
      <div className="mb-2 bg-brand-soft-gray w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-brand-purple/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-brand-black group-hover:text-brand-purple transition-colors">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed text-sm font-medium">{description}</p>
      <div className="mt-auto pt-4 flex items-center gap-2 text-brand-purple font-bold text-xs uppercase tracking-widest">
         Learn More <Clock size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}

function ServingItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-2">
       <div className="mt-1.5 flex-shrink-0">
          <CheckCircle2 className="text-brand-purple w-5 h-5" />
       </div>
       <div>
          <h4 className="font-bold text-brand-black">{title}</h4>
          <p className="text-sm text-brand-charcoal/60 font-medium">{description}</p>
       </div>
    </div>
  );
}

function WhyItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 p-6">
       <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-white/10 transition-colors">
          {icon}
       </div>
       <div>
          <h3 className="text-2xl font-bold mb-4">{title}</h3>
          <p className="text-brand-lavender/70 leading-relaxed font-medium">{description}</p>
       </div>
    </div>
  );
}
