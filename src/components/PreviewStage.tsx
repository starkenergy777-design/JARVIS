import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, RotateCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface PreviewStageProps {
  code: string;
  lang: Language;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({ code, lang }) => {
  const [device, setDevice] = useState<'full' | 'tablet' | 'mobile'>('full');
  const [refreshKey, setRefreshKey] = useState(0);

  const t = TRANSLATIONS[lang].preview;

  const getContainerWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[375px] h-[667px] my-auto';
      case 'tablet':
        return 'max-w-[768px] h-[90%] my-auto';
      default:
        return 'w-full h-full';
    }
  };

  const handleOpenNewTab = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg overflow-hidden min-h-0">
      {/* Stage Toolbar */}
      <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-md">
          <button
            onClick={() => setDevice('full')}
            className={`p-1 rounded ${device === 'full' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title={t.desktopTip}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1 rounded ${device === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title={t.tabletTip}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1 rounded ${device === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            title={t.mobileTip}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1"
            title={t.refreshTip}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors text-[11px]"
            title={t.newTabTip}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.newTab}</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-slate-950/60 p-2 flex items-center justify-center overflow-auto">
        {!code ? (
          <div className="text-center p-6 text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">{t.noCode}</p>
          </div>
        ) : (
          <div
            className={`transition-all duration-300 shadow-2xl rounded-lg overflow-hidden border border-slate-700 bg-white ${getContainerWidth()}`}
          >
            <iframe
              key={refreshKey}
              srcDoc={code}
              title="Agent Pro Sandbox Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            />
          </div>
        )}
      </div>
    </div>
  );
};
