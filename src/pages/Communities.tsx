import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Community {
  id: string;
  name: string;
  memberCount?: number;
  gradient: string;
  hoverGradient: string;
  route: string;
}

export default function Communities() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const communities: Community[] = [
    { 
      id: '1', 
      name: 'Diabetes', 
      memberCount: 1250,
      gradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-700',
      route: '/communities/diabetes'
    },
    { 
      id: '2', 
      name: 'Hypertension', 
      memberCount: 980,
      gradient: 'bg-gradient-to-br from-red-400 to-red-600',
      hoverGradient: 'hover:from-red-500 hover:to-red-700',
      route: '/communities/hypertension'
    },
    { 
      id: '3', 
      name: 'Deaddiction\n&\nRehabilitation', 
      memberCount: 450,
      gradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
      hoverGradient: 'hover:from-purple-500 hover:to-purple-700',
      route: '/communities/deaddiction-rehabilitation'
    },
    { 
      id: '4', 
      name: "Women's Health", 
      memberCount: 2100,
      gradient: 'bg-gradient-to-br from-pink-400 to-pink-600',
      hoverGradient: 'hover:from-pink-500 hover:to-pink-700',
      route: '/communities/womens-health'
    },
    { 
      id: '5', 
      name: 'Chronic Pain', 
      memberCount: 720,
      gradient: 'bg-gradient-to-br from-orange-400 to-orange-600',
      hoverGradient: 'hover:from-orange-500 hover:to-orange-700',
      route: '/communities/chronic-pain'
    },
    { 
      id: '6', 
      name: 'Multiple Sclerosis', 
      memberCount: 340,
      gradient: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
      hoverGradient: 'hover:from-indigo-500 hover:to-indigo-700',
      route: '/communities/multiple-sclerosis'
    },
    { 
      id: '7', 
      name: 'Infertility', 
      memberCount: 580,
      gradient: 'bg-gradient-to-br from-teal-400 to-teal-600',
      hoverGradient: 'hover:from-teal-500 hover:to-teal-700',
      route: '/communities/infertility'
    },
    { 
      id: '8', 
      name: 'Child Care', 
      memberCount: 1850,
      gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
      hoverGradient: 'hover:from-yellow-500 hover:to-yellow-700',
      route: '/communities/child-care'
    },
    { 
      id: '9', 
      name: 'Pregnancy', 
      memberCount: 1420,
      gradient: 'bg-gradient-to-br from-rose-400 to-rose-600',
      hoverGradient: 'hover:from-rose-500 hover:to-rose-700',
      route: '/communities/pregnancy'
    },
    { 
      id: '10', 
      name: 'Pain\nRehabilitation', 
      memberCount: 510,
      gradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
      hoverGradient: 'hover:from-amber-500 hover:to-amber-700',
      route: '/communities/pain-rehabilitation'
    },
    { 
      id: '11', 
      name: 'Mental Health', 
      memberCount: 1680,
      gradient: 'bg-gradient-to-br from-green-400 to-green-600',
      hoverGradient: 'hover:from-green-500 hover:to-green-700',
      route: '/communities/mental-health'
    },
    { 
      id: '12', 
      name: 'Cancer Care', 
      memberCount: 890,
      gradient: 'bg-gradient-to-br from-violet-400 to-violet-600',
      hoverGradient: 'hover:from-violet-500 hover:to-violet-700',
      route: '/communities/cancer-care'
    },
  ];

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().replace(/\n/g, ' ').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-md mx-auto px-4 py-4">
      {/* Header */}
      <h1 className="text-xl font-bold mb-4">Communities (or) Ask AI</h1>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Communities / Questions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {filteredCommunities.map((community) => (
          <button
            key={community.id}
            onClick={() => navigate(community.route)}
            className={`${community.gradient} ${community.hoverGradient} rounded-2xl p-4 h-28 flex items-center justify-center text-center transition-all transform hover:scale-105 shadow-md`}
          >
            <span className="text-sm font-semibold text-white leading-tight whitespace-pre-line drop-shadow-md">
              {community.name}
            </span>
          </button>
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No communities found matching "{searchQuery}"
        </div>
      )}

      {/* Info Section */}
      <div className="bg-cyan-50 rounded-lg p-4">
        <h3 className="font-semibold text-sm mb-2">👥 Communities / Ask-AI</h3>
        <ul className="text-xs text-gray-700 space-y-1">
          <li><span className="font-medium">Purpose:</span> Peer support & knowledge; condition-tagged spaces (Diabetes, Hypertension, etc.)</li>
          <li><span className="font-medium">Features:</span> Browse communities, search questions, ask anonymously, upvote, mark "clinically verified" answers from curated clinicians</li>
          <li><span className="font-medium">Moderation:</span> Abuse filters, report content, anti-misinformation guardrails</li>
        </ul>
      </div>
    </div>
  );
}
