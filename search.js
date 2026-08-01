(function () {
  var input = document.getElementById('site-search');
  var resultsEl = document.getElementById('search-results');
  if (!input || !resultsEl || typeof SEARCH_INDEX === 'undefined') return;

  var activeIndex = -1;
  var currentMatches = [];

  function scoreMatch(entry, query) {
    var t = entry.t.toLowerCase();
    if (t === query) return 100;
    if (t.indexOf(query) === 0) return 80;
    if (t.indexOf(query) !== -1) return 50;
    return 0;
  }

  function search(query) {
    query = query.trim().toLowerCase();
    if (!query) return [];
    var scored = SEARCH_INDEX
      .map(function (e) { return { entry: e, score: scoreMatch(e, query) }; })
      .filter(function (x) { return x.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 8)
      .map(function (x) { return x.entry; });
    return scored;
  }

  function href(entry) {
    return entry.a ? entry.p + '#' + entry.a : entry.p;
  }

  function render(matches) {
    currentMatches = matches;
    activeIndex = -1;
    resultsEl.innerHTML = '';
    if (matches.length === 0) {
      resultsEl.classList.remove('open');
      return;
    }
    matches.forEach(function (m, i) {
      var a = document.createElement('a');
      a.href = href(m);
      a.className = 'search-result-row';
      a.setAttribute('data-index', i);
      a.innerHTML = '<span class="search-result-title">' + m.t + '</span><span class="search-result-cat">' + m.c + '</span>';
      resultsEl.appendChild(a);
    });
    resultsEl.classList.add('open');
  }

  function setActive(i) {
    var rows = resultsEl.querySelectorAll('.search-result-row');
    rows.forEach(function (r) { r.classList.remove('active'); });
    if (i >= 0 && i < rows.length) {
      rows[i].classList.add('active');
      activeIndex = i;
    }
  }

  input.addEventListener('input', function () {
    render(search(input.value));
  });

  input.addEventListener('keydown', function (e) {
    var rows = resultsEl.querySelectorAll('.search-result-row');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(Math.min(activeIndex + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && currentMatches[activeIndex]) {
        window.location.href = href(currentMatches[activeIndex]);
      } else if (currentMatches.length > 0) {
        window.location.href = href(currentMatches[0]);
      }
    } else if (e.key === 'Escape') {
      resultsEl.classList.remove('open');
      input.blur();
    }
  });

  input.addEventListener('focus', function () {
    if (input.value.trim()) render(search(input.value));
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search-widget')) {
      resultsEl.classList.remove('open');
    }
  });
})();
