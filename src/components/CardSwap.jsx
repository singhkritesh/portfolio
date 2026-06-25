import React, {
  Children, cloneElement, forwardRef, isValidElement,
  useCallback, useEffect, useImperativeHandle, useMemo, useRef,
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x, y: slot.y, z: slot.z,
    xPercent: -50, yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true,
  });

const CardSwap = forwardRef(({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  autoPlay = true,
  children,
}, ref) => {

  const config = useMemo(() =>
    easing === 'elastic'
      ? { ease: 'elastic.out(0.6,0.9)', durDrop: 2,    durMove: 2,   durReturn: 2,   promoteOverlap: 0.9, returnDelay: 0.05 }
      : { ease: 'power3.out',            durDrop: 0.28,  durMove: 0.24, durReturn: 0.24, promoteOverlap: 0.72, returnDelay: 0.06 },
  [easing]);

  const childArr  = useMemo(() => Children.toArray(children), [children]);
  const refs      = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
  const order     = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef     = useRef(null);
  const container = useRef(null);

  const swappingRef       = useRef(false);
  const targetIndexRef    = useRef(0);   // desired front card (scroll-driven mode)
  const doSwapRef         = useRef(null);
  const doSwapBackRef     = useRef(null);
  const jumpInstantlyRef  = useRef(null);
  const catchUpRef        = useRef(null);

  // Snap all cards to correct positions for a given order rotation — no animation
  const jumpInstantly = useCallback((targetIndex) => {
    const pos = order.current.indexOf(targetIndex);
    if (pos < 0) return;

    tlRef.current?.kill();
    swappingRef.current = false;

    const n = refs.length;
    const newOrder = [...order.current.slice(pos), ...order.current.slice(0, pos)];
    order.current = newOrder;

    newOrder.forEach((cardIdx, slotI) => {
      const el = refs[cardIdx]?.current;
      if (el) placeNow(el, makeSlot(slotI, cardDistance, verticalDistance, n), skewAmount);
    });
  }, [refs, cardDistance, verticalDistance, skewAmount]);

  jumpInstantlyRef.current = jumpInstantly;

  // Called after every animation completes.
  // If still off-target: jump to target-1 then animate the final step.
  const catchUp = useCallback(() => {
    const visual = order.current[0];
    const target = targetIndexRef.current;
    if (visual === target) return;
    const delta = target - visual;
    if (Math.abs(delta) === 1) {
      if (delta > 0) doSwapRef.current?.();
      else           doSwapBackRef.current?.();
    } else {
      const penultimate = delta > 0 ? target - 1 : target + 1;
      jumpInstantlyRef.current?.(penultimate);
      if (delta > 0) doSwapRef.current?.();
      else           doSwapBackRef.current?.();
    }
  }, []);

  catchUpRef.current = catchUp;

  // ── Forward swap ─────────────────────────────────────────────
  const doSwap = useCallback(() => {
    if (order.current.length < 2) return;
    swappingRef.current = true;

    const [front, ...rest] = order.current;
    const elFront = refs[front]?.current;
    if (!elFront) { swappingRef.current = false; catchUpRef.current?.(); return; }

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.to(elFront, { y: '+=340', duration: config.durDrop, ease: config.ease });

    tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = refs[idx]?.current;
      if (!el) return;
      const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.04}`);
    });

    const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
    tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
    tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
    tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return');

    tl.call(() => {
      order.current = [...rest, front];
      swappingRef.current = false;
      catchUpRef.current?.();
    });
  }, [refs, cardDistance, verticalDistance, config]);

  doSwapRef.current = doSwap;

  // ── Backward swap ────────────────────────────────────────────
  const doSwapBack = useCallback(() => {
    if (order.current.length < 2) return;
    swappingRef.current = true;

    const n    = order.current.length;
    const back = order.current[n - 1];
    const rest = order.current.slice(0, n - 1);
    const elBack = refs[back]?.current;
    if (!elBack) { swappingRef.current = false; catchUpRef.current?.(); return; }

    const tl = gsap.timeline();
    tlRef.current = tl;

    const frontSlot = makeSlot(0, cardDistance, verticalDistance, n);
    tl.set(elBack, { x: frontSlot.x, y: frontSlot.y - 340, z: frontSlot.z, zIndex: n + 1 }, 0);

    rest.forEach((idx, i) => {
      const el = refs[idx]?.current;
      if (!el) return;
      const slot = makeSlot(i + 1, cardDistance, verticalDistance, n);
      tl.set(el, { zIndex: slot.zIndex }, 0);
      tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, i * 0.04);
    });

    tl.to(elBack, { y: frontSlot.y, duration: config.durDrop, ease: config.ease }, 0);
    tl.set(elBack, { zIndex: frontSlot.zIndex });

    tl.call(() => {
      order.current = [back, ...rest];
      swappingRef.current = false;
      catchUpRef.current?.();
    });
  }, [refs, cardDistance, verticalDistance, config]);

  doSwapBackRef.current = doSwapBack;

  // ── goTo: scroll-driven entry point ─────────────────────────
  // For single-step: animate directly.
  // For multi-step: jump instantly to target-1, then animate the final step.
  // This gives immediate visual response with a smooth landing — no animation
  // debt and no abrupt jumps past the destination card.
  const goTo = useCallback((index) => {
    targetIndexRef.current = index;

    const visual = order.current[0];
    const delta  = index - visual;
    if (delta === 0) return;
    if (swappingRef.current) return;

    if (Math.abs(delta) === 1) {
      if (delta > 0) doSwapRef.current?.();
      else           doSwapBackRef.current?.();
    } else {
      const penultimate = delta > 0 ? index - 1 : index + 1;
      jumpInstantlyRef.current?.(penultimate);
      if (delta > 0) doSwapRef.current?.();
      else           doSwapBackRef.current?.();
    }
  }, []);

  // ── Autoplay entry points ────────────────────────────────────
  const swap = useCallback(() => {
    if (!swappingRef.current) doSwap();
  }, [doSwap]);

  const swapBack = useCallback(() => {
    if (!swappingRef.current) doSwapBack();
  }, [doSwapBack]);

  useImperativeHandle(ref, () => ({ swap, swapBack, goTo }), [swap, swapBack, goTo]);

  // Initial placement
  useEffect(() => {
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, refs.length), skewAmount);
    });
  }, [cardDistance, verticalDistance, skewAmount, refs]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay) return;
    swap();
    const id = window.setInterval(swap, delay);
    if (pauseOnHover) {
      const node = container.current;
      const pause  = () => tlRef.current?.pause();
      const resume = () => tlRef.current?.play();
      node?.addEventListener('mouseenter', pause);
      node?.addEventListener('mouseleave', resume);
      return () => {
        node?.removeEventListener('mouseenter', pause);
        node?.removeEventListener('mouseleave', resume);
        clearInterval(id);
      };
    }
    return () => clearInterval(id);
  }, [autoPlay, delay, pauseOnHover, swap]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i, ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
          onClick: e => { child.props.onClick?.(e); onCardClick?.(i); },
        })
      : child
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
});

CardSwap.displayName = 'CardSwap';
export default CardSwap;
