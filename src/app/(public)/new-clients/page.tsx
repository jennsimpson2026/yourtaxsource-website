import Link from "next/link";
import { 
  ClipboardList, 
  Users, 
  ShieldCheck, 
  FileText, 
  LayoutDashboard, 
  CheckCircle, 
  Briefcase, 
  MessageCircle,
  Clock,
  ArrowRight,
  HelpCircle,
  Laptop
} from "lucide-react";

export default function NewClientsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-brand-purple py-16 md:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">New Clients</h1>
          <h2 className="text-2xl md:text-3xl font-heading font-medium text-brand-lavender mb-8">
            Getting Started Is Easy
          </h2>
          <p className="text-xl text-brand-lavender max-w-2xl mx-auto leading-relaxed">
            Welcome to Your Tax Source. We've streamlined our onboarding process to 
            make your transition as smooth and stress-free as possible.
          </p>
        </div>
      </section>

      {/* Welcome & Intro */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-brand-black mb-8">Ready for a Better Tax Experience?</h2>
          <p className="text-lg text-brand-charcoal/80 leading-relaxed mb-10">
            Whether you are filing as an individual, a family, or a business owner, 
            we are here to provide the expert guidance and personalized service you deserve. 
            Our goal is to make "tax time" just another smooth part of your year.
          </p>
          <div className="inline-flex items-center gap-2 bg-brand-purple/10 px-6 py-3 rounded-full border border-brand-purple/20">
            <Users className="text-brand-purple" size={20} />
            <span className="text-brand-purple font-bold uppercase tracking-widest text-sm">Join Our Growing Community</span>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Step Process */}
      <section className="py-24 bg-brand-soft-gray border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-black mb-6">Our 4-Step Process</h2>
            <p className="text-lg text-brand-charcoal/70 max-w-2xl mx-auto">
              Simple, transparent, and digital-first. Here is how we work together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
            {/* Connection Lines (Desktop) */}
            <div className="hidden lg:block absolute top-1/4 left-0 right-0 h-0.5 bg-brand-purple/20 -z-0"></div>
            
            <StepCard 
              number="1"
              icon={<MessageCircle className="text-white" size={32} />}
              title="Consultation"
              description="We'll start with a brief meeting to discuss your unique needs and ensure we're the perfect fit for you."
            />
            <StepCard 
              number="2"
              icon={<ClipboardList className="text-white" size={32} />}
              title="Gather Info"
              description="Complete our simple intake questionnaire to help us build your current tax and financial profile."
            />
            <StepCard 
              number="3"
              icon={<ShieldCheck className="text-white" size={32} />}
              title="Submit Docs"
              description="Upload your tax documents securely to our encrypted portal from anywhere in the country."
            />
            <StepCard 
              number="4"
              icon={<CheckCircle className="text-white" size={32} />}
              title="Review & File"
              description="We'll review everything together, answer your questions, and electronically file your returns."
            />
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-8 leading-tight">
                What to Expect When <br/>You Work With Us
              </h2>
              <div className="space-y-8">
                <ExpectationItem 
                  icon={<Laptop className="text-brand-purple" />}
                  title="A Digital-First Approach"
                  description="No more driving to an office or mailing sensitive papers. Everything can be handled through our secure, mobile-friendly portal."
                />
                <ExpectationItem 
                  icon={<FileText className="text-brand-purple" />}
                  title="Plain-English Explanations"
                  description="We hate jargon as much as you do. We'll explain your tax situation and options in a way that actually makes sense."
                />
                <ExpectationItem 
                  icon={<Clock className="text-brand-purple" />}
                  title="Clear Timelines"
                  description="We'll keep you updated on the status of your return every step of the way. No more wondering where things stand."
                />
              </div>
            </div>
            <div className="bg-brand-black p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple opacity-10 rounded-full -mr-32 -mt-32"></div>
               <div className="relative z-10 text-white">
                  <LayoutDashboard className="w-16 h-16 text-brand-purple mb-8" />
                  <h3 className="text-3xl font-heading font-bold mb-6">The Client Portal</h3>
                  <p className="text-brand-lavender text-lg leading-relaxed mb-8">
                    Your personal command center for everything tax-related. 
                    Upload documents, sign forms, check status, and message Jenn 
                    all in one secure place.
                  </p>
                  <Link 
                    href="/auth/signup"
                    className="inline-flex items-center gap-2 bg-brand-purple text-white px-8 py-4 rounded-xl font-bold hover:bg-[#5a3a74] transition-all"
                  >
                    Create Your Account <ArrowRight size={20} />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checklist Section */}
      <section className="py-24 bg-brand-soft-gray">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-4">New Tax Client Checklist</h2>
            <p className="text-lg text-brand-charcoal/70">
              Gather these common items to make your first intake a breeze.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ChecklistCategory 
              title="Identity & Family"
              items={[
                "Driver's License or Government ID",
                "Social Security Numbers for all household members",
                "Dates of birth for all dependents",
                "Prior year tax return (if not filed with us)"
              ]}
            />
            <ChecklistCategory 
              title="Income Sources"
              items={[
                "W-2 forms from all employers",
                "1099-NEC/MISC for self-employed income",
                "1099-INT/DIV for interest and dividends",
                "1099-B for stock sales or investments",
                "K-1 forms from partnerships or S-Corps"
              ]}
            />
            <ChecklistCategory 
              title="Deductions & Credits"
              items={[
                "1098 Mortgage Interest statement",
                "Property tax records",
                "Charitable contribution receipts",
                "Medical & dental expense totals",
                "Childcare provider info and SSN/EIN"
              ]}
            />
            <ChecklistCategory 
              title="Banking & Health"
              items={[
                "Bank routing and account number (for direct deposit)",
                "1095-A (if you have Marketplace insurance)",
                "HSA or MSA contribution/distribution records",
                "Student loan interest (1098-E)"
              ]}
            />
          </div>
        </div>
      </section>

      {/* For Business Clients */}
      <section className="py-24 bg-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-brand-purple/5 p-12 md:p-20 rounded-[4rem] border border-brand-purple/10 flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
               <div className="w-16 h-16 bg-brand-purple rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                  <Briefcase className="text-white" size={32} />
               </div>
               <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-black mb-8 leading-tight">
                 For Our <br/><span className="text-brand-purple italic">Business Clients</span>
               </h2>
               <p className="text-lg text-brand-charcoal/80 leading-relaxed mb-8">
                 Managing a business is hard enough. We help you stay compliant and organized 
                 with tax planning, bookkeeping, and payroll services tailored to your industry.
               </p>
               <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-3 font-bold text-brand-black">
                     <CheckCircle className="text-brand-purple" size={20} />
                     Specialized in Small Business & Rental Properties
                  </li>
                  <li className="flex items-center gap-3 font-bold text-brand-black">
                     <CheckCircle className="text-brand-purple" size={20} />
                     QuickBooks Online (QBO) Setup & Support
                  </li>
                  <li className="flex items-center gap-3 font-bold text-brand-black">
                     <CheckCircle className="text-brand-purple" size={20} />
                     Fractional Controller & Financial Oversight
                  </li>
               </ul>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                  <div className="text-2xl font-black text-brand-purple mb-2">1065</div>
                  <p className="text-xs font-bold text-brand-charcoal/50 uppercase tracking-widest">Partnerships</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center mt-8">
                  <div className="text-2xl font-black text-brand-purple mb-2">1120-S</div>
                  <p className="text-xs font-bold text-brand-charcoal/50 uppercase tracking-widest">S-Corporations</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center -mt-4">
                  <div className="text-2xl font-black text-brand-purple mb-2">Sch C</div>
                  <p className="text-xs font-bold text-brand-charcoal/50 uppercase tracking-widest">Sole Proprietors</p>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center mt-4">
                  <div className="text-2xl font-black text-brand-purple mb-2">Sch E</div>
                  <p className="text-xs font-bold text-brand-charcoal/50 uppercase tracking-widest">Rental Properties</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ & Why Choose Us Teaser */}
      <section className="py-24 bg-brand-soft-gray border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-black mb-16">Still Have Questions?</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <Link href="/faq" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <HelpCircle className="w-10 h-10 text-brand-purple mx-auto mb-4 group-hover:scale-110 transition-transform" />
                 <h3 className="font-bold text-brand-black text-lg mb-2">Visit Our FAQ</h3>
                 <p className="text-sm text-brand-charcoal/60">Common questions about filing, deadlines, and our process.</p>
              </Link>
              <Link href="/services" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <Briefcase className="w-10 h-10 text-brand-purple mx-auto mb-4 group-hover:scale-110 transition-transform" />
                 <h3 className="font-bold text-brand-black text-lg mb-2">Explore Services</h3>
                 <p className="text-sm text-brand-charcoal/60">A deeper dive into our bookkeeping and advisory offerings.</p>
              </Link>
              <Link href="/contact" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                 <MessageCircle className="w-10 h-10 text-brand-purple mx-auto mb-4 group-hover:scale-110 transition-transform" />
                 <h3 className="font-bold text-brand-black text-lg mb-2">Talk to Us</h3>
                 <p className="text-sm text-brand-charcoal/60">Send us a message if you have a specific situation to discuss.</p>
              </Link>
           </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-purple p-12 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-8">
                Ready to Join Your Tax Source?
              </h2>
              <p className="text-xl text-brand-lavender mb-12 max-w-2xl mx-auto font-medium">
                Start your onboarding today and experience the peace of mind 
                that comes with professional financial partnership.
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
                  Schedule Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center text-center group">
      <div className="w-12 h-12 bg-brand-black text-brand-purple font-black rounded-full flex items-center justify-center mb-8 border-2 border-brand-purple/20 shadow-md">
        {number}
      </div>
      <div className="w-20 h-20 bg-brand-purple rounded-3xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-heading font-bold text-brand-black mb-4">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function ExpectationItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 bg-brand-purple/5 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-bold text-brand-black mb-2">{title}</h4>
        <p className="text-brand-charcoal/70 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function ChecklistCategory({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold text-brand-purple mb-6 pb-4 border-b border-gray-50">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-brand-charcoal/80 font-medium">
            <CheckCircle className="text-brand-purple mt-1 flex-shrink-0" size={16} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
