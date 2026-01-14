import { APP_NAME, APP_VERSION_LABEL } from '../services/appService';

function VersionFooter() {
  return (
    <footer className="fixed bottom-3 right-3 z-50">
      <div className="text-xs text-gray-600 bg-white/80 backdrop-blur border border-gray-200 rounded-full px-3 py-1 shadow-sm">
        <span className="font-medium text-gray-800">
          {APP_NAME} {APP_VERSION_LABEL}
        </span>
        <span className="mx-2 text-gray-300">|</span>
        <span>Grounded in Big Five research</span>
      </div>
    </footer>
  );
}

export default VersionFooter;
