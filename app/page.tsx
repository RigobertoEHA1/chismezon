'use client';

import { useState, useEffect } from 'react';
import NewsList from '../components/NewsList';
import ModalLogin from '../components/ModalLogin';
import ModalAddNews from '../components/ModalAddNews';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('isAdmin', 'true');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isAdmin');
  };

  const handleNewsAdded = () => {
    setReload(!reload);
  };

  return (
    <main>
      <Toaster />
      <h1 className="text-3xl font-bold mb-8 text-center text-blue-600 drop-shadow">
        Chismezón
      </h1>
      <div className="flex justify-center gap-3 mb-8">
        {isAdmin && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-gradient-to-br from-blue-500 to-pink-500 text-white px-5 py-2 rounded-full shadow font-semibold hover:brightness-110 hover:scale-105 transition-all"
          >
            Agregar noticia
          </button>
        )}
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="bg-gray-100 text-gray-800 px-5 py-2 rounded-full shadow hover:bg-gray-200 transition-all"
          >
            Cerrar sesión
          </button>
        ) : (
          <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all focus:outline-none"
            title="Iniciar sesión"
          >
            {/* Heroicon: LockClosed */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7a4 4 0 10-8 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
            </svg>
          </button>
          </div>
        )}
      </div>
      <NewsList isAdmin={isAdmin} reload={reload} />
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
    </main>
  );
}
