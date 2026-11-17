import React from 'react';
import { Link } from 'react-router-dom';
import { Award, MessageCircle, MessagesSquare } from 'lucide-react';
import { Lumi } from '../components/brand/Lumi';
import { GroupMockup, LibraryMockup, PlanMockup, StudyRoomMockup } from '../components/landing/LandingMockups';

const FEATURES = [
  {
    id: 'biblioteca',
    title: 'Los apuntes de tu curso, en un solo lugar',
    text: 'Sube resúmenes, exámenes resueltos y guías ordenados por curso y universidad. Las reseñas de tus compañeros te dicen cuál vale la pena, y con un clic la IA te arma un quiz o flashcards del material.',
    Visual: LibraryMockup,
  },
  {
    id: 'grupos',
    title: 'Un grupo por curso, con canales y sala de voz',
    text: 'Crea un grupo público o privado para tu sección. Separa las conversaciones en canales, comparte archivos, haz encuestas y entra a la sala de voz cuando necesites explicarlo hablando.',
    Visual: null,
  },
  {
    id: 'sala',
    title: 'Estudiar acompañado se nota',
    text: 'Enciende la sala de estudio y todo el grupo comparte el mismo Pomodoro: estudian y descansan a la vez. Tus compañeros ven quién está concentrado y se suman con un toque.',
    Visual: StudyRoomMockup,
  },
  {
    id: 'asesorias',
    title: 'Asesorías con quien ya aprobó, y un plan que se arma solo',
    text: 'Agenda asesorías dentro del grupo, confirma tu asistencia y califícalas al terminar. Si no sabes por dónde empezar, cuéntale a la IA qué curso llevas y te arma un plan semanal que vas marcando.',
    Visual: PlanMockup,
  },
];

const EXTRAS = [
  {
    Icon: MessagesSquare,
    title: 'Foro por curso',
    text: 'Pregunta lo que no te quedó claro. Las mejores respuestas suben con los votos.',
    color: '#59c3ff',
  },
  {
    Icon: MessageCircle,
    title: 'Mensajes directos',
    text: 'Escríbele a un compañero o arma un chat con tu equipo del proyecto.',
    color: '#ff6fb5',
  },
  {
    Icon: Award,
    title: 'Logros y ranking',
    text: 'Ganas puntos cuando tu aporte ayuda: un apunte bien reseñado, una respuesta elegida.',
    color: '#3ee6a8',
  },
];

const RHYTHM = ['apuntes', 'grupos', 'asesorías', 'foro'];

const PrimaryCta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Link
    to="/register"
    className="inline-flex h-12 items-center rounded-full bg-[#ffd25e] px-7 text-base font-bold text-[#0f1020] transition hover:bg-[#ffe08a] focus-visible:ring-4 focus-visible:ring-[#ffd25e]/50 focus-visible:outline-hidden"
  >
    {children}
  </Link>
);

const SecondaryCta: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Link
    to="/login"
    className="inline-flex h-12 items-center rounded-full bg-white/10 px-7 text-base font-bold text-white transition hover:bg-white/20 focus-visible:ring-4 focus-visible:ring-white/40 focus-visible:outline-hidden"
  >
    {children}
  </Link>
);

export const LandingPage: React.FC = () => (
  <div className="min-h-screen bg-[#141634] text-[#e2e4f5]">
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#141634]/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5" aria-label="Principal">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold text-white">
          <Lumi mood="happy" size={30} animated={false} /> EDUQUEST
        </Link>
        <div className="hidden items-center gap-6 text-sm font-semibold text-[#c8c4ff] md:flex">
          <a href="#biblioteca" className="hover:text-white">
            Biblioteca
          </a>
          <a href="#grupos" className="hover:text-white">
            Grupos
          </a>
          <a href="#sala" className="hover:text-white">
            Sala de estudio
          </a>
          <a href="#asesorias" className="hover:text-white">
            Asesorías
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-full px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="hidden rounded-full bg-[#ffd25e] px-4 py-2 text-sm font-bold text-[#0f1020] hover:bg-[#ffe08a] sm:inline-block"
          >
            Crear cuenta
          </Link>
        </div>
      </nav>
    </header>

    <main>
      <section className="eq-stars relative isolate overflow-hidden">
        <span aria-hidden="true" className="absolute -top-48 -left-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-[#262170]" />
        <span aria-hidden="true" className="absolute -right-32 bottom-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-[#1b1757]" />
        <span
          aria-hidden="true"
          className="absolute top-24 right-[12%] -z-10 hidden h-16 w-16 rounded-full bg-[#ff6fb5] shadow-[inset_-12px_-8px_0_#d84b93] lg:block"
        />
        <span
          aria-hidden="true"
          className="absolute top-[7.6rem] right-[calc(12%-1.6rem)] -z-10 hidden h-3.5 w-28 -rotate-[18deg] rounded-[50%] border-[3px] border-[#ffd25e] lg:block"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-16 pb-20 lg:grid-cols-[1fr_1.15fr] lg:pt-24 lg:pb-28">
          <div>
            <Lumi mood="happy" size={88} label="Lumi, la luciérnaga de EduQuest" />
            <h1 className="mt-6 text-4xl leading-[1.05] text-white sm:text-6xl">Estudiar juntos ilumina</h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#d6d9f2]">
              EduQuest reúne a tu sección en un solo lugar: los apuntes ordenados por curso, un grupo con chat y sala de
              estudio, asesorías con quienes ya aprobaron y un plan semanal hecho con IA.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryCta>Crear cuenta gratis</PrimaryCta>
              <SecondaryCta>Ya tengo cuenta</SecondaryCta>
            </div>
          </div>
          <GroupMockup />
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/5 bg-[#0f1020] py-8" aria-hidden="true">
        <p className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 font-display text-3xl text-white/90 sm:text-5xl">
          {RHYTHM.map((word, index) => (
            <React.Fragment key={word}>
              {index > 0 && <span className="eq-glow h-3 w-3 rounded-full bg-[#ffd25e] shadow-[0_0_18px_6px_rgba(255,210,94,0.45)]" />}
              <span>{word}</span>
            </React.Fragment>
          ))}
        </p>
      </div>

      <div className="mx-auto max-w-6xl space-y-24 px-5 py-24 sm:space-y-32">
        {FEATURES.map(({ id, title, text, Visual }, index) => (
          <section
            key={id}
            id={id}
            className="grid scroll-mt-24 items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
              <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl">{title}</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#c3c7e6]">{text}</p>
            </div>
            <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
              {Visual ? (
                <Visual />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    ['TDC', 'Teoría de la Computación', '#ffd25e', '35 integrantes'],
                    ['CV', 'Cálculo Vectorial', '#ff6fb5', '22 integrantes'],
                    ['AYE', 'Algoritmos y Estructuras', '#59c3ff', '41 integrantes'],
                  ].map(([initials, name, color, members]) => (
                    <div key={initials} className="overflow-hidden rounded-3xl bg-[#262a45] last:hidden sm:last:block">
                      <div className="relative h-16" style={{ backgroundColor: color }}>
                        <span className="absolute -top-5 -right-5 h-16 w-16 rounded-full bg-white/25" />
                      </div>
                      <div className="p-3">
                        <span
                          className="relative -mt-9 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-[#262a45] font-display text-[10px] text-[#0f1020]"
                          style={{ backgroundColor: color }}
                        >
                          {initials}
                        </span>
                        <p className="mt-2 text-sm leading-tight font-bold text-white">{name}</p>
                        <p className="mt-1 text-xs text-[#8f93b8]">{members}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        <section aria-labelledby="extras-title">
          <h2 id="extras-title" className="text-center font-display text-3xl text-white sm:text-4xl">
            Y lo que pasa entre clase y clase
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {EXTRAS.map(({ Icon, title, text, color }) => (
              <div key={title} className="rounded-3xl bg-[#1f2240] p-6">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-[#0f1020]"
                  style={{ backgroundColor: color }}
                >
                  <Icon size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-[#a9aecf]">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="eq-stars relative isolate overflow-hidden bg-[#262170]">
        <span aria-hidden="true" className="absolute -bottom-40 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-[50%] bg-[#1b1757]" />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-24 text-center">
          <Lumi mood="cheer" size={110} />
          <h2 className="mt-6 font-display text-3xl leading-tight text-white sm:text-5xl">
            Tu grupo ya está estudiando. Solo falta tu luz.
          </h2>
          <p className="mt-4 max-w-lg text-lg text-[#d6d9f2]">Crea tu cuenta con tu correo y únete a tu primer grupo en un minuto.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <PrimaryCta>Crear cuenta gratis</PrimaryCta>
            <SecondaryCta>Iniciar sesión</SecondaryCta>
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-[#0f1020]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-[#8f93b8] sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base font-extrabold text-white">EDUQUEST</p>
        <p>Proyecto del curso Desarrollo Basado en Plataformas, UTEC</p>
        <div className="flex gap-4 font-semibold">
          <Link to="/login" className="hover:text-white">
            Iniciar sesión
          </Link>
          <Link to="/register" className="hover:text-white">
            Crear cuenta
          </Link>
        </div>
      </div>
    </footer>
  </div>
);
