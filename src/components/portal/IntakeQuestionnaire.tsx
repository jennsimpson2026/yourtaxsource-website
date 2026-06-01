"use client";

import { useState } from "react";
import { saveQuestionnaire } from "@/actions/questionnaires";

export function IntakeQuestionnaire({ returnId, existingData }: { returnId: string, existingData?: any }) {
  const [formData, setFormData] = useState(existingData || {
    filingStatus: "",
    dependents: 0,
    hasW2: false,
    has1099: false,
    hasInvestments: false,
    hasBusiness: false,
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave(isSubmitted: boolean = false) {
    setSaving(true);
    try {
      await saveQuestionnaire(returnId, formData, isSubmitted);
      alert(isSubmitted ? "Questionnaire submitted!" : "Draft saved!");
    } catch (error) {
      console.error(error);
      alert("Error saving questionnaire");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow border space-y-6">
      <h2 className="text-2xl font-bold text-blue-900">Intake Questionnaire</h2>
      <p className="text-gray-600">Please provide the following information to help us prepare your tax return.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">Filing Status</label>
          <select 
            value={formData.filingStatus}
            onChange={(e) => setFormData({ ...formData, filingStatus: e.target.value })}
            className="mt-1 block w-full rounded-md border p-2"
          >
            <option value="">Select Status</option>
            <option value="SINGLE">Single</option>
            <option value="MFJ">Married Filing Jointly</option>
            <option value="MFS">Married Filing Separately</option>
            <option value="HOH">Head of Household</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Number of Dependents</label>
          <input 
            type="number"
            value={formData.dependents}
            onChange={(e) => setFormData({ ...formData, dependents: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Income Types</h3>
        <label className="flex items-center gap-3">
          <input 
            type="checkbox"
            checked={formData.hasW2}
            onChange={(e) => setFormData({ ...formData, hasW2: e.target.checked })}
          />
          <span>I have W-2 income</span>
        </label>
        <label className="flex items-center gap-3">
          <input 
            type="checkbox"
            checked={formData.has1099}
            onChange={(e) => setFormData({ ...formData, has1099: e.target.checked })}
          />
          <span>I have 1099 income (Interest, Dividends, Independent Contractor)</span>
        </label>
        <label className="flex items-center gap-3">
          <input 
            type="checkbox"
            checked={formData.hasBusiness}
            onChange={(e) => setFormData({ ...formData, hasBusiness: e.target.checked })}
          />
          <span>I own a small business</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium">Additional Notes</label>
        <textarea 
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2 h-32"
          placeholder="Anything else you want us to know?"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex-1 border border-blue-600 text-blue-600 p-2 rounded-md hover:bg-blue-50"
        >
          {saving ? "Saving..." : "Save Draft"}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex-1 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 font-bold"
        >
          Submit Final
        </button>
      </div>
    </div>
  );
}
