'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import LikesDislikes from '../../../components/LikesDislikes';
import Comentarios from '../../../components/Comentarios';
import ImageAlbumModal from '../../../components/ImageAlbumModal';
import React from "react";
import Image from 'next/image';

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

  // Álbum modal state
  const [album, setAlbum] = useState<{ imgs: string[]; idx: number } | null>(null);
  // Zoom y drag
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchNoticia = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .eq('id', id)
        .single();
      if (!error && data && mounted) setData(data);
      setLoading(false);
    };
    fetchNoticia();
    return () => { mounted = false; };
  }, [id, likesRefresh]);

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

  const handleLikeDislike = async (type: 'like' | 'dislike') => {
    if (!data) return;
    await supabase.from('noticias').update({
      [type === 'like' ? 'likes' : 'dislikes']: (type === 'like' ? data.likes : data.dislikes) + 1,
    }).eq('id', data.id);
    setLikesRefresh(r => r + 1);
  };

  // --- MODAL DE IMAGENES: ZOOM Y DRAG ---
  function handleImgMouseDown(e: React.MouseEvent<HTMLImageElement>) {
    if (zoom === 1) return;
    setDragging(true);
    setHasDragged(false);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  }
  function handleImgMouseMove(e: React.MouseEvent<HTMLImageElement>) {
    if (!dragging || !start) return;
    setOffset({
      x: e.clientX - start.x,
      y: e.clientY - start.y,
    });
    setHasDragged(true);
  }
  function handleImgMouseUp() {
    if (dragging) {
      setDragging(false);
      setStart(null);
    }
  }
  function handleImgClick() {
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    setZoom(z => (z === 1 ? 2 : z === 2 ? 3 : 1));
    setOffset({ x: 0, y: 0 });
  }
  function handleImgMouseLeave() {
    setDragging(false);
    setStart(null);
    setHasDragged(false);
  }
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      setAlbum(null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-400 text-lg animate-pulse">Cargando...</div>;
  if (!data) return <div className="text-center py-12 text-gray-400 text-lg">Noticia no encontrada.</div>;

  return (
    <main className="max-w-2xl mx-auto p-2 sm:p-6 bg-white rounded-xl shadow-md sm:shadow-lg border transition-all">
      <h1 className="text-xl sm:text-2xl font-bold mb-2 text-blue-600 break-words">{data.titulo}</h1>
      <p className="text-xs text-gray-400 mb-2">{new Date(data.fecha).toLocaleString()}</p>
      <LikesDislikes
        likes={data.likes || 0}
        dislikes={data.dislikes || 0}
        noticiaId={data.id}
        onReact={handleLikeDislike}
        refresh={likesRefresh}
      />
      <div className="mb-3 text-gray-700 whitespace-pre-line break-words">{linkify(data.contenido)}</div>

      import Image from 'next/image';
// ...resto del código...
{data.imagenes && data.imagenes.length > 0 && (
  <>
    {/* Thumbnails */}
    <div className="flex gap-2 flex-wrap mb-2">
      {data.imagenes.map((img, idx) =>
        img ? (
          <div key={idx} className="w-16 h-16 relative">
            <Image
              src={img}
              alt={`Imagen ${idx + 1}`}
              fill
              className="object-cover rounded-lg shadow border border-gray-200 cursor-pointer hover:scale-110 transition"
              onClick={() => {
                setAlbum({ imgs: data.imagenes as string[], idx });
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              unoptimized
              sizes="64px"
            />
          </div>
        ) : null
      )}
    </div>
    {/* Modal álbum para imágenes */}
    {album && (
      <ImageAlbumModal
        album={album}
        setAlbum={setAlbum}
        zoom={zoom}
        setZoom={setZoom}
        offset={offset}
        setOffset={setOffset}
        dragging={dragging}
        setDragging={setDragging}
        start={start}
        setStart={setStart}
        hasDragged={hasDragged}
        setHasDragged={setHasDragged}
        handleImgMouseDown={handleImgMouseDown}
        handleImgMouseMove={handleImgMouseMove}
        handleImgMouseUp={handleImgMouseUp}
        handleImgClick={handleImgClick}
        handleImgMouseLeave={handleImgMouseLeave}
        handleBackdropClick={handleBackdropClick}
      />
    )}
  </>
)}

      <div className="text-right text-xs text-blue-500 font-mono mb-4">Por: {data.autor}</div>
      <Comentarios noticiaId={data.id} />
    </main>
  );
}
