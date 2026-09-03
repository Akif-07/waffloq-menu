import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: String(error) };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WAFFLOQ ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#edf9f8', padding: '20px', fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', padding: '40px', maxWidth: '400px',
            width: '100%', textAlign: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            border: '2px solid #d5f2ef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f3c3a', marginBottom: '8px' }}>
              Bir sorun oluştu
            </h2>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '20px', wordBreak: 'break-word' }}>
              {this.state.errorMsg}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMsg: '' });
                window.location.reload();
              }}
              style={{
                background: '#23958e', color: '#fff', border: 'none', borderRadius: '12px',
                padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                width: '100%'
              }}
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
