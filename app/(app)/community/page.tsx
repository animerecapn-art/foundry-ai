'use client';

import { motion } from 'framer-motion';
import { Users, Heart, MessageSquare, Pin, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockCommunityPosts } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';

export default function CommunityPage() {
  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Community</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Connect with 12,000+ founders building the next big thing
          </p>
        </div>
        <Button variant="gradient" className="gap-2">
          <MessageSquare className="w-4 h-4" />
          Share Your Story
        </Button>
      </motion.div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Members', value: '12,483' },
          { label: 'Posts This Week', value: '847' },
          { label: 'Ideas Shared', value: '3,291' },
        ].map((stat, i) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="font-display text-xl font-bold gradient-text">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Trending Posts</h2>
        </div>
        {mockCommunityPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="group rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-all cursor-pointer"
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{post.author.name}</span>
                    <span className="text-xs text-muted-foreground">{post.author.role}</span>
                    {post.pinned && (
                      <Badge variant="default" className="text-xs gap-1">
                        <Pin className="w-2.5 h-2.5" /> Pinned
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{formatRelativeTime(post.createdAt)}</span>
                  </div>
                  <h3 className="font-display font-semibold mt-1.5 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.content}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-3 text-muted-foreground">
                      <button className="flex items-center gap-1 text-xs hover:text-rose-500 transition-colors">
                        <Heart className="w-3.5 h-3.5" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-xs hover:text-primary transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.comments}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
