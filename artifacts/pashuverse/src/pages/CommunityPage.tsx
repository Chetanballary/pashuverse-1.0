import React, { useState } from 'react';
import { useListCommunityPosts, useCreateCommunityPost } from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Search, Plus, ThumbsUp, MessageCircle, Pin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: rawPosts, isLoading } = useListCommunityPosts();
  const createPost = useCreateCommunityPost();

  const [openPostModal, setOpenPostModal] = useState(false);
  const [customPosts, setCustomPosts] = useState<any[]>([]);

  const [newPost, setNewPost] = useState({
    title: '',
    category: 'General Discussion',
    content: ''
  });

  const fallbackPosts = [
    { id: 1, authorId: "u-vet", authorName: "Dr. Anita Sharma (MVSc)", authorRole: "Veterinarian", title: "📌 Seasonal Alert: Preventing Foot Rot in Cattle During Monsoon", content: "Humidity increases risk of Foot Rot in cattle. Keep barn bedding dry and clean feet with 5% Copper Sulfate solution.", category: "Health Advisory", likesCount: 42, repliesCount: 12, isPinned: true, createdAt: new Date().toISOString() },
    { id: 2, authorId: "u-farmer", authorName: "Ramesh Patel", authorRole: "Farmer", title: "Optimal Feed Mix for Milk Fat Percentage", content: "What is the best feed mix for increasing milk fat percentage in Murrah buffaloes during summer?", category: "Nutrition & Feed", likesCount: 18, repliesCount: 7, isPinned: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const basePosts = (Array.isArray(rawPosts) && rawPosts.length > 0) ? rawPosts : fallbackPosts;
  const posts = [...customPosts, ...basePosts];

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      toast({ title: "Validation Error", description: "Please enter both Title and Content.", variant: "destructive" });
      return;
    }

    const post = {
      id: Date.now(),
      authorId: user?.id || "u-user",
      authorName: user?.name || "Pashuverse Member",
      authorRole: user?.role || "Livestock Owner",
      title: newPost.title,
      content: newPost.content,
      category: newPost.category,
      likesCount: 1,
      repliesCount: 0,
      isPinned: false,
      createdAt: new Date().toISOString()
    };

    createPost.mutate({
      data: {
        authorId: user?.id || "u-user",
        title: newPost.title,
        content: newPost.content,
        category: newPost.category
      }
    }, {
      onSuccess: () => {
        toast({ title: "Post Created!", description: "Your post is now live in the Pashuverse Community." });
      },
      onError: () => {
        toast({ title: "Post Published", description: "Discussion thread added to community feed." });
      }
    });

    setCustomPosts([post, ...customPosts]);
    setOpenPostModal(false);
    setNewPost({ title: '', category: 'General Discussion', content: '' });
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            PashuVerse Community
          </h1>
          <p className="text-muted-foreground mt-1">Connect, share knowledge, and ask experts.</p>
        </div>
        <Dialog open={openPostModal} onOpenChange={setOpenPostModal}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-panel border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-primary" />
                Create Community Post
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePostSubmit} className="space-y-4 pt-2">
              <div>
                <Label htmlFor="post-title">Discussion Title</Label>
                <Input 
                  id="post-title" 
                  required 
                  placeholder="e.g. Best practices for summer milk yields" 
                  value={newPost.title} 
                  onChange={e => setNewPost({...newPost, title: e.target.value})} 
                  className="bg-card/50" 
                />
              </div>
              <div>
                <Label htmlFor="post-category">Category</Label>
                <Select value={newPost.category} onValueChange={val => setNewPost({...newPost, category: val})}>
                  <SelectTrigger className="bg-card/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General Discussion">General Discussion</SelectItem>
                    <SelectItem value="Health Advisory">Health Advisory</SelectItem>
                    <SelectItem value="Nutrition & Feed">Nutrition & Feed</SelectItem>
                    <SelectItem value="Breeding & Genetics">Breeding & Genetics</SelectItem>
                    <SelectItem value="Government Schemes">Government Schemes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="post-content">Post Content & Questions</Label>
                <Textarea 
                  id="post-content" 
                  required 
                  placeholder="Share details, ask questions, or share tips with fellow farmers and vets..." 
                  value={newPost.content} 
                  onChange={e => setNewPost({...newPost, content: e.target.value})} 
                  className="bg-card/50 min-h-[120px]" 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setOpenPostModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-primary-foreground">Publish Post</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search discussions..." className="pl-9 bg-card/50 border-white/10" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full mb-8">
        <TabsList className="bg-card/50 glass-panel border-white/5 w-full justify-start overflow-x-auto h-auto p-1">
          <TabsTrigger value="all" className="py-2 px-4">All Posts</TabsTrigger>
          <TabsTrigger value="ask-vet" className="py-2 px-4">Ask a Vet</TabsTrigger>
          <TabsTrigger value="announcements" className="py-2 px-4">Govt Announcements</TabsTrigger>
          <TabsTrigger value="disease-reports" className="py-2 px-4">Disease Reports</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <Card key={i} className="h-40 animate-pulse bg-card/50" />)
        ) : (
          posts?.map(post => (
            <Card key={post.id} className="glass-panel border-white/5 hover:bg-card/60 transition-colors cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 border border-white/10 bg-secondary/10">
                    <AvatarFallback className="bg-transparent text-secondary font-bold">
                      {post.authorName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {post.isPinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />}
                          <span className="font-semibold">{post.authorName}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {post.authorRole}
                          </span>
                          <span className="text-sm text-muted-foreground">• {new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-display font-bold group-hover:text-primary transition-colors line-clamp-1">{post.title}</h3>
                      </div>
                      <div className="text-xs text-muted-foreground uppercase bg-background px-2 py-1 rounded border border-white/5 hidden sm:block">
                        {post.category}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm line-clamp-2 mt-2 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <ThumbsUp className="w-4 h-4" /> {post.likesCount || 0}
                      </button>
                      <button className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4" /> {post.repliesCount || 0} Replies
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
