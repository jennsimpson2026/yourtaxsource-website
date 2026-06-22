"use client";

import { useState } from "react";
import { 
  User, 
  Users, 
  Landmark, 
  FileText, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck,
  Plus,
  Trash2,
  Loader2,
  ClipboardCheck
} from "lucide-react";
import { submitAnnualUpdate } from "@/actions/annualUpdate";
import { useRouter } from "next/navigation";

interface Dependent {
  id: string;
  name: string;
  ssn: string;
  relationship: string;
}

export function AnnualUpdateForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Client Info
    firstName: "",
    lastName: "",
    ssnLast4: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    filingStatus: "SINGLE",
    
    // Banking
    bankName: "",
    routingNumber: "",
    accountNumber: "",
    accountType: "CHECKING",
    
    // Questionnaire
    boughtSoldHome: false,
    startedBusiness: false,
    receivedCrypto: false,
    foreignAccounts: false,
    majorLifeChanges: "",
    
    // Signature
    signature: "",
    date: new Date().toISOString().split('T')[0],
  });

  const [dependents, setDependents] = useState<Dependent[]>([]);

  const addDependent = () => {
    const newDep = { id: Math.random().toString(36).substr(2, 9), name: "", ssn: "", relationship: "" };
    setDependents([...dependents, newDep]);
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter(d => d.id !== id));
  };

  const updateDependent = (id: string, field: keyof Dependent, value: string) => {
    setDependents(dependents.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!formData.signature) {
      alert("Please type your name as an electronic signature.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAnnualUpdate({
        ...formData,
        dependents
      });
      if (result.success) {
        alert("Annual update submitted successfully! A summary PDF has been generated for Jenn's review.");
        router.push("/portal");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to submit update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Client Info", icon: <User size={18} /> },
    { id: 2, label: "Dependents", icon: <Users size={18} /> },
    { id: 3, label: "Banking", icon: <Landmark size={18} /> },
    { id: 4, label: "Tax Questions", icon: <FileText size={18} /> },
    { id: 5, label: "Review", icon: <ShieldCheck size={18} /> },
    { id: 6, label: "Signature", icon: <CheckCircle2 size={18} /> },
  ];

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden max-w-4xl mx-auto">
      {/* Form Header / Progress */}
      <div className="bg-brand-black p-8 text-white">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center text-white">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold">Annual Information Update</h2>
            <p className="text-gray-400 text-sm font-medium">Please complete all 6 steps for the 2024 Tax Season.</p>
          </div>
        </div>

        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0"></div>
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${step === s.id ? 'bg-brand-purple border-brand-purple text-white scale-110 shadow-lg shadow-brand-purple/20' : 
                  step > s.id ? 'bg-green-500 border-green-500 text-white' : 
                  'bg-brand-black border-gray-700 text-gray-500'}
              `}>
                {step > s.id ? <CheckCircle2 size={20} /> : s.icon}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest hidden md:block ${step === s.id ? 'text-brand-purple' : 'text-gray-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <div className="p-8 md:p-12 min-h-[400px]">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-bold text-brand-black">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">First Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="Jenn"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Last Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="Simpson"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="jenn@example.com"
                />
                <p className="mt-1 text-[10px] text-gray-500 italic">
                  If you do not have an email address, enter <a href="mailto:none@yts.com" className="text-brand-purple underline">none@yts.com</a>.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="(555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">SSN (Last 4 Only)</label>
                <input 
                  type="text" 
                  maxLength={4}
                  value={formData.ssnLast4}
                  onChange={(e) => setFormData({ ...formData, ssnLast4: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="1234"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Filing Status</label>
                <select 
                  value={formData.filingStatus}
                  onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none appearance-none"
                >
                  <option value="SINGLE">Single</option>
                  <option value="MFJ">Married Filing Jointly</option>
                  <option value="MFS">Married Filing Separately</option>
                  <option value="HOH">Head of Household</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Street Address</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                placeholder="123 Belmont St."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">City</label>
                <input 
                  type="text" 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="Belmont"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">State</label>
                <input 
                  type="text" 
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="NC"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Zip Code</label>
                <input 
                  type="text" 
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple transition-all outline-none"
                  placeholder="28012"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-heading font-bold text-brand-black">Dependents</h3>
              <button 
                onClick={addDependent}
                className="flex items-center gap-2 text-brand-purple font-bold text-sm bg-brand-purple/5 px-4 py-2 rounded-lg hover:bg-brand-purple/10 transition-all"
              >
                <Plus size={16} /> Add Dependent
              </button>
            </div>
            
            {dependents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                <Users size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-medium">No dependents added. Skip if not applicable.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dependents.map((dep) => (
                  <div key={dep.id} className="p-6 bg-gray-50 border border-gray-100 rounded-2xl relative group">
                    <button 
                      onClick={() => removeDependent(dep.id)}
                      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-charcoal/40 uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          value={dep.name}
                          onChange={(e) => updateDependent(dep.id, 'name', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm"
                          placeholder="Dependent Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-charcoal/40 uppercase tracking-widest">SSN</label>
                        <input 
                          type="text" 
                          value={dep.ssn}
                          onChange={(e) => updateDependent(dep.id, 'ssn', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm"
                          placeholder="000-00-0000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-charcoal/40 uppercase tracking-widest">Relationship</label>
                        <input 
                          type="text" 
                          value={dep.relationship}
                          onChange={(e) => updateDependent(dep.id, 'relationship', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-purple/20 outline-none text-sm"
                          placeholder="Son, Daughter, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-bold text-brand-black">Banking Information</h3>
            <p className="text-brand-charcoal/60 text-sm">Required for direct deposit of refunds or electronic payment of balance due.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Bank Name</label>
                <input 
                  type="text" 
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                  placeholder="First National Bank"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Account Type</label>
                <select 
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none appearance-none"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Routing Number</label>
                <input 
                  type="text" 
                  value={formData.routingNumber}
                  onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                  placeholder="9-digit number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Account Number</label>
                <input 
                  type="text" 
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                  placeholder="Enter full account number"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-bold text-brand-black">Tax Questionnaire</h3>
            <div className="space-y-4">
              <QuestionToggle 
                label="Did you buy, sell, or refinance a home during the tax year?"
                checked={formData.boughtSoldHome}
                onChange={(checked) => setFormData({ ...formData, boughtSoldHome: checked })}
              />
              <QuestionToggle 
                label="Did you start, sell, or close a business?"
                checked={formData.startedBusiness}
                onChange={(checked) => setFormData({ ...formData, startedBusiness: checked })}
              />
              <QuestionToggle 
                label="Did you receive, sell, send, or exchange any virtual currency (Crypto)?"
                checked={formData.receivedCrypto}
                onChange={(checked) => setFormData({ ...formData, receivedCrypto: checked })}
              />
              <QuestionToggle 
                label="Do you have any foreign bank accounts or assets?"
                checked={formData.foreignAccounts}
                onChange={(checked) => setFormData({ ...formData, foreignAccounts: checked })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Major Life Changes</label>
              <textarea 
                value={formData.majorLifeChanges}
                onChange={(e) => setFormData({ ...formData, majorLifeChanges: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none h-32"
                placeholder="Marriage, birth of a child, new job, retirement, etc."
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-bold text-brand-black">Review Your Information</h3>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-6">
              <ReviewSection title="Primary Contact" items={[
                { label: "Name", value: `${formData.firstName} ${formData.lastName}` },
                { label: "Filing Status", value: formData.filingStatus },
                { label: "Address", value: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}` }
              ]} />
              
              <ReviewSection title="Banking" items={[
                { label: "Bank", value: formData.bankName },
                { label: "Account", value: `****${formData.accountNumber.slice(-4)} (${formData.accountType})` }
              ]} />

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-brand-charcoal/40 font-bold uppercase tracking-widest mb-2">Dependents</p>
                <p className="font-medium text-brand-black">{dependents.length} dependent(s) added.</p>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-bold text-brand-black">Electronic Signature</h3>
            <div className="bg-brand-lavender/30 p-6 rounded-2xl border border-brand-purple/10">
              <p className="text-sm text-brand-charcoal/80 leading-relaxed italic">
                "Under penalties of perjury, I declare that I have examined this information and to the best of my knowledge and belief, it is true, correct, and complete. I authorize Your Tax Source to use this information for the preparation of my 2024 tax returns."
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Full Name Signature</label>
                <input 
                  type="text" 
                  value={formData.signature}
                  onChange={(e) => setFormData({ ...formData, signature: e.target.value })}
                  className="w-full bg-white border-2 border-brand-black/5 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none font-signature text-2xl"
                  placeholder="Type full name to sign"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-charcoal uppercase tracking-widest">Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white border-2 border-brand-black/5 rounded-xl p-4 focus:ring-2 focus:ring-brand-purple/20 outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Footer */}
      <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
        <button 
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
          className={`flex items-center gap-2 font-bold text-sm transition-all ${step === 1 || isSubmitting ? 'text-gray-300 cursor-not-allowed' : 'text-brand-charcoal hover:text-brand-black'}`}
        >
          <ArrowLeft size={16} /> Back
        </button>
        
        {step < 6 ? (
          <button 
            onClick={nextStep}
            className="bg-brand-purple text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all flex items-center gap-2"
          >
            Continue <ArrowRight size={16} />
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-brand-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-brand-black/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>Submitting... <Loader2 size={16} className="animate-spin" /></>
            ) : (
              <>Submit Final <CheckCircle2 size={16} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function QuestionToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
      <span className="text-sm font-medium text-brand-black">{label}</span>
      <button 
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-brand-purple' : 'bg-gray-300'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </button>
    </div>
  );
}

function ReviewSection({ title, items }: { title: string, items: { label: string, value: string }[] }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-brand-charcoal/40 font-bold uppercase tracking-widest border-b border-gray-100 pb-2">{title}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
            <p className="font-bold text-brand-black">{item.value || 'Not provided'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
