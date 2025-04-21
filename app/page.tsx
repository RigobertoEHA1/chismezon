'use client';

import { useState, useEffect } from 'react';
import NewsList from '../components/NewsList';
import ModalLogin from '../components/ModalLogin';
import ModalAddNews from '../components/ModalAddNews';
import { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAdmin(!!session);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  const handleNewsAdded = () => {
    setShowAdd(false);
    setReload(prev => !prev);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Cargando...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Chismezón</h1>
          <div className="flex gap-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setShowAdd(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Nueva Noticia
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>

        <NewsList isAdmin={isAdmin} reload={reload} />

        {showLogin && (
          <ModalLogin
            isOpen={showLogin}
            onClose={() => setShowLogin(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {showAdd && (
          <ModalAddNews
            isOpen={showAdd}
            onClose={() => setShowAdd(false)}
            onNewsAdded={handleNewsAdded}
          />
        )}

        <Toaster position="bottom-right" />
      </div>
    </main>
  );
}
