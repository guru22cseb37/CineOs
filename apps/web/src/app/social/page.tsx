'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Users, Heart, ShieldCheck, UserPlus } from 'lucide-react';
import UserDNACard from '@/components/social/UserDNACard';
import { API_BASE } from '@/lib/api';

export default function SocialPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: searchResults } = useQuery({
    queryKey: ['user-search', searchQuery],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/social/search?query=${searchQuery}`);
      return res.json();
    },
    enabled: searchQuery.length > 2
  });

  return (
    <div className="min-h-screen pb-32 pt-24 container mx-auto px-4 md:px-12">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Left Column: Your DNA */}
        <div className="lg:w-1/3">
          <div className="sticky top-24">
            <h1 className="text-sm font-black text-cinema-primary uppercase tracking-[0.4em] mb-2">Social Network</h1>
            <h2 className="text-4xl font-black text-white italic mb-12">Taste Profile</h2>
            <UserDNACard />
          </div>
        </div>

        {/* Right Column: Friends & Discovery */}
        <div className="flex-1">
          <div className="mb-12">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input 
                type="text"
                placeholder="Search fellow cinephiles by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-white focus:outline-none focus:border-cinema-primary/50 transition-all font-medium"
              />
            </div>
          </div>

          {!searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[2.5rem] bg-cinema-glass border border-white/5 flex flex-col justify-between h-64">
                <Users className="w-10 h-10 text-cinema-primary" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Connect with Friends</h3>
                  <p className="text-sm text-cinema-muted">See what they're watching and compare your cinematic DNA.</p>
                </div>
              </div>
              <div className="p-8 rounded-[2.5rem] bg-cinema-primary/10 border border-cinema-primary/20 flex flex-col justify-between h-64">
                <ShieldCheck className="w-10 h-10 text-cinema-primary" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Verified Taste</h3>
                  <p className="text-sm text-cinema-muted">Unlock social badges by having high compatibility scores with the community.</p>
                </div>
              </div>
            </div>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white/30 uppercase tracking-widest mb-6">Discovery Results</h3>
              {searchResults.map((user: any) => (
                <SearchResultCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultCard({ user }: { user: any }) {
  const { data: compatibility } = useQuery({
    queryKey: ['compatibility', user._id],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/social/compatibility/${user._id}`);
      return res.json();
    }
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
    >
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-cinema-primary/20 flex items-center justify-center text-xl font-black text-cinema-primary border border-cinema-primary/20">
          {user.name?.[0] || 'C'}
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">{user.name}</h4>
          <div className="flex items-center space-x-3 mt-1">
            <div className="flex items-center space-x-1 text-cinema-primary font-black text-[10px] uppercase">
              <Heart className="w-3 h-3 fill-current" />
              <span>{compatibility?.score || 0}% Taste Match</span>
            </div>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-[10px] font-bold text-cinema-muted uppercase tracking-tighter">{compatibility?.commonMovies || 0} Common Movies</span>
          </div>
        </div>
      </div>
      
      <button className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-xl font-black text-xs hover:bg-cinema-gold transition-all">
        <UserPlus className="w-3 h-3" />
        <span>Connect</span>
      </button>
    </motion.div>
  );
}
