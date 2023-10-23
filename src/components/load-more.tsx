import { useEffect, useRef } from "react";

export function LoadMoreSentinel({
  loadMore,
  isLoading,
}: {
  loadMore: () => void;
  isLoading: boolean;
}) {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 1.0,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    const currentRef = ref.current;

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMore, isLoading]);

  return <div ref={ref}></div>;
}
