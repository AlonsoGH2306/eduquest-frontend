import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lumi } from '../components/brand/Lumi';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 text-center">
      <Lumi mood="sleepy" size={160} label="Lumi se perdió volando" />
      <h1 className="mt-4 text-5xl text-slate-900">404</h1>
      <p className="mt-3 text-lg font-semibold text-slate-700">Me perdí volando. Esta página no existe.</p>
      <p className="mt-1 max-w-md text-sm text-slate-500">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        Volver al inicio
      </button>
    </div>
  );
};
