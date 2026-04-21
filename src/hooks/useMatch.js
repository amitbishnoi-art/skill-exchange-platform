import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

// Smart matching logic: 
// 1. A matches B if A offers what B wants, or B offers what A wants.
// 2. Mutual match: A offers what B wants AND B offers what A wants.
// We assign a compatibility score based on overlaps.

export const useMatch = () => {
  const { currentUserProfile, users } = useData();
  const { currentUser } = useAuth();

  const suggestedMatches = useMemo(() => {
    if (!currentUser || !currentUserProfile) return [];

    const myOffered = (currentUserProfile.skillsOffered || []).map(s => s.toLowerCase());
    const myWanted = (currentUserProfile.skillsWanted || []).map(s => s.toLowerCase());

    const scoredUsers = users.map(user => {
      if (user.id === currentUser.id) return null;

      const userOffered = (user.skillsOffered || []).map(s => s.toLowerCase());
      const userWanted = (user.skillsWanted || []).map(s => s.toLowerCase());

      let score = 0;
      let matchingOffered = []; // What they offer that I want
      let matchingWanted = []; // What they want that I offer

      // Check what they offer that I want
      userOffered.forEach(skill => {
        if (myWanted.includes(skill)) {
          score += 50;
          matchingOffered.push(skill);
        }
      });

      // Check what they want that I offer
      userWanted.forEach(skill => {
        if (myOffered.includes(skill)) {
          score += 50;
          matchingWanted.push(skill);
        }
      });

      // Bonus for mutual exact exchange
      if (matchingOffered.length > 0 && matchingWanted.length > 0) {
        score += 20;
      }

      // Cap at 100
      score = Math.min(score, 100);

      return {
        ...user,
        compatibilityScore: score,
        matchingOffered,
        matchingWanted
      };
    }).filter(u => u !== null && u.compatibilityScore > 0);

    // Sort by highest score first
    return scoredUsers.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  }, [currentUser, currentUserProfile, users]);

  return { suggestedMatches };
};
