import { Money } from '@shared/schema/Money.ts';
import { Chart, registerables } from 'chart.js';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { Format } from '../../utils/format.ts';

Chart.register(...registerables);

interface PieChartEntry {
  name: string;
  value: Money;
  color: string;
}

interface PieChartProps {
  values: PieChartEntry[];
  locale: string;
  height?: number;
  variant?: 'pie' | 'ring';
  showLabels?: boolean;
}

export function PieChart({
  values,
  locale,
  height = 160,
  variant = 'pie',
  showLabels = true,
}: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<'pie', Money[]> | null>(null);

  const chartData = useMemo(() => {
    const totalValue = values.reduce((sum, entry) => sum + entry.value.amount, 0);

    if (totalValue === 0) return { labels: [], data: [], colors: [], percentages: [] };

    return {
      labels: values.map((entry) => entry.name),
      data: values.map((entry) => entry.value),
      percentages: values.map((entry) => 100 * entry.value.amount / totalValue),
      colors: values.map((entry) => entry.color),
    };
  }, [values]);

  useEffect(() => {
    if (!canvasRef.current || !values.length) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartRef.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            data: chartData.data,
            backgroundColor: chartData.colors,
            borderWidth: 1,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: { key: 'amount' },
        cutout: variant === 'ring' ? '50%' : undefined,
        layout: {
          padding: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 8,
            boxPadding: 4,
            intersect: false,
            callbacks: {
              label: (context) => {
                const money = context.raw as Money;
                const percentage = chartData.percentages[context.dataIndex];

                return `${Format.money(money, { locale })} (${percentage.toFixed(1)}%)`;
              },
            },
          },
        },
      },
      plugins: [
        {
          id: 'segmentLabels',
          afterDatasetsDraw(chart) {
            if (!showLabels) return;

            const { ctx, data } = chart;

            chart.data.datasets.forEach((_, datasetIndex) => {
              const meta = chart.getDatasetMeta(datasetIndex);

              if (!meta.hidden) {
                meta.data.forEach((element, index) => {
                  if (chartData.percentages[index] < 5) return;

                  const model = element as unknown as {
                    x: number;
                    y: number;
                    outerRadius: number;
                    startAngle: number;
                    endAngle: number;
                    circumference: number;
                  };

                  const angle = model.startAngle + (model.endAngle - model.startAngle) / 2;
                  const radius = model.outerRadius * 1.2;

                  const x = model.x + (Math.cos(angle) * radius);
                  const y = model.y + (Math.sin(angle) * radius);

                  const label = data.labels?.[index] as string;

                  ctx.save();

                  ctx.textAlign = x < model.x ? 'right' : 'left';
                  ctx.textBaseline = 'middle';

                  const textWidth = ctx.measureText(label).width + 4;
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                  ctx.fillRect(x < model.x ? x - textWidth - 2 : x - 2, y - 9, textWidth + 4, 18);

                  ctx.fillStyle = '#000000';
                  ctx.fillText(label, x, y);

                  ctx.restore();
                });
              }
            });
          },
        },
      ],
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData, values, locale, variant, showLabels]);

  return (
    <div class='h-full w-full flex flex-col'>
      <div class='flex-1' style={{ minHeight: `${height}px` }}>
        <canvas ref={canvasRef} class='w-full h-full' />
      </div>
    </div>
  );
}
