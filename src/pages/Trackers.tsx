import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Activity, Droplet, Flower2, Baby, Syringe, Moon, Heart } from 'lucide-react';

export default function Trackers() {
  const [expandedTracker, setExpandedTracker] = useState<string | null>(null);
  const [bloodPressureEntries, setBloodPressureEntries] = useState([
    { systolic: '', diastolic: '', time: '08:30 am' },
    { systolic: '', diastolic: '', time: '10:30 am' },
    { systolic: '', diastolic: '', time: '12:30 pm' },
  ]);

  const toggleTracker = (trackerId: string) => {
    setExpandedTracker(expandedTracker === trackerId ? null : trackerId);
  };

  const addBloodPressureEntry = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const time = `${formattedHours}:${formattedMinutes} ${ampm}`;
    
    setBloodPressureEntries([...bloodPressureEntries, { systolic: '', diastolic: '', time }]);
  };

  const trackerItems = [
    {
      id: 'blood-pressure',
      title: 'Blood Pressure',
      icon: Activity,
      bgColor: 'bg-gray-100',
      expandable: true,
    },
    {
      id: 'blood-glucose',
      title: 'Blood Glucose',
      icon: Droplet,
      route: '/trackers/blood-glucose',
      bgColor: 'bg-gray-100',
      expandable: false,
    },
    {
      id: 'menstrual-cycle',
      title: 'Menstrual Cycle',
      icon: Flower2,
      route: '/trackers/menstrual-cycle',
      bgColor: 'bg-gray-100',
      expandable: false,
    },
    {
      id: 'pregnancy',
      title: 'Pregnancy Tracker',
      subtitle: '(Antenatal Care)',
      icon: Baby,
      route: '/trackers/pregnancy',
      bgColor: 'bg-gray-100',
      expandable: false,
    },
    {
      id: 'child-vaccination',
      title: 'Child Vaccination Tracker',
      icon: Syringe,
      route: '/trackers/child-vaccination',
      bgColor: 'bg-gray-100',
      expandable: false,
    },
    {
      id: 'sleep',
      title: 'Sleep Tracker',
      subtitle: '(Data from fitness trackers/apple health)',
      icon: Moon,
      route: '/trackers/sleep',
      bgColor: 'bg-gray-100',
      expandable: false,
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-4 pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-6 -mb-6"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Heart className="text-red-700" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Health Trackers</h2>
              <p className="text-red-100 text-sm">Monitor your vital signs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trackers List */}
      <div className="space-y-3">
        {trackerItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id}>
              {item.expandable ? (
                <div
                  className={`${item.bgColor} rounded-xl shadow-sm border border-gray-200 cursor-pointer transition-all duration-300 ease-in-out`}
                  onClick={() => toggleTracker(item.id)}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        {item.subtitle && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                      <div>
                        <IconComponent size={28} strokeWidth={2} className="text-gray-700" />
                      </div>
                    </div>

                    {/* Expanded Content */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedTracker === item.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="space-y-3 mt-4" onClick={(e) => e.stopPropagation()}>
                        {bloodPressureEntries.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="flex items-center gap-1 flex-1">
                              <input
                                type="text"
                                placeholder=""
                                value={entry.systolic}
                                onChange={(e) => {
                                  const newEntries = [...bloodPressureEntries];
                                  newEntries[index].systolic = e.target.value;
                                  setBloodPressureEntries(newEntries);
                                }}
                                className="w-16 px-2 py-2 bg-white rounded-lg text-center text-lg font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                              />
                              <span className="text-2xl font-bold text-gray-400">/</span>
                              <input
                                type="text"
                                placeholder=""
                                value={entry.diastolic}
                                onChange={(e) => {
                                  const newEntries = [...bloodPressureEntries];
                                  newEntries[index].diastolic = e.target.value;
                                  setBloodPressureEntries(newEntries);
                                }}
                                className="w-16 px-2 py-2 bg-white rounded-lg text-center text-lg font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-900"
                              />
                              <div className="flex flex-col ml-1">
                                <span className="text-[9px] text-gray-500 leading-tight">mm Hg</span>
                                <span className="text-[9px] text-gray-500 leading-tight">bpm</span>
                              </div>
                            </div>
                            <div className="bg-white px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700">
                              {entry.time}
                            </div>
                          </div>
                        ))}
                        
                        {/* Add Button */}
                        <button
                          onClick={addBloodPressureEntry}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium mt-2 bg-white px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                        >
                          <Plus size={16} />
                          <span>Add Reading</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to={item.route || '#'}
                  className={`${item.bgColor} rounded-xl p-4 flex items-center justify-between active:scale-98 transition-transform duration-150 shadow-sm border border-gray-200`}
                >
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="ml-3">
                    <IconComponent size={28} strokeWidth={2} className="text-gray-700" />
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-red-900 mb-1 text-sm">Track Your Health Daily</h4>
            <p className="text-xs text-red-800">
              Regular monitoring helps you stay on top of your health and detect any changes early.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
