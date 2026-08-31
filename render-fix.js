(() => {
  'use strict';

  const proto = CanvasRenderingContext2D.prototype;
  const original = {
    beginPath: proto.beginPath,
    moveTo: proto.moveTo,
    lineTo: proto.lineTo,
    stroke: proto.stroke,
    fill: proto.fill,
    fillRect: proto.fillRect,
    strokeRect: proto.strokeRect
  };

  const anchor = { x: 72, y: 548 };
  const pathState = new WeakMap();

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
    stateFor(this).line = { x, y };
    return original.lineTo.call(this, x, y);
  };

  proto.stroke = function (...args) {
    const stroke = color(this.strokeStyle);
    const state = stateFor(this);
    const isSlingBand = stroke === '#4b2b1e' || stroke === '#3c2218' || stroke === 'rgb(75,43,30)' || stroke === 'rgb(60,34,24)';

    if (isSlingBand && state.move && state.line) {
      const distanceFromAnchor = Math.hypot(state.line.x - anchor.x, state.line.y - anchor.y);
      if (distanceFromAnchor > 118) {
        original.beginPath.call(this);
        original.moveTo.call(this, state.move.x, state.move.y);
        original.lineTo.call(this, anchor.x, anchor.y);
        return original.stroke.apply(this, args);
      }
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
