import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Award, BookOpen, Heart, ShieldCheck, Users, Briefcase } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-brand-purple py-16 md:py-32 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom duration-700">
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-8 leading-tight">
              A Decade of Putting <span className="text-brand-lavender italic">Neighbors</span> First.
            </h1>
            <p className="text-xl text-brand-lavender leading-relaxed">
              Your trusted partner for nationwide tax preparation and advisory, 
              proudly rooted in Belmont, NC and supporting our clients for more than a decade. We're on a mission to make 
              taxes simple, transparent, and accessible for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Meet Jenn Section */}
      <section className="py-24 bg-white border-y border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               <div className="lg:w-2/5 relative">
                  <div className="absolute inset-0 bg-brand-purple rounded-[3rem] rotate-3 scale-95 opacity-10 blur-xl"></div>
                  <div className="relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                        <Image
                          src="/images/jenn-professional-office.png"
                          alt="Jenn Simpson"
                          fill
                          className="object-cover object-top"
                        />
                  </div>
               </div>
               <div className="lg:w-3/5">
                  <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-black mb-2">Meet Jenn Simpson</h2>
                  <p className="text-brand-purple font-bold uppercase tracking-widest text-sm mb-8">Founder & Lead Advisor</p>
                  
                  <div className="space-y-6 text-brand-charcoal/80 text-lg leading-relaxed font-medium">
                     <p>
                        Jenn Simpson is the founder of Your Tax Source and brings more than 15 years of experience in tax preparation, accounting, bookkeeping, financial reporting, and business consulting.
                     </p>
                     <p>
                        As a Controller, CFO, business owner, and tax professional, Jenn understands taxes from both the individual and business perspective. Her experience spans individual tax returns, self-employed taxpayers, small businesses, rental property owners, bookkeeping, payroll, and financial management.
                     </p>
                     <p>
                        What started as helping friends and family navigate tax season has grown into a trusted tax and accounting practice serving clients locally in Belmont, North Carolina and remotely across the United States.
                     </p>
                     <p>
                        Jenn believes taxes shouldn't be intimidating. Her approach focuses on education, communication, and helping clients understand not only what is happening on their tax return, but why.
                     </p>
                     <p>
                        In addition to operating Your Tax Source, Jenn serves as a financial executive and business consultant, bringing real-world accounting and leadership experience to every client relationship.
                     </p>
                     <p>
                        When she's not helping clients, Jenn enjoys spending time with her husband Chad, their children, traveling, supporting small businesses, and serving her local community.
                     </p>
                  </div>

                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="flex items-center gap-3 bg-brand-soft-gray p-4 rounded-xl shadow-sm border border-gray-100">
                        <Award className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">15+ Years Expertise</span>
                     </div>
                     <div className="flex items-center gap-3 bg-brand-soft-gray p-4 rounded-xl shadow-sm border border-gray-100">
                        <BookOpen className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">IRS Registered Provider</span>
                     </div>
                     <div className="flex items-center gap-3 bg-brand-soft-gray p-4 rounded-xl shadow-sm border border-gray-100">
                        <Heart className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">Belmont Community Leader</span>
                     </div>
                     <div className="flex items-center gap-3 bg-brand-soft-gray p-4 rounded-xl shadow-sm border border-gray-100">
                        <CheckCircle2 className="text-brand-purple" size={20} />
                        <span className="text-sm font-bold text-brand-black">Client-First Advocate</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-brand-soft-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-16">The Your Tax Source Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <StoryCard
              icon={<Users className="text-brand-purple" size={32} />}
              title="Neighbors First"
              description="While we serve clients nationwide, we maintain the warmth and personal connection of a neighborhood firm."
            />
            <StoryCard
              icon={<ShieldCheck className="text-brand-purple" size={32} />}
              title="Secure & Modern"
              description="We use bank-grade encryption to ensure your sensitive financial data is protected at all times."
            />
            <StoryCard
              icon={<Briefcase className="text-brand-purple" size={32} />}
              title="Real-World Expertise"
              description="We bring accounting and leadership experience from the boardroom to your kitchen table."
            />
          </div>
        </div>
      </section>

      {/* Local Connection */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2">
                 <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-6">Rooted in Belmont, NC</h2>
                 <p className="text-lg text-brand-charcoal/70 leading-relaxed mb-8">
                    Our heart is in the Belmont community. We love serving our local neighbors face-to-face while leveraging modern technology to provide the same high level of service to our remote clients across the United States.
                 </p>
                 <Link
                   href="/contact"
                   className="inline-block bg-brand-purple text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5a3a74] transition-all shadow-md"
                 >
                   Schedule a Consultation
                 </Link>
              </div>
              <div className="lg:w-1/2 relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-xl border-8 border-brand-soft-gray bg-brand-soft-gray">
                 <Image
                   src="/images/jenn-office-desk.png"
                   alt="Jenn at her desk in our office"
                   fill
                   className="object-contain"
                 />
              </div>
           </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-brand-black text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-purple/5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">
            Ready to work with a tax pro who actually listens?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block bg-brand-purple text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-lg"
            >
              Get in Touch Today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StoryCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-brand-black mb-4">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
