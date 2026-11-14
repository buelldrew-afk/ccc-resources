// The phone menu button, as on the church site.
(function () {
  var btn = document.querySelector('.menu-toggle'), nav = document.getElementById('site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
  // A link that jumps within the same page (a topic on the Topics page) closes the menus.
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var url = new URL(a.href, location.href), target = url.hash && document.getElementById(url.hash.slice(1));
    if (target && url.pathname === location.pathname) {
      // Close the menu first, then scroll, so the jump lands where it should.
      e.preventDefault();
      history.pushState(null, '', url.hash);
      setTimeout(function () { target.scrollIntoView(); }, 0);
    }
    nav.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    [].slice.call(nav.querySelectorAll('.dd.open')).forEach(function (dd) {
      dd.classList.remove('open');
      dd.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
  });
})();

// The drop-downs (Ministry Suggestions, Topics): tap or click to open; Escape or a click elsewhere closes them.
(function () {
  [].slice.call(document.querySelectorAll('.dd')).forEach(function (dd) {
    var b = dd.querySelector('.dd-btn');
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = dd.classList.toggle('open');
      b.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dd.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); } });
  });
})();

// Search and filters for the resource pages. No data leaves the page.
(function () {
  var find = document.querySelector('.find');
  if (!find) return;
  var results = document.getElementById('site-results');
  var count = document.querySelector('.fcount');
  var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ''); };

  if (results) {  // Home page: search every resource.
    var rows = window.SEARCH || [];
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
    find.addEventListener('input', function () {
      var words = norm(find.value).split(/\s+/).filter(Boolean);
      results.innerHTML = '';
      if (!words.length) { count.textContent = ''; return; }
      var hits = rows.filter(function (r) {
        var hay = norm(r.t + ' ' + r.a + ' ' + r.n + ' ' + r.p + ' ' + r.s);
        return words.every(function (w) { return hay.indexOf(w) >= 0; });
      });
      count.textContent = hits.length ? hits.length + (hits.length === 1 ? ' match' : ' matches') + (hits.length > 60 ? ', showing the first 60' : '') : 'No matches. Try a shorter word, or browse by topic below.';
      results.innerHTML = hits.slice(0, 60).map(function (r) {
        return '<li><a href="' + r.u + '">' + esc(r.t) + '</a>' + (r.a ? ' · ' + esc(r.a) : '') +
               '<div class="where">' + esc(r.p) + ' › ' + esc(r.s) + '</div></li>';
      }).join('');
    });
    return;
  }

  // Department and topic pages: filter what's on the page.
  var entries = [].slice.call(document.querySelectorAll('li.entry'));
  var sections = [].slice.call(document.querySelectorAll('section.group'));
  var chips = [].slice.call(document.querySelectorAll('.fchip'));
  var active = '';
  function apply() {
    var words = norm(find.value).split(/\s+/).filter(Boolean);
    var shown = 0;
    entries.forEach(function (li) {
      var ok = (!active || (' ' + li.dataset.f + ' ').indexOf(' ' + active + ' ') >= 0) &&
               words.every(function (w) { return li.dataset.q.indexOf(w) >= 0; });
      li.classList.toggle('hidden', !ok);
      if (ok) shown++;
    });
    sections.forEach(function (s) {
      var any = s.querySelector('li.entry:not(.hidden)');
      s.classList.toggle('hidden', !any);
      var link = document.querySelector('nav.index a[href="#' + s.id + '"]');
      if (link) link.classList.toggle('hidden', !any);
    });
    count.textContent = (words.length || active) ? (shown ? shown + (shown === 1 ? ' resource' : ' resources') : 'Nothing matches. Try another word or clear the filter.') : '';
  }
  find.addEventListener('input', apply);
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      active = active === c.dataset.f ? '' : c.dataset.f;
      chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o.dataset.f === active)); });
      apply();
    });
  });
})();
