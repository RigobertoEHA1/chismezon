'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import Comentarios from '../components/Comentarios';
import LikesDislikes from '../components/LikesDislikes';
import ModalEditNews from '../components/ModalEditNews';

type News = {
  id: string;
  titulo: string;
  contenido: string;
  imagenes: string[] | null;
  autor: string;
  fecha: string;
  likes: number;
  dislikes: number;
};

type NewsListProps = {
  isAdmin: boolean;
  reload: boolean;
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

export default function NewsList({ isAdmin, reload }: NewsListProps) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [expanded, setExpanded] = useState<{ [id: string]: boolean }>({});
  const [likesRefresh, setLikesRefresh] = useState(0);

  // Album state for all news
  const [album, setAlbum] = useState<{ imgs: string[]; idx: number } | null>(null);

  // Zoom y drag state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);

  // Modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('fecha', { ascending: false });
      if (!error && data) setNews(data as News[]);
      setLoading(false);
    };
    fetchNews();
  }, [reload, refresh]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta noticia?')) return;
    const { error } = await supabase.from('noticias').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar noticia');
    } else {
      toast.success('Noticia eliminada');
      setRefresh(!refresh);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLikeDislike = async (id: string, type: 'like' | 'dislike', currValue: number) => {
    await supabase.from('noticias').update({
      [type === 'like' ? 'likes' : 'dislikes']: currValue + 1,
    }).eq('id', id);
    setLikesRefresh(r => r + 1);
    setRefresh(r => !r);
  };

  const getSiteUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return '';
  };

  const copyLink = (url: string) => {
    if (typeof window !== "undefined" && window.navigator?.clipboard) {
      window.navigator.clipboard.writeText(url);
      toast.success('¡Enlace copiado!');
    }
  };

  // --- MODAL DE IMAGENES: ZOOM Y DRAG ---
  // Eventos de mouse para imagen grande del modal
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

  // Solo click, no drag
  function handleImgClick() {
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    // Zoom cíclico: 1→2→3→1
    setZoom(z => {
      if (z === 1) return 2;
      if (z === 2) return 3;
      return 1;
    });
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

  if (loading) return <div className="text-center text-gray-400">Cargando noticias...</div>;

  return (
    <div className="grid gap-6">
      {news.map((item) => {
        const isLong = item.contenido.length > 300;
        const isExpanded = expanded[item.id];
        const contenidoPreview = isLong && !isExpanded
          ? item.contenido.slice(0, 300) + '...'
          : item.contenido;

        const noticiaUrl = `${getSiteUrl()}/noticia/${item.id}`;

        return (
          <div
            key={item.id}
            id={item.id}
            className="relative bg-white rounded-xl shadow-lg border hover:shadow-2xl transition-all duration-200 p-6 group"
            style={{ wordBreak: 'break-word' }}
          >
            {isAdmin && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={() => {
                    setEditingNews(item);
                    setShowEditModal(true);
                  }}
                  className="bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md hover:scale-110 transition-transform"
                  title="Editar noticia"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-gradient-to-br from-pink-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md hover:scale-110 transition-transform"
                  title="Eliminar noticia"
                >
                  Eliminar
                </button>
              </div>
            )}
            <h2 className="font-semibold text-xl text-pink-600 group-hover:text-purple-600 transition-colors">
              {item.titulo}
            </h2>
            <p className="text-xs text-gray-400 mb-2">{new Date(item.fecha).toLocaleString()}</p>
            <LikesDislikes
              likes={item.likes || 0}
              dislikes={item.dislikes || 0}
              noticiaId={item.id}
              onReact={(type) => handleLikeDislike(item.id, type, type === 'like' ? item.likes || 0 : item.dislikes || 0)}
              refresh={likesRefresh}
            />
            <div className="mb-3 text-gray-700 break-words whitespace-pre-line max-h-64 overflow-auto">
              {linkify(contenidoPreview)}
              {isLong && (
                <button
                  className="text-blue-600 ml-2 underline text-xs"
                  onClick={() => toggleExpand(item.id)}
                >
                  {isExpanded ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>
            {item.imagenes && item.imagenes.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {item.imagenes.map((img, idx) =>
                  img ? (
                    <img
                      key={idx}
                      src={img}
                      alt={`Imagen ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded-lg shadow border border-gray-200 cursor-pointer transition hover:scale-110"
                      onClick={() => {
                        setAlbum({ imgs: item.imagenes as string[], idx });
                        setZoom(1);
                        setOffset({ x: 0, y: 0 });
                      }}
                    />
                  ) : null
                )}
              </div>
            )}
            <div className="text-right text-xs text-blue-500 font-mono">Por: {item.autor}</div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Link
                href={`/noticia/${item.id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow transition"
              >
                Ver noticia
              </Link>
              <button
                onClick={() => copyLink(noticiaUrl)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold shadow transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-3.656-3.656a4 4 0 015.656 0m-5.656 5.656a4 4 0 010-5.656m9.192 1.414a6 6 0 11-8.485-8.485 6 6 0 018.485 8.485z" />
                </svg>
                Copiar enlace
              </button>
            </div>
            <Comentarios noticiaId={item.id} />
          </div>
        );
      })}

      {/* Modal álbum para imágenes */}
      {album && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <div
            className="relative max-w-3xl w-[90vw] flex flex-col items-center"
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className="flex items-center justify-center w-full h-[80vh] bg-black rounded-xl overflow-hidden"
            >
              <img
                src={album.imgs[album.idx]}
                alt={`Imagen ampliada ${album.idx + 1}`}
                className="object-contain w-full h-full max-w-full max-h-full bg-black rounded-xl shadow-lg select-none"
                draggable={false}
                style={{
                  transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                  cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in',
                  userSelect: 'none'
                }}
                onMouseDown={handleImgMouseDown}
                onMouseMove={handleImgMouseMove}
                onMouseUp={handleImgMouseUp}
                onClick={handleImgClick}
                onMouseLeave={handleImgMouseLeave}
                onDragStart={e => e.preventDefault()}
              />
            </div>
            <div className="mt-4 flex justify-center items-center gap-6 w-full">
              <button
                className={`text-2xl font-bold p-2 rounded-full border-2 transition ${
                  album.idx === 0
                    ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-600 hover:scale-110'
                }`}
                onClick={() =>
                  setAlbum({ ...album, idx: album.idx > 0 ? album.idx - 1 : album.idx })
                }
                disabled={album.idx === 0}
                aria-label="Anterior"
              >
                ‹
              </button>
              <button
                className={`text-2xl font-bold p-2 rounded-full border-2 transition ${
                  album.idx === album.imgs.length - 1
                    ? 'bg-gray-300 border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 border-blue-400 text-white hover:bg-blue-700 hover:border-blue-600 hover:scale-110'
                }`}
                onClick={() =>
                  setAlbum({
                    ...album,
                    idx: album.idx < album.imgs.length - 1 ? album.idx + 1 : album.idx,
                  })
                }
                disabled={album.idx === album.imgs.length - 1}
                aria-label="Siguiente"
              >
                ›
              </button>
            </div>
            <button
              className="absolute top-3 right-3 bg-pink-600 border-2 border-white text-white font-bold p-2 rounded-full text-xl shadow-lg hover:bg-pink-700 hover:scale-110 transition"
              onClick={() => {
                setAlbum(null);
                setZoom(1);
                setOffset({ x: 0, y: 0 });
              }}
              title="Cerrar"
              aria-label="Cerrar"
            >
              ×
            </button>
            {zoom > 1 && (
              <button
                className="absolute bottom-4 right-4 bg-gray-800/80 text-white px-3 py-1 rounded shadow"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                Restablecer zoom
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de edición */}
      <ModalEditNews
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        noticia={editingNews}
        onEdited={() => setRefresh(r => !r)}
      />
    </div>
  );
}
