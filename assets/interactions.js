// Project search + topic filters, and expandable experience/project cards.
// Progressive enhancement: without this script every card and detail is simply shown in full.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TOPICS = {
    'release-management': 'Release management',
    'ci-cd': 'CI/CD & DevOps',
    security: 'Security',
    'ai-security': 'AI & LLM security',
    python: 'Python',
    compliance: 'Compliance',
    leadership: 'Leadership'
  };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'onclick') node.addEventListener('click', attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { node.append(c); });
    return node;
  }
  function icon(name) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#i-' + name);
    svg.append(use);
    return svg;
  }

  /* ---------- Expandable cards ---------- */
  function setExpanded(card, open) {
    card.classList.toggle('is-expanded', open);
    var btn = $('.expand-toggle', card);
    if (!btn) return;
    btn.setAttribute('aria-expanded', String(open));
    btn.firstChild.textContent = open ? 'Show less' : btn.getAttribute('data-more');
  }

  $$('[data-expandable]').forEach(function (card) {
    var isRole = card.classList.contains('role');
    var extras = isRole
      ? $$('.role-list li', card).slice(3).concat($('.role-tools', card) || [])
      : $$('.cstep', card).slice(2);
    if (!extras.length) return;
    extras.forEach(function (n) { n.classList.add('is-extra'); });
    var more = isRole ? 'Show full role details' : 'Show full case details';
    var btn = el('button', { type: 'button', class: 'expand-toggle', 'aria-expanded': 'false', 'data-more': more }, [more, icon('chevron')]);
    btn.addEventListener('click', function () { setExpanded(card, !card.classList.contains('is-expanded')); });
    (isRole ? ($('.role-tools', card) || $('.role-list', card)) : $('.csteps', card)).after(btn);
  });

  /* ---------- Project search and topic filters ---------- */
  var grid = $('#projects .projects');
  if (!grid) return;
  var cards = $$(':scope > .project', grid);
  var state = { query: '', topic: 'all' };
  var used = {};
  cards.forEach(function (c) { (c.getAttribute('data-topics') || '').split(' ').forEach(function (t) { used[t] = true; }); });

  var search = el('input', { type: 'search', id: 'project-search', placeholder: 'Search projects by skill, tool or topic', autocomplete: 'off', 'aria-label': 'Search projects by skill, tool or topic' });
  var status = el('p', { class: 'filter-status', 'aria-live': 'polite' });
  var chips = el('div', { class: 'topic-chips', role: 'group', 'aria-label': 'Filter projects by topic' });
  [['all', 'All']].concat(Object.keys(TOPICS).filter(function (k) { return used[k]; }).map(function (k) { return [k, TOPICS[k]]; }))
    .forEach(function (pair) {
      chips.append(el('button', { type: 'button', class: 'topic-chip', 'data-topic': pair[0], 'aria-pressed': String(pair[0] === 'all'),
        onclick: function () { state.topic = pair[0]; syncChips(); apply(); } }, [pair[1]]));
    });
  var empty = el('p', { class: 'projects-empty', hidden: '' }, ['No projects match that search. ',
    el('button', { type: 'button', class: 'link-btn', onclick: function () { reset(true); } }, ['Clear filters'])]);

  function text(card) {
    var topics = (card.getAttribute('data-topics') || '').split(' ').map(function (t) { return TOPICS[t] || t; }).join(' ');
    return (card.textContent + ' ' + topics).toLowerCase();
  }
  function syncChips() {
    $$('.topic-chip', chips).forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-topic') === state.topic)); });
  }
  function apply() {
    var terms = state.query.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    cards.forEach(function (card) {
      var hay = text(card);
      var ok = terms.every(function (t) { return hay.indexOf(t) !== -1; }) &&
        (state.topic === 'all' || (card.getAttribute('data-topics') || '').split(' ').indexOf(state.topic) !== -1);
      var wasHidden = card.hidden;
      card.hidden = !ok;
      if (ok) {
        shown++;
        if (wasHidden && !reduce) { card.classList.remove('is-filtering-in'); void card.offsetWidth; card.classList.add('is-filtering-in'); }
      }
    });
    status.replaceChildren();
    if (terms.length || state.topic !== 'all') {
      status.append('Showing ' + shown + ' of ' + cards.length + ' projects. ',
        el('button', { type: 'button', class: 'link-btn', onclick: function () { reset(true); } }, ['Show all']));
    }
    empty.hidden = shown !== 0;
  }
  function reset(focus) {
    state.query = ''; state.topic = 'all'; search.value = '';
    syncChips(); apply();
    if (focus) search.focus();
  }
  search.addEventListener('input', function () { state.query = search.value; apply(); });

  grid.before(el('div', { class: 'project-tools' }, [el('label', { class: 'search-field' }, [icon('search'), search]), chips, status]));
  grid.after(empty);
})();
