// Carreira+ — menu, animações discretas e rastreio de cliques (sem cookies)
(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Revela blocos ao rolar (respeita prefers-reduced-motion via CSS)
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Preserva UTMs na mensagem do WhatsApp (origem da campanha)
  try {
    var q = new URLSearchParams(location.search);
    var utm = ['utm_source', 'utm_medium', 'utm_campaign'].map(function (k) { return q.get(k); }).filter(Boolean).join(' / ');
    if (utm) {
      document.querySelectorAll('a[data-wa]').forEach(function (a) {
        var u = new URL(a.href);
        u.searchParams.set('text', (u.searchParams.get('text') || '') + ' (origem: ' + utm + ')');
        a.href = u.toString();
      });
    }
  } catch (e) {}

  // Evento de clique no WhatsApp para GA4/GTM quando forem configurados
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[data-wa]');
    if (!a) return;
    var detail = { event: 'whatsapp_click', course: a.dataset.course || '', unit: a.dataset.unit || '', origin: a.dataset.origin || '' };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);
  });
})();

// Filtro de cursos por área (/cursos/)
(function () {
  var group = document.querySelector('.filters');
  if (!group) return;
  group.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-filter]');
    if (!b) return;
    group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var f = b.dataset.filter;
    document.querySelectorAll('#course-grid .ccard').forEach(function (c) { c.hidden = !(f === '*' || c.dataset.area === f); c.classList.add('in'); });
  });
})();

// Pré-matrícula → abre o WhatsApp da unidade com a mensagem pronta (nada é salvo no site)
(function () {
  var form = document.getElementById('form-matricula');
  if (!form) return;
  try {
    var pre = new URLSearchParams(location.search).get('curso');
    if (pre) form.curso.value = pre;
  } catch (e) {}
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var nome = form.nome.value.trim();
    var c = form.curso.selectedOptions[0], u = form.unidade.selectedOptions[0];
    if (!nome || !form.curso.value || !form.unidade.value) {
      (!nome ? form.nome : !form.curso.value ? form.curso : form.unidade).focus();
      return;
    }
    var msg = 'Olá! Meu nome é ' + nome + '. Quero fazer a matrícula no curso de ' + c.dataset.name + ' na unidade ' + u.dataset.name + '. Pode me passar as próximas turmas e valores?';
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'matricula_whatsapp', course: form.curso.value, unit: form.unidade.value });
    window.open('https://wa.me/' + u.dataset.wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  });
})();
