'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type Comment = {
  id: string;
  contenido: string;
  fecha: string;
  comentario_padre: string | null;
};

export default function Comentarios({
  noticiaId,
  comentarioPadre = null,
  nivel = 0,
  refresh = 0,
  onNuevoComentario,
}: {
  noticiaId: string;
  comentarioPadre?: string | null;
  nivel?: number;
  refresh?: number;
  onNuevoComentario?: () => void;
}) {
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [nuevo, setNuevo] = useState('');
  const [respondiendo, setRespondiendo] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshChild, setRefreshChild] = useState(0);

  const fetchComentarios = async () => {
    let query = supabase
      .from('comentarios')
      .select('*')
      .eq('noticia_id', noticiaId)
      .order('fecha', { ascending: true });

    if (comentarioPadre === undefined || comentarioPadre === null) {
      query = query.is('comentario_padre', null);
    } else {
      query = query.eq('comentario_padre', comentarioPadre);
    }

    const { data } = await query;
    setComentarios(data || []);
  };

  useEffect(() => {
    fetchComentarios();
    // eslint-disable-next-line
  }, [noticiaId, comentarioPadre, refresh]);

  const handleNuevoComentario = () => {
    setRefreshChild(r => r + 1); // fuerza refresh en el hijo
    if (onNuevoComentario) onNuevoComentario();
  };

  const agregarComentario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.trim()) return;
    setLoading(true);
    await supabase.from('comentarios').insert([
      { noticia_id: noticiaId, contenido: nuevo, comentario_padre: comentarioPadre === undefined ? null : comentarioPadre }
    ]);
    setNuevo('');
    setLoading(false);
    handleNuevoComentario();
    fetchComentarios();
  };

  const responderComentario = async (e: React.FormEvent, padreId: string) => {
    e.preventDefault();
    if (!respuesta.trim()) return;
    setLoading(true);
    await supabase.from('comentarios').insert([
      { noticia_id: noticiaId, contenido: respuesta, comentario_padre: padreId }
    ]);
    setRespuesta('');
    setRespondiendo(null);
    setLoading(false);
    handleNuevoComentario();
    fetchComentarios();
  };

  return (
    <div className={`${nivel === 0 ? 'bg-gray-50' : 'bg-gray-100'} mt-4 rounded p-3 border`}>
      {nivel === 0 && (
        <>
          <div className="font-medium text-xs text-gray-700 mb-2">Comentarios</div>
          <form onSubmit={agregarComentario} className="flex gap-2 mb-2">
            <input
              className="border rounded p-1 flex-1 text-xs bg-white text-gray-900"
              placeholder="Escribe un comentario..."
              value={nuevo}
              onChange={e => setNuevo(e.target.value)}
              disabled={loading}
              maxLength={300}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
              disabled={loading}
            >
              Comentar
            </button>
          </form>
        </>
      )}

      <div className="space-y-2">
        {comentarios.map(c => (
          <div key={c.id} className="bg-white p-2 rounded border text-xs">
            <div>
              <span className="font-bold text-gray-500 mr-2">Anónimo:</span>
              <span className="text-gray-900">{c.contenido}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {nivel === 0 && (
                <button
                  className="text-blue-500 text-xs underline"
                  onClick={() => setRespondiendo(respondiendo === c.id ? null : c.id)}
                >
                  Responder
                </button>
              )}
              <span className="text-gray-400 text-[10px]">{new Date(c.fecha).toLocaleString()}</span>
            </div>
            {/* Formulario de respuesta solo para comentarios de nivel 0 */}
            {respondiendo === c.id && nivel === 0 && (
              <form className="flex gap-2 mt-1" onSubmit={e => responderComentario(e, c.id)}>
                <input
                  className="border rounded p-1 flex-1 text-xs bg-white text-gray-900"
                  placeholder="Escribe una respuesta..."
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  disabled={loading}
                  maxLength={300}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                  disabled={loading}
                >
                  Responder
                </button>
              </form>
            )}
            {/* Render recursivo solo para un nivel de hijos */}
            {nivel === 0 && (
              <div className="ml-4">
                <Comentarios
                  noticiaId={noticiaId}
                  comentarioPadre={c.id}
                  nivel={nivel + 1}
                  refresh={refreshChild}
                />
              </div>
            )}
          </div>
        ))}
        {comentarios.length === 0 && nivel === 0 && (
          <div className="text-xs text-gray-400">Sé el primero en comentar</div>
        )}
      </div>
    </div>
  );
}
