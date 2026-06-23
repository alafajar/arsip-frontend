import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Terjadi kesalahan pada halaman ini.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Muat ulang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
