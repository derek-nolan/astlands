
(() => {
  const data = window.ASTLANDS_DATA;
  const app = document.getElementById('app');
  const dialog = document.getElementById('reader-dialog');
  const reader = document.getElementById('reader-content');
  const closeDialog = dialog.querySelector('.dialog-close');
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');

  const escapeHTML = (value = '') => String(value)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  const initials = name => name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase();
  const list = items => items?.length ? `<ul>${items.map(x => `<li>${escapeHTML(x)}</li>`).join('')}</ul>` : '';
  const tags = items => items?.filter(Boolean).length ? `<div class="tag-row">${items.filter(Boolean).map(x => `<span class="tag">${escapeHTML(x)}</span>`).join('')}</div>` : '';

  function setActive(route) {
    document.querySelectorAll('.site-nav a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${route}`);
    });
  }

  function shell(title, intro, content, eyebrow = 'Campaign archive') {
    return `<section class="page">
      <header class="page-head">
        <p class="eyebrow">${escapeHTML(eyebrow)}</p>
        <h1 class="page-title">${escapeHTML(title)}</h1>
        <p>${escapeHTML(intro)}</p>
      </header>
      ${content}
    </section>`;
  }

  function renderHome() {
    const c = data.campaign;
    app.innerHTML = `
      <section class="hero">
        <div class="hero-inner">
          <p class="eyebrow">Pathfinder campaign archive</p>
          <h1>${escapeHTML(c.title)}<span>${escapeHTML(c.subtitle)}</span></h1>
          <p class="lede">${escapeHTML(c.tagline)}</p>
          <div class="hero-actions">
            <a class="button primary" href="#sessions">Read the chronicle</a>
            <a class="button" href="#party">Meet the party</a>
          </div>
        </div>
      </section>
      <div class="stat-strip">
        <div class="stat"><strong>${c.stats.sessions}</strong><span>Sessions recorded</span></div>
        <div class="stat"><strong>${c.stats.party}</strong><span>Core adventurers</span></div>
        <div class="stat"><strong>${c.stats.locations}</strong><span>Known locations</span></div>
        <div class="stat"><strong>${c.stats.knownNpcs}</strong><span>Named figures</span></div>
      </div>
      <div class="page">
        <section class="section section-grid">
          <div class="section-heading">
            <p class="eyebrow">The world</p>
            <h2>Dust, debt and old magic</h2>
            <p>The Blighted West is a place where clean water is power, magic is dangerous to reveal, and the ruins beneath the earth remember more than the people above.</p>
          </div>
          <div class="prose">${c.premise.map(p => `<p>${escapeHTML(p)}</p>`).join('')}</div>
        </section>
        <section class="section section-grid">
          <div class="section-heading">
            <p class="eyebrow">The chronicle</p>
            <h2>Story so far</h2>
            <p>From a dead train carriage to the hidden stair beneath Professor Godt's Library.</p>
          </div>
          <div class="prose">${c.storySoFar.map(p => `<p>${escapeHTML(p)}</p>`).join('')}</div>
        </section>
        <section class="section">
          <div class="callout"><p><strong>Latest entry:</strong> Session 10 ends with the party inside the Library, experiment journals in hand, and a concealed stair opening below them.</p></div>
        </section>
      </div>`;
  }

  function characterCard(person) {
    const summary = person.notes?.slice(0,3) || [];
    return `<article class="card character-card searchable" data-search="${escapeHTML(JSON.stringify(person).toLowerCase())}">
      <div class="avatar" aria-hidden="true">${escapeHTML(initials(person.name))}</div>
      <p class="meta">${escapeHTML([person.race, person.class].filter(Boolean).join(' · ') || 'Unknown')}</p>
      <h2>${escapeHTML(person.name)}</h2>
      ${person.player ? `<p class="muted">Played by ${escapeHTML(person.player)}</p>` : ''}
      <div class="summary">${list(summary)}</div>
      ${tags(person.affiliations)}
      <button class="read-link" data-person="${escapeHTML(person.name)}">View full entry →</button>
    </article>`;
  }

  function renderParty() {
    const all = [...data.party, ...data.companions];
    const content = `
      <div class="toolbar"><input class="search" id="page-search" type="search" placeholder="Search the party…" aria-label="Search party"><span class="count">${all.length} entries</span></div>
      <div class="card-grid">${data.party.map(characterCard).join('')}</div>
      ${data.companions.length ? `<section class="section"><header class="page-head"><p class="eyebrow">Travelling companions</p><h2>Temporary members</h2></header><div class="card-grid">${data.companions.map(characterCard).join('')}</div></section>` : ''}`;
    app.innerHTML = shell('The Party', 'Six strangers aboard the Desert Rose became reluctant allies in a city designed to trap them.', content, 'Abrams Unrest');
    bindSearch();
    bindPersonButtons();
  }

  function renderNpcs() {
    const content = `<div class="toolbar"><input class="search" id="page-search" type="search" placeholder="Search people, factions or places…" aria-label="Search people"><span class="count">${data.npcs.length} entries</span></div>
      <div class="card-grid">${data.npcs.map(characterCard).join('')}</div>`;
    app.innerHTML = shell('People of the Astlands', 'Allies, tyrants, captives, survivors and monsters wearing human faces.', content, 'Known figures');
    bindSearch();
    bindPersonButtons();
  }

  function renderSessions() {
    const content = `<div class="session-list">${[...data.sessions].reverse().map(s => `
      <article class="card session-card">
        <div class="session-number">${String(s.number).padStart(2,'0')}</div>
        <div><p class="meta">Session ${s.number}</p><h2>${escapeHTML(s.title)}</h2><p>${escapeHTML(s.excerpt)}</p></div>
        <button class="button" data-session="${s.number}">Read session</button>
      </article>`).join('')}</div>`;
    app.innerHTML = shell('Session Chronicle', 'The complete campaign record, from the goblin attack aboard the Desert Rose to the descent beneath the Library.', content, `${data.sessions.length} sessions`);
    document.querySelectorAll('[data-session]').forEach(btn => btn.addEventListener('click', () => openSession(Number(btn.dataset.session))));
  }

  const gazetteerSets = {
    locations: ['Locations', data.locations],
    factions: ['Factions', data.factions],
    fauna: ['Fauna', data.fauna],
    items: ['Key items', data.items],
    lore: ['Lore', data.lore],
    relics: ['Old World relics', data.relics],
    races: ['Races', data.races],
  };

  function entryCard(entry) {
    return `<article class="card entry-card searchable" data-search="${escapeHTML((entry.name + ' ' + entry.description.join(' ')).toLowerCase())}">
      <p class="meta">Gazetteer entry</p><h3>${escapeHTML(entry.name)}</h3>${list(entry.description)}
    </article>`;
  }

  function renderGazetteer(initial = 'locations') {
    app.innerHTML = shell('The Gazetteer', 'A living index of the places, peoples, creatures, relics and beliefs uncovered in play.', `
      <div class="gazetteer-nav">${Object.entries(gazetteerSets).map(([key,[label]]) => `<button class="filter-button ${key===initial?'active':''}" data-gazetteer="${key}">${escapeHTML(label)}</button>`).join('')}</div>
      <div class="toolbar"><input class="search" id="page-search" type="search" placeholder="Search the gazetteer…" aria-label="Search gazetteer"><span class="count" id="entry-count"></span></div>
      <div class="card-grid" id="gazetteer-grid"></div>
    `, 'World reference');
    const show = key => {
      document.querySelectorAll('[data-gazetteer]').forEach(x => x.classList.toggle('active', x.dataset.gazetteer===key));
      const entries = gazetteerSets[key][1];
      document.getElementById('gazetteer-grid').innerHTML = entries.map(entryCard).join('');
      document.getElementById('entry-count').textContent = `${entries.length} entries`;
      document.getElementById('page-search').value = '';
      bindSearch();
    };
    document.querySelectorAll('[data-gazetteer]').forEach(btn => btn.addEventListener('click', () => show(btn.dataset.gazetteer)));
    show(initial);
  }

  function renderLocations() {
    app.innerHTML = shell('Places of the Astlands', 'From the poisoned expanse of the Blighted West to the guarded streets of the Cobbles.', `
      <div class="toolbar"><input class="search" id="page-search" type="search" placeholder="Search locations…" aria-label="Search locations"><span class="count">${data.locations.length} entries</span></div>
      <div class="card-grid">${data.locations.map(entryCard).join('')}</div>
    `, 'Mapped and rumoured');
    bindSearch();
  }

  function renderJournal() {
    const first = data.journal[0];
    app.innerHTML = shell("Coren's Journal", "Fragments of a stolen name, a lost lover, a mother's curse and the road back to Abrams Rest.", `
      <div class="journal-layout">
        <aside class="journal-index" aria-label="Journal entries">
          ${data.journal.map((e,i)=>`<button class="${i===0?'active':''}" data-journal="${i}">${escapeHTML(e.title)}</button>`).join('')}
        </aside>
        <article class="journal-entry" id="journal-entry">${journalHTML(first)}</article>
      </div>
    `, 'Private record');
    document.querySelectorAll('[data-journal]').forEach(btn => btn.addEventListener('click', () => {
      const index=Number(btn.dataset.journal);
      document.querySelectorAll('[data-journal]').forEach(x=>x.classList.toggle('active', x===btn));
      document.getElementById('journal-entry').innerHTML=journalHTML(data.journal[index]);
      if (window.innerWidth < 940) document.getElementById('journal-entry').scrollIntoView({behavior:'smooth',block:'start'});
    }));
  }

  function journalHTML(entry) {
    return `<p class="eyebrow">The Journal of Coren Vael</p><h2>${escapeHTML(entry.title)}</h2>${entry.paragraphs.map(p=>`<p>${escapeHTML(p)}</p>`).join('')}`;
  }

  function openSession(number) {
    const s = data.sessions.find(x => x.number===number);
    if (!s) return;
    reader.innerHTML = `<p class="dialog-kicker">Session ${s.number}</p><h1>${escapeHTML(s.title)}</h1>${s.paragraphs.map(p => {
      if (p.startsWith('* ')) {
        const bits=p.split(/\s*\*\s+/).filter(Boolean);
        return `<ul>${bits.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul>`;
      }
      return `<p>${escapeHTML(p)}</p>`;
    }).join('')}`;
    dialog.showModal();
  }

  function openPerson(name) {
    const person = [...data.party, ...data.companions, ...data.npcs].find(x => x.name===name);
    if (!person) return;
    reader.innerHTML = `
      <p class="dialog-kicker">${escapeHTML([person.race, person.class].filter(Boolean).join(' · ') || 'Campaign entry')}</p>
      <h1>${escapeHTML(person.name)}</h1>
      ${person.player ? `<p><strong>Player:</strong> ${escapeHTML(person.player)}</p>` : ''}
      ${person.home ? `<p><strong>Home:</strong> ${escapeHTML(person.home)}</p>` : ''}
      ${person.familiar ? `<p><strong>Companion:</strong> ${escapeHTML(person.familiar)}</p>` : ''}
      ${person.notes?.length ? `<h2>Known history</h2>${list(person.notes)}` : ''}
      ${person.affiliations?.length ? `<h2>Affiliations</h2>${list(person.affiliations)}` : ''}
      ${(person.firstAppearance || person.lastAppearance) ? `<p class="muted">${escapeHTML([person.firstAppearance && `First seen: ${person.firstAppearance}`, person.lastAppearance && `Last seen: ${person.lastAppearance}`].filter(Boolean).join(' · '))}</p>` : ''}`;
    dialog.showModal();
  }

  function bindPersonButtons() {
    document.querySelectorAll('[data-person]').forEach(btn => btn.addEventListener('click', () => openPerson(btn.dataset.person)));
  }

  function bindSearch() {
    const input = document.getElementById('page-search');
    if (!input) return;
    input.oninput = () => {
      const q = input.value.trim().toLowerCase();
      const cards = [...document.querySelectorAll('.searchable')];
      let shown = 0;
      cards.forEach(card => {
        const match = !q || card.dataset.search.includes(q);
        card.hidden = !match;
        if (match) shown++;
      });
      const count = document.querySelector('.count');
      if (count) count.textContent = `${shown} ${shown===1?'entry':'entries'}`;
      const grid = document.querySelector('.card-grid');
      let empty = document.getElementById('search-empty');
      if (!shown && grid) {
        if (!empty) {
          empty = document.createElement('div');
          empty.id='search-empty'; empty.className='empty'; empty.textContent='No matching entries found.';
          grid.after(empty);
        }
      } else if (empty) empty.remove();
    };
  }

  function route() {
    const raw=(location.hash || '#home').slice(1).split('?')[0];
    const routes = {
      home: renderHome,
      sessions: renderSessions,
      party: renderParty,
      npcs: renderNpcs,
      locations: renderLocations,
      lore: () => renderGazetteer('lore'),
      journal: renderJournal,
    };
    const fn=routes[raw] || renderHome;
    fn();
    setActive(routes[raw] ? raw : 'home');
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded','false');
    window.scrollTo({top:0,behavior:'instant'});
  }

  closeDialog.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    const rect=dialog.getBoundingClientRect();
    const outside=e.clientX<rect.left || e.clientX>rect.right || e.clientY<rect.top || e.clientY>rect.bottom;
    if (outside) dialog.close();
  });
  menuButton.addEventListener('click', () => {
    const open=nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  window.addEventListener('hashchange', route);
  route();
})();
