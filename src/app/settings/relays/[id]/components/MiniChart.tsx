'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Enregistrer les composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

/**
 * Composant mini graphique avec Chart.js
 * Affiche un graphique linéaire pour visualiser l'historique des données
 */
export function MiniChart({ data, color }: { data: number[]; color: string }) {
  const chartData = {
    labels: data.map((_, i) => i.toString()),
    datasets: [
      {
        data: data,
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { 
        display: false, 
        min: 0, 
        max: 100,
      },
    },
    animation: false,
  };

  return <Line data={chartData} options={options} />;
}
