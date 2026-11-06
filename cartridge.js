/* The same physical face travels from its socket into the native project dialog. */
var Cartridge = (function () {
  'use strict';
  function mount(options) {
    var trigger = document.getElementById('vault'), dialog = document.getElementById('srv');
    var home = trigger.querySelector('.cartridge-scene'), body = trigger.querySelector('.cartridge-body');
    var flight = document.getElementById('cartridgeFlight'), room = document.getElementById('srvRoom');
    var boot = document.getElementById('srvBoot');
    var motion = matchMedia('(prefers-reduced-motion: reduce)');
    var phase = 'closed', epoch = 0, timers = new Map(), animations = new Set();
    var returnFocus = trigger, afterClose = null, ownedEntry = false, returnURL = '', origin;
    var hash = '#projects-u02';
    function setPhase(value) {
      phase = value; dialog.dataset.phase = value;
      trigger.setAttribute('aria-expanded', String(value !== 'closed'));
      trigger.classList.toggle('is-active', value !== 'closed');
    }
    function delay(ms) {
      if (motion.matches) return Promise.resolve();
      return new Promise(function (resolve) {
        var id = setTimeout(function () { timers.delete(id); resolve(); }, ms);
        timers.set(id, resolve);
      });
    }
    function cancel() {
      epoch++;
      timers.forEach(function (resolve, id) { clearTimeout(id); resolve(); }); timers.clear();
      animations.forEach(function (animation) { animation.cancel(); }); animations.clear();
    }
    async function animate(el, frames, ms) {
      if (motion.matches || !el.animate) return;
      var animation;
      try {
        animation = el.animate(frames, { duration: ms, easing: 'cubic-bezier(.22,.7,.22,1)', fill: 'forwards' });
        animations.add(animation);
        // A browser animation failure cannot block access to the projects.
        await Promise.race([animation.finished.catch(function () {}), delay(ms + 120)]);
      } catch (_) {} finally {
        if (animation) { animations.delete(animation); animation.cancel(); }
      }
    }
    function rectStyle(rect) { return { left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px' }; }
    function fullRect() { return { left: 10, top: 10, width: innerWidth - 20, height: innerHeight - 20 }; }
    function place(rect) { Object.assign(flight.style, rectStyle(rect)); }
    function valid(token) { return token === epoch && dialog.open; }
    function showGallery() {
      if (!dialog.open) return;
      place(fullRect()); setPhase('gallery'); dialog.classList.add('in');
      room.inert = false; room.removeAttribute('aria-hidden');
      document.getElementById('srvClose').focus({ preventScroll: true });
    }
    function restore() {
      cancel();
      home.appendChild(body); body.classList.remove('in-flight');
      flight.removeAttribute('style'); dialog.classList.remove('in');
      document.documentElement.classList.remove('srv-lock');
      trigger.classList.remove('extracted'); setPhase('closed');
      room.inert = true; room.setAttribute('aria-hidden', 'true');
      if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
      var callback = afterClose; afterClose = null;
      // Let scrollbar/layout observers settle before navigating to another section.
      var token = epoch;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (token !== epoch || phase !== 'closed') return;
        if (location.hash === hash) open(true);
        else if (callback) callback();
      }); });
    }
    async function closeVisual() {
      if (phase === 'closed' || phase === 'closing') return;
      var current = flight.getBoundingClientRect();
      cancel(); var token = epoch;
      setPhase('closing'); dialog.classList.remove('in'); room.inert = true; room.setAttribute('aria-hidden', 'true');
      document.getElementById('cartridgeCancel').focus({ preventScroll: true });
      var homeRect = home.getBoundingClientRect();
      // Measure the socket at its current breakpoint without painting an intermediate frame.
      home.appendChild(body); body.classList.remove('in-flight');
      var destination = body.getBoundingClientRect();
      flight.appendChild(body); body.classList.add('in-flight');
      if (!destination || homeRect.bottom < 0 || homeRect.top > innerHeight) destination = { left: innerWidth / 2, top: innerHeight / 2, width: 1, height: 1 };
      place(destination);
      await animate(flight, [rectStyle(current), rectStyle(destination)], 360);
      if (token !== epoch) return;
      dialog.close();
    }
    function close(callback) {
      if (phase === 'closed') { if (callback) callback(); return; }
      if (phase === 'closing') return;
      afterClose = callback || (!returnURL ? function () { document.getElementById('u2').scrollIntoView({ behavior: 'instant' }); } : null);
      if (location.hash === hash) {
        if (ownedEntry) { ownedEntry = false; history.back(); }
        else history.replaceState(history.state, '', returnURL || '#u2');
      }
      closeVisual();
    }
    async function open(direct) {
      if (phase !== 'closed') return;
      cancel(); var token = epoch;
      returnFocus = document.activeElement === document.body ? trigger : document.activeElement;
      origin = body.getBoundingClientRect();
      if (!direct) {
        returnURL = location.href;
        try { history.pushState({ projectGallery: true, returnURL: returnURL }, '', hash); ownedEntry = true; } catch (_) { ownedEntry = false; }
      } else { ownedEntry = !!(history.state && history.state.projectGallery); returnURL = ownedEntry ? history.state.returnURL || '' : ''; }
      room.scrollTop = 0; room.inert = true; room.setAttribute('aria-hidden', 'true');
      refresh(); boot.querySelectorAll('span').forEach(function (line) { line.classList.remove('shown'); });
      setPhase('activating');
      dialog.showModal(); document.documentElement.classList.add('srv-lock');
      document.getElementById('cartridgeCancel').focus({ preventScroll: true });
      flight.appendChild(body); body.classList.add('in-flight'); trigger.classList.add('extracted'); place(origin);
      if (direct || motion.matches) { showGallery(); return; }
      try {
        await delay(160); if (!valid(token)) return;
        setPhase('ejecting');
        var width = Math.min(innerWidth - 40, origin.width * 1.16);
        var lifted = { left: (innerWidth - width) / 2, top: Math.max(35, (innerHeight - origin.height * 1.16) / 2 - 30), width: width, height: origin.height * 1.16 };
        place(lifted);
        await animate(flight, [Object.assign(rectStyle(origin), { transform: 'perspective(1200px) rotateX(7deg)' }), Object.assign(rectStyle(lifted), { transform: 'perspective(1200px) rotateX(0deg)' })], 360);
        if (!valid(token)) return;
        setPhase('expanding'); place(fullRect());
        await animate(flight, [rectStyle(lifted), rectStyle(fullRect())], 480);
        if (!valid(token)) return;
        setPhase('loading');
        var lines = boot.querySelectorAll('span');
        for (var i = 0; i < lines.length; i++) {
          lines[i].classList.add('shown'); await delay(300); if (!valid(token)) return;
        }
        showGallery();
      } catch (_) { if (valid(token)) showGallery(); }
    }
    function refresh() {
      var t = options.texts();
      boot.replaceChildren();
      t.portal.forEach(function (text) { var line = document.createElement('span'); line.textContent = text; boot.appendChild(line); });
      document.getElementById('cartridgeCancel').setAttribute('aria-label', t.leave);
    }
    var previews = body.querySelector('.cartridge-previews');
    options.projects.slice(0, 3).forEach(function (project) {
      var frame = document.createElement('span'), img = document.createElement('img');
      frame.className = 'cartridge-preview'; img.src = project.shot; img.alt = project.name; img.decoding = 'async';
      frame.appendChild(img); previews.appendChild(frame);
    });
    var more = document.createElement('span'); more.className = 'cartridge-more'; more.textContent = '+' + Math.max(0, options.projects.length - 3); more.hidden = options.projects.length <= 3; previews.appendChild(more);
    options.projects.forEach(function (project, index) {
      var card = document.createElement('span'), img = document.createElement('img');
      card.className = 'holo-card'; card.style.setProperty('--i', index); img.src = project.shot; img.alt = ''; card.appendChild(img);
      document.getElementById('cartridgeHolograms').appendChild(card);
    });
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); close(); });
    dialog.addEventListener('close', restore);
    function navigate() {
      if (location.hash === hash) { if (phase === 'closed') open(true); }
      else if (phase !== 'closed') { ownedEntry = false; closeVisual(); }
    }
    window.addEventListener('popstate', navigate); window.addEventListener('hashchange', navigate);
    window.addEventListener('resize', function () { if (phase !== 'closed' && phase !== 'closing' && phase !== 'gallery') { cancel(); showGallery(); } });
    function motionChanged() {
      if (!motion.matches || phase === 'closed' || phase === 'gallery') return;
      cancel();
      if (phase === 'closing') dialog.close(); else showGallery();
    }
    if (motion.addEventListener) motion.addEventListener('change', motionChanged); else motion.addListener(motionChanged);
    trigger.addEventListener('pointermove', function (event) {
      if (motion.matches || event.pointerType !== 'mouse' || phase !== 'closed') return;
      var rect = trigger.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
      trigger.style.setProperty('--cart-x', (-y * 5).toFixed(2) + 'deg'); trigger.style.setProperty('--cart-y', (x * 6).toFixed(2) + 'deg');
      trigger.style.setProperty('--shine', ((x + .5) * 100).toFixed(1) + '%');
    }, { passive: true });
    trigger.addEventListener('pointerleave', function () { trigger.style.setProperty('--cart-x', '0deg'); trigger.style.setProperty('--cart-y', '0deg'); });
    if ('IntersectionObserver' in window && !motion.matches) {
      var observer = new IntersectionObserver(function (entries) { if (entries[0].isIntersecting) { trigger.classList.add('is-ready'); observer.disconnect(); } }, { threshold: .15 }); observer.observe(trigger);
    } else trigger.classList.add('is-ready');
    setPhase('closed'); refresh();
    return { open: function () { open(false); }, close: close, refresh: refresh, navigate: navigate };
  }
  return { mount: mount };
})();
