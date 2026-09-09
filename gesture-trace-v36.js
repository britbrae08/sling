(() => {
  'use strict';

  const wheel = document.getElementById('letterWheel');
  const traceSvg = document.getElementById('traceSvg');
  if (!wheel || !traceSvg) return;

  const NS = 'http://www.w3.org/2000/svg';
  const gestureLine = document.createElementNS(NS, 'polyline');
  gestureLine.id = 'gestureTraceLine';
  gestureLine.setAttribute('points', '');
  gestureLine.setAttribute('fill', 'none');
  gestureLine.setAttribute('stroke', 'rgba(110,79,104,.62)');
  gestureLine.setAttribute('stroke-width', '17');
  gestureLine.setAttribute('stroke-linecap', 'round');
  gestureLine.setAttribute('stroke-linejoin', 'round');
  gestureLine.setAttribute('pointer-events', 'none');
  traceSvg.append(gestureLine);

  // Let the live segment extend beyond the circle while the finger is held down.
  traceSvg.style.overflow = 'visible';
  wheel.style.overflow = 'visible';
  if (wheel.parentElement) wheel.parentElement.style.overflow = 'visible';

  let tracking = false;
  let activePointerId = null;
  let lockedIndexes = [];
  let livePoint = null;
  let lastClientPoint = null;
  let drawFrame = 0;

  function buttons() {
    return [...wheel.querySelectorAll('.letter-btn')];
  }

  function toWheelPoint(clientX, clientY) {
    const rect = wheel.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 150, y: 150 };
    return {
      x: (clientX - rect.left) * (300 / rect.width),
      y: (clientY - rect.top) * (300 / rect.height)
    };
  }

  function buttonCenter(index) {
    const button = buttons()[index];
    if (!button) return null;
    const rect = button.getBoundingClientRect();
    return toWheelPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function nearestLetter(clientX, clientY) {
    const letterButtons = buttons();
    let bestIndex = null;
    let bestDistance = Infinity;
    let bestThreshold = 0;

    letterButtons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const distance = Math.hypot(clientX - cx, clientY - cy);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
        bestThreshold = Math.max(36, Math.min(52, Math.max(rect.width, rect.height) * .9));
      }
    });

    return bestDistance <= bestThreshold ? bestIndex : null;
  }

  function lockIndex(index) {
    if (index === null || index === undefined) return;
    const last = lockedIndexes[lockedIndexes.length - 1];
    if (index === last) return;

    // Mirror the game's backtrack behavior if the finger returns to the
    // immediately previous letter.
    if (lockedIndexes.length > 1 && index === lockedIndexes[lockedIndexes.length - 2]) {
      lockedIndexes.pop();
      return;
    }

    if (!lockedIndexes.includes(index)) lockedIndexes.push(index);
  }

  function sampleBetween(from, to) {
    if (!from || !to) return;
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / 6));
    for (let step = 1; step <= steps; step++) {
      const t = step / steps;
      lockIndex(nearestLetter(
        from.x + (to.x - from.x) * t,
        from.y + (to.y - from.y) * t
      ));
    }
  }

  function draw() {
    drawFrame = 0;
    if (!tracking || !lockedIndexes.length) {
      gestureLine.setAttribute('points', '');
      return;
    }

    const points = lockedIndexes
      .map(buttonCenter)
      .filter(Boolean);

    if (livePoint) points.push(livePoint);
    gestureLine.setAttribute(
      'points',
      points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
    );
  }

  function scheduleDraw() {
    if (drawFrame) return;
    drawFrame = requestAnimationFrame(draw);
  }

  function beginTrace(event) {
    const firstIndex = nearestLetter(event.clientX, event.clientY);
    if (firstIndex === null) return;

    tracking = true;
    activePointerId = event.pointerId;
    lockedIndexes = [firstIndex];
    livePoint = toWheelPoint(event.clientX, event.clientY);
    lastClientPoint = { x: event.clientX, y: event.clientY };
    wheel.classList.add('finger-tracing');
    wheel.setPointerCapture?.(event.pointerId);
    scheduleDraw();
  }

  function moveTrace(event) {
    if (!tracking || event.pointerId !== activePointerId) return;

    const current = { x: event.clientX, y: event.clientY };
    sampleBetween(lastClientPoint, current);
    lockIndex(nearestLetter(current.x, current.y));
    livePoint = toWheelPoint(current.x, current.y);
    lastClientPoint = current;
    scheduleDraw();
  }

  function endTrace(event) {
    if (!tracking || (event && event.pointerId !== activePointerId)) return;
    tracking = false;
    activePointerId = null;
    lockedIndexes = [];
    livePoint = null;
    lastClientPoint = null;
    wheel.classList.remove('finger-tracing');
    if (drawFrame) cancelAnimationFrame(drawFrame);
    drawFrame = 0;
    gestureLine.setAttribute('points', '');
  }

  wheel.addEventListener('pointerdown', beginTrace, { passive: true });
  wheel.addEventListener('pointermove', moveTrace, { passive: true });
  wheel.addEventListener('pointerup', endTrace, { passive: true });
  wheel.addEventListener('pointercancel', endTrace, { passive: true });
  wheel.addEventListener('lostpointercapture', endTrace, { passive: true });
})();
