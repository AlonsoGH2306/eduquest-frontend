import React from 'react';
import { Link } from 'react-router-dom';
import { Lumi } from '../brand/Lumi';

interface HeroAction {
  to: string;
  label: string;
}

interface NightHeroProps {
  dateLabel: string;
  username: string;
  message: string;
  primary: HeroAction;
  secondary: HeroAction;
  lively: boolean;
  stats?: { label: string; value: number | null }[];
}

export const NightHero: React.FC<NightHeroProps> = ({ dateLabel, username, message, primary, secondary, lively, stats }) => (
  <section className="eq-stars relative isolate overflow-hidden rounded-3xl bg-[#262170] px-6 py-8 text-white sm:px-10 sm:py-10">
    <span aria-hidden="true" className="absolute -top-32 -right-24 -z-10 h-[26rem] w-[26rem] rounded-full bg-[#3a33a8]" />
    <span aria-hidden="true" className="absolute right-32 -bottom-44 -z-10 h-80 w-80 rounded-full bg-[#1b1757]" />
    <span
      aria-hidden="true"
      className="absolute top-10 right-[17rem] -z-10 hidden h-14 w-14 rounded-full bg-chicle shadow-[inset_-10px_-6px_0_#d84b93] lg:block"
    />
    <span
      aria-hidden="true"
      className="absolute top-[3.4rem] right-[16.2rem] -z-10 hidden h-3 w-24 -rotate-[18deg] rounded-[50%] border-[3px] border-lumi lg:block"
    />

    <div className="flex flex-wrap items-center justify-between gap-6">
      <div className="max-w-xl min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#c8c4ff] first-letter:uppercase">{dateLabel}</p>
        <h1 className={`mt-2 leading-tight ${username.length > 12 ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl'}`}>
          Hola,{' '}
          <span className="block truncate" title={username}>
            {username}
          </span>
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#e2e0ff] sm:text-lg">{message}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={primary.to}
            className="inline-flex h-11 items-center rounded-full bg-lumi px-6 text-sm font-bold text-noche transition hover:brightness-105"
          >
            {primary.label}
          </Link>
          <Link
            to={secondary.to}
            className="inline-flex h-11 items-center rounded-full bg-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/25"
          >
            {secondary.label}
          </Link>
        </div>
      </div>
      <Lumi mood={lively ? 'cheer' : 'happy'} size={150} label="Lumi, la luciérnaga de EduQuest" />
    </div>

    {stats && (
      <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-2">
            <dt className="order-2 text-sm text-[#c8c4ff]">{stat.label}</dt>
            <dd className="font-display text-xl font-extrabold">
              {stat.value === null ? <span className="inline-block h-5 w-8 animate-pulse rounded bg-white/20" /> : stat.value}
            </dd>
          </div>
        ))}
      </dl>
    )}
  </section>
);
