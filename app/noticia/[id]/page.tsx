'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import LikesDislikes from '../../../components/LikesDislikes';
import Comentarios from '../../../components/Comentarios';

type Noticia = {
  id: string;
  titulo: string;
  contenido: string;
  imagenes: string[] | null;
  autor: string;
  fecha: string;
  likes: number;
  dislikes: number;
};

export default function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [data, setData] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [likesRefresh, setLikesRefresh] = useState(0);
  const [albumIdx, setAlbumIdx] = useState<number | null>(null);

  // Fetch noticia individual
  const fetchNoticia = async () => {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) setData(data);
    setLoading(false);
  };

  function linkify(text: string) {
    const urlRegex = /((https?:\/\/[^\s]+)|(www\.[^\s]+))/g;
    const html = text.replace(urlRegex, (url) => {
      let href = url;
      if (url.startsWith('www.')) {
        href = 'https://' + url;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all">${url}</a>`;
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }
  

  useEffect(() => {
    fetchNoticia();
    // eslint-disable-next-line
  }, [id]);

  const handleLikeDislike = async (type: 'like' | 'dislike') => {
    if (!data) return;
    await supabase.from('noticias').update({
      [type === 'like' ? 'likes' : 'dislikes']: (type === 'like' ? data.likes : data.dislikes) + 1,
    }).eq('id', data.id);
    setLikesRefresh(r => r + 1);
    fetchNoticia();
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Cargando...</div>;
  if (!data) return <div className="text-center py-8 text-gray-400">Noticia no encontrada.</div>;

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-2 text-blue-600">{data.titulo}</h1>
      <p className="text-xs text-gray-400 mb-2">{new Date(data.fecha).toLocaleString()}</p>
      <LikesDislikes
        likes={data.likes || 0}
        dislikes={data.dislikes || 0}
        noticiaId={data.id}
        onReact={handleLikeDislike}
        refresh={likesRefresh}
      />
      <div className="mb-3 text-gray-700 whitespace-pre-line"> {linkify(data.contenido)}</div>

      {/* Imágenes tipo álbum */}
      {data.imagenes && data.imagenes.length > 0 && (
        <>
          <div className="flex gap-2 flex-wrap mb-2">
            {data.imagenes.map((img: string, idx: number) =>
              img ? (
                <img
                  key={idx}
                  src={img}
                  alt={`Imagen ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg shadow border border-gray-200 cursor-pointer transition hover:scale-110"
                  onClick={() => setAlbumIdx(idx)}
                />
              ) : null
            )}
          </div>

          {/* Modal tipo álbum */}
          {albumIdx !== null && albumIdx >= 0 && albumIdx < data.imagenes!.length && (
            <div
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
              onClick={() => setAlbumIdx(null)}
            >
              <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img
                  src={data.imagenes![albumIdx]}
                  alt={`Imagen ampliada ${albumIdx + 1}`}
                  className="max-h-[80vh] max-w-full rounded-xl shadow-lg"
                />
                <div className="mt-4 flex justify-center items-center gap-6 w-full">
                  <button
                    className={`text-2xl font-bold p-2 rounded-full border-2 transition ${
                      albumIdx === 0
                        ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-600 hover:scale-110'
                    }`}
                    onClick={() => setAlbumIdx(albumIdx > 0 ? albumIdx - 1 : albumIdx)}
                    disabled={albumIdx === 0}
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    className={`text-2xl font-bold p-2 rounded-full border-2 transition ${
                      albumIdx === data.imagenes!.length - 1
                        ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-600 hover:scale-110'
                    }`}
                    onClick={() => setAlbumIdx(albumIdx < data.imagenes!.length - 1 ? albumIdx + 1 : albumIdx)}
                    disabled={albumIdx === data.imagenes!.length - 1}
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                </div>
                <button
                  className="absolute top-3 right-3 bg-pink-600 border-2 border-white text-white font-bold p-2 rounded-full text-xl shadow-lg hover:bg-pink-700 hover:scale-110 transition"
                  onClick={() => setAlbumIdx(null)}
                  title="Cerrar"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="text-right text-xs text-blue-500 font-mono mb-4">Por: {data.autor}</div>
      <Comentarios noticiaId={data.id} />
    </main>
  );
}
