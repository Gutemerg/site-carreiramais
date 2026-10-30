// Gerador estático do site Carreira+ — node build.mjs  → dist/
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const data = JSON.parse(readFileSync('content/site.json', 'utf8'));
const { site, units, courses } = data;
const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unitById = id => units.find(u => u.id === id);

// Helper central do WhatsApp — nunca escrever links à mão
function createWhatsAppLink(course, unit, origin) {
  const number = unit ? unit.whatsapp : site.whatsappDefault;
  let msg = 'Olá! ';
  if (course && unit) msg += `Vi o curso de ${course.shortName} da unidade ${unit.name} no site da Carreira+ e gostaria de receber mais informações.`;
  else if (course) msg += `Vi o curso de ${course.shortName} no site da Carreira+ e gostaria de receber mais informações.`;
  else if (unit) msg += `Vi a unidade ${unit.name} no site da Carreira+ e gostaria de receber informações sobre os cursos.`;
  else msg += 'Vim pelo site da Carreira+ e gostaria de receber informações sobre os cursos.';
  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}
function waAttrs(course, unit, origin) {
  return `href="${esc(createWhatsAppLink(course, unit, origin))}" target="_blank" rel="noopener" data-wa data-course="${esc(course ? course.slug : '')}" data-unit="${esc(unit ? unit.id : '')}" data-origin="${esc(origin)}"`;
}

const I = {
  fingerprint: '<path d="M12 11c0 3.5-.6 6.3-1.8 8.5"/><path d="M8.2 9.1A4 4 0 0 1 16 11c0 1.6-.1 3.2-.4 4.6"/><path d="M5.3 7.5A7 7 0 0 1 19 11c0 1.1 0 2.1-.1 3"/><path d="M4.4 13.5c.4-1 .6-2 .6-3"/><path d="M15 19.5c.3-.8.5-1.7.7-2.6"/><path d="M8.5 19.8c.5-1.1.9-2.4 1.1-3.8"/><path d="M12 3a8 8 0 0 0-5.7 2.4"/><path d="M17.7 5.4A8 8 0 0 0 14.5 3.4"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.7 18.4A1.7 1.7 0 0 0 6.2 21h11.6a1.7 1.7 0 0 0 1.5-2.6L14 9.5V3"/><path d="M7.5 15h9"/>',
  hands: '<path d="M7 11.5V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M10 10.5V4.5a1.5 1.5 0 0 1 3 0v6"/><path d="M13 10.5V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.6a6 6 0 0 1-4.6-2.2L4 14.5a1.6 1.6 0 0 1 2.4-2.1L8 14"/>',
  blocks: '<rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><rect x="8" y="3" width="8" height="8" rx="1"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21.5l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1Z"/><path d="M3.5 12h4l1.5-3 3 6 1.5-3h7"/>',
  shield: '<path d="M12 21s-7.5-3.4-7.5-9.5V5.2L12 2.5l7.5 2.7v6.3C19.5 17.6 12 21 12 21Z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  pin: '<path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.4"/>',
  hand: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M11 11V4a1.5 1.5 0 0 1 3 0v7"/><path d="M14 11V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 10a1.5 1.5 0 0 1 3 0v4a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4 15a1.6 1.6 0 0 1 2.7-1.7L8 15"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  chat: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12Z"/>',
};
const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>';

// ---------- layout ----------
function layout({ path, title, description, body, schema = [], sticky = '' }) {
  const url = site.domain + path;
  const ld = schema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0F0F10">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Carreira+">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.domain}/og.jpg">
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
${ld}
</head>
<body class="${sticky ? 'has-sticky' : ''}">
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<div class="topbar"></div>
<header class="header">
  <div class="wrap">
    <a class="logo" href="/" aria-label="Carreira+ — página inicial"><img src="/logo.webp" alt="Instituto Profissionalizante Carreira+" width="146" height="40"></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    <nav class="nav" id="nav" aria-label="Principal">
      <a href="/cursos/">Cursos</a>
      <a href="/unidades/nova-iguacu/">Nova Iguaçu</a>
      <a href="/unidades/campo-grande-rj/">Campo Grande</a>
      <a class="btn btn-primary btn-sm on-dark" ${waAttrs(null, null, 'header')}>Falar no WhatsApp</a>
    </nav>
  </div>
</header>
<main id="conteudo">
${body}
</main>
${footer()}
<a class="wa-float" ${waAttrs(null, null, 'flutuante')} aria-label="Falar no WhatsApp">${waIcon}</a>
${sticky}
<script src="/main.js" defer></script>
</body>
</html>`;
}

function footer() {
  return `<footer class="footer">
  <div class="wrap">
    <div class="cols">
      <div>
        <img src="/logo.webp" alt="Instituto Profissionalizante Carreira+" width="161" height="44" loading="lazy">
        <p>Cursos profissionalizantes presenciais com aulas práticas, em Nova Iguaçu e Campo Grande (RJ).</p>
        <p><a href="https://www.instagram.com/${site.instagram}/" target="_blank" rel="noopener">Instagram @${site.instagram}</a></p>
      </div>
      <div><h4>Cursos</h4><ul>${courses.map(c => `<li><a href="/cursos/${c.slug}/">${esc(c.shortName)}</a></li>`).join('')}</ul></div>
      <div><h4>Unidades</h4><ul>${units.map(u => `<li><a href="/unidades/${u.id}/">${esc(u.label)}</a></li>`).join('')}</ul></div>
      <div><h4>Atendimento</h4><ul>${units.map(u => `<li><a ${waAttrs(null, u, 'rodape')}>WhatsApp ${esc(u.name)}</a></li>`).join('')}<li><a href="/politica-de-privacidade/">Política de Privacidade</a></li></ul></div>
    </div>
    <div class="legal">© ${new Date().getFullYear()} ${esc(site.legalName)}. Cursos livres presenciais.</div>
  </div>
</footer>`;
}

const orgSchema = {
  '@context': 'https://schema.org', '@type': 'EducationalOrganization',
  name: site.displayName, alternateName: 'Carreira+', url: site.domain,
  logo: site.domain + '/og.jpg', sameAs: [`https://www.instagram.com/${site.instagram}/`],
};
const crumbsSchema = items => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it[0], item: site.domain + it[1] })),
});
const crumbsHtml = items => `<nav class="crumbs" aria-label="Você está em">${items.map((it, i) => i < items.length - 1 ? `<a href="${it[1]}">${esc(it[0])}</a> / ` : `<span aria-current="page">${esc(it[0])}</span>`).join('')}</nav>`;

function courseCard(c) {
  return `<a class="course-card reveal" href="/cursos/${c.slug}/">
    <div class="top">${icon(c.icon)}<span class="area">${esc(c.area)}</span></div>
    <div class="body"><h3>${esc(c.name)}</h3><p>${esc(c.hero)}</p><span class="more">Conhecer o curso →</span></div>
  </a>`;
}

function unitCta(course, origin) {
  return `<div class="unit-picker">${units.map(u => `<a class="btn btn-wa" ${waAttrs(course, u, origin)}>${waIcon} ${esc(u.name)}</a>`).join('')}</div>`;
}

// ---------- páginas ----------
const pages = {};

pages['/'] = layout({
  path: '/',
  title: 'Carreira+ | Cursos profissionalizantes presenciais em Nova Iguaçu e Campo Grande RJ',
  description: site.description,
  schema: [orgSchema],
  body: `
<section class="hero on-dark">
  <div class="wrap">
    <div>
      <span class="tag">Cursos presenciais</span>
      <h1>Prepare-se para a sua <em>próxima profissão</em></h1>
      <p class="lead">Cursos profissionalizantes com aulas práticas em Nova Iguaçu e Campo Grande (RJ). Você aprende fazendo, com acompanhamento de perto.</p>
      <div class="actions">
        <a class="btn btn-primary" href="#cursos">Conhecer os cursos</a>
        <a class="btn btn-ghost" ${waAttrs(null, null, 'home-hero')}>Falar com o atendimento</a>
      </div>
      <ul class="quick"><li>Presencial</li><li>Aulas práticas</li><li>Nova Iguaçu</li><li>Campo Grande</li></ul>
    </div>
    <div class="hero-art" aria-hidden="true">
      ${courses.map(c => `<a class="tile" href="/cursos/${c.slug}/" tabindex="-1"><div style="text-align:center">${icon(c.icon)}<span>${esc(c.area)}</span></div></a>`).join('')}
    </div>
  </div>
</section>

<section class="section" id="cursos">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Nossos cursos</span><h2>Escolha a sua área</h2><p>Formações presenciais em saúde, educação, perícia, estética e segurança patrimonial.</p></div>
    <div class="grid c3">${courses.map(courseCard).join('')}</div>
  </div>
</section>

<section class="section gray">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Por que a Carreira+</span><h2>Aprender de perto faz diferença</h2></div>
    <div class="grid c4">
      <div class="card feature reveal"><div class="ico">${icon('users')}</div><h3>Presencial</h3><p>Aulas em sala, com professor e turma, para tirar dúvidas na hora.</p></div>
      <div class="card feature reveal"><div class="ico">${icon('hand')}</div><h3>Prática</h3><p>Você treina as técnicas durante o curso, não fica só na teoria.</p></div>
      <div class="card feature reveal"><div class="ico">${icon('pin')}</div><h3>Perto de você</h3><p>Duas unidades: Nova Iguaçu e Campo Grande, na Zona Oeste do Rio.</p></div>
      <div class="card feature reveal"><div class="ico">${icon('chat')}</div><h3>Atendimento direto</h3><p>Tire suas dúvidas sobre turmas e valores pelo WhatsApp.</p></div>
    </div>
  </div>
</section>

<section class="section practice on-dark">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Aprendizado na prática</span><h2>O que você vai fazer em aula</h2></div>
    <div class="grid c2">
      ${courses.map(c => `<div class="item reveal"><strong>${esc(c.shortName)}:</strong> ${esc(c.practice[0])}</div>`).join('')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Unidades</span><h2>Onde estamos</h2></div>
    <div class="grid c2">
      ${units.map(u => `<div class="card unit-card reveal"><h3>${icon('pin')} ${esc(u.label)}</h3>
        <p class="meta">Fale com a unidade pelo WhatsApp para receber o endereço, os horários e as próximas turmas.</p>
        ${u.notes.map(n => `<p class="note">${esc(n)}</p>`).join('')}
        <div class="actions"><a class="btn btn-wa" ${waAttrs(null, u, 'home-unidades')}>${waIcon} WhatsApp ${esc(u.name)}</a><a class="btn btn-ghost" href="/unidades/${u.id}/">Ver unidade</a></div></div>`).join('')}
    </div>
  </div>
</section>

${ctaBand(null, 'home-final')}
`,
});

function ctaBand(course, origin) {
  return `<section class="cta-band on-dark">
  <div class="wrap">
    <h2>${course ? 'Quer saber da próxima turma?' : 'Dê o primeiro passo hoje'}</h2>
    <p>${course ? `Escolha a unidade e fale com a gente pelo WhatsApp. Respondemos sobre datas, duração e valores do curso de ${esc(course.shortName)}.` : 'Fale com a gente pelo WhatsApp e descubra qual curso combina com você.'}</p>
    ${course ? unitCta(course, origin) : `<div class="actions"><a class="btn btn-primary" ${waAttrs(null, null, origin)}>Falar no WhatsApp</a><a class="btn btn-ghost" href="/cursos/">Ver todos os cursos</a></div>`}
  </div>
</section>`;
}

pages['/cursos/'] = layout({
  path: '/cursos/',
  title: 'Cursos presenciais | Carreira+ Nova Iguaçu e Campo Grande RJ',
  description: 'Conheça os cursos profissionalizantes presenciais da Carreira+: perícia, necropsia, massoterapia, educação, cuidador de idosos e portaria.',
  schema: [orgSchema, crumbsSchema([['Início', '/'], ['Cursos', '/cursos/']])],
  body: `
<section class="hero on-dark"><div class="wrap"><div>
  ${crumbsHtml([['Início', '/'], ['Cursos', '/cursos/']])}
  <span class="tag">Cursos presenciais</span>
  <h1>Nossos <em>cursos</em></h1>
  <p class="lead">Todos presenciais, com aulas práticas, nas unidades de Nova Iguaçu e Campo Grande (RJ).</p>
</div></div></section>
<section class="section"><div class="wrap"><div class="grid c3">${courses.map(courseCard).join('')}</div></div></section>
${ctaBand(null, 'cursos-final')}`,
});

for (const c of courses) {
  const path = `/cursos/${c.slug}/`;
  const crumbs = [['Início', '/'], ['Cursos', '/cursos/'], [c.shortName, path]];
  const faq = [
    ['O curso é presencial?', 'Sim. As aulas são presenciais, com atividades práticas em sala.'],
    ['Em qual unidade posso fazer?', `Temos unidades em Nova Iguaçu e em Campo Grande (RJ). Fale com a unidade mais perto de você pelo WhatsApp para saber as turmas disponíveis.`],
    ['Qual a duração e o valor?', 'Duração, horários e valores variam conforme a turma. Fale com a gente pelo WhatsApp e passamos as informações atualizadas.'],
    ['Preciso ter experiência na área?', 'Não. O curso começa pelos fundamentos e avança para a prática.'],
    ['Como faço a matrícula?', 'É só chamar no WhatsApp da unidade escolhida. O atendimento explica o passo a passo da matrícula.'],
  ];
  const others = courses.filter(o => o.slug !== c.slug).slice(0, 3);
  pages[path] = layout({
    path,
    title: c.seoTitle + ' | Carreira+',
    description: c.seoDescription,
    schema: [orgSchema, crumbsSchema(crumbs), {
      '@context': 'https://schema.org', '@type': 'Course', name: c.name, description: c.about,
      provider: { '@type': 'EducationalOrganization', name: site.displayName, sameAs: site.domain },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'onsite', location: units.map(u => ({ '@type': 'Place', name: `Carreira+ ${u.name}`, address: { '@type': 'PostalAddress', addressLocality: u.city, addressRegion: u.state, addressCountry: 'BR' } })) },
    }, {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    }],
    sticky: `<div class="sticky-cta"><a class="btn btn-wa" ${waAttrs(c, null, 'sticky-mobile')}>${waIcon} Quero saber mais</a></div>`,
    body: `
<section class="hero on-dark">
  <div class="wrap">
    <div>
      ${crumbsHtml(crumbs)}
      <span class="tag">Curso presencial</span>
      <h1>${esc(c.name)}</h1>
      <p class="lead">${esc(c.hero)}</p>
      <ul class="quick"><li>Presencial</li><li>Aulas práticas</li><li>Nova Iguaçu e Campo Grande (RJ)</li></ul>
      <div class="actions">
        <a class="btn btn-primary" ${waAttrs(c, null, 'curso-hero')}>Quero saber mais</a>
        <a class="btn btn-ghost" href="#aprender">O que vou aprender</a>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true"><div class="tile big" style="aspect-ratio:2/1.3">${icon(c.icon)}</div></div>
  </div>
</section>

<section class="section">
  <div class="wrap grid c2" style="align-items:start">
    <div class="reveal"><span class="eyebrow">Sobre o curso</span><h2>Para que serve</h2><p>${esc(c.about)}</p></div>
    <div class="info-card reveal">
      <h3>Informações do curso</h3>
      <dl>
        <dt>Modalidade</dt><dd>Presencial</dd>
        <dt>Unidades</dt><dd>${units.map(u => esc(u.label)).join('<br>')}</dd>
        <dt>Turmas</dt><dd>Consulte datas e horários</dd>
        <dt>Valores</dt><dd>Consulte pelo WhatsApp</dd>
      </dl>
      ${unitCta(c, 'curso-info')}
    </div>
  </div>
</section>

<section class="section gray" id="aprender">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Conteúdo</span><h2>O que você vai aprender</h2></div>
    <ul class="checklist cols reveal">${c.learn.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
  </div>
</section>

<section class="section practice on-dark">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Parte prática</span><h2>Mão na massa durante o curso</h2></div>
    <div class="grid c2">${c.practice.map(p => `<div class="item reveal">${esc(p)}</div>`).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap grid c2" style="align-items:start">
    <div class="reveal"><span class="eyebrow">Para quem é</span><h2>Esse curso é para você se…</h2><ul class="checklist">${c.audience.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>
    <div class="reveal"><span class="eyebrow">Possibilidades</span><h2>Onde você pode atuar</h2><ul class="checklist">${c.career.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
      <p class="note" style="margin-top:16px">As oportunidades dependem do mercado e do seu perfil. O curso prepara você com conhecimento e prática para buscar essas áreas.</p></div>
  </div>
</section>

<section class="section gray">
  <div class="wrap" style="max-width:820px">
    <div class="section-head"><span class="eyebrow">Dúvidas frequentes</span><h2>Perguntas e respostas</h2></div>
    ${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><div class="ans">${esc(a)}</div></details>`).join('')}
  </div>
</section>

${ctaBand(c, 'curso-final')}

<section class="section">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">Outros cursos</span><h2>Veja também</h2></div>
    <div class="grid c3">${others.map(courseCard).join('')}</div>
  </div>
</section>`,
  });
}

for (const u of units) {
  const path = `/unidades/${u.id}/`;
  const crumbs = [['Início', '/'], ['Unidades', path], [u.name, path]];
  pages[path] = layout({
    path,
    title: `Cursos presenciais em ${u.name}${u.id === 'campo-grande-rj' ? ' (RJ)' : ' – RJ'} | Carreira+`,
    description: `Unidade Carreira+ ${u.label}: cursos profissionalizantes presenciais com aulas práticas. Fale com a unidade pelo WhatsApp.`,
    schema: [orgSchema, crumbsSchema([['Início', '/'], [u.name, path]])],
    sticky: `<div class="sticky-cta"><a class="btn btn-wa" ${waAttrs(null, u, 'unidade-sticky')}>${waIcon} WhatsApp ${esc(u.name)}</a></div>`,
    body: `
<section class="hero on-dark"><div class="wrap"><div>
  ${crumbsHtml([['Início', '/'], [u.name, path]])}
  <span class="tag">${icon('pin')} Unidade ${esc(u.name)}</span>
  <h1>Cursos presenciais em <em>${esc(u.name)}</em></h1>
  <p class="lead">Aulas práticas na unidade Carreira+ ${esc(u.label)}. Fale com a unidade para receber o endereço, os horários e as próximas turmas.</p>
  <div class="actions"><a class="btn btn-primary" ${waAttrs(null, u, 'unidade-hero')}>Falar com a unidade</a><a class="btn btn-ghost" href="#cursos">Ver cursos</a></div>
</div></div></section>
${u.notes.length ? `<section class="section" style="padding-bottom:0"><div class="wrap">${u.notes.map(n => `<p class="note">${esc(n)}</p>`).join('')}</div></section>` : ''}
<section class="section" id="cursos"><div class="wrap">
  <div class="section-head"><span class="eyebrow">Cursos</span><h2>Cursos em ${esc(u.name)}</h2><p>Confirme pelo WhatsApp quais turmas estão com matrículas abertas nesta unidade.</p></div>
  <div class="grid c3">${courses.map(courseCard).join('')}</div>
</div></section>
${ctaBand(null, 'unidade-final')}`,
  });
}

pages['/politica-de-privacidade/'] = layout({
  path: '/politica-de-privacidade/',
  title: 'Política de Privacidade | Carreira+',
  description: 'Como a Carreira+ trata os dados de quem visita o site e entra em contato.',
  body: `
<section class="hero on-dark"><div class="wrap"><div><h1>Política de <em>Privacidade</em></h1></div></div></section>
<section class="section"><div class="wrap prose">
<p>Esta política explica como o ${esc(site.legalName)} ("Carreira+") trata as informações de quem visita este site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
<h2>Que dados coletamos</h2>
<p>Este site não tem formulário de cadastro e não usa cookies de publicidade ou rastreamento. Quando você clica em um botão de WhatsApp, a conversa acontece no aplicativo WhatsApp, e recebemos as informações que você mesmo enviar, como nome, telefone e o curso de interesse.</p>
<h2>Para que usamos</h2>
<p>Usamos esses dados apenas para responder ao seu contato, informar sobre cursos e turmas e, se você se matricular, cumprir as obrigações do contrato.</p>
<h2>Compartilhamento</h2>
<p>Não vendemos nem compartilhamos seus dados com terceiros para fins de publicidade.</p>
<h2>Seus direitos</h2>
<p>Você pode pedir a qualquer momento para ver, corrigir ou excluir seus dados. Basta falar com a gente pelo WhatsApp de atendimento.</p>
<h2>Atualizações</h2>
<p>Se esta política mudar, a versão atualizada será publicada nesta página.</p>
</div></section>`,
});

pages['/404.html'] = layout({
  path: '/404.html', title: 'Página não encontrada | Carreira+', description: 'Página não encontrada.',
  body: `<section class="hero on-dark"><div class="wrap"><div><span class="tag">Erro 404</span><h1>Página não <em>encontrada</em></h1><p class="lead">O endereço pode ter mudado. Veja os cursos ou fale com a gente.</p><div class="actions"><a class="btn btn-primary" href="/cursos/">Ver cursos</a><a class="btn btn-ghost" ${waAttrs(null, null, '404')}>Falar no WhatsApp</a></div></div></div></section>`,
});

// ---------- escrever ----------
for (const [p, html] of Object.entries(pages)) {
  const file = p.endsWith('/') ? join(OUT, p, 'index.html') : join(OUT, p);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
for (const f of ['style.css', 'main.js']) copyFileSync(join('src', f), join(OUT, f));
copyFileSync('src/logo-escuro.webp', join(OUT, 'logo.webp'));
copyFileSync('src/og.jpg', join(OUT, 'og.jpg'));
copyFileSync('src/favicon.png', join(OUT, 'favicon.png'));

const urls = Object.keys(pages).filter(p => p.endsWith('/'));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site.domain}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);
// Enquanto estiver no endereço de teste, não indexar
writeFileSync(join(OUT, '_headers'), `https://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n\n/*.webp\n  Cache-Control: public, max-age=31536000\n`);
console.log('OK', Object.keys(pages).length, 'páginas');
