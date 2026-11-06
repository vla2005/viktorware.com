/* Original procedural hardware; CSS 3D keeps the static site dependency-free. */
var Processor = (function () {
  'use strict';
  var modules = [
    { id: 'stack', sections: ['u1'], href: '#u1', labels: ['STACK', 'STACK'], icon: 'm8 6-6 7 6 7m8-14 6 7-6 7m-2-17-4 20', shift: [18, -12, 2] },
    { id: 'projects', sections: ['u2'], href: '#u2', labels: ['PROJETOS', 'PROJECTS'], icon: 'M2 7h8l3 3h10v12H2ZM2 7V4h8l3 3', shift: [20, 12, 2] },
    { id: 'github', sections: ['u3'], href: '#u3', labels: ['GITHUB', 'GITHUB'], icon: 'M7 3v12a5 5 0 0 0 5 5h5M17 7v13M4 3a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14 7a3 3 0 1 0 6 0a3 3 0 1 0-6 0M14 20a3 3 0 1 0 6 0a3 3 0 1 0-6 0', shift: [-12, -8, -2] },
    { id: 'experience', sections: ['u4'], href: '#u4', labels: ['TRAJETÓRIA', 'JOURNEY'], icon: 'M4 22V14h3v8m4 0V9h3v13m4 0V3h3v19', shift: [-20, 10, -3] },
    { id: 'contact', sections: ['u5'], href: '#u5', labels: ['CONTATO', 'CONTACT'], icon: 'm2 12 21-9-7 21-5-9-9-3Zm9 3L23 3', shift: [0, 24, -1] }
  ];
  function clamp(v) { return Math.max(0, Math.min(1, v)); }
  function smooth(v) { v = clamp(v); return v * v * (3 - 2 * v); }
  function sample(bounds, height, scroll, reduced) {
    height = Math.max(1, height);
    var weights = modules.map(function (module) {
      return Math.max.apply(null, module.sections.map(function (id) {
        var rect = bounds[id];
        if (!rect) return 0;
        var value = smooth(Math.min(clamp((height * .82 - rect.top) / (height * .4)), clamp((rect.bottom - height * .18) / (height * .4))));
        return value;
      }));
    });
    var best = Math.max.apply(null, weights);
    return { weights: weights, active: best > .35 ? weights.indexOf(best) : -1, expansion: reduced ? 0 : smooth(scroll / (height * .65)) };
  }
  function svg(content, className, viewBox) {
    return '<svg class="' + className + '" viewBox="' + (viewBox || '0 0 360 300') + '" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">' + content + '</svg>';
  }
  function logo() {
    return svg('<path fill="currentColor" stroke="none" d="M2 2h4v4H2zM14 2h4v4h-4zM2 8h4v4H2zM14 8h4v4h-4zM8 14h4v4H8z"/>', 'cpu-logo', '0 0 20 20');
  }
  function circuits(seed) {
    var paths = '', pads = '';
    for (var i = 0; i < 9; i++) {
      var x = 28 + i * 36, turn = 34 + ((i + seed) % 3) * 9;
      paths += '<path d="M' + x + ' 8v' + turn + 'l18 18v22M' + (360 - x) + ' 292v-' + turn + 'l-18-18v-22"/>';
      pads += '<circle cx="' + (x + 18) + '" cy="' + (turn + 48) + '" r="2"/><circle cx="' + (342 - x) + '" cy="' + (252 - turn) + '" r="2"/>';
    }
    for (var j = 0; j < 5; j++) {
      var y = 74 + j * 32;
      paths += '<path d="M8 ' + y + 'h30l18 14h34M352 ' + (300 - y) + 'h-30l-18-14h-34"/>';
    }
    return svg('<g class="cpu-traces">' + paths + '</g><g class="cpu-vias">' + pads + '</g><path class="cpu-live-trace" d="M8 206h38l32-32h42M352 94h-38l-32 32h-42M176 8v40l24 24v20"/>', 'cpu-circuits');
  }
  function screws() {
    return '<i class="cpu-screw nw"></i><i class="cpu-screw ne"></i><i class="cpu-screw sw"></i><i class="cpu-screw se"></i>';
  }
  function edges() {
    return '<i class="cpu-edge front"></i><i class="cpu-edge back"></i><i class="cpu-edge left"></i><i class="cpu-edge right"></i>';
  }
  function pins() {
    return '<i class="cpu-pins north"></i><i class="cpu-pins south"></i><i class="cpu-pins east"></i><i class="cpu-pins west"></i>';
  }
  function components(kind) {
    var html = '';
    if (kind === 'stack') return '<div class="cpu-lid">' + logo() + '<span>VIKTORWARE</span><small>MODULAR COMPUTE / 05</small></div>';
    var count = kind === 'github' ? 6 : kind === 'projects' ? 2 : 4;
    for (var i = 0; i < count; i++) html += '<i class="cpu-chip chip-' + i + '"><b></b></i>';
    return '<div class="cpu-components ' + kind + '">' + html + '</div>';
  }
  function build(stage) {
    var layers = modules.map(function (m, i) {
      return '<div class="cpu-module" data-module="' + m.id + '" style="--level:' + (4 - i) + '">' +
        '<div class="cpu-surface">' + circuits(i) + screws() + components(m.id) + '<span class="cpu-board-id">VW / M0' + (i + 1) + '</span></div>' + edges() +
        '<a class="cpu-label" href="' + m.href + '" tabindex="-1" aria-hidden="true">' + svg('<path d="' + m.icon + '"/>', 'cpu-icon', '0 0 26 26') + '<span>0' + (i + 1) + '</span><b data-module-label="' + i + '"></b><i></i></a></div>';
    }).join('');
    stage.innerHTML = '<div class="cpu-hud" aria-hidden="true"><span><i></i> VW—05 <b>MODULAR PROCESSOR</b></span><span class="cpu-status"></span></div>' +
      '<div class="cpu-viewport" aria-hidden="true"><div class="cpu-scale"><div class="cpu-float"><div class="cpu-assembly">' +
      '<div class="cpu-shadow"></div><div class="cpu-base"><div class="cpu-surface">' + circuits(2) + screws() +
      '<div class="cpu-capacitors"></div><div class="cpu-capacitors opposite"></div><span class="cpu-board-brand">VIKTORWARE / SYSTEM BOARD</span></div>' + edges() +
      '<div class="cpu-socket">' + pins() + '<div class="cpu-surface">' + screws() + '</div>' + edges() +
      '<div class="cpu-core"><div class="cpu-surface">' + logo() + '<span>VW—05</span></div>' + edges() + '</div></div></div>' + layers +
      '</div></div></div></div><nav class="cpu-nav">' + modules.map(function (m, i) {
        return '<a href="' + m.href + '" data-module-link="' + i + '"><span>0' + (i + 1) + '</span><b data-module-label="' + i + '"></b></a>';
      }).join('') + '</nav><div class="cpu-caption" aria-hidden="true"></div>';
  }
  function mount(stage) {
    build(stage);
    var els = Array.from(stage.querySelectorAll('[data-module]'));
    var links = Array.from(stage.querySelectorAll('[data-module-link]'));
    var reduced = matchMedia('(prefers-reduced-motion: reduce)');
    var mobile = matchMedia('(max-width: 1023px), (max-width: 1100px) and (orientation: portrait)');
    var coarse = matchMedia('(pointer: coarse)');
    var hero = document.querySelector('.hero'), layout = document.querySelector('.layout');
    var lang = 'pt', active = -1, expansion = 0, weights = [0, 0, 0, 0, 0];
    var target = { expansion: 0, weights: weights.slice(), active: -1 }, bounds = {}, scroll = 0;
    var frame = 0, last = 0, visible = true, pointer = [0, 0], tilt = [0, 0];
    var listeners = [], observer, resizeObserver;
    function listen(el, name, fn, options) {
      if (el.addEventListener) {
        el.addEventListener(name, fn, options);
        listeners.push(function () { el.removeEventListener(name, fn, options); });
      } else if (name === 'change' && el.addListener) {
        el.addListener(fn);
        listeners.push(function () { el.removeListener(fn); });
      }
    }
    function status() {
      stage.querySelector('.cpu-status').textContent = active < 0 ? (lang === 'pt' ? 'NÚCLEO ONLINE' : 'CORE ONLINE') : '0' + (active + 1) + ' / ' + modules[active].labels[lang === 'pt' ? 0 : 1];
      links.forEach(function (link, i) { link.setAttribute('aria-current', String(i === active)); });
      stage.dataset.active = active < 0 ? 'idle' : modules[active].id;
    }
    function setLanguage(value) {
      lang = value;
      stage.querySelectorAll('[data-module-label]').forEach(function (el) { el.textContent = modules[+el.dataset.moduleLabel].labels[lang === 'pt' ? 0 : 1]; });
      stage.querySelector('.cpu-nav').setAttribute('aria-label', lang === 'pt' ? 'Módulos do processador' : 'Processor modules');
      stage.querySelector('.cpu-caption').textContent = lang === 'pt' ? 'ROLE PARA EXPLORAR · SELECIONE UM MÓDULO' : 'SCROLL TO EXPLORE · SELECT A MODULE';
      status();
    }
    function draw(now) {
      frame = 0;
      var alpha = reduced.matches ? 1 : 1 - Math.exp(-Math.min((now - last) / 1000 || .016, .05) * 12);
      last = now;
      var unsettled = false;
      function approach(from, to) { if (Math.abs(to - from) < .001) return to; unsettled = true; return from + (to - from) * alpha; }
      expansion = approach(expansion, target.expansion);
      tilt = tilt.map(function (v, i) { return approach(v, reduced.matches ? 0 : pointer[i]); });
      stage.style.setProperty('--spread', expansion.toFixed(4));
      stage.classList.toggle('cpu-open', expansion > .15);
      stage.style.setProperty('--tilt-x', tilt[0].toFixed(3) + 'deg');
      stage.style.setProperty('--tilt-z', tilt[1].toFixed(3) + 'deg');
      els.forEach(function (el, i) {
        weights[i] = approach(weights[i], target.weights[i]);
        var weight = reduced.matches ? 0 : weights[i], rank = 4 - i;
        var travel = mobile.matches ? .73 : 1;
        var clearance = reduced.matches ? 0 : ((weights[i + 1] || 0) - (weights[i - 1] || 0)) * 5;
        var z = 62 + rank * 14 + expansion * (55 + rank * 58) * travel + (weight * 14 + clearance) * travel;
        var move = modules[i].shift;
        el.style.transform = 'translate3d(' + (weight * move[0]).toFixed(2) + 'px,' + (weight * move[1]).toFixed(2) + 'px,' + z.toFixed(2) + 'px) rotateZ(' + (weight * move[2]).toFixed(2) + 'deg)';
        el.style.setProperty('--active', weights[i].toFixed(4));
      });
      if (unsettled) wake();
    }
    function wake() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); }
    function update(rects, y) {
      bounds = rects; scroll = y;
      target = sample(bounds, window.innerHeight, scroll, reduced.matches);
      if (active !== target.active) { active = target.active; status(); }
      wake();
    }
    function resize() {
      if (mobile.matches && stage.parentNode !== hero) hero.appendChild(stage);
      else if (!mobile.matches && stage.parentNode !== layout) layout.insertBefore(stage, layout.firstChild);
      var viewport = stage.querySelector('.cpu-viewport');
      var frameHeight = mobile.matches ? 520 : window.innerHeight <= 750 ? 720 : 610;
      var scale = Math.min(1, (viewport.clientWidth - 16) / 450, viewport.clientHeight / frameHeight);
      stage.style.setProperty('--scene-scale', Math.max(.35, scale).toFixed(3));
      pointer = [0, 0];
      update(bounds, scroll);
    }
    listen(stage, 'pointermove', function (e) {
      if (reduced.matches || coarse.matches || mobile.matches) return;
      var rect = stage.getBoundingClientRect();
      pointer = [((e.clientY - rect.top) / rect.height - .5) * -4, ((e.clientX - rect.left) / rect.width - .5) * 5];
      wake();
    }, { passive: true });
    listen(stage, 'pointerleave', function () { pointer = [0, 0]; wake(); });
    links.forEach(function (link, i) {
      ['pointerenter', 'focus'].forEach(function (name) { listen(link, name, function () { els[i].classList.add('is-hovered'); }); });
      ['pointerleave', 'blur'].forEach(function (name) { listen(link, name, function () { els[i].classList.remove('is-hovered'); }); });
    });
    listen(reduced, 'change', function () { stage.classList.toggle('cpu-reduced', reduced.matches); pointer = [0, 0]; update(bounds, scroll); });
    listen(mobile, 'change', resize);
    listen(window, 'resize', resize, { passive: true });
    listen(document, 'visibilitychange', function () { stage.classList.toggle('cpu-paused', document.hidden || !visible); if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); });
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        stage.classList.toggle('cpu-paused', !visible || document.hidden);
        if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; }
      });
      observer.observe(stage);
    }
    if ('ResizeObserver' in window) { resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage); }
    stage.classList.toggle('cpu-reduced', reduced.matches);
    setLanguage(lang);
    resize();
    return {
      update: update,
      setLanguage: setLanguage,
      projectElement: stage.querySelector('[data-module="projects"] .cpu-label'),
      destroy: function () { cancelAnimationFrame(frame); listeners.forEach(function (off) { off(); }); if (observer) observer.disconnect(); if (resizeObserver) resizeObserver.disconnect(); }
    };
  }
  return { modules: modules, sample: sample, mount: mount };
})();
