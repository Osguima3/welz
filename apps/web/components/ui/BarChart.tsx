import { Money } from '@shared/schema/Money.ts';
import { Chart, registerables } from 'chart.js';
import { useEffect, useRef } from 'preact/hooks';
import { Format } from '../../utils/format.ts';

Chart.register(...registerables);

interface ChartSeries {
  label: string;
  data: Money[];
  color: string;
  stack?: string;
}

interface ChartProps {
  labels: string[];
  series: ChartSeries[];
  locale: string;
  height?: number;
  stacked?: boolean;
  hideLegend?: boolean;
  hideTooltipForEmpty?: string[];
}

export function BarChart({
  labels,
  series,
  locale,
  height = 256,
  stacked = false,
  hideLegend = false,
  hideTooltipForEmpty = [],
}: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'bar'> | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !labels.length || !series.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currency = series[0].data[0]?.currency || 'EUR';
    const datasets = series.map((serie) => ({
      label: serie.label,
      data: serie.data.map((money) => money.amount),
      backgroundColor: serie.color,
      stack: serie.stack,
      borderWidth: 0,
      borderRadius: 4,
    }));

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: !hideLegend,
            position: 'bottom',
            labels: { usePointStyle: true, padding: 20 },
          },
          tooltip: {
            padding: 8,
            boxPadding: 4,
            intersect: false,
            mode: 'index',
            callbacks: {
              title: (context) => context[0].label,
              label: (context) => {
                const money = series[context.datasetIndex].data[context.dataIndex];
                const label = context.dataset.label;

                if (money.amount === 0 && label && hideTooltipForEmpty.includes(label)) {
                  return '';
                }

                return `${label}: ${Format.money(money, { locale })}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            stacked,
          },
          y: {
            border: { display: false },
            stacked,
            ticks: {
              callback: (value) => Format.money(Money.create(value, currency), { locale }),
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [labels, series, locale, stacked, hideLegend, hideTooltipForEmpty]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      class='w-full'
    />
  );
}
