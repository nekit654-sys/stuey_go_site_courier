import { Courier } from './payments/types';
import { usePaymentsLogic } from './payments/usePaymentsLogic';
import CsvUploadCard from './payments/CsvUploadCard';
import UploadResultDisplay from './payments/UploadResultDisplay';
import PartnerMatchingCard from './payments/PartnerMatchingCard';

interface UnifiedPaymentsTabProps {
  authToken: string;
  couriers: Courier[];
  isLoadingCouriers: boolean;
  onRefreshCouriers: () => void;
}

export default function UnifiedPaymentsTab({ 
  authToken, 
  couriers, 
  isLoadingCouriers,
  onRefreshCouriers 
}: UnifiedPaymentsTabProps) {
  const {
    uploading,
    csvData,
    uploadResult,
    partnerData,
    matchedCouriers,
    filterUnmatched,
    setFilterUnmatched,
    handleFileUpload,
    handleProcessCsv,
    handlePartnerImport,
    exportPaymentReport,
    exportCouriersForPartner,
  } = usePaymentsLogic(authToken, couriers, onRefreshCouriers);

  return (
    <div className="space-y-6">
      <CsvUploadCard
        csvData={csvData}
        uploading={uploading}
        onFileUpload={handleFileUpload}
        onProcessCsv={handleProcessCsv}
      />

      {uploadResult && <UploadResultDisplay uploadResult={uploadResult} />}

      <PartnerMatchingCard
        partnerData={partnerData}
        matchedCouriers={matchedCouriers}
        filterUnmatched={filterUnmatched}
        onPartnerImport={handlePartnerImport}
        onExportCouriers={exportCouriersForPartner}
        onExportReport={exportPaymentReport}
        onToggleFilter={() => setFilterUnmatched(!filterUnmatched)}
      />
    </div>
  );
}
