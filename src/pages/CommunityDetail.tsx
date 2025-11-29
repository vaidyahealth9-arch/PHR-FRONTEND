import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  question: string;
  answers: number;
  upvotes: number;
  timeAgo: string;
}

const CommunityDetail: React.FC = () => {
  const navigate = useNavigate();
  const { communityId } = useParams<{ communityId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [postQuestion, setPostQuestion] = useState('');

  // Map community IDs to names
  const communityNames: { [key: string]: string } = {
    'diabetes': 'Diabetes',
    'hypertension': 'Hypertension',
    'deaddiction-rehabilitation': 'Deaddiction & Rehabilitation',
    'womens-health': "Women's Health",
    'chronic-pain': 'Chronic Pain',
    'multiple-sclerosis': 'Multiple Sclerosis',
    'infertility': 'Infertility',
    'child-care': 'Child Care',
    'pregnancy': 'Pregnancy',
    'pain-rehabilitation': 'Pain Rehabilitation',
    'mental-health': 'Mental Health',
    'cancer-care': 'Cancer Care',
  };

  const communityName = communityNames[communityId || ''] || 'Community';

  // Sample posts data
  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: 'Anonymous',
      question: 'What are the best diet tips for managing blood sugar levels?',
      answers: 12,
      upvotes: 45,
      timeAgo: '2 hours ago',
    },
    {
      id: '2',
      author: 'HealthSeeker',
      question: 'How often should I check my glucose levels?',
      answers: 8,
      upvotes: 32,
      timeAgo: '5 hours ago',
    },
    {
      id: '3',
      author: 'CareGiver101',
      question: 'What exercises are safe for diabetic patients?',
      answers: 15,
      upvotes: 58,
      timeAgo: '1 day ago',
    },
    {
      id: '4',
      author: 'WellnessWarrior',
      question: 'Can stress affect blood sugar levels?',
      answers: 20,
      upvotes: 67,
      timeAgo: '2 days ago',
    },
  ]);

  const handlePost = () => {
    if (postQuestion.trim()) {
      // Handle post submission
      console.log('Posting question:', postQuestion);
      setPostQuestion('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-4">
        <button
          onClick={() => navigate('/communities')}
          className="mr-3 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold flex-1">{communityName} {'{Community (or) Ask AI}'}</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Communities / Questions"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Ask Question Section */}
      <div className="mb-4 bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="What do you want to ask?"
          value={postQuestion}
          onChange={(e) => setPostQuestion(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button
          onClick={handlePost}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
        >
          Post
        </button>
      </div>

      {/* Recent Posts/Questions */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-3">Recent Posts/Questions</h2>

        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{post.author}</div>
                    <div className="text-xs text-gray-500">{post.timeAgo}</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-800 mb-3">{post.question}</p>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <span>{post.answers} answers</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>{post.upvotes} upvotes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-2">No posts yet in this community</p>
          <p className="text-sm">Be the first to ask a question!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail;
