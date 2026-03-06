/**
 * Composant barres réseau (Upload/Download)
 * Affiche deux barres verticales pour visualiser l'upload et le download en temps réel
 */
export function NetworkBars({ 
  upload, 
  download, 
  maxBandwidth, 
  uploadColor, 
  downloadColor 
}: { 
  upload: number; 
  download: number; 
  maxBandwidth: number;
  uploadColor: string;
  downloadColor: string;
}) {
  const uploadPercent = maxBandwidth > 0 ? Math.min(100, (upload / maxBandwidth) * 100) : 0;
  const downloadPercent = maxBandwidth > 0 ? Math.min(100, (download / maxBandwidth) * 100) : 0;
  
  return (
    <div className="w-full h-full flex items-end gap-2 px-4">
      {/* Upload bar */}
      <div className="flex-1">
        <div
          className="w-full rounded-t-md transition-all duration-500"
          style={{
            height: `${Math.max(8, uploadPercent)}%`,
            backgroundColor: uploadColor,
            opacity: uploadPercent > 0 ? Math.max(0.25, uploadPercent / 100) : 0.15,
          }}
        />
      </div>
      {/* Download bar */}
      <div className="flex-1">
        <div
          className="w-full rounded-t-md transition-all duration-500"
          style={{
            height: `${Math.max(8, downloadPercent)}%`,
            backgroundColor: downloadColor,
            opacity: downloadPercent > 0 ? Math.max(0.25, downloadPercent / 100) : 0.15,
          }}
        />
      </div>
    </div>
  );
}
