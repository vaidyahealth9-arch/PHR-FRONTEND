import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface VaccinationRecord {
  age: string;
  vaccines: string;
  completed: boolean;
}

const ChildVaccinationTracker: React.FC = () => {
  const navigate = useNavigate();
  const [dateOfBirth, setDateOfBirth] = useState('');
  
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([
    {
      age: 'Birth',
      vaccines: 'Bacillus Calmette Guerin (BCG), Oral Polio Vaccine (OPV)-0 dose, Hepatitis B birth dose',
      completed: false,
    },
    {
      age: '6 Weeks',
      vaccines: 'OPV-1, Pentavalent-1, Rotavirus Vaccine (RVV)-1, Fractional dose of Inactivated Polio Vaccine (fIPV)-1, Pneumococcal Conjugate Vaccine (PCV) -1*',
      completed: false,
    },
    {
      age: '10 weeks',
      vaccines: 'OPV-2, Pentavalent-2, RVV-2',
      completed: false,
    },
    {
      age: '14 weeks',
      vaccines: 'OPV-3, Pentavalent-3, fIPV-2, RVV-3, PCV-2*',
      completed: false,
    },
    {
      age: '9-12 months',
      vaccines: 'Measles & Rubella (MR)-1, JE-1**, PCV-Booster*',
      completed: false,
    },
    {
      age: '16-24 months',
      vaccines: 'MR-2, JE-2**, Diphtheria, Pertussis & Tetanus (DPT)-Booster-1, OPV-Booster-1',
      completed: false,
    },
    {
      age: '5-6 years',
      vaccines: 'DPT-Booster-2',
      completed: false,
    },
    {
      age: '10 years',
      vaccines: 'Tetanus & adult Diphtheria (Td)',
      completed: false,
    },
    {
      age: '16 years',
      vaccines: 'Td',
      completed: false,
    },
  ]);

  const toggleVaccination = (index: number) => {
    setVaccinations(prev => 
      prev.map((vac, i) => 
        i === index ? { ...vac, completed: !vac.completed } : vac
      )
    );
  };

  const calculateAge = () => {
    if (!dateOfBirth) return { years: 0, months: 0, weeks: 0 };
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - dob.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const weeks = Math.floor(((diffDays % 365) % 30) / 7);
    
    return { years, months, weeks };
  };

  const age = calculateAge();

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/trackers')}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">Child Vaccination Tracker</h1>
        <span className="text-3xl">💉</span>
      </div>

      {/* Date of Birth Section */}
      <div className="bg-gray-100 rounded-lg p-4 mb-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="dd/mm/yy"
          />
        </div>

        {dateOfBirth && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-white rounded-lg p-2 text-center">
                <div className="font-bold text-lg">{age.years}</div>
                <div className="text-xs text-gray-600">years</div>
              </div>
              <div className="flex-1 bg-white rounded-lg p-2 text-center">
                <div className="font-bold text-lg">{age.months}</div>
                <div className="text-xs text-gray-600">months</div>
              </div>
              <div className="flex-1 bg-white rounded-lg p-2 text-center">
                <div className="font-bold text-lg">{age.weeks}</div>
                <div className="text-xs text-gray-600">weeks</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommended Vaccinations */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Recommended Vaccinations</h2>
        <p className="text-xs text-gray-600 mb-4">Rules based on National Immunization Schedule</p>

        {/* Vaccination Schedule Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          <div className="bg-gray-50 border-b border-gray-200 p-3">
            <h3 className="font-semibold text-center text-sm">National Immunization Schedule</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-yellow-100">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Age</th>
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Vaccines given</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map((vac, index) => (
                  <tr key={index} className={vac.completed ? 'bg-green-50' : ''}>
                    <td className="border border-gray-300 px-2 py-2 font-medium">{vac.age}</td>
                    <td className="border border-gray-300 px-2 py-2">{vac.vaccines}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
            <p>* PCV in selected states/districts: Bihar, Himachal Pradesh, Madhya Pradesh, Uttar Pradesh (UP), Haryana and Rajasthan; in Haryana as state initiative</p>
            <p>** JE in endemic districts only</p>
            <p>*** One dose if previously vaccinated within 3 years</p>
          </div>
        </div>

        {/* Vaccination Checklist */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="bg-cyan-50 border-b border-gray-200 p-3">
            <h3 className="font-semibold text-sm">Vaccination Checklist</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {vaccinations.map((vac, index) => (
              <div key={index} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="font-medium text-sm">{vac.age}</div>
                  <div className="text-xs text-gray-600 mt-1">{vac.vaccines}</div>
                </div>
                <button
                  onClick={() => toggleVaccination(index)}
                  className={`ml-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    vac.completed
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {vac.completed ? '✓ Done' : 'Mark Done'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-4 bg-cyan-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Vaccination Progress</span>
            <span className="text-sm font-bold text-cyan-700">
              {vaccinations.filter(v => v.completed).length} / {vaccinations.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(vaccinations.filter(v => v.completed).length / vaccinations.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildVaccinationTracker;
