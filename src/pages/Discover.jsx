import React, { useState } from 'react';
import { useMatch } from '../hooks/useMatch';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Star } from 'lucide-react';

const Discover = () => {
  const { suggestedMatches } = useMatch();
  const { sendRequest, requests } = useData();
  const { currentUser } = useAuth();
  
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter out matches we already sent a request to
  const availableMatches = suggestedMatches.filter(match => 
    !requests.some(req => req.receiverId === match.id && req.senderId === currentUser.id)
  );

  const currentMatch = availableMatches[currentIndex];

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleSendRequest = async (match, offeredSkill, wantedSkill) => {
    try {
      await sendRequest(match.id, wantedSkill, offeredSkill);
      handleNext();
    } catch (error) {
      console.error("Request failed", error);
    }
  };

  if (availableMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <Star className="w-10 h-10 text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">You're all caught up!</h2>
        <p className="text-slate-500 text-center max-w-md">
          We couldn't find any more matches right now. Update your profile with more skills or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Discover Matches</h1>
        <p className="text-slate-500 mt-2">Find the perfect partner to exchange skills with.</p>
      </header>

      <div className="relative h-[500px]">
        <AnimatePresence mode="popLayout">
          {currentMatch && (
            <motion.div
              key={currentMatch.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: -200, scale: 0.9 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              className="absolute inset-0"
            >
              <div className="bg-white h-full rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-8 pb-0 text-center flex-1">
                  <div className="relative inline-block mb-4">
                    <img 
                      src={currentMatch.avatar} 
                      alt={currentMatch.name} 
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg mx-auto"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
                      {currentMatch.compatibilityScore}% Match
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900">{currentMatch.name}</h2>
                  <p className="text-slate-500 mb-6">{currentMatch.experience} Level</p>

                  <div className="grid grid-cols-2 gap-6 text-left">
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                      <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">They offer</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.skillsOffered.map(skill => (
                          <span 
                            key={skill} 
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              currentMatch.matchingWanted.includes(skill.toLowerCase()) 
                                ? 'bg-blue-200 text-blue-800 ring-2 ring-blue-400' 
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                      <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-3">They want</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentMatch.skillsWanted.map(skill => (
                          <span 
                            key={skill} 
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                              currentMatch.matchingOffered.includes(skill.toLowerCase()) 
                                ? 'bg-green-200 text-green-800 ring-2 ring-green-400' 
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center gap-6">
                  <button 
                    onClick={handleNext}
                    className="w-16 h-16 rounded-full bg-white text-slate-400 hover:text-red-500 hover:bg-red-50 shadow-md flex items-center justify-center transition-all focus:outline-none"
                  >
                    <X className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={() => handleSendRequest(
                      currentMatch, 
                      currentMatch.matchingOffered[0] || currentMatch.skillsWanted[0], // What I offer
                      currentMatch.matchingWanted[0] || currentMatch.skillsOffered[0] // What I want
                    )}
                    className="w-16 h-16 rounded-full bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 flex items-center justify-center transition-all focus:outline-none focus:ring-4 focus:ring-primary-200"
                  >
                    <Send className="w-7 h-7" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <p className="text-center text-slate-400 mt-8 text-sm">
        {availableMatches.length > 0 ? (currentIndex + 1) : 0} of {availableMatches.length} matches
      </p>
    </div>
  );
};

export default Discover;
