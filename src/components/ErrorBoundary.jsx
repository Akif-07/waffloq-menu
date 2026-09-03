import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary yakaladı:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-waffloq-50 text-stone-800">
          <div className="bg-white p-6 rounded-3xl shadow-xl max-w-md w-full text-center border border-waffloq-200">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-waffloq-950 mb-2">Arayüz Yüklenirken Bir Sorun Oluştu</h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              Sayfa önbelleğini temizleyip menüyü yeniden yüklemek için aşağıdaki butona tıklayabilirsiniz.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 bg-waffloq-600 hover:bg-waffloq-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sayfayı Sıfırla ve Yenile</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
