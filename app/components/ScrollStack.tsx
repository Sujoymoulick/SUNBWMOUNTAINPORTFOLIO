"use client";

/**
 * ScrollStack — React Bits component (TypeScript)
 * Source: https://reactbits.dev/components/scroll-stack
 *
 * Adapted from the JavaScript + CSS variant.
 * When useWindowScroll=true  → hooks into the EXISTING global Lenis instance
 *   via useLenis() from lenis/react (avoids conflicting with LenisProvider).
 * When useWindowScroll=false → creates its own scoped Lenis on the inner div.
 */

import {
  useLayoutEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import Lenis from "lenis";
import { useLenis } from "lenis/react";
import "./ScrollStack.css";

/* ── ScrollStackItem ─────────────────────────────────────────────────── */
interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
}

export const ScrollStackItem = ({
  children,
  itemClassName = "",
}: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

/* ── ScrollStack ─────────────────────────────────────────────────────── */
interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack = ({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) => {
  const scrollerRef      = useRef<HTMLDivElement>(null);
  const stackCompletedRef   = useRef(false);
  const animationFrameRef   = useRef<number | null>(null);
  const lenisRef            = useRef<Lenis | null>(null);
  const cardsRef            = useRef<HTMLElement[]>([]);
  const lastTransformsRef   = useRef(new Map<number, Record<string, number>>());
  const isUpdatingRef       = useRef(false);

  /* helpers */
  const calculateProgress = useCallback(
    (scrollTop: number, start: number, end: number) => {
      if (scrollTop < start) return 0;
      if (scrollTop > end)   return 1;
      return (scrollTop - start) / (end - start);
    },
    []
  );

  const parsePercentage = useCallback(
    (value: string | number, containerHeight: number) => {
      if (typeof value === "string" && value.includes("%")) {
        return (parseFloat(value) / 100) * containerHeight;
      }
      return parseFloat(value as string);
    },
    []
  );

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    }
    const scroller = scrollerRef.current!;
    return {
      scrollTop: scroller.scrollTop,
      containerHeight: scroller.clientHeight,
    };
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        return element.getBoundingClientRect().top + window.scrollY;
      }
      return element.offsetTop;
    },
    [useWindowScroll]
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;
    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx    = parsePercentage(stackPosition,    containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endEl = useWindowScroll
      ? document.querySelector<HTMLElement>(".scroll-stack-end")
      : scrollerRef.current?.querySelector<HTMLElement>(".scroll-stack-end");
    const endElementTop = endEl ? getElementOffset(endEl) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop    = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx    - itemStackDistance * i;
      const triggerEnd   = cardTop - scaleEndPositionPx;
      const pinStart     = cardTop - stackPositionPx    - itemStackDistance * i;
      const pinEnd       = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale   = baseScale + i * itemScale;
      const scale         = 1 - scaleProgress * (1 - targetScale);
      const rotation      = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jTop        = getElementOffset(cardsRef.current[j]);
          const jTriggerStart = jTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd  - cardTop + stackPositionPx + itemStackDistance * i;
      }

      const nt = {
        translateY: Math.round(translateY * 100) / 100,
        scale:      Math.round(scale      * 1000) / 1000,
        rotation:   Math.round(rotation   * 100) / 100,
        blur:       Math.round(blur        * 100) / 100,
      };

      const lt = lastTransformsRef.current.get(i);
      const changed =
        !lt ||
        Math.abs(lt.translateY - nt.translateY) > 0.1 ||
        Math.abs(lt.scale      - nt.scale)      > 0.001 ||
        Math.abs(lt.rotation   - nt.rotation)   > 0.1 ||
        Math.abs(lt.blur       - nt.blur)        > 0.1;

      if (changed) {
        card.style.transform = `translate3d(0,${nt.translateY}px,0) scale(${nt.scale}) rotate(${nt.rotation}deg)`;
        card.style.filter    = nt.blur > 0 ? `blur(${nt.blur}px)` : "";
        lastTransformsRef.current.set(i, nt);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, rotationAmount, blurAmount, useWindowScroll, onStackComplete,
    calculateProgress, parsePercentage, getScrollData, getElementOffset,
  ]);

  /* ── useWindowScroll=true: subscribe to the GLOBAL Lenis via useLenis ── */
  useLenis(
    useWindowScroll
      ? () => { updateCardTransforms(); }
      : undefined
  );

  /* ── Main setup effect ───────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const selector = useWindowScroll
      ? document.querySelectorAll<HTMLElement>(".scroll-stack-card")
      : scroller.querySelectorAll<HTMLElement>(".scroll-stack-card");

    const cards = Array.from(selector);
    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange          = "transform, filter";
      card.style.transformOrigin     = "top center";
      card.style.backfaceVisibility  = "hidden";
      card.style.transform           = "translateZ(0)";
    });

    /* When useWindowScroll=false, create a scoped Lenis on this container */
    if (!useWindowScroll) {
      const lenis = new Lenis({
        wrapper:  scroller,
        content:  scroller.querySelector<HTMLElement>(".scroll-stack-inner") ?? undefined,
        duration:       1.2,
        easing:         (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:    true,
        lerp:           0.1,
        syncTouch:      false,
      });

      lenis.on("scroll", () => updateCardTransforms());

      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;
    }

    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (lenisRef.current)          lenisRef.current.destroy();
      stackCompletedRef.current = false;
      cardsRef.current          = [];
      transformsCache.clear();
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance, itemScale, itemStackDistance, stackPosition,
    scaleEndPosition, baseScale, scaleDuration, rotationAmount,
    blurAmount, useWindowScroll, onStackComplete, updateCardTransforms,
  ]);

  return (
    <div
      className={`scroll-stack-scroller ${className}`.trim()}
      ref={scrollerRef}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
