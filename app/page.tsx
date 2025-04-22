'use client';

import { useState, useEffect } from 'react';
import NewsList from '../components/NewsList';
import ModalLogin from '../components/ModalLogin';
import ModalAddNews from '../components/ModalAddNews';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { FaSignInAlt, FaSignOutAlt, FaPlus } from 'react-icons/fa';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Chequeo de sesión admin eficiente
  useEffect(() => {
    let mounted = true;
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setIsAdmin(!!session);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error('Error checking session:', error);
          setIsAdmin(false);
          setIsLoading(false);
        }
        // console.error('Error checking session:', error);
      }
    };
    checkAdmin();
    return () => { mounted = false; };
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    supabase.auth.signOut(); // Cierra sesión si implementas autenticación real
    localStorage.removeItem('isAdmin');
  };

  const handleNewsAdded = () => {
    setShowAdd(false);
    setReload(prev => !prev);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="text-center py-8 text-gray-400 text-lg animate-pulse">Cargando...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-3xl mx-auto px-2 sm:px-4">
        {/* Header responsivo */}
        <header className="flex flex-col sm:flex-row items-center justify-between py-6 mb-2 gap-2 sm:gap-0">
          {/* Título centrado y colorido */}
          <h1 className="w-full text-3xl sm:text-5xl font-extrabold text-center select-none bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Chismezón
          </h1>
          {/* Botones a la derecha */}
          <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:ml-4">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowAdd(true)}
                  title="Nueva Noticia"
                  className="text-blue-600 hover:text-blue-800 text-2xl transition-colors flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="Agregar noticia"
                >
                  <FaPlus />
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 text-3xl transition-colors flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300"
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                >
                  <FaSignOutAlt />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-500 hover:text-blue-500 text-3xl sm:text-4xl transition-colors flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                title="Iniciar sesión"
                aria-label="Iniciar sesión"
              >
                <FaSignInAlt />
              </button>
            )}
          </div>
        </header>

        <NewsList isAdmin={isAdmin} reload={reload} />

        {/* Modales */}
        <ModalLogin
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
        />
        <ModalAddNews
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          onNewsAdded={handleNewsAdded}
        />

        <Toaster position="bottom-right" />
      </div>
    </main>
  );
}
