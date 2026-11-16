import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Users, X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import { messageService } from '../../services/messageService';
import { roomService } from '../../services/roomService';
import { useDebounce } from '../../hooks/useDebounce';
import { ChatRoom, UserSummary } from '../../types';
import { extractErrorMessage } from '../../utils/errors';
import { applyServerErrors, inputClass } from '../../utils/forms';

const MAX_MEMBERS = 10;

interface RoomModalProps {
  isOpen: boolean;
  room?: ChatRoom | null;
  onClose: () => void;
  onSaved: (room: ChatRoom) => void;
}

interface FormValues {
  name: string;
}

export const RoomModal: React.FC<RoomModalProps> = ({ isOpen, room, onClose, onSaved }) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ mode: 'onChange' });
  const [selected, setSelected] = useState<UserSummary[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSummary[]>([]);
  const debounced = useDebounce(query.trim(), 300);
  const existing = room?.members ?? [];
  const total = (room ? existing.length : 1) + selected.length;

  useEffect(() => {
    if (!isOpen) return;
    reset({ name: room?.name ?? '' });
    setSelected([]);
    setQuery('');
  }, [isOpen, room, reset]);

  useEffect(() => {
    if (debounced.replace(/^@/, '').length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    messageService
      .searchUsers(debounced, controller.signal)
      .then(setResults)
      .catch(() => setResults([]));
    return () => controller.abort();
  }, [debounced]);

  const add = (person: UserSummary) => {
    if (total >= MAX_MEMBERS) {
      toast.error(`Un chat grupal tiene hasta ${MAX_MEMBERS} personas`);
      return;
    }
    setSelected((current) => (current.some((item) => item.id === person.id) ? current : [...current, person]));
    setQuery('');
  };

  const onSubmit = async (values: FormValues) => {
    if (!room && selected.length < 2) {
      toast.error('Elige al menos 2 personas');
      return;
    }
    try {
      const saved = room
        ? await roomService.updateRoom(room.id, {
            name: values.name.trim(),
            addMemberIds: selected.map((person) => person.id),
          })
        : await roomService.createRoom(values.name.trim(), selected.map((person) => person.id));
      toast.success(room ? 'Chat actualizado' : 'Chat grupal creado');
      onSaved(saved);
      onClose();
    } catch (err) {
      if (!applyServerErrors(err, setError)) toast.error(extractErrorMessage(err));
    }
  };

  const candidates = results.filter(
    (person) => !selected.some((item) => item.id === person.id) && !existing.some((item) => item.id === person.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={room ? 'Editar chat grupal' : 'Nuevo chat grupal'}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="room-name" className="block text-xs font-semibold text-slate-700">
            Nombre del chat
          </label>
          <input
            id="room-name"
            maxLength={60}
            placeholder="Repaso para el final"
            className={inputClass(Boolean(errors.name))}
            {...register('name', { validate: (value) => value.trim().length > 0 || 'Ponle un nombre al chat' })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="room-people" className="block text-xs font-semibold text-slate-700">
            {room ? 'Agregar personas' : 'Personas'} ({total}/{MAX_MEMBERS})
          </label>
          <input
            id="room-people"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca por @usuario"
            autoComplete="off"
            className={inputClass(false)}
          />
          {candidates.length > 0 && (
            <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200">
              {candidates.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => add(person)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <UserAvatar username={person.username} avatarUrl={person.avatarUrl} size={24} /> @{person.username}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selected.map((person) => (
                <span key={person.id} className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-0.5 pr-1 pl-2 text-xs text-indigo-700">
                  @{person.username}
                  <button
                    type="button"
                    onClick={() => setSelected((current) => current.filter((item) => item.id !== person.id))}
                    aria-label={`Quitar a ${person.username}`}
                    className="rounded-full p-0.5 hover:bg-indigo-100"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Users size={14} /> {isSubmitting ? 'Guardando...' : room ? 'Guardar' : 'Crear chat'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
