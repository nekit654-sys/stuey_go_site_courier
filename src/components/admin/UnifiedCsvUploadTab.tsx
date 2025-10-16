import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { API_URL } from '@/config/api';
import { Courier, CsvRow, UploadResult } from './csv/types';
import { parseCSV } from './csv/utils';
import CsvFileUploader from './csv/CsvFileUploader';
import UploadResultCard from './csv/UploadResultCard';
import UnmatchedCouriersCard from './csv/UnmatchedCouriersCard';
import SystemInfoCard from './csv/SystemInfoCard';

interface UnifiedCsvUploadTabProps {
  authToken: string;
  couriers: Courier[];
  onRefreshCouriers: () => void;
}

export default function UnifiedCsvUploadTab({ authToken, couriers, onRefreshCouriers }: UnifiedCsvUploadTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [preview, setPreview] = useState<CsvRow[]>([]);
  const [linkingCourier, setLinkingCourier] = useState<{ external_id: string; courier_id: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Можно загружать только CSV файлы');
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setPreview(parsed.slice(0, 5));
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Выберите CSV файл');
      return;
    }

    if (!authToken) {
      toast.error('Ошибка авторизации. Перезайдите в систему');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const rows = parseCSV(text);

        if (rows.length === 0) {
          toast.error('CSV файл пустой или некорректный');
          setUploading(false);
          return;
        }

        const response = await fetch(`${API_URL}?route=csv`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': authToken
          },
          body: JSON.stringify({ rows })
        });

        const data = await response.json();

        if (data.success) {
          setUploadResult(data);
          toast.success(`Загружено ${data.processed} записей`);
          setFile(null);
          setPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onRefreshCouriers();
        } else {
          toast.error(data.error || 'Ошибка загрузки');
        }

        setUploading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Ошибка загрузки файла');
      setUploading(false);
    }
  };

  const handleLinkCourier = async (external_id: string, courier_id: number) => {
    setLinkingCourier({ external_id, courier_id });

    try {
      const response = await fetch(`${API_URL}?route=link-courier`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': authToken
        },
        body: JSON.stringify({ external_id, courier_id })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Курьер успешно связан с партнёркой');
        onRefreshCouriers();
        
        if (uploadResult?.unmatched) {
          setUploadResult({
            ...uploadResult,
            unmatched: uploadResult.unmatched.filter(u => u.external_id !== external_id)
          });
        }
      } else {
        toast.error(data.error || 'Ошибка связывания');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    } finally {
      setLinkingCourier(null);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <CsvFileUploader
        file={file}
        uploading={uploading}
        preview={preview}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        onCancel={handleCancel}
      />

      {uploadResult && uploadResult.success && (
        <>
          <UploadResultCard uploadResult={uploadResult} />
          
          {uploadResult.unmatched && uploadResult.unmatched.length > 0 && (
            <UnmatchedCouriersCard
              unmatchedCouriers={uploadResult.unmatched}
              linkingCourier={linkingCourier}
              onLinkCourier={handleLinkCourier}
            />
          )}
        </>
      )}

      <SystemInfoCard />
    </div>
  );
}
