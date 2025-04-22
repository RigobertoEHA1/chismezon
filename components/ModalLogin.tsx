'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
};

export default function ModalLogin({ isOpen, onClose, onLoginSuccess }: Props) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('config')
      .select('valor')
      .eq('clave', 'admin_password')
      .single();

    setLoading(false);

    if (error) {
      setErrorMsg('Error de conexión. Intenta de nuevo.');
      return;
    }

    if (data?.valor === password) {
      onLoginSuccess();
      onClose();
      setPassword('');
      setErrorMsg('');
    } else {
      setErrorMsg('Contraseña incorrecta');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
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
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-blue-100 transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-bold leading-6 text-blue-600 mb-2"
                >
                  Acceso de administrador
                </Dialog.Title>
                <p className="text-sm text-gray-500 mb-6">
                  Ingresa la contraseña de administrador para continuar.
                </p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <input
                      type="password"
                      className="border w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-500 text-gray-900 transition"
                      placeholder="Contraseña"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      disabled={loading}
                      autoFocus
                    />
                    {errorMsg && (
                      <div className="text-red-500 text-xs mt-2">{errorMsg}</div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-gradient-to-br from-blue-500 to-pink-500 text-white px-4 py-2 rounded-full w-full font-semibold shadow hover:brightness-110 hover:scale-105 transition-all"
                      disabled={loading}
                    >
                      {loading ? 'Ingresando...' : 'Ingresar'}
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
