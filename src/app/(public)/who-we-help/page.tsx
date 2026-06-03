import Link from "next/link";
import { 
  User, 
  Briefcase, 
  Home, 
  Building2, 
  Hammer, 
  Heart, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Clock
} from "lucide-react";
import { BookingButton } from "@/components/BookingButton";

export default function WhoWeHelpPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-brand-purple py-16 md:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Who We Help</h1>
          <p className="text-xl text-brand-lavender max-w-3xl mx-auto leading-relaxed">
            We specialize in providing high-level tax and advisory services for those 
            who need more than just a "tax preparer." We are your strategic financial partners.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-brand-black mb-8">Personalized Service for Every Stage of Growth</h2>
          <p className="text-lg text-brand-charcoal/80 leading-relaxed mb-10">
            Our firm is designed to support a diverse range of clients, from individuals 
            navigating personal milestones to growing businesses scaling their operations. 
            We combine technical expertise with a human-centered approach to ensure you 
            always feel confident in your numbers.
          </p>
        </div>
      </section>

      {/* Audience Sections - 7 Cards */}
      <section className="py-24 bg-brand-soft-gray border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AudienceCard 
              icon={<User size={32} />}
              title="Individuals & Families"
              description="Whether you're buying your first home, planning for retirement, or managing a growing family, we ensure your personal taxes are accurate and optimized."
            />
            <AudienceCard 
              icon={<Briefcase size={32} />}
              title="Small Business Owners"
              description="You focus on your passion; we'll focus on the books. We provide comprehensive tax and bookkeeping support tailored to your specific industry."
            />
            <AudienceCard 
              icon={<Home size={32} />}
              title="Real Estate Agents"
              description="Commission-based income and unique deductions require specialized knowledge. We help agents maximize their take-home pay through smart planning."
            />
            <AudienceCard 
              icon={<Building2 size={32} />}
              title="Real Estate Investors"
              description="From single-family rentals to complex portfolios, we understand the nuances of depreciation, 1031 exchanges, and portfolio tax strategy."
            />
            <AudienceCard 
              icon={<Hammer size={32} />}
              title="Independent Contractors"
              description="The 'Gig Economy' shouldn't mean a tax headache. We help freelancers and contractors stay compliant and keep more of what they earn."
            />
            <AudienceCard 
              icon={<Heart size={32} />}
              title="Nonprofits"
              description="We support the missions of our local organizations with reliable 990 filings and transparent financial oversight to ensure community trust."
            />
            <div className="lg:col-span-3 flex justify-center mt-8">
              <div className="max-w-md w-full">
                <AudienceCard 
                  icon={<TrendingUp size={32} />}
                  title="Growing Businesses"
                  description="Scaling requires more than just bookkeeping. Our Fractional Controller services provide the high-level financial strategy your growing team needs."
                  highlight
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Clients Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-brand-black">Why Clients Choose Us</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ValueProp 
              icon={<ShieldCheck className="text-brand-purple" size={40} />}
              title="Expertise You Can Trust"
              description="With over 15 years of experience and a unique background in business ownership, Jenn Simpson brings a level of insight you won't find at a big-box firm."
            />
            <ValueProp 
              icon={<Award className="text-brand-purple" size={40} />}
              title="Military & Community Support"
              description="We are proud supporters of our veterans and active-duty military through *Salute The Brave*. We treat our clients like neighbors, not numbers."
            />
            <ValueProp 
              icon={<Clock className="text-brand-purple" size={40} />}
              title="Digital-First Convenience"
              description="Our secure portal and digital workflow mean you can work with us from anywhere in the country without sacrificing personalized attention."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-purple text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-8">
            Are We the Right Fit for You?
          </h2>
          <p className="text-xl text-brand-lavender mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            We'd love to learn more about your situation and discuss how we can help you achieve financial clarity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <BookingButton className="bg-white text-brand-purple px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-lavender transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider" />
            <Link
              href="/contact"
              className="bg-brand-black text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-black transition-all shadow-xl hover:scale-105 active:scale-95 uppercase tracking-wider flex items-center justify-center gap-2"
            >
              Contact Us <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function AudienceCard({ 
  icon, 
  title, 
  description, 
  highlight = false 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className={`p-10 rounded-[2.5rem] border transition-all duration-300 group hover:shadow-2xl ${
      highlight 
        ? 'bg-brand-black text-white border-brand-purple/20' 
        : 'bg-white text-brand-black border-gray-100 hover:border-brand-purple/20'
    }`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform ${
        highlight ? 'bg-brand-purple text-white' : 'bg-brand-purple/10 text-brand-purple'
      }`}>
        {icon}
      </div>
      <h3 className="text-2xl font-heading font-bold mb-4">{title}</h3>
      <p className={`leading-relaxed font-medium ${highlight ? 'text-brand-lavender/80' : 'text-brand-charcoal/70'}`}>
        {description}
      </p>
    </div>
  );
}

function ValueProp({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-black mb-4">{title}</h3>
      <p className="text-brand-charcoal/70 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
