import { JSX } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import EmblaCarousel from 'embla-carousel';

interface CarouselProps {
  children: JSX.Element[];
  class?: string;
}

export default function Carousel({ children, class: className = '' }: CarouselProps) {
  const [emblaApi, setEmblaApi] = useState<ReturnType<typeof EmblaCarousel>>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewportRef.current) return;

    const options = {
      align: 'start',
      loop: false,
      skipSnaps: false,
      dragFree: true,
      containScroll: 'trimSnaps',
      breakpoints: { '(min-width: 640px)': { slidesToScroll: 2 } },
    };

    const embla = EmblaCarousel(viewportRef.current, options);
    setEmblaApi(embla);

    const onSelect = () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };

    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    onSelect();

    return () => {
      embla.destroy();
    };
  }, []);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div class={`relative ${className}`} ref={rootRef}>
      <div class='overflow-hidden' ref={viewportRef}>
        <div class='flex'>
          {children.map((child, index) => (
            <div
              key={index}
              class='flex-none min-w-[240px] pl-4 first:pl-0 w-full sm:basis-1/2 lg:basis-1/3'
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <div class='mt-4 flex items-center justify-center gap-2'>
        <button
          type='button'
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          class='h-8 w-8 rounded-full flex items-center justify-center bg-secondary/10 hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          aria-label='Previous slide'
        >
          <svg
            class='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>

        <button
          type='button'
          onClick={scrollNext}
          disabled={!canScrollNext}
          class='h-8 w-8 rounded-full flex items-center justify-center bg-secondary/10 hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
          aria-label='Next slide'
        >
          <svg
            class='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
