import { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function PregnancyTracker() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [gestationalAge, setGestationalAge] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  
  const [doctorVisits, setDoctorVisits] = useState([
    { week: 12, date: '', completed: false, skipped: true },
    { week: 20, date: '', completed: false, skipped: false },
    { week: 26, date: '', completed: false, skipped: false },
    { week: 30, date: '', completed: false, skipped: false },
    { week: 34, date: '', completed: false, skipped: false },
    { week: 36, date: '', completed: false, skipped: false },
    { week: 38, date: '', completed: false, skipped: false },
    { week: 40, date: '', completed: false, skipped: false },
  ]);

  const [vaccinations, setVaccinations] = useState({
    td1: { completed: false, skipped: false },
    td2: { completed: false, skipped: false },
    tdB: { completed: false, skipped: false },
  });

  const toggleVisitStatus = (index: number, type: 'completed' | 'skipped') => {
    const newVisits = [...doctorVisits];
    if (type === 'completed') {
      newVisits[index].completed = !newVisits[index].completed;
      if (newVisits[index].completed) newVisits[index].skipped = false;
    } else {
      newVisits[index].skipped = !newVisits[index].skipped;
      if (newVisits[index].skipped) newVisits[index].completed = false;
    }
    setDoctorVisits(newVisits);
  };

  const toggleVaccination = (vaccine: 'td1' | 'td2' | 'tdB', type: 'completed' | 'skipped') => {
    setVaccinations(prev => ({
      ...prev,
      [vaccine]: {
        ...prev[vaccine],
        [type]: !prev[vaccine][type],
        [type === 'completed' ? 'skipped' : 'completed']: prev[vaccine][type] ? prev[vaccine][type === 'completed' ? 'skipped' : 'completed'] : false,
      }
    }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-300 p-4 mb-4">
        <h1 className="text-xl font-bold text-center text-gray-900">Trackers</h1>
      </div>

      {/* Pregnancy Tracker Card */}
      <div className="bg-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Pregnancy Tracker</h2>
            <p className="text-xs text-gray-600">(Antenatal Care)</p>
          </div>
          <div className="text-4xl">🤰</div>
        </div>

        {/* Last Menstrual Period */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-semibold text-gray-900">Last Menstrual Period</label>
              <p className="text-xs text-gray-500">(1st day of last period)</p>
            </div>
            <input
              type="text"
              placeholder="dd/mm/yy"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-28 px-3 py-2 bg-white rounded-lg text-sm text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Gestational Age */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">Gestational Age</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={gestationalAge}
                onChange={(e) => setGestationalAge(e.target.value)}
                className="w-28 px-3 py-2 bg-white rounded-lg text-sm text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <span className="text-xs text-gray-500">weeks</span>
            </div>
          </div>
        </div>

        {/* Expected Delivery Date */}
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900">Expected Delivery Date</label>
            <input
              type="text"
              placeholder="dd/mm/yy"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              className="w-28 px-3 py-2 bg-white rounded-lg text-sm text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Minimum Recommended Doctor Visits */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Minimum Recommended Doctor Visits <span className="text-xs font-normal text-gray-500">(acc. to WHO)</span>
          </h3>
          <div className="space-y-2">
            {doctorVisits.map((visit, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900 w-4">{index + 1}.</span>
                <input
                  type="text"
                  placeholder="dd/mm/yy"
                  value={visit.date}
                  onChange={(e) => {
                    const newVisits = [...doctorVisits];
                    newVisits[index].date = e.target.value;
                    setDoctorVisits(newVisits);
                  }}
                  className="w-24 px-2 py-1.5 bg-white rounded-lg text-xs text-center border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={() => toggleVisitStatus(index, 'completed')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    visit.completed ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {visit.completed && <Check size={14} className="text-white" />}
                </button>
                <button
                  onClick={() => toggleVisitStatus(index, 'skipped')}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    visit.skipped ? 'bg-red-500' : 'bg-white border-2 border-gray-300'
                  }`}
                >
                  {visit.skipped && <X size={14} className="text-white" />}
                </button>
                <span className="text-xs text-gray-500 flex-1">
                  (Rule: at {visit.week} weeks gestational age)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vaccinations */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Vaccinations <span className="text-xs font-normal text-gray-500">(acc. to NHM)</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Td-1 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Td-1</span>
              <button
                onClick={() => toggleVaccination('td1', 'completed')}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  vaccinations.td1.completed ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                }`}
              >
                {vaccinations.td1.completed && <Check size={14} className="text-white" />}
              </button>
              <button
                onClick={() => toggleVaccination('td1', 'skipped')}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  vaccinations.td1.skipped ? 'bg-red-500' : 'bg-white border-2 border-gray-300'
                }`}
              >
                {vaccinations.td1.skipped && <X size={14} className="text-white" />}
              </button>
            </div>

            {/* Td-B */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Td-B</span>
              <button
                onClick={() => toggleVaccination('tdB', 'completed')}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  vaccinations.tdB.completed ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                }`}
              >
                {vaccinations.tdB.completed && <Check size={14} className="text-white" />}
              </button>
              <button
                onClick={() => toggleVaccination('tdB', 'skipped')}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  vaccinations.tdB.skipped ? 'bg-red-500' : 'bg-white border-2 border-gray-300'
                }`}
              >
                {vaccinations.tdB.skipped && <X size={14} className="text-white" />}
              </button>
            </div>

            {/* Td-2 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">Td-2</span>
              <button
                onClick={() => toggleVaccination('td2', 'completed')}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  vaccinations.td2.completed ? 'bg-green-500' : 'bg-white border-2 border-gray-300'
                }`}
              >
                {vaccinations.td2.completed && <Check size={14} className="text-white" />}
              </button>
              <button
                onClick={() => toggleVaccination('td2', 'skipped')}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  vaccinations.td2.skipped ? 'bg-red-500' : 'bg-white border-2 border-gray-300'
                }`}
              >
                {vaccinations.td2.skipped && <X size={14} className="text-white" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
