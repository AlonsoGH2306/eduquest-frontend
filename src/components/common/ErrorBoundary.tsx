import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Lumi } from '../brand/Lumi';

interface Props {
  children: ReactNode;
  resetKey?: string;
  variant?: 'screen' | 'page';
}

interface State {
  hasError: boolean;
  errorMessage: string;
  resetKey?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
    resetKey: this.props.resetKey,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, errorMessage: error.message };
  }

  public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey === state.resetKey) return null;
    return { hasError: false, errorMessage: '', resetKey: props.resetKey };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  private retry = () => this.setState({ hasError: false, errorMessage: '' });

  public render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.variant === 'page') {
      return (
        <div role="alert" className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
          <Lumi mood="off" size={88} />
          <h2 className="mt-4 text-lg font-bold text-ink">Esta pantalla tuvo un problema</h2>
          <p className="mt-1 max-w-sm text-sm text-soft">
            El resto de EduQuest sigue funcionando. Vuelve a intentarlo o ve a otra sección desde el menú.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={this.retry}
              className="h-10 rounded-full bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"
            >
              Reintentar
            </button>
            <Link
              to="/dashboard"
              className="flex h-10 items-center rounded-full px-5 text-sm font-bold text-soft hover:bg-hover hover:text-ink"
            >
              Ir al inicio
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Algo salió mal en la interfaz</h1>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Ocurrió un error inesperado al mostrar esta pantalla. Puedes recargar la aplicación de forma segura.
        </p>
        <button
          type="button"
          onClick={() => window.location.assign('/')}
          className="mt-6 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Volver al inicio
        </button>
      </div>
    );
  }
}
