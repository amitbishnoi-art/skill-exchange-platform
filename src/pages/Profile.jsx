import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Save, Plus, X } from 'lucide-react';

const Profile = () => {
  const { currentUser } = useAuth();
  const { currentUserProfile, updateProfile } = useData();

  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [experience, setExperience] = useState('Beginner');
  const [availability, setAvailability] = useState('Weekends');
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUserProfile) {
      setSkillsOffered(currentUserProfile.skillsOffered || []);
      setSkillsWanted(currentUserProfile.skillsWanted || []);
      setExperience(currentUserProfile.experience || 'Beginner');
      setAvailability(currentUserProfile.availability || 'Weekends');
    }
  }, [currentUserProfile]);

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      skillsOffered,
      skillsWanted,
      experience,
      availability
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addSkill = (type) => {
    if (type === 'offered' && newSkillOffered.trim()) {
      if (!skillsOffered.includes(newSkillOffered.trim())) {
        setSkillsOffered([...skillsOffered, newSkillOffered.trim()]);
      }
      setNewSkillOffered('');
    } else if (type === 'wanted' && newSkillWanted.trim()) {
      if (!skillsWanted.includes(newSkillWanted.trim())) {
        setSkillsWanted([...skillsWanted, newSkillWanted.trim()]);
      }
      setNewSkillWanted('');
    }
  };

  const removeSkill = (type, skillToRemove) => {
    if (type === 'offered') {
      setSkillsOffered(skillsOffered.filter(s => s !== skillToRemove));
    } else {
      setSkillsWanted(skillsWanted.filter(s => s !== skillToRemove));
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
        <p className="text-slate-500 mt-2">Manage your skills and preferences to get better matches.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Basic Info (Read Only) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center space-x-6 shadow-sm">
          <img src={currentUser?.avatar} alt="" className="w-20 h-20 rounded-full border border-slate-200" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser?.name}</h2>
            <p className="text-slate-500">{currentUser?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Skills Offered */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-blue-500 rounded-full mr-2"></span>
              Skills You Can Teach
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsOffered.map(skill => (
                <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {skill}
                  <button type="button" onClick={() => removeSkill('offered', skill)} className="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {skillsOffered.length === 0 && <p className="text-sm text-slate-400">No skills added yet.</p>}
            </div>

            <div className="flex space-x-2">
              <input 
                type="text" 
                value={newSkillOffered}
                onChange={(e) => setNewSkillOffered(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('offered'))}
                placeholder="e.g. React, Guitar"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <button 
                type="button" 
                onClick={() => addSkill('offered')}
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-green-500 rounded-full mr-2"></span>
              Skills You Want to Learn
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {skillsWanted.map(skill => (
                <span key={skill} className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                  {skill}
                  <button type="button" onClick={() => removeSkill('wanted', skill)} className="ml-2 text-green-400 hover:text-green-600 focus:outline-none">
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
              {skillsWanted.length === 0 && <p className="text-sm text-slate-400">No skills added yet.</p>}
            </div>

            <div className="flex space-x-2">
              <input 
                type="text" 
                value={newSkillWanted}
                onChange={(e) => setNewSkillWanted(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('wanted'))}
                placeholder="e.g. Figma, Spanish"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
              <button 
                type="button" 
                onClick={() => addSkill('wanted')}
                className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Preferences</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Teaching Experience Level</label>
              <select 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">General Availability</label>
              <select 
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="Weekdays (Evening)">Weekdays (Evening)</option>
                <option value="Weekdays (Morning)">Weekdays (Morning)</option>
                <option value="Weekends">Weekends</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-slate-200">
          {saved && <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">Profile updated successfully!</span>}
          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
