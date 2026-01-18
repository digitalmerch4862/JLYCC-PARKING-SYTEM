import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#FEF2F2',
          color: '#991B1B',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            border: '2px solid #FECACA',
            maxWidth: '90%',
            width: '400px'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>Application Crashed</h2>
            <div style={{
              backgroundColor: '#FEE2E2',
              padding: '1rem',
              borderRadius: '0.5rem',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              wordBreak: 'break-word',
              marginBottom: '1rem'
            }}>
              Error: {this.state.error?.message}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '1.5rem' }}>
              Please take a screenshot of this error and send it to the developer.
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#DC2626',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;