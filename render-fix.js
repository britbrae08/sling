(() => {
  'use strict';

  const proto = CanvasRenderingContext2D.prototype;
  const original = {
    beginPath: proto.beginPath,
    moveTo: proto.moveTo,
    lineTo: proto.lineTo,
    arc: proto.arc,
    stroke: proto.stroke,
    fill: proto.fill,
    fillRect: proto.fillRect,
    strokeRect: proto.strokeRect
  };

  const canvas = document.getElementById('gameCanvas');
  const anchor = { x: 72, y: 548 };
  const canvasSize = { w: 390, h: 690 };
  const groundY = 642;
  const safeStoneY = 631;
  const visualMaxPull = 128;
  const pathState = new WeakMap();
  let released = false;
  let draggingVisual = false;
  let visualPoint = { x: anchor.x, y: anchor.y };

  const nativeCanvasAdd = canvas?.addEventListener.bind(canvas);

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvasSize.w / rect.width),
      y: (event.clientY - rect.top) * (canvasSize.h / rect.height)
    };
  }

  function clampVisualPoint(point) {
    let dx = point.x - anchor.x;
    let dy = point.y - anchor.y;
    const distance = Math.hypot(dx, dy);
    if (distance > visualMaxPull) {
      dx = dx / distance * visualMaxPull;
      dy = dy / distance * visualMaxPull;
    }
    dx = Math.min(dx, 28);
    return { x: anchor.x + dx, y: anchor.y + dy };
  }

  nativeCanvasAdd?.('pointerdown', event => {
    released = false;
    draggingVisual = true;
    visualPoint = clampVisualPoint(canvasPoint(event));
  }, { capture: true });

  nativeCanvasAdd?.('pointermove', event => {
    if (!draggingVisual) return;
    visualPoint = clampVisualPoint(canvasPoint(event));
  }, { capture: true });

  const markReleased = () => {
    released = true;
    draggingVisual = false;
  };

  nativeCanvasAdd?.('pointerup', markReleased, { capture: true });
  nativeCanvasAdd?.('pointercancel', markReleased, { capture: true });

  // The original prototype treats a stone that begins below the collision line
  // as if it has already hit the ground. Let the player's finger continue below
  // the ground visually, while the physics stone stays just above the collision
  // line so an upward release can actually take off.
  if (canvas && nativeCanvasAdd) {
    canvas.addEventListener = function (type, listener, options) {
      if (type !== 'pointermove') {
        return nativeCanvasAdd(type, listener, options);
      }

      return nativeCanvasAdd(type, event => {
        const point = canvasPoint(event);
        if (point.y <= safeStoneY) {
          return listener.call(canvas, event);
        }

        const rect = canvas.getBoundingClientRect();
        const safeClientY = rect.top + (safeStoneY / canvasSize.h) * rect.height;
        const proxy = new Proxy(event, {
          get(target, property) {
            if (property === 'clientY') return safeClientY;
            const value = Reflect.get(target, property, target);
            return typeof value === 'function' ? value.bind(target) : value;
          }
        });
        return listener.call(canvas, proxy);
      }, options);
    };
  }

  function stateFor(ctx) {
    let state = pathState.get(ctx);
    if (!state) {
      state = { move: null, line: null };
      pathState.set(ctx, state);
    }
    return state;
  }

  function color(value) {
    return String(value || '').replace(/\s+/g, '').toLowerCase();
  }

  proto.beginPath = function (...args) {
    const state = stateFor(this);
    state.move = null;
    state.line = null;
    return original.beginPath.apply(this, args);
  };

  proto.moveTo = function (x, y) {
    stateFor(this).move = { x, y };
    return original.moveTo.call(this, x, y);
  };

  proto.lineTo = function (x, y) {
    const state = stateFor(this);
    state.line = { x, y };

    const stroke = color(this.strokeStyle);
    const isSlingBand = stroke === '#4b2b1e' || stroke === '#3c2218' || stroke === 'rgb(75,43,30)' || stroke === 'rgb(60,34,24)';
    if (!released && draggingVisual && isSlingBand && visualPoint.y > groundY - 12) {
      state.line = { ...visualPoint };
      return original.lineTo.call(this, visualPoint.x, visualPoint.y);
    }

    return original.lineTo.call(this, x, y);
  };

  proto.arc = function (x, y, radius, startAngle, endAngle, counterclockwise) {
    const fill = color(this.fillStyle);
    const isStone = radius === 10 && (fill === '#d8d0bf' || fill === 'rgb(216,208,191)');
    if (!released && draggingVisual && isStone && visualPoint.y > groundY - 12) {
      return original.arc.call(this, visualPoint.x, visualPoint.y, radius, startAngle, endAngle, counterclockwise);
    }
    return original.arc.call(this, x, y, radius, startAngle, endAngle, counterclockwise);
  };

  proto.stroke = function (...args) {
    const stroke = color(this.strokeStyle);
    const state = stateFor(this);
    const isSlingBand = stroke === '#4b2b1e' || stroke === '#3c2218' || stroke === 'rgb(75,43,30)' || stroke === 'rgb(60,34,24)';

    if (released && isSlingBand && state.move && state.line) {
      original.beginPath.call(this);
      original.moveTo.call(this, state.move.x, state.move.y);
      original.lineTo.call(this, anchor.x, anchor.y);
      return original.stroke.apply(this, args);
    }

    return original.stroke.apply(this, args);
  };

  proto.fill = function (...args) {
    const fill = color(this.fillStyle);
    // Hide the dotted predicted trajectory and its dark power-meter backing.
    if (
      fill === '#fff5d7' ||
      fill === 'rgb(255,245,215)' ||
      fill === 'rgba(19,39,31,0.52)'
    ) {
      return;
    }
    return original.fill.apply(this, args);
  };

  proto.fillRect = function (x, y, w, h) {
    const fill = color(this.fillStyle);
    // Hide the aiming power bar so players judge each shot by feel.
    if ((fill === '#f2d18e' || fill === 'rgb(242,209,142)') && y === 35 && h === 6) return;
    return original.fillRect.call(this, x, y, w, h);
  };

  proto.strokeRect = function (x, y, w, h) {
    if (x === 35 && y === 35 && h === 6) return;
    return original.strokeRect.call(this, x, y, w, h);
  };
})();
