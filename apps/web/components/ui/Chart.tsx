import { useEffect, useRef } from 'preact/hooks';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Money } from '@shared/schema/Money.ts';

ChartJS.register(...registerables);

interface ChartData {
  month: string;
  income: Money;
  expenses: Money;
}

interface ChartProps {
  data: ChartData[];
  height?: number;
  locale?: string;
}

export function Chart({ data, height = 256, locale = 'es-ES' }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    // Destroy previous chart instance if it exists
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Get currency from first data point since all points should use the same currency
    const currency = data[0]?.income.currency ?? 'EUR';

    chartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: data.map((item) => item.month),
        datasets: [
          {
            label: 'Income',
            data: data.map((item) => item.income.amount),
            backgroundColor: '#22c55e',
            borderRadius: 4,
          },
          {
            label: 'Expenses',
            data: data.map((item) => item.expenses.amount),
            backgroundColor: '#ef4444',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            padding: 12,
            backgroundColor: 'white',
            titleColor: 'black',
            bodyColor: 'var(--foreground)',
            borderColor: 'var(--border)',
            borderWidth: 1,
            boxWidth: 10,
            boxHeight: 10,
            boxPadding: 4,
            intersect: false,
            mode: 'index',
            callbacks: {
              labelColor: (context) => ({
                borderColor: context.dataset.backgroundColor as string,
                backgroundColor: context.dataset.backgroundColor as string,
              }),
              title: (context) => {
                return context[0].label;
              },
              label: (context) => {
                const value = context.parsed.y;
                return `${context.dataset.label}: ${
                  value.toLocaleString(locale, {
                    style: 'currency',
                    currency,
                  })
                }`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            border: {
              display: false,
            },
          },
          y: {
            border: {
              display: false,
            },
            ticks: {
              callback: (value) => {
                return new Intl.NumberFormat(locale, {
                  style: 'currency',
                  currency,
                  notation: 'compact',
                  maximumFractionDigits: 1,
                }).format(Number(value));
              },
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
  }, [data, locale]);

  return (
    <canvas
      ref={canvasRef}
      height={height}
      class='w-full'
    />
  );
}
