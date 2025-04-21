'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  noticia: {
    id: string;
    titulo: string;
    contenido: string;
    imagenes: string[] | null;
    autor: string;
  } | null;
  onEdited: () => void;
};

export default function ModalEditNews({ isOpen, onClose, noticia, onEdited }: Props) {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [author, setAuthor] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [nuevaImagen, setNuevaImagen] = useState('');
  const [uploading, setUploading] = useState(false);

  // Cargar datos de la noticia al abrir el modal
  useEffect(() => {
    if (noticia) {
      setTitulo(noticia.titulo);
      setContenido(noticia.contenido);
      setAuthor(noticia.autor);
      setImagenes(noticia.imagenes || []);
    }
  }, [noticia, isOpen]);

  // Subida directa a Supabase Storage
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const { error } = await supabase.storage.from('noticias').upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      toast.error('Error al subir imagen');
    } else {
      const { data } = supabase.storage.from('noticias').getPublicUrl(fileName);
      setImagenes([...imagenes, data.publicUrl]);
      toast.success('Imagen subida');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!titulo.trim() || !contenido.trim() || !author.trim()) {
      setErrorMsg('Llena todos los campos requeridos.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('noticias').update({
      titulo,
      contenido,
      imagenes: imagenes.length > 0 ? imagenes : null,
      autor: author,
    }).eq('id', noticia?.id);

    setLoading(false);

    if (error) {
      setErrorMsg('Error al editar noticia.');
    } else {
      toast.success('Noticia editada');
      onEdited();
      onClose();
    }
  };

  const handleAddImagen = () => {
    if (nuevaImagen.trim().length > 0) {
      setImagenes([...imagenes, nuevaImagen.trim()]);
      setNuevaImagen('');
    }
  };

  const handleRemoveImagen = (idx: number) => {
    setImagenes(imagenes.filter((_, i) => i !== idx));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-2xl border border-blue-100 transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-blue-600 mb-2"
                >
                  Editar Noticia
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-700 text-gray-900"
                    placeholder="Título *"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    required
                  />
                  <textarea
                    className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-pink-200 placeholder-gray-700 text-gray-900"
                    placeholder="Descripción o contenido *"
                    value={contenido}
                    onChange={e => setContenido(e.target.value)}
                    required
                    rows={3}
                  />
                  {/* Gestión de imágenes */}
                  <div>
                    <label className="block font-medium text-sm text-gray-800 mb-1">Imágenes</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        className="border flex-1 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-gray-700 text-gray-900"
                        placeholder="URL de imagen"
                        value={nuevaImagen}
                        onChange={e => setNuevaImagen(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddImagen}
                        disabled={!nuevaImagen.trim()}
                        className="bg-gradient-to-br from-purple-500 to-pink-500 text-white px-3 py-2 rounded-full shadow hover:brightness-110 transition disabled:opacity-50"
                      >
                        Agregar imagen
                      </button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <label
                        htmlFor="file-upload"
                        className="flex items-center bg-gradient-to-br from-blue-500 to-pink-500 text-white px-3 py-2 rounded-full shadow hover:brightness-110 cursor-pointer transition text-sm"
                        tabIndex={0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                        </svg>
                        Subir imagen
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                      {uploading && <span className="text-xs text-blue-500 self-center">Subiendo...</span>}
                    </div>
                    {imagenes.length > 0 && (
                      <ul className="space-y-2">
                        {imagenes.map((img, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs break-all">
                            <img src={img} alt="" className="w-10 h-10 object-cover rounded border" />
                            <span className="flex-1">{img}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveImagen(idx)}
                              className="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 text-xs"
                              title="Quitar imagen"
                            >
                              Quitar
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <input
                    type="text"
                    className="border w-full p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-700 text-gray-900"
                    placeholder="Autor *"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    required
                  />
                  {errorMsg && (
                    <div className="text-red-500 text-xs mb-2">{errorMsg}</div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-gradient-to-br from-blue-500 to-pink-500 text-white px-4 py-2 rounded-full w-full shadow font-semibold hover:brightness-110 hover:scale-105 transition-all"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full w-full shadow hover:bg-gray-200 transition-all"
                      onClick={onClose}
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
