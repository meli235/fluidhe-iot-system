'use client';

import React from 'react';
import { FileSpreadsheet, Database, Loader2 } from 'lucide-react';

export interface ExportButtonsProps {
  isUploading?: boolean;
  onExportExcel?: () => void;
  onExportMasterExcel?: () => void;
  onExportAndUpload?: () => void;
  onCloudDriveAccess?: () => void;
  isAdmin?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  isUploading,
  onExportExcel,
  onExportMasterExcel,
  isAdmin = false
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      {onExportExcel && (
        <button
          type="button"
          onClick={onExportExcel}
          disabled={isUploading}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
          title="Unduh data sesi yang sedang dipilih dalam format spreadsheet Excel"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5" />
          )}
          <span>Unduh Excel Sesi</span>
        </button>
      )}

      {isAdmin && onExportMasterExcel && (
        <button
          type="button"
          onClick={onExportMasterExcel}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          title="Unduh seluruh data akumulatif dari semua kelas dan pertemuan (Master Dataset)"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Master Excel (Semua Kelas)</span>
        </button>
      )}
    </div>
  );
};

export default ExportButtons;
