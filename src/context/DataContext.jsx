import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  or,
  orderBy,
  limit
} from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [messages, setMessages] = useState({}); // { exchangeId: [msgs] }

  // 1. Fetch Public User Profiles
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      
      if (currentUser) {
        const myProfile = usersData.find(u => u.id === currentUser.id);
        if (myProfile) {
          setCurrentUserProfile(myProfile);
        } else {
          setCurrentUserProfile({
            skillsOffered: [],
            skillsWanted: [],
            experience: 'Beginner',
            availability: 'Weekends'
          });
        }
      }
    });
    return () => unsubscribeUsers();
  }, [currentUser]);

  // 2. Fetch User-Specific Private Data
  useEffect(() => {
    if (!currentUser) {
      setRequests([]);
      setExchanges([]);
      setSessions([]);
      setMessages({});
      return;
    }

    const qRequests = query(
      collection(db, 'requests'),
      or(
        where('senderId', '==', currentUser.id),
        where('receiverId', '==', currentUser.id)
      )
    );
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qExchanges = query(
      collection(db, 'exchanges'),
      where('users', 'array-contains', currentUser.id)
    );
    const unsubscribeExchanges = onSnapshot(qExchanges, (snapshot) => {
      const exchangesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExchanges(exchangesData);

      if (exchangesData.length > 0) {
        const exchangeIds = exchangesData.map(e => e.id);
        
        // Fetch Sessions
        const qSessions = query(collection(db, 'sessions'), where('exchangeId', 'in', exchangeIds));
        const unsubscribeSessions = onSnapshot(qSessions, (snapshot) => {
          setSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // Fetch Messages for each exchange
        const messageUnsubscribers = exchangeIds.map(eid => {
          const qMsgs = query(
            collection(db, `exchanges/${eid}/messages`),
            orderBy('timestamp', 'asc'),
            limit(50)
          );
          return onSnapshot(qMsgs, (snapshot) => {
            setMessages(prev => ({
              ...prev,
              [eid]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            }));
          });
        });

        return () => {
          unsubscribeRequests();
          unsubscribeExchanges();
          unsubscribeSessions();
          messageUnsubscribers.forEach(unsub => unsub());
        };
      } else {
        setSessions([]);
        setMessages({});
      }
    });

    return () => {
      unsubscribeRequests();
      unsubscribeExchanges();
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.id);
      setDoc(userRef, {
        name: currentUser.name,
        avatar: currentUser.avatar
      }, { merge: true }).catch(err => console.error(err));
    }
  }, [currentUser?.id]);


  const updateProfile = useCallback(async (updates) => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.id);
    try {
      await updateDoc(userRef, updates);
    } catch (err) {
      if (err.code === 'not-found') {
        await setDoc(userRef, updates, { merge: true });
      }
    }
  }, [currentUser]);

  const sendRequest = useCallback(async (targetUserId, targetSkill, offeredSkill) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'requests'), {
      senderId: currentUser.id,
      receiverId: targetUserId,
      targetSkill,
      offeredSkill,
      status: 'pending',
      timestamp: serverTimestamp()
    });
  }, [currentUser]);

  const respondToRequest = useCallback(async (requestId, accept) => {
    if (!currentUser) return;
    const reqRef = doc(db, 'requests', requestId);
    await updateDoc(reqRef, { status: accept ? 'accepted' : 'rejected' });

    if (accept) {
      const req = requests.find(r => r.id === requestId);
      if (req) {
        await addDoc(collection(db, 'exchanges'), {
          users: [req.senderId, req.receiverId],
          skills: { [req.senderId]: req.offeredSkill, [req.receiverId]: req.targetSkill },
          status: 'active',
          startedAt: new Date().toISOString()
        });
      }
    }
  }, [currentUser, requests]);

  const addSession = useCallback(async (exchangeId, date, duration, notes) => {
    if (!currentUser) return;
    await addDoc(collection(db, 'sessions'), {
      exchangeId,
      date,
      duration,
      notes,
      loggedBy: currentUser.id,
      timestamp: serverTimestamp()
    });
  }, [currentUser]);

  const sendMessage = useCallback(async (exchangeId, text) => {
    if (!currentUser) return;
    await addDoc(collection(db, `exchanges/${exchangeId}/messages`), {
      text,
      senderId: currentUser.id,
      timestamp: serverTimestamp()
    });
  }, [currentUser]);

  const value = {
    users,
    currentUserProfile,
    requests,
    exchanges,
    sessions,
    messages,
    updateProfile,
    sendRequest,
    respondToRequest,
    addSession,
    sendMessage
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
