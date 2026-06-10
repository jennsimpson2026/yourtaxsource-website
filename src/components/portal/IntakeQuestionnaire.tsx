"use client";

import { useState, useEffect } from "react";
import { saveQuestionnaire, getQuestionnaire } from "@/actions/questionnaires";
import { Save, Send, ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function IntakeQuestionnaire({ returnId }: { returnId: string }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<any>({
    personal: {
      filingStatus: "",
      occupation: "",
      spouseOccupation: "",
    },
    dependents: [],
    income: {
      hasW2: false,
      has1099: false,
      hasBusiness: false,
      hasRental: false,
      hasCrypto: false,
    },
    deductions: {
      hasMortgage: false,
      hasCharity: false,
      hasMedical: false,
    },
    other: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const existing = await getQuestionnaire(returnId);
        if (existing) {
          setData(JSON.parse(existing.data));
          if (existing.isSubmitted) setSubmitted(true);
        }
      } catch (error) {
        console.error("Error loading questionnaire:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [returnId]);

  const handleSave = async (isSubmit: boolean = false) => {
    if (isSubmit && !confirm("Are you sure you want to submit? You won't be able to edit it after submission.")) {
      return;
    }

    setSaving(true);
    try {
      await saveQuestionnaire(returnId, data, isSubmit);
      if (isSubmit) setSubmitted(true);
      else alert("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving questionnaire");
    } finally {
      setSaving(false);
    }
  };

  const updateData = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <Loader2 className="animate-spin text-brand-purple mb-4" size={48} />
        <p className="text-brand-charcoal/60 font-bold">Loading your questionnaire...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-green-500 mx-auto">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-heading font-black text-brand-black">Successfully Submitted</h2>
        <p className="text-brand-charcoal/60 max-w-md mx-auto">
          Thank you! Your intake questionnaire has been received. Our team will review your information and reach out if we have any questions.
        </p>
        <button 
          onClick={() => router.push("/portal")}
          className="bg-brand-purple text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s}
              className={`w-8 h-2 rounded-full transition-all ${step >= s ? 'bg-brand-purple' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <span className="text-xs font-black text-brand-purple uppercase tracking-widest">Step {step} of 4</span>
      </div>

      <div className="p-8 md:p-12">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-black text-brand-black">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-brand-black">Filing Status</label>
                <select 
                  value={data.personal.filingStatus}
                  onChange={(e) => updateData('personal', 'filingStatus', e.target.value)}
                  className="w-full p-4 rounded-2xl bg-brand-soft-gray border-none focus:ring-2 focus:ring-brand-purple outline-none"
                >
                  <option value="">Select Status...</option>
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED_JOINT">Married Filing Jointly</option>
                  <option value="MARRIED_SEPARATE">Married Filing Separately</option>
                  <option value="HEAD_OF_HOUSEHOLD">Head of Household</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-brand-black">Your Occupation</label>
                <input 
                  type="text"
                  value={data.personal.occupation}
                  onChange={(e) => updateData('personal', 'occupation', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="w-full p-4 rounded-2xl bg-brand-soft-gray border-none focus:ring-2 focus:ring-brand-purple outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-black text-brand-black">Income Sources</h3>
            <p className="text-brand-charcoal/60 text-sm">Select all that apply to you for this tax year.</p>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { id: 'hasW2', label: 'W-2 Wages (Employment)' },
                { id: 'has1099', label: '1099 Income (Freelance/Contract)' },
                { id: 'hasBusiness', label: 'Business Owner (Schedule C)' },
                { id: 'hasRental', label: 'Rental Property Income' },
                { id: 'hasCrypto', label: 'Cryptocurrency/Stock Sales' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-soft-gray cursor-pointer hover:bg-brand-lavender/50 transition-colors">
                  <input 
                    type="checkbox"
                    checked={data.income[item.id]}
                    onChange={(e) => updateData('income', item.id, e.target.checked)}
                    className="w-5 h-5 rounded-md text-brand-purple border-none focus:ring-brand-purple"
                  />
                  <span className="font-bold text-brand-charcoal">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-black text-brand-black">Potential Deductions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { id: 'hasMortgage', label: 'Mortgage Interest' },
                { id: 'hasCharity', label: 'Charitable Contributions' },
                { id: 'hasMedical', label: 'High Medical Expenses' },
              ].map((item) => (
                <label key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-soft-gray cursor-pointer hover:bg-brand-lavender/50 transition-colors">
                  <input 
                    type="checkbox"
                    checked={data.deductions[item.id]}
                    onChange={(e) => updateData('deductions', item.id, e.target.checked)}
                    className="w-5 h-5 rounded-md text-brand-purple border-none focus:ring-brand-purple"
                  />
                  <span className="font-bold text-brand-charcoal">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-2xl font-heading font-black text-brand-black">Final Notes</h3>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-brand-black">Anything else we should know?</label>
              <textarea 
                value={data.other}
                onChange={(e) => setData({...data, other: e.target.value})}
                rows={5}
                placeholder="List any life changes, new dependants, or specific concerns..."
                className="w-full p-4 rounded-2xl bg-brand-soft-gray border-none focus:ring-2 focus:ring-brand-purple outline-none resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-100">
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-brand-charcoal hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}
            <button 
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-brand-purple bg-brand-lavender hover:bg-brand-lavender/70 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Draft
            </button>
          </div>

          {step < 4 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-white bg-brand-black hover:bg-brand-charcoal transition-all shadow-lg"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          ) : (
            <button 
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black text-white bg-brand-purple hover:scale-105 transition-all shadow-xl shadow-brand-purple/20 disabled:opacity-50"
            >
              {saving ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              Submit Questionnaire
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
