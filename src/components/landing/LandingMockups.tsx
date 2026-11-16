import React from 'react';
import { CheckCircle2, Circle, GraduationCap, Hash, Headphones, Star } from 'lucide-react';
import { Lumi } from '../brand/Lumi';

const Avatar: React.FC<{ letter: string; color: string; size?: number }> = ({ letter, color, size = 28 }) => (
  <span
    className="flex shrink-0 items-center justify-center rounded-full text-xs font-bold text-[#0f1020]"
    style={{ backgroundColor: color, width: size, height: size }}
  >
    {letter}
  </span>
);

const RAIL = [
  { label: 'TDC', color: '#ffd25e' },
  { label: 'CV', color: '#ff6fb5' },
  { label: 'AYE', color: '#59c3ff' },
];

const MESSAGES = [
  { name: 'valeria', color: '#ff8fc8', letter: 'V', avatar: '#ff6fb5', text: '¿Alguien entendió la reducción de HALT a ATM?' },
  { name: 'diego', color: '#7ad7ff', letter: 'D', avatar: '#59c3ff', text: 'Subí mi resumen a la biblioteca del grupo, está en el canal #apuntes.' },
  { name: 'santi', color: '#ffe08a', letter: 'S', avatar: '#ffd25e', text: 'Hoy a las 6 hago una asesoría de repaso. Confirmen asistencia 🙌' },
];

export const GroupMockup: React.FC = () => (
  <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1b1d33] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
    <div className="flex h-[22rem]">
      <div className="flex w-16 shrink-0 flex-col items-center gap-3 bg-[#0f1020] py-4">
        {RAIL.map((item, index) => (
          <span
            key={item.label}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl font-display text-[10px] text-[#0f1020] ${
              index === 0 ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#0f1020]' : ''
            }`}
            style={{ backgroundColor: item.color }}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div className="hidden w-44 shrink-0 flex-col bg-[#171a2e] sm:flex">
        <div className="relative h-16 overflow-hidden bg-[#ffd25e]">
          <span className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-[#ffe08a]" />
          <p className="absolute bottom-2 left-3 text-sm font-extrabold text-[#0f1020]">Teoría de la Computación</p>
        </div>
        <div className="space-y-0.5 p-2 text-[13px]">
          <p className="px-2 pt-1 pb-1 text-[11px] font-bold text-[#8f93b8]">Canales de texto</p>
          {['general', 'apuntes', 'dudas-parcial'].map((channel, index) => (
            <p
              key={channel}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 ${index === 0 ? 'bg-white/10 text-white' : 'text-[#a9aecf]'}`}
            >
              <Hash size={13} /> {channel}
            </p>
          ))}
          <p className="px-2 pt-3 pb-1 text-[11px] font-bold text-[#8f93b8]">Juntos</p>
          <p className="flex items-center gap-1.5 px-2 py-1 text-[#3ee6a8]">
            <Headphones size={13} /> Sala de voz
          </p>
          <div className="flex gap-1 pl-7">
            <Avatar letter="V" color="#ff6fb5" size={20} />
            <Avatar letter="D" color="#59c3ff" size={20} />
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3 text-sm font-bold text-white">
          <Hash size={15} className="text-[#8f93b8]" /> general
        </p>
        <div className="flex-1 space-y-4 px-4 py-4">
          {MESSAGES.map((message) => (
            <div key={message.name} className="flex gap-3">
              <Avatar letter={message.letter} color={message.avatar} size={32} />
              <div className="min-w-0">
                <p className="text-[13px] font-bold" style={{ color: message.color }}>
                  {message.name} <span className="ml-1 text-[11px] font-normal text-[#8f93b8]">Hoy a las 5:12 p. m.</span>
                </p>
                <p className="text-[13px] leading-snug text-[#e2e4f5]">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="m-3 rounded-xl bg-[#262a45] px-3 py-2.5 text-[13px] text-[#8f93b8]">Mensaje para #general</div>
      </div>
    </div>
  </div>
);

export const LibraryMockup: React.FC = () => (
  <div className="relative mx-auto h-72 w-full max-w-sm">
    <div className="absolute top-8 left-6 w-64 -rotate-6 rounded-3xl bg-[#262a45] p-5 shadow-xl">
      <span className="rounded-full bg-[#ff6fb5]/20 px-2.5 py-1 text-[11px] font-bold text-[#ff9fd0]">Cálculo Vectorial</span>
      <p className="mt-3 font-bold text-white">Parcial 2025-2 resuelto</p>
      <p className="mt-1 text-xs text-[#a9aecf]">Integrales dobles y triples, paso a paso.</p>
    </div>
    <div className="absolute top-0 right-2 w-64 rotate-3 rounded-3xl bg-[#2f3354] p-5 shadow-2xl">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#ffd25e]/20 px-2.5 py-1 text-[11px] font-bold text-[#ffd25e]">
          Teoría de la Computación
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-[#ffd25e]">
          <Star size={13} className="fill-[#ffd25e]" /> 4.8
        </span>
      </div>
      <p className="mt-3 font-bold text-white">Resumen de reducciones</p>
      <p className="mt-1 text-xs text-[#a9aecf]">Con ejemplos de HALT, ATM y Post.</p>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-[#6a5af9] px-3 py-1.5 text-xs font-bold text-white">Ver</span>
        <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#c8c4ff]">
          <GraduationCap size={13} /> Estudiar con IA
        </span>
      </div>
    </div>
    <div className="absolute bottom-2 left-12 w-60 rotate-2 rounded-3xl bg-[#262a45] p-4 shadow-xl">
      <p className="text-xs text-[#a9aecf]">
        <span className="font-bold text-[#7ad7ff]">diego</span> reseñó: «Me salvó el parcial, súper claro»
      </p>
    </div>
  </div>
);

export const StudyRoomMockup: React.FC = () => (
  <div className="eq-live mx-auto w-full max-w-sm rounded-3xl bg-[#24204f] p-7 text-center">
    <Lumi mood="focus" size={64} />
    <p className="mt-2 text-sm font-bold text-[#c8c4ff]">Sala de estudio</p>
    <p className="mt-1 font-display text-6xl text-white">24:59</p>
    <p className="mt-2 text-sm text-[#d6d9f2]">Ronda 2 · 5 estudiando</p>
    <div className="mt-4 flex justify-center -space-x-2">
      {[
        ['V', '#ff6fb5'],
        ['D', '#59c3ff'],
        ['S', '#ffd25e'],
        ['M', '#3ee6a8'],
        ['A', '#a597ff'],
      ].map(([letter, color]) => (
        <span key={letter} className="rounded-full ring-2 ring-[#24204f]">
          <Avatar letter={letter} color={color} size={32} />
        </span>
      ))}
    </div>
    <span className="mt-5 inline-block rounded-full bg-[#ffd25e] px-5 py-2 text-sm font-bold text-[#0f1020]">Unirme</span>
  </div>
);

const PLAN_STEPS = [
  { text: 'Repasar definiciones de máquinas de Turing', done: true },
  { text: 'Resolver 5 ejercicios de decidibilidad', done: true },
  { text: 'Practicar reducciones con el resumen del grupo', done: false },
];

export const PlanMockup: React.FC = () => (
  <div className="mx-auto w-full max-w-sm space-y-4">
    <div className="rounded-3xl bg-[#262a45] p-5">
      <p className="text-xs font-bold text-[#c8c4ff]">Jueves, 6:00 p. m. – 7:00 p. m.</p>
      <p className="mt-1 font-bold text-white">Repaso para el parcial</p>
      <p className="mt-1 flex items-center gap-2 text-xs text-[#a9aecf]">
        Dicta @santi
        <span className="rounded-full bg-[#ffd25e]/20 px-2 py-0.5 font-bold text-[#ffd25e]">Asesor</span>
      </p>
      <p className="mt-3 text-xs font-bold text-[#3ee6a8]">12 confirmados</p>
    </div>
    <div className="rounded-3xl bg-[#2f3354] p-5">
      <div className="flex items-center justify-between text-xs font-bold text-[#c8c4ff]">
        <span>Semana 1 de 4</span>
        <span>67 %</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-white/10">
        <div className="h-1.5 w-2/3 rounded-full bg-[#6a5af9]" />
      </div>
      <ul className="mt-4 space-y-2.5">
        {PLAN_STEPS.map((step) => (
          <li key={step.text} className="flex items-start gap-2 text-sm">
            {step.done ? (
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#3ee6a8]" />
            ) : (
              <Circle size={17} className="mt-0.5 shrink-0 text-[#8f93b8]" />
            )}
            <span className={step.done ? 'text-[#8f93b8] line-through' : 'text-white'}>{step.text}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);
