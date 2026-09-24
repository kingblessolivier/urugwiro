import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center"
          style={{ background: 'var(--color-bg-deep)', color: 'var(--color-text-main)' }}
        >
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-5 shadow-xl">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            {this.props.fallbackTitle || 'Display Interruption'}
          </h2>
          <p className="text-xs sm:text-sm max-w-md mb-6 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            We encountered a temporary rendering issue loading this section. You can refresh the view or return to the catalog.
          </p>
          <div className="flex items-center gap-3">
            {this.props.onReset && (
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="rounded-xl flex items-center gap-2 text-xs"
              >
                <ArrowLeft size={14} /> Back
              </Button>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw size={14} /> Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
