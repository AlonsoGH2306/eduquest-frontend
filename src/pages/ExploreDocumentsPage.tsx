import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bookmark, GraduationCap, Library, Plus, School, Search, Tag, X } from 'lucide-react';
import { useDocuments, useSavedDocumentsPage } from '../hooks/useDocuments';
import { DocumentSort } from '../services/documentService';
import { usePageParams } from '../hooks/usePageParams';
import { ErrorState } from '../components/common/ErrorState';
import { extractErrorMessage } from '../utils/errors';
import { DocumentRequest, DocumentResponse } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { EmptyState } from '../components/common/EmptyState';
import { PaginationBar } from '../components/common/PaginationBar';
import { TabButton } from '../components/common/TabButton';
import { DocumentCard } from '../components/documents/DocumentCard';
import { DocumentUploadModal } from '../components/documents/DocumentUploadModal';
import { ReviewModal } from '../components/documents/ReviewModal';

const SORT_OPTIONS: { value: DocumentSort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'oldest', label: 'Más antiguos' },
  { value: 'title', label: 'Título (A-Z)' },
];

const filterInputClass =
  'w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-sm focus:border-indigo-500 focus:outline-hidden';

export const ExploreDocumentsPage: React.FC = () => {
  const { page, size, setPage, setSize, searchParams, updateParams } = usePageParams();
  const view = searchParams.get('view') === 'saved' ? 'saved' : 'all';
  const tagParam = searchParams.get('tag') || '';
  const searchParam = searchParams.get('search') || '';
  const courseParam = searchParams.get('course') || '';
  const universityParam = searchParams.get('university') || '';
  const sortParam = SORT_OPTIONS.some((option) => option.value === searchParams.get('sort'))
    ? (searchParams.get('sort') as DocumentSort)
    : 'recent';

  const [searchInput, setSearchInput] = useState(searchParam);
  const [courseInput, setCourseInput] = useState(courseParam);
  const [universityInput, setUniversityInput] = useState(universityParam);
  const debouncedSearch = useDebounce(searchInput.trim(), 400);
  const debouncedCourse = useDebounce(courseInput.trim(), 400);
  const debouncedUniversity = useDebounce(universityInput.trim(), 400);

  const library = useDocuments({
    page,
    size,
    search: searchParam,
    tag: tagParam,
    course: courseParam,
    university: universityParam,
    sort: sortParam,
    enabled: view === 'all',
  });
  const saved = useSavedDocumentsPage(page, size, view === 'saved');
  const current = view === 'all' ? library : saved;

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDocForReview, setSelectedDocForReview] = useState<DocumentResponse | null>(null);

  useEffect(() => {
    const changes: Record<string, string | null> = {};
    if (debouncedSearch !== searchParam) changes.search = debouncedSearch || null;
    if (debouncedCourse !== courseParam) changes.course = debouncedCourse || null;
    if (debouncedUniversity !== universityParam) changes.university = debouncedUniversity || null;
    if (Object.keys(changes).length > 0) updateParams({ ...changes, page: '0' }, true);
  }, [debouncedSearch, debouncedCourse, debouncedUniversity, searchParam, courseParam, universityParam, updateParams]);

  const handleTagFilter = (tag: string) => updateParams({ tag: tag || null, view: null, page: '0' });

  const clearFilters = () => {
    setSearchInput('');
    setCourseInput('');
    setUniversityInput('');
    updateParams({ search: null, tag: null, course: null, university: null, page: '0' });
  };

  const handleUploadDocument = async (payload: DocumentRequest) => {
    try {
      await library.uploadDocument(payload);
      toast.success('¡Documento publicado en la biblioteca!');
    } catch (err) {
      toast.error(extractErrorMessage(err));
      throw err;
    }
  };

  const handleSavedChange = (doc: DocumentResponse, isSaved: boolean) => {
    if (view === 'saved' && !isSaved) saved.setItems((items) => items.filter((item) => item.id !== doc.id));
  };

  const hasFilters = Boolean(searchParam || tagParam || courseParam || universityParam);

  const renderEmpty = () => {
    if (view === 'saved') {
      return (
        <EmptyState
          title="Aún no guardas materiales"
          description="Toca el marcador de cualquier documento para tenerlo siempre a mano aquí."
          actionLabel="Ir a la biblioteca"
          onAction={() => updateParams({ view: null, page: '0' })}
        />
      );
    }
    return hasFilters ? (
      <EmptyState
        title="Sin resultados para tu búsqueda"
        description="Prueba con otras palabras o quita algún filtro."
        actionLabel="Limpiar filtros"
        onAction={clearFilters}
      />
    ) : (
      <EmptyState
        title="La biblioteca está vacía"
        description="Sube el primer recurso académico para tu curso."
        actionLabel="Subir documento"
        onAction={() => setIsUploadOpen(true)}
      />
    );
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Biblioteca pública' }]} />

      <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Biblioteca pública</h1>
          <p className="text-sm text-slate-500">Encuentra apuntes, guías y exámenes compartidos por estudiantes</p>
        </div>
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus size={16} /> Subir documento
        </button>
      </div>

      <div role="tablist" className="mb-4 flex gap-1 border-b border-slate-200">
        <TabButton
          active={view === 'all'}
          icon={<Library size={14} />}
          label="Todos"
          onClick={() => updateParams({ view: null, page: '0' })}
        />
        <TabButton
          active={view === 'saved'}
          icon={<Bookmark size={14} />}
          label="Mis guardados"
          onClick={() => updateParams({ view: 'saved', page: '0' })}
        />
      </div>

      {view === 'all' && (
        <div className="mb-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                aria-label="Buscar documentos"
                placeholder="Buscar por título o descripción (ej. Cálculo, Algoritmos)..."
                className="w-full rounded-xl border border-slate-200 py-2 pr-4 pl-10 text-sm focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="document-sort" className="text-xs font-medium text-slate-500">
                Ordenar
              </label>
              <select
                id="document-sort"
                value={sortParam}
                onChange={(e) => updateParams({ sort: e.target.value === 'recent' ? null : e.target.value, page: '0' })}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-hidden"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <GraduationCap size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={courseInput}
                onChange={(e) => setCourseInput(e.target.value)}
                aria-label="Filtrar por curso"
                placeholder="Curso"
                className={filterInputClass}
              />
            </div>
            <div className="relative">
              <School size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={universityInput}
                onChange={(e) => setUniversityInput(e.target.value)}
                aria-label="Filtrar por universidad o colegio"
                placeholder="Universidad o colegio"
                className={filterInputClass}
              />
            </div>
            {(tagParam || hasFilters) && (
              <div className="flex flex-wrap items-center gap-2">
                {tagParam && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                    <Tag size={13} /> #{tagParam}
                    <button
                      type="button"
                      onClick={() => handleTagFilter('')}
                      aria-label="Quitar filtro de etiqueta"
                      className="ml-1 rounded-full p-0.5 hover:bg-indigo-100"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {current.loading ? (
        <SkeletonCard count={6} />
      ) : current.error ? (
        <ErrorState message={current.error} onRetry={current.reload} />
      ) : current.items.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {current.items.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onOpenReviews={(d) => setSelectedDocForReview(d)}
                onTagClick={handleTagFilter}
                onSavedChange={handleSavedChange}
                onChanged={current.reload}
              />
            ))}
          </div>

          <PaginationBar
            page={page}
            size={size}
            totalElements={current.totalElements}
            totalPages={current.totalPages}
            onPageChange={setPage}
            onSizeChange={setSize}
          />
        </>
      )}

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSubmitDocument={handleUploadDocument}
      />

      <ReviewModal document={selectedDocForReview} onClose={() => setSelectedDocForReview(null)} />
    </div>
  );
};
