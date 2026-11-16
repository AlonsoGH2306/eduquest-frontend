import React from 'react';
import { Lumi } from '../brand/Lumi';
import { ThemeToggle } from '../layout/ThemeToggle';

interface AuthShellProps {
  children: React.ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children }) => (
  <div className="eq-stars relative isolate flex min-h-screen overflow-hidden bg-[#141634]">
    <span aria-hidden="true" className="absolute -top-40 -left-32 -z-10 h-[34rem] w-[34rem] rounded-full bg-[#262170]" />
    <span aria-hidden="true" className="absolute -right-24 -bottom-48 -z-10 h-[28rem] w-[28rem] rounded-full bg-[#1b1757]" />
    <div className="absolute top-4 right-4 rounded-full bg-white/10 text-white">
      <ThemeToggle />
    </div>

    <section className="hidden flex-1 flex-col justify-between p-12 text-white lg:flex">
      <p className="font-display text-xl font-extrabold">EDUQUEST</p>
      <div>
        <Lumi mood="happy" size={180} label="Lumi, la luciérnaga de EduQuest" />
        <p className="mt-6 max-w-md font-display text-4xl leading-tight font-extrabold">ESTUDIAR JUNTOS ILUMINA</p>
        <p className="mt-4 max-w-md text-lg text-[#d6d9f2]">
          Apuntes ordenados por curso, grupos con chat y sala de estudio, asesorías y un plan hecho con IA.
        </p>
      </div>
      <p className="text-sm text-[#a9aecf]">Proyecto de Desarrollo Basado en Plataformas · UTEC</p>
    </section>

    <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md rounded-3xl bg-raised p-8 shadow-2xl">{children}</div>
    </main>
  </div>
);
