import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Check, X, MessageSquare, Calendar, BookOpen, Send, Star } from 'lucide-react';

const ExchangeHub = () => {
  const { currentUser } = useAuth();
  const { 
    requests, 
    exchanges, 
    sessions, 
    respondToRequest, 
    addSession, 
    users, 
    messages, 
    sendMessage 
  } = useData();

  const [activeTab, setActiveTab] = useState('active'); // 'active', 'requests', 'sessions'
  
  // Log Session state
  const [selectedExchangeId, setSelectedExchangeId] = useState(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionDuration, setSessionDuration] = useState('60');
  const [sessionNotes, setSessionNotes] = useState('');

  // Chat state
  const [showChatId, setShowChatId] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  const incomingRequests = requests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');
  const outgoingRequests = requests.filter(r => r.senderId === currentUser.id && r.status === 'pending');
  const activeExchanges = exchanges.filter(e => e.status === 'active' && e.users.includes(currentUser.id));

  const handleLogSession = async (e) => {
    e.preventDefault();
    if (selectedExchangeId && sessionDate && sessionDuration) {
      try {
        await addSession(selectedExchangeId, sessionDate, parseInt(sessionDuration), sessionNotes);
        setSelectedExchangeId(null);
        setSessionDate('');
        setSessionDuration('60');
        setSessionNotes('');
        setActiveTab('sessions');
      } catch (error) {
        console.error("Session logging failed", error);
      }
    }
  };

  const handleSendMessage = async (e, exchangeId) => {
    e.preventDefault();
    if (newMessage.trim()) {
      try {
        await sendMessage(exchangeId, newMessage.trim());
        setNewMessage('');
      } catch (error) {
        console.error("Message send failed", error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exchange Hub</h1>
          <p className="text-slate-500 mt-2">Manage your skill exchanges and track learning sessions.</p>
        </div>
        
        <div className="flex bg-slate-200/50 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'active' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Active ({activeExchanges.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'requests' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Requests ({incomingRequests.length})
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'sessions' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
          >
            History
          </button>
        </div>
      </header>

      {/* ACTIVE EXCHANGES TAB */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          {activeExchanges.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">No active exchanges</h3>
              <p className="text-slate-500 mt-2">Go to Discover to find someone to learn from!</p>
            </div>
          ) : (
            activeExchanges.map(exchange => {
              const partnerId = exchange.users.find(id => id !== currentUser.id);
              const partner = users.find(u => u.id === partnerId);
              const mySkill = exchange.skills[currentUser.id]; 
              const partnerSkill = exchange.skills[partnerId]; 
              
              const exchangeSessions = sessions.filter(s => s.exchangeId === exchange.id);

              return (
                <div key={exchange.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img src={partner?.avatar} alt="" className="w-14 h-14 rounded-full border border-slate-200" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{partner?.name}</h3>
                        <p className="text-sm text-slate-500">Exchanging {mySkill} for {partnerSkill}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setShowChatId(showChatId === exchange.id ? null : exchange.id)}
                        className={`p-2 rounded-xl transition-colors ${showChatId === exchange.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedExchangeId(selectedExchangeId === exchange.id ? null : exchange.id);
                          setShowChatId(null);
                        }}
                        className={`px-4 py-2 font-medium rounded-xl transition-colors ${selectedExchangeId === exchange.id ? 'bg-primary-600 text-white' : 'bg-primary-50 text-primary-700 hover:bg-primary-100'}`}
                      >
                        Log Session
                      </button>
                    </div>
                  </div>
                  
                  {/* Chat Window */}
                  {showChatId === exchange.id && (
                    <div className="border-t border-slate-100 bg-white flex flex-col h-[400px]">
                      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                        {(messages[exchange.id] || []).map((msg, i) => (
                          <div key={i} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                              msg.senderId === currentUser.id ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-slate-800 shadow-sm rounded-tl-none border border-slate-100'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        {(!messages[exchange.id] || messages[exchange.id].length === 0) && (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">Start the conversation!</p>
                          </div>
                        )}
                      </div>
                      <form onSubmit={(e) => handleSendMessage(e, exchange.id)} className="p-4 border-t border-slate-100 flex space-x-2">
                        <input 
                          type="text" 
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <button type="submit" className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-transform active:scale-95">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Log Session Form */}
                  {selectedExchangeId === exchange.id && (
                    <div className="p-6 border-t border-slate-200 bg-white shadow-inner">
                      <h4 className="font-bold text-slate-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-primary-600" /> Log New Session
                      </h4>
                      <form onSubmit={handleLogSession} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                            <input 
                              type="date" 
                              required
                              value={sessionDate}
                              onChange={(e) => setSessionDate(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                            <select 
                              value={sessionDuration}
                              onChange={(e) => setSessionDuration(e.target.value)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                            >
                              <option value="30">30 minutes</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                              <option value="120">2 hours</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                          <textarea 
                            rows="2"
                            value={sessionNotes}
                            onChange={(e) => setSessionNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                            placeholder="What did you cover today?"
                          ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <button 
                            type="button" 
                            onClick={() => setSelectedExchangeId(null)}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                          >
                            Save Session
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {exchangeSessions.length} sessions logged</span>
                    <span className="flex items-center"><Star className="w-3 h-3 mr-1" /> {exchangeSessions.reduce((acc, curr) => acc + curr.duration, 0) / 60} hours total</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === 'requests' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-2">Incoming Requests</h2>
            {incomingRequests.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400">No pending incoming requests.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map(req => {
                  const sender = users.find(u => u.id === req.senderId);
                  return (
                    <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img src={sender?.avatar} alt="" className="w-12 h-12 rounded-full border border-slate-200" />
                        <div>
                          <p className="font-bold text-slate-900">{sender?.name}</p>
                          <p className="text-sm text-slate-500 mt-0.5">
                            Wants to learn <span className="font-semibold text-primary-600">{req.targetSkill}</span> 
                            {' '}and can teach <span className="font-semibold text-blue-600">{req.offeredSkill}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => respondToRequest(req.id, false)}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => respondToRequest(req.id, true)}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 px-2 text-slate-400">Your Sent Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingRequests.map(req => {
                const receiver = users.find(u => u.id === req.receiverId);
                return (
                  <div key={req.id} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={receiver?.avatar} alt="" className="w-10 h-10 rounded-full opacity-60" />
                      <div>
                        <p className="font-medium text-slate-700">To {receiver?.name}</p>
                        <p className="text-xs text-slate-500">Learning {req.targetSkill}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Pending</span>
                  </div>
                );
              })}
              {outgoingRequests.length === 0 && <p className="text-slate-400 text-sm px-2 italic">No sent requests.</p>}
            </div>
          </div>
        </div>
      )}

      {/* SESSIONS HISTORY TAB */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
              <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900">History is empty</h3>
              <p className="text-slate-500 mt-2">Completed sessions will be logged here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(session => {
                const exchange = exchanges.find(e => e.id === session.exchangeId);
                const partnerId = exchange?.users.find(id => id !== currentUser.id);
                const partner = users.find(u => u.id === partnerId);

                return (
                  <div key={session.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 md:mb-0">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <Check className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Session with {partner?.name}</p>
                        <p className="text-sm text-slate-500">{new Date(session.date).toLocaleDateString()} • {session.duration} minutes</p>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="flex-1 md:mx-8 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start space-x-3">
                        <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-slate-600 italic line-clamp-2">{session.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExchangeHub;
