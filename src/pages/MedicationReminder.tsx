import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Upload, Clock, Bell, Pill, CheckCircle, X } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  timing: 'Before Meal' | 'After Meal';
  taken: boolean;
  skipped: boolean;
}

const MedicationReminder: React.FC = () => {
  const navigate = useNavigate();
  
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Pan-D',
      dosage: '40mg',
      time: '07:30 am',
      timing: 'Before Meal',
      taken: false,
      skipped: false,
    },
    {
      id: '2',
      name: 'Augementin',
      dosage: '625mg',
      time: '08:30 am',
      timing: 'After Meal',
      taken: false,
      skipped: false,
    },
  ]);

  const handleTake = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, taken: true, skipped: false } : med
      )
    );
  };

  const handleSkip = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, skipped: true, taken: false } : med
      )
    );
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-cyan-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Pill className="text-cyan-700" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Medication Reminder</h1>
              <p className="text-cyan-100 text-sm">Never miss a dose</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95">
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
        <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-200 shadow-sm hover:shadow-md active:scale-95">
          <Upload className="w-5 h-5" />
          Upload
        </button>
      </div>

      {/* Next Reminders Today */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Reminders</h2>

        <div className="space-y-3">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`bg-white rounded-2xl shadow-md border overflow-hidden transition-all ${
                med.taken ? 'border-green-200 bg-green-50/50' : med.skipped ? 'border-red-200 bg-red-50/50' : 'border-gray-100'
              }`}
            >
              <div className="p-4">
                {/* Medication Name */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {med.name} <span className="text-gray-600 font-normal text-sm">{med.dosage}</span>
                    </h3>
                  </div>
                  {med.taken && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Taken
                    </div>
                  )}
                  {med.skipped && (
                    <div className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">
                      <X className="w-3.5 h-3.5" />
                      Skipped
                    </div>
                  )}
                </div>

                {/* Timing and Time */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{med.timing}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bell className="w-4 h-4" />
                    <span>{med.time}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTake(med.id)}
                    disabled={med.taken || med.skipped}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      med.taken
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl active:scale-95'
                    } ${(med.taken || med.skipped) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {med.taken ? '✓ Taken' : 'Take'}
                  </button>
                  <button
                    onClick={() => handleSkip(med.id)}
                    disabled={med.taken || med.skipped}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                      med.skipped
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-red-600 shadow-sm hover:shadow-md active:scale-95'
                    } ${(med.taken || med.skipped) ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {med.skipped ? '✗ Skipped' : 'Skip'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-cyan-900 mb-1 text-sm">Medication Adherence Tips</h3>
            <p className="text-xs text-cyan-800 mb-2">
              Taking your medications on time helps ensure better health outcomes.
            </p>
            <ul className="text-xs text-cyan-700 space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Set reminders for consistent timing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Follow meal timing instructions carefully</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationReminder;
