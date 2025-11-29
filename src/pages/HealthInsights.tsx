import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InsightCategory {
  id: string;
  label: string;
}

const HealthInsights: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('blood-pressure');

  const categories: InsightCategory[] = [
    { id: 'blood-pressure', label: 'Blood Pressure' },
    { id: 'blood-sugar', label: 'Blood Sugar' },
    { id: 'sleep', label: 'Sleep' },
    { id: 'hemoglobin', label: 'Hemoglobin' },
    { id: 'menses', label: 'Menses' },
    { id: 'liver', label: 'Liver' },
    { id: 'kidney', label: 'Kidney' },
  ];

  // Sample data for Blood Pressure
  const bloodPressureData = [
    { date: 'Nov 13', systolic: 140, diastolic: 90 },
    { date: 'Nov 14', systolic: 145, diastolic: 92 },
    { date: 'Nov 15', systolic: 150, diastolic: 95 },
    { date: 'Nov 16', systolic: 155, diastolic: 98 },
    { date: 'Nov 17', systolic: 158, diastolic: 100 },
    { date: 'Nov 18', systolic: 160, diastolic: 100 },
    { date: 'Nov 19', systolic: 162, diastolic: 102 },
  ];

  const bloodSugarData = [
    { date: 'Nov 13', fasting: 95, postMeal: 140 },
    { date: 'Nov 14', fasting: 98, postMeal: 145 },
    { date: 'Nov 15', fasting: 100, postMeal: 150 },
    { date: 'Nov 16', fasting: 105, postMeal: 155 },
    { date: 'Nov 17', fasting: 110, postMeal: 160 },
    { date: 'Nov 18', fasting: 112, postMeal: 165 },
    { date: 'Nov 19', fasting: 115, postMeal: 170 },
  ];

  const getInsightContent = () => {
    switch (activeCategory) {
      case 'blood-pressure':
        return {
          title: 'Blood Pressure',
          insight: 'There is an average increase of systolic BP by 10% and an average increase of diastolic BP by 5% over the past 1 week',
          data: bloodPressureData,
          lines: [
            { dataKey: 'systolic', stroke: '#f59e0b', name: 'Systolic (DBP)' },
            { dataKey: 'diastolic', stroke: '#3b82f6', name: 'Diastolic (DBP)' },
          ],
          yAxisLabel: 'Blood Pressure (mmHg)',
          yDomain: [80, 170],
        };
      case 'blood-sugar':
        return {
          title: 'Blood Sugar',
          insight: 'Your average fasting blood sugar has increased by 12% over the past week. Post-meal readings show a 12% increase.',
          data: bloodSugarData,
          lines: [
            { dataKey: 'fasting', stroke: '#10b981', name: 'Fasting' },
            { dataKey: 'postMeal', stroke: '#8b5cf6', name: 'Post-Meal' },
          ],
          yAxisLabel: 'Blood Sugar (mg/dL)',
          yDomain: [80, 180],
        };
      default:
        return null;
    }
  };

  const content = getInsightContent();

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-600 rounded-2xl shadow-xl p-6 mb-6 text-white relative overflow-hidden">
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
              <Lightbulb className="text-yellow-600" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Health Insights</h1>
              <p className="text-yellow-100 text-sm">AI-powered analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Card */}
      {content ? (
        <div className="space-y-4">
          {/* Trend Summary */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">{content.title}</h2>
                <p className="text-sm text-gray-700">{content.insight}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">7-Day Trend</h3>
            <div className="bg-gray-50 rounded-xl p-3">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={content.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    label={{ value: content.yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }}
                    domain={content.yDomain}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '11px' }}
                    iconType="line"
                  />
                  {content.lines.map((line) => (
                    <Line
                      key={line.dataKey}
                      type="monotone"
                      dataKey={line.dataKey}
                      stroke={line.stroke}
                      name={line.name}
                      strokeWidth={3}
                      dot={{ r: 4, fill: line.stroke }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium mb-2">No insights available yet</p>
          <p className="text-sm text-gray-500">Start tracking your health data to see trends and personalized insights.</p>
        </div>
      )}

      {/* Info Card */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 mt-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-yellow-900 mb-1 text-sm">AI-Powered Health Analysis</h3>
            <p className="text-xs text-yellow-800 mb-2">
              Get plain-language interpretations of your health trends and receive personalized recommendations.
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Track changes over time with interactive charts</li>
              <li>• Understand your health metrics better</li>
              <li>• Get actionable insights for improvement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthInsights;
