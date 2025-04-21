'use client';

import { useEffect, useState } from 'react';

type Props = {
  likes: number;
  dislikes: number;
  noticiaId: string;
  onReact: (type: 'like' | 'dislike') => void;
  refresh?: number; // Este prop forzará releer localStorage cuando cambie
};

export default function LikesDislikes({ likes, dislikes, noticiaId, onReact, refresh }: Props) {
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    const reactions = JSON.parse(localStorage.getItem('news-reactions') || '{}');
    if (reactions[noticiaId]) {
      setUserReaction(reactions[noticiaId]);
    } else {
      setUserReaction(null);
    }
  }, [noticiaId, refresh]); // <-- refresh aquí

  const handleReact = (type: 'like' | 'dislike') => {
    if (userReaction) return;
    onReact(type);
    const reactions = JSON.parse(localStorage.getItem('news-reactions') || '{}');
    reactions[noticiaId] = type;
    localStorage.setItem('news-reactions', JSON.stringify(reactions));
    setUserReaction(type);
  };

  return (
    <div className="flex items-center gap-2 mb-2">
      <button
        onClick={() => handleReact('like')}
        className={`bg-green-100 px-2 py-1 rounded text-green-700 text-xs font-bold hover:bg-green-200 ${userReaction ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!!userReaction}
      >
        👍 {likes}
      </button>
      <button
        onClick={() => handleReact('dislike')}
        className={`bg-red-100 px-2 py-1 rounded text-red-700 text-xs font-bold hover:bg-red-200 ${userReaction ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={!!userReaction}
      >
        👎 {dislikes}
      </button>
      {userReaction && (
        <span className="text-gray-400 text-xs ml-2">¡Ya votaste!</span>
      )}
    </div>
  );
}
