import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Microscope, Calendar, AlertCircle } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  why: string;
  frequency: string;
  category: string[];
}

const RecommendedTests: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('General');

  const categories = [
    'General',
    'Diabetes',
    'Hypertension',
    'Pregnancy',
    'Cardio',
    'Liver',
    'Kidney',
  ];

  const tests: Test[] = [
    {
      id: '1',
      name: 'Complete Blood Count',
      why: 'No CBC in 12 months',
      frequency: 'Every 12 months',
      category: ['General'],
    },
    {
      id: '2',
      name: 'HbA1c',
      why: 'Age >35y, BMI >25, family history',
      frequency: 'Every 12 months ; 3-6 months for diagnosed diabetes',
      category: ['General', 'Diabetes'],
    },
    {
      id: '3',
      name: 'Lipid Profile',
      why: 'Age >35y, BMI >25, diabetes, hypertension, smokers',
      frequency: 'Every 12 months',
      category: ['General', 'Cardio', 'Hypertension'],
    },
    {
      id: '4',
      name: 'Thyroid profile',
      why: 'Pregnant women, no TSH in 12 months',
      frequency: 'Once every trimester',
      category: ['General', 'Pregnancy'],
    },
    {
      id: '5',
      name: 'Fasting Blood Sugar',
      why: 'Age >35y, BMI >25, family history of diabetes',
      frequency: 'Every 12 months',
      category: ['Diabetes', 'General'],
    },
    {
      id: '6',
      name: 'Blood Pressure Monitoring',
      why: 'Age >40y, family history, obesity',
      frequency: 'Every 6 months',
      category: ['Hypertension', 'General'],
    },
    {
      id: '7',
      name: 'ECG',
      why: 'Age >40y, hypertension, diabetes, smokers',
      frequency: 'Every 24 months',
      category: ['Cardio', 'General'],
    },
    {
      id: '8',
      name: 'Liver Function Test',
      why: 'Alcohol consumption, hepatitis risk, medications',
      frequency: 'Every 12 months',
      category: ['Liver', 'General'],
    },
    {
      id: '9',
      name: 'Kidney Function Test',
      why: 'Diabetes, hypertension, age >60y',
      frequency: 'Every 12 months',
      category: ['Kidney', 'General'],
    },
    {
      id: '10',
      name: 'Urine Analysis',
      why: 'Pregnancy, diabetes, kidney disease risk',
      frequency: 'Every trimester for pregnancy',
      category: ['Pregnancy', 'Kidney'],
    },
  ];

  const filteredTests = tests.filter(test =>
    test.category.includes(activeCategory)
  );

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
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
              <Microscope className="text-purple-700" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Recommended Tests</h1>
              <p className="text-purple-100 text-sm">Stay ahead with preventive care</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tests List */}
      <div className="space-y-3">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Microscope className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{test.name}</h3>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-700">
                <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Why:</span> {test.why}
                </div>
              </div>
              <div className="flex items-start gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Frequency:</span> {test.frequency}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Microscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 mb-1 text-sm">Preventive Health Screening</h3>
            <p className="text-xs text-purple-800 mb-2">
              Regular health checkups help detect potential issues early and keep you healthy.
            </p>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Personalized recommendations based on your profile</li>
              <li>• Follow recommended frequencies for best results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedTests;
