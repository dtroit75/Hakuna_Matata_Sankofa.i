import React, { useState } from 'react';
import { moderateContent } from '../services/geminiService';
import { CommunityPost } from '../types';

const CulturalExchange: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      author: 'Kwame M.',
      title: 'Grandmother’s Kente',
      content: 'This Kente cloth has been in my family for 3 generations. The pattern represents "Abusua Pa" (Good Family).',
      likes: 12,
      aiCuratorNote: 'A beautiful example of heritage preservation. "Abusua Pa" emphasizes the strength of family bonds in Akan culture.',
      timestamp: new Date()
    },
    {
      id: '2',
      author: 'Zainab A.',
      title: 'Favorite Swahili Proverb',
      content: 'Haba na haba hujaza kibaba. (Little by little fills the pot). Reminds me to be patient.',
      likes: 8,
      aiCuratorNote: 'An excellent choice. This proverb teaches patience, persistence, and the value of small savings or efforts.',
      timestamp: new Date()
    }
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<'feed' | 'submit'>('feed');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsSubmitting(true);
    try {
      const moderationResult = await moderateContent(newContent, newImage || undefined);

      if (moderationResult === "UNSAFE") {
        alert("Your submission was flagged as culturally insensitive or inappropriate and cannot be posted.");
      } else {
        const newPost: CommunityPost = {
          id: Date.now().toString(),
          author: 'You (Guest)',
          title: newTitle,
          content: newContent,
          image: newImage || undefined,
          likes: 0,
          aiCuratorNote: moderationResult,
          timestamp: new Date()
        };
        setPosts([newPost, ...posts]);
        setView('feed');
        setNewTitle('');
        setNewContent('');
        setNewImage(null);
      }
    } catch (error) {
      console.error(error);
      alert("Error processing submission. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-800">Cultural Exchange</h2>
          <p className="text-stone-600">Share your heritage, stories, and artifacts with the community.</p>
        </div>
        <div className="flex bg-stone-200 rounded-lg p-1">
          <button
            onClick={() => setView('feed')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'feed' ? 'bg-white shadow text-amber-800' : 'text-stone-500'}`}
          >
            Community Feed
          </button>
          <button
            onClick={() => setView('submit')}
            className={`px-4 py-2 rounded-md font-medium transition-all ${view === 'submit' ? 'bg-white shadow text-amber-800' : 'text-stone-500'}`}
          >
            Share Story
          </button>
        </div>
      </div>

      {view === 'feed' ? (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-stone-800">{post.title}</h3>
                    <p className="text-sm text-stone-500">by {post.author} • {post.timestamp.toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <span>♥</span> {post.likes}
                  </div>
                </div>
                
                {post.image && (
                  <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-lg mb-4" />
                )}
                
                <p className="text-stone-800 mb-4 leading-relaxed">{post.content}</p>

                {post.aiCuratorNote && (
                  <div className="bg-stone-50 p-4 rounded-lg border-l-4 border-amber-500">
                    <p className="text-xs font-bold text-amber-600 uppercase mb-1">AI Curator Note</p>
                    <p className="text-sm text-stone-600 italic">{post.aiCuratorNote}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-stone-200">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Contribute to the Archive</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                placeholder="Name of artifact or story title"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Your Story/Description</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-lg h-32 focus:ring-2 focus:ring-amber-500"
                placeholder="Describe the significance, history, or meaning..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">Upload Image (Optional)</label>
              <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-stone-50">
                {newImage ? (
                  <img src={newImage} alt="Preview" className="h-40 object-contain" />
                ) : (
                  <span className="text-stone-400">Click to upload artifact photo</span>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
              <span className="font-bold">Note:</span> Your submission will be reviewed by our AI Curator for cultural sensitivity before being posted.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Curating Submission...' : 'Share with Community'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CulturalExchange;
