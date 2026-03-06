/**
 * Composant grille CPU par cœur
 * Affiche une barre verticale pour chaque cœur CPU avec une hauteur proportionnelle à l'utilisation
 */
export function CpuCoreGrid({ cores, color }: { cores: number[]; color: string }) {
  return (
    <div className="w-full h-full flex items-end gap-0.5 px-1">
      {cores.map((usage, index) => (
        <div
          key={index}
          className="flex-1 rounded-t-sm transition-all duration-500"
          style={{
            height: `${Math.max(5, usage)}%`,
            backgroundColor: color,
            opacity: usage > 0 ? Math.max(0.15, usage / 100) : 0.1,
          }}
          title={`Core ${index}: ${usage.toFixed(1)}%`}
        />
      ))}
    </div>
  );
}
