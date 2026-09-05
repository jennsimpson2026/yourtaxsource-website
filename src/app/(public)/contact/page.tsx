import Image from "next/image";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-brand-black py-6 md:py-10 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Let's Talk <span className="text-brand-purple italic">Taxes</span>.</h1>
          <p className="text-xl text-brand-lavender max-w-2xl mx-auto leading-relaxed">
            Have a question or ready to get started? Reach out to our team in Belmont, NC. 
            We're here to make your financial life simpler.
          </p>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Contact Information */}
            <div className="space-y-12">
              <div>
                <h2 className="text-3xl font-heading font-bold text-brand-black mb-6 border-l-4 border-brand-purple pl-6">Get In Touch</h2>
                <p className="text-lg text-brand-charcoal/70 mb-10 leading-relaxed max-w-lg">
                  Whether you're a new client looking for help or an existing client with a quick question, 
                  we're here to provide the support you need.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                <ContactInfoItem
                  icon={<Phone className="w-6 h-6 text-brand-purple" />}
                  title="Call or Text"
                  value="(803) 371-5766"
                  description="Primary business number."
                />
                <ContactInfoItem
                  icon={<Mail className="w-6 h-6 text-brand-purple" />}
                  title="Email Us"
                  value="jsimpson@yourtaxsource.com"
                  description="We respond within 24 hours."
                />
                <ContactInfoItem
                  icon={<MapPin className="w-6 h-6 text-brand-purple" />}
                  title="Visit Our Office"
                  value="100 1/2 S Main St, Belmont, NC 28012"
                  description="Right in the heart of downtown."
                />
              </div>

              <div className="relative h-[300px] rounded-3xl overflow-hidden shadow-xl border-4 border-brand-cloud">
                <Image
                  src="/images/jenn-meeting-authentic.png"
                  alt="Jenn Simpson"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-brand-purple" />
                    Always here to help.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form Container */}
            <div className="bg-brand-cloud p-1 md:p-2 rounded-[2.5rem] shadow-2xl">
              <div className="bg-white p-8 md:p-12 rounded-[2rem] h-full shadow-inner">
                <div className="flex items-center gap-4 mb-10 bg-brand-cloud/50 p-4 rounded-2xl border border-gray-100">
                  <div className="bg-brand-purple p-3 rounded-xl shadow-lg shadow-purple-500/20">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-brand-black">Send a Message</h3>
                    <p className="text-sm text-brand-charcoal/60">Fill out the form below and we'll be in touch.</p>
                  </div>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Hours & Map Section */}
      <section className="py-24 bg-brand-black text-white overflow-hidden relative">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-purple opacity-5 rounded-full -mr-48 -mb-48"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-8">Office Hours</h2>
              <div className="space-y-4 max-w-md">
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <span className="text-brand-lavender font-medium text-lg">Monday - Friday</span>
                  <span className="font-bold text-lg">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-white/10">
                  <div className="flex flex-col">
                    <span className="text-brand-lavender font-medium text-lg">Saturday</span>
                    <span className="text-brand-purple text-sm font-bold uppercase tracking-wider">Tax Season Only</span>
                  </div>
                  <span className="font-bold text-lg">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-brand-lavender font-medium text-lg">Sunday</span>
                  <span className="text-white/40 font-bold text-lg uppercase tracking-widest">Closed</span>
                </div>
              </div>
            </div>
            <div className="h-[400px] bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center justify-center text-blue-200/50 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/images/belmont-office.png')] bg-cover bg-center opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700"></div>
              <div className="relative z-10 text-center p-8">
                 <MapPin className="w-12 h-12 text-brand-purple mx-auto mb-4" />
                 <p className="text-xl font-bold text-white mb-2">Belmont, North Carolina</p>
                 <p className="text-brand-lavender/70 italic">100 1/2 S Main St, Belmont, NC 28012</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactInfoItem({ 
  icon, 
  title, 
  value, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string;
  description: string;
}) {
  return (
    <div className="flex gap-6 group">
      <div className="bg-brand-cloud w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-sm group-hover:bg-brand-purple/10 group-hover:border-brand-purple/20 transition-all">
        {icon}
      </div>
      <div>
        <h4 className="font-heading font-bold text-brand-black text-xl mb-1">{title}</h4>
        <p className="text-brand-charcoal text-lg font-bold group-hover:text-brand-purple transition-colors">{value}</p>
        <p className="text-brand-charcoal/60 text-sm mt-1">{description}</p>
      </div>
    </div>
  );
}
