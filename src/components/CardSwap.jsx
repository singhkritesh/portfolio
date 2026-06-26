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
  skewAmount = 6,
  children,
}, ref) => {
  const childArr  = useMemo(() => Children.toArray(children), [children]);
  const refs      = useMemo(() => childArr.map(() => React.createRef()), [childArr.length]);
  const container = useRef(null);

  useEffect(() => {
    refs.forEach((r, i) => {
      if (r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, refs.length), skewAmount);
    });
  }, [cardDistance, verticalDistance, skewAmount, refs]);

  // One flat master timeline for all n-1 transitions.
  // Transition i occupies the range [i, i+1) seconds:
  //   Phase 1  [i,     i+0.65]: front card drops; other cards promote.
  //   Snap     [i+0.65]:        front card zIndex collapses to 0 (goes behind stack).
  //   Phase 2  [i+0.65, i+1.0]: front card tucks to back slot.
  //   Restore  [i+0.999]:       front card zIndex set to backSlot.zIndex.
  //
  // The front card holds zIndex n+1 throughout phase 1 — one above any promoting card's
  // max zIndex (n) — so it always paints on top while dropping.
  const buildMasterTimeline = useCallback(() => {
    const n = refs.length;
    const tl = gsap.timeline({ paused: true });

    for (let i = 0; i < n - 1; i++) {
      const startOrder = Array.from({ length: n }, (_, k) => (i + k) % n);
      const endOrder   = Array.from({ length: n }, (_, k) => (i + 1 + k) % n);
      const startSlots = startOrder.map((_, si) => makeSlot(si, cardDistance, verticalDistance, n));
      const endSlots   = endOrder.map((_, si)   => makeSlot(si, cardDistance, verticalDistance, n));

      const frontIdx      = startOrder[0];
      const frontFrom     = startSlots[0];   // slot 0: {x:0,y:0,z:0}
      const backTo        = endSlots[n - 1];
      const DROP_Y        = frontFrom.y + 340;
      const TOP_Z         = n + 1;           // above any card's normal zIndex

      // ── Phase 1: front card drops (stays on top via zIndex n+1) ──────
      tl.fromTo(
        refs[frontIdx].current,
        { x: frontFrom.x, y: frontFrom.y, z: frontFrom.z, zIndex: TOP_Z, immediateRender: false },
        { x: frontFrom.x, y: DROP_Y,      z: frontFrom.z, zIndex: TOP_Z, ease: 'power1.in', duration: 0.65 },
        i   // absolute position in master timeline
      );

      // Promoting cards: each moves one slot forward simultaneously
      startOrder.slice(1).forEach((cardIdx, j) => {
        tl.fromTo(
          refs[cardIdx].current,
          { x: startSlots[j + 1].x, y: startSlots[j + 1].y, z: startSlots[j + 1].z, zIndex: startSlots[j + 1].zIndex, immediateRender: false },
          { x: endSlots[j].x,       y: endSlots[j].y,       z: endSlots[j].z,       zIndex: endSlots[j].zIndex,       ease: 'power1.inOut', duration: 0.65 },
          '<'
        );
      });

      // ── Boundary snap: collapse front card's zIndex (scrub-reversible) ──
      // Duration 0.001 makes it near-instant but still properly reverses on scrub-back.
      tl.fromTo(
        refs[frontIdx].current,
        { zIndex: TOP_Z, immediateRender: false },
        { zIndex: 0,     duration: 0.001 },
        i + 0.65
      );

      // ── Phase 2: front card tucks behind the stack ────────────────────
      tl.fromTo(
        refs[frontIdx].current,
        { x: frontFrom.x, y: DROP_Y,  z: frontFrom.z, immediateRender: false },
        { x: backTo.x,    y: backTo.y, z: backTo.z,    ease: 'power1.out', duration: 0.35 },
        '<'  // same start as the zIndex snap = i + 0.65
      );

      // ── End snap: restore proper zIndex for the back slot ─────────────
      tl.fromTo(
        refs[frontIdx].current,
        { zIndex: 0,             immediateRender: false },
        { zIndex: backTo.zIndex, duration: 0.001 },
        i + 0.999
      );
    }

    return tl;
  }, [refs, cardDistance, verticalDistance]);

  useImperativeHandle(ref, () => ({ buildMasterTimeline }), [buildMasterTimeline]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i, ref: refs[i],
          style: { width, height, ...(child.props.style ?? {}) },
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
