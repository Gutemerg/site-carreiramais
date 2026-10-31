// Gerador estático do site Carreira+ — npm run build → dist/
// Fotos: coloque em src/img/ com o nome da "chave" (ex.: home-hero.jpg, curso-massoterapia-profissional.jpg).
// Se a foto existir, ela é otimizada e usada; se não, entra um espaço reservado na cor da marca.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';

const data = JSON.parse(readFileSync('content/site.json', 'utf8'));
const { site, units, courses } = data;
const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'img'), { recursive: true });

// ---------- imagens ----------
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* sem sharp: copia o arquivo como está */ }
const IMG_DIR = 'src/img';
const imgFiles = existsSync(IMG_DIR) ? readdirSync(IMG_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f)) : [];
const IMAGES = {}; // chave -> { src, srcset }
for (const f of imgFiles) {
  const key = parse(f).name.toLowerCase();
  if (sharp) {
    const sizes = [640, 1280];
    for (const w of sizes) await sharp(join(IMG_DIR, f)).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 74 }).toFile(join(OUT, 'img', `${key}-${w}.webp`));
    IMAGES[key] = { src: `/img/${key}-1280.webp`, srcset: sizes.map(w => `/img/${key}-${w}.webp ${w}w`).join(', ') };
  } else {
    copyFileSync(join(IMG_DIR, f), join(OUT, 'img', f));
    IMAGES[key] = { src: `/img/${f}`, srcset: '' };
  }
}
const ALT = {};
for (const c of courses) ALT[`curso-${c.slug}`] = `Aula prática do curso de ${c.shortName} na Carreira+`;
for (const u of units) ALT[`unidade-${u.id}`] = `Unidade Carreira+ ${u.name}`;
Object.assign(ALT, { 'home-hero': 'Aluna da Carreira+ em sala de aula', 'cursos-hero': 'Alunos da Carreira+ em aula presencial', 'unidades-hero': 'Unidade da Carreira+', 'atendimento': 'Atendimento da Carreira+' });

function media(keys, { icon: ic = 'cap', sizes = '(min-width: 980px) 33vw, 100vw', eager = false, cls = '' } = {}) {
  const key = [].concat(keys).find(k => IMAGES[k]);
  if (key) {
    const im = IMAGES[key];
    return `<div class="media ${cls}"><img src="${im.src}"${im.srcset ? ` srcset="${im.srcset}" sizes="${sizes}"` : ''} alt="${esc(ALT[key] || '')}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></div>`;
  }
  return `<div class="media ${cls}"><div class="ph">${icon(ic)}</div></div>`;
}

// ---------- helpers ----------
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
const wa = (course, unit, origin) => `href="${esc(createWhatsAppLink(course, unit, origin))}" target="_blank" rel="noopener" data-wa data-course="${esc(course ? course.slug : '')}" data-unit="${esc(unit ? unit.id : '')}" data-origin="${esc(origin)}"`;

const I = {
  fingerprint: '<path d="M12 11c0 3.5-.6 6.3-1.8 8.5"/><path d="M8.2 9.1A4 4 0 0 1 16 11c0 1.6-.1 3.2-.4 4.6"/><path d="M5.3 7.5A7 7 0 0 1 19 11c0 1.1 0 2.1-.1 3"/><path d="M4.4 13.5c.4-1 .6-2 .6-3"/><path d="M15 19.5c.3-.8.5-1.7.7-2.6"/><path d="M8.5 19.8c.5-1.1.9-2.4 1.1-3.8"/><path d="M12 3a8 8 0 0 0-5.7 2.4"/><path d="M17.7 5.4A8 8 0 0 0 14.5 3.4"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.7 18.4A1.7 1.7 0 0 0 6.2 21h11.6a1.7 1.7 0 0 0 1.5-2.6L14 9.5V3"/><path d="M7.5 15h9"/>',
  hands: '<path d="M7 11.5V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M10 10.5V4.5a1.5 1.5 0 0 1 3 0v6"/><path d="M13 10.5V5.5a1.5 1.5 0 0 1 3 0V12"/><path d="M16 9.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.6a6 6 0 0 1-4.6-2.2L4 14.5a1.6 1.6 0 0 1 2.4-2.1L8 14"/>',
  blocks: '<rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/><rect x="8" y="3" width="8" height="8" rx="1"/>',
  heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21.5l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1Z"/><path d="M3.5 12h4l1.5-3 3 6 1.5-3h7"/>',
  shield: '<path d="M12 21s-7.5-3.4-7.5-9.5V5.2L12 2.5l7.5 2.7v6.3C19.5 17.6 12 21 12 21Z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
  pin: '<path d="M12 21s-6.5-6.1-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.8" r="2.4"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  chat: '<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.2A8.5 8.5 0 1 1 21 12Z"/>',
  cap: '<path d="M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z"/><path d="M6 11.3v4.2c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.2"/><path d="M22 9.5v5"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  phone: '<path d="M21 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1.1 4.2 2 2 0 0 1 3.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
};
const icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;
const waIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3ZM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>';

// Oferta central (site.json → site.offer) — troque/desligue em um só lugar
const OFFER = site.offer && site.offer.active ? site.offer : null;
const offerBadge = () => OFFER ? `<span class="offer-badge">${icon('tag')} ${esc(OFFER.short)}</span>` : '';
const offerNote = () => OFFER ? `<div class="offer-note">${icon('tag')}<div><strong>${esc(OFFER.short)}</strong><span>Pague a 1ª parcela só depois do início das aulas.</span></div></div>` : '';

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
<meta name="theme-color" content="#7A0C1E">
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
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
${ld}
</head>
<body class="${sticky ? 'has-sticky' : ''}">
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
${OFFER ? `<div class="offer-bar"><a href="/matricula/">${icon('tag')} ${esc(OFFER.bar)}</a></div>` : ''}
<header class="header">
  <div class="wrap">
    <a class="logo" href="/" aria-label="Carreira+ — página inicial"><img src="/logo-claro.webp" alt="Instituto Profissionalizante Carreira+" width="154" height="42"></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    <nav class="nav" id="nav" aria-label="Principal">
      <a href="/">Início</a>
      <a href="/cursos/">Cursos</a>
      <a href="/unidades/">Unidades</a>
      <a href="/#sobre">Sobre</a>
      <a href="/contato/">Contato</a>
      <a class="btn btn-primary btn-sm" href="/matricula/">Matricule-se</a>
    </nav>
  </div>
</header>
<main id="conteudo">
${body}
</main>
${footer()}
<a class="wa-float" ${wa(null, null, 'flutuante')} aria-label="Falar no WhatsApp">${waIcon}</a>
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
      <div><h4>Atendimento</h4><ul>${units.map(u => `<li><a ${wa(null, u, 'rodape')}>WhatsApp ${esc(u.name)}</a></li>`).join('')}<li><a href="/matricula/">Matrícula</a></li><li><a href="/politica-de-privacidade/">Política de Privacidade</a></li></ul></div>
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
const crumbsHtml = items => `<nav class="crumbs" aria-label="Você está em">${items.map((it, i) => i < items.length - 1 ? `<a href="${it[1]}">${esc(it[0])}</a> › ` : `<span aria-current="page">${esc(it[0])}</span>`).join('')}</nav>`;

const AREAS = [...new Set(courses.map(c => c.area))];
function courseCard(c, origin = 'card') {
  const price = c.price
    ? `<span class="from">A partir de</span><span class="price">${esc(c.price)}</span>`
    : OFFER ? `<span class="from">Condição especial</span><span class="price small-price">${esc(OFFER.short)}</span>` : `<span class="from">Valores e turmas</span><span class="price small-price">no WhatsApp</span>`;
  return `<article class="ccard reveal" data-area="${esc(c.area)}">
    ${media([`curso-${c.slug}`], { icon: c.icon, sizes: '(min-width: 980px) 25vw, 50vw' })}
    <div class="body">
      <h3><a href="/cursos/${c.slug}/">${esc(c.name)}</a></h3>
      <div class="foot"><div class="pricebox">${price}</div><a class="btn btn-primary btn-sm" href="/cursos/${c.slug}/">Saiba mais ${icon('arrow')}</a></div>
    </div>
  </article>`;
}

function unitCard(u, origin) {
  return `<article class="ucard reveal">
    ${media([`unidade-${u.id}`], { icon: 'pin', sizes: '200px' })}
    <div class="body">
      <h3>Unidade ${esc(u.name)}</h3>
      <div class="sub">${esc(u.label)}</div>
      <ul>
        <li>${icon('pin')}<span>${u.address ? esc(u.address) : 'Endereço e como chegar: fale com a unidade pelo WhatsApp'}</span></li>
        ${u.hours ? `<li>${icon('clock')}<span>${esc(u.hours)}</span></li>` : ''}
        ${u.notes.map(n => `<li>${icon('calendar')}<span>${esc(n)}</span></li>`).join('')}
      </ul>
      <div class="actions"><a class="btn btn-wa btn-sm" ${wa(null, u, origin)}>${waIcon} Fale no WhatsApp</a><a class="btn btn-outline btn-sm" href="/unidades/${u.id}/">Ver unidade</a></div>
    </div>
  </article>`;
}

// Destaques em texto (sem números), conforme pedido do Júnior
const highlights = `<section class="highlights" aria-label="Destaques"><div class="wrap"><div class="hl-card">
  <div class="hl">${icon('cap')}<div><strong>Diversos cursos</strong><span>Saúde, educação, perícia e mais</span></div></div>
  <div class="hl">${icon('pin')}<div><strong>Campo Grande e Nova Iguaçu</strong><span>Unidades no Rio de Janeiro</span></div></div>
  <div class="hl">${icon('users')}<div><strong>100% presencial</strong><span>Aulas em sala, com professor</span></div></div>
  <div class="hl">${icon('tool')}<div><strong>Aulas práticas</strong><span>Você aprende fazendo</span></div></div>
</div></div></section>`;

const REGION = { 'campo-grande-rj': 'Zona Oeste – Rio de Janeiro', 'nova-iguacu': 'Baixada Fluminense' };
function unitMini(u) {
  return `<a class="umini reveal" href="/unidades/${u.id}/">
    ${media([`unidade-${u.id}`], { icon: 'pin', sizes: '140px' })}
    <div><strong>${esc(u.name)}</strong><span>${esc(REGION[u.id] || u.label)}</span><em>Ver unidade →</em></div>
  </a>`;
}

function ctaBand(course, origin) {
  return `<section class="cta-band"><div class="wrap">
    <h2>${course ? 'Garanta sua vaga na próxima turma' : 'Seu próximo passo começa aqui'}</h2>
    <p>${course ? `Fale com a gente e receba datas, duração e valores do curso de ${esc(course.shortName)}.` : (OFFER ? OFFER.long + ' ' : '') + 'Escolha seu curso e fale com a gente.'}</p>
    <div class="actions"><a class="btn btn-light" href="/matricula/${course ? `?curso=${course.slug}` : ''}">Matricule-se agora</a><a class="btn btn-dark" ${wa(course, null, origin)}>${waIcon} Fale no WhatsApp</a></div>
  </div></section>`;
}

// ---------- páginas ----------
const pages = {};

pages['/'] = layout({
  path: '/',
  title: 'Carreira+ | Cursos profissionalizantes presenciais em Nova Iguaçu e Campo Grande RJ',
  description: site.description,
  schema: [orgSchema],
  body: `
<section class="hero hero-bg">
  <div class="bg">${media(['home-hero'], { icon: 'cap', sizes: '100vw', eager: true })}</div>
  <div class="wrap">
    <div class="copy">
      ${offerBadge()}
      <h1>Transforme seu futuro com <mark>cursos profissionalizantes</mark></h1>
      <p class="lead">Formação prática, presencial e com foco no mercado de trabalho. Venha para a Carreira+ e conquiste novas oportunidades.</p>
      <div class="actions">
        <a class="btn btn-red" href="/matricula/">Matricule-se agora ${icon('arrow')}</a>
        <a class="btn btn-dark" ${wa(null, null, 'home-hero')}>${waIcon} Fale no WhatsApp</a>
      </div>
    </div>
  </div>
</section>
${highlights}

<section class="section" id="cursos">
  <div class="wrap">
    <div class="section-head"><h2>Nossos cursos em destaque</h2><a class="more" href="/cursos/">Ver todos os cursos →</a></div>
    <div class="grid cards">${courses.map(c => courseCard(c, 'home')).join('')}</div>
    <div class="icon-strip" id="sobre">
      <div>${icon('tool')}<span>Aulas práticas e presenciais</span></div>
      <div>${icon('chat')}<span>Atendimento humanizado</span></div>
      <div>${icon('calendar')}<span>Matrícula fácil pelo WhatsApp</span></div>
      <div>${icon('cap')}<span>Foco no mercado de trabalho</span></div>
    </div>
  </div>
</section>

<section class="units-band">
  <div class="wrap">
    <h2>Nossas unidades no Rio de Janeiro</h2>
    <div class="grid c2">${units.map(unitMini).join('')}</div>
  </div>
</section>
${ctaBand(null, 'home-final')}`,
});

pages['/cursos/'] = layout({
  path: '/cursos/',
  title: 'Cursos presenciais | Carreira+ Nova Iguaçu e Campo Grande RJ',
  description: 'Conheça os cursos profissionalizantes presenciais da Carreira+: perícia, necropsia, massoterapia, educação, cuidador de idosos e portaria.',
  schema: [orgSchema, crumbsSchema([['Início', '/'], ['Cursos', '/cursos/']])],
  body: `
<section class="phero">
  <div class="bg">${media(['cursos-hero', 'home-hero'], { icon: 'cap', sizes: '100vw', eager: true })}</div>
  <div class="wrap">
    ${crumbsHtml([['Início', '/'], ['Cursos', '/cursos/']])}
    <h1>Nossos cursos</h1>
    <p class="lead">Formação profissional presencial, com aulas práticas, para você conquistar novas oportunidades.</p>
  </div>
</section>
${highlights}
<section class="section"><div class="wrap">
  <div class="filters" role="group" aria-label="Filtrar por área">
    <button type="button" aria-pressed="true" data-filter="*">Todos</button>
    ${AREAS.map(a => `<button type="button" aria-pressed="false" data-filter="${esc(a)}">${esc(a)}</button>`).join('')}
  </div>
  <div class="grid cards" id="course-grid">${courses.map(c => courseCard(c, 'cursos')).join('')}</div>
</div></section>
${ctaBand(null, 'cursos-final')}`,
});

for (const c of courses) {
  const path = `/cursos/${c.slug}/`;
  const crumbs = [['Início', '/'], ['Cursos', '/cursos/'], [c.shortName, path]];
  const faq = [
    ['O curso é presencial ou online?', 'É presencial. As aulas acontecem na unidade, com atividades práticas em sala.'],
    ['Em qual unidade posso fazer?', 'Temos unidades em Nova Iguaçu e em Campo Grande (RJ). Fale com a unidade mais perto de você para saber as turmas disponíveis.'],
    ['Qual a duração e o valor?', 'Duração, horários e valores variam conforme a turma. Fale com a gente pelo WhatsApp e passamos as informações atualizadas.'],
    ...(OFFER ? [['Preciso pagar a matrícula?', 'Não. A matrícula é grátis, e você só paga a 1ª parcela depois que as aulas começarem.']] : []),
    ['Preciso ter conhecimento prévio?', 'Não. O curso começa pelos fundamentos e avança para a prática.'],
    ['Como faço a matrícula?', 'Preencha a página de matrícula ou chame no WhatsApp da unidade. O atendimento explica o passo a passo.'],
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
    sticky: `<div class="sticky-cta"><a class="btn btn-primary" href="/matricula/?curso=${c.slug}">Matricule-se</a><a class="btn btn-wa" ${wa(c, null, 'sticky-mobile')}>${waIcon} WhatsApp</a></div>`,
    body: `
<section class="phero">
  <div class="bg">${media([`curso-${c.slug}`], { icon: c.icon, sizes: '100vw', eager: true })}</div>
  <div class="wrap course-top">
    <div>
      ${crumbsHtml(crumbs)}
      <h1>${esc(c.name)}</h1>
      <p class="lead">${esc(c.hero)}</p>
      <ul class="chips"><li>${icon('pin')} Presencial</li><li>${icon('tool')} Aulas práticas</li><li>${icon('calendar')} Turmas em Nova Iguaçu e Campo Grande</li></ul>
    </div>
    <div class="cta-box">
      <div class="label">Próximas turmas e valores</div>
      <div class="big">Consulte as condições da sua unidade</div>
      ${offerNote()}
      <a class="btn btn-primary btn-block" href="/matricula/?curso=${c.slug}">Matricule-se agora ${icon('arrow')}</a>
      <a class="btn btn-dark btn-block" ${wa(c, null, 'curso-box')}>${waIcon} Fale no WhatsApp</a>
    </div>
  </div>
</section>
<div class="ticker" aria-hidden="true"><div class="ticker-track">${[...Array(2)].map(() => [OFFER ? OFFER.short : null, 'Turmas em Campo Grande e Nova Iguaçu', 'Aulas 100% presenciais', 'Muita prática em sala', 'Atendimento rápido no WhatsApp'].filter(Boolean).map(t => `<span>${icon('tag')} ${esc(t)}</span>`).join('')).join('')}</div></div>
<nav class="tabs" aria-label="Seções do curso"><div class="wrap">
  <a href="#sobre">Sobre</a><a href="#aprender">Módulos</a><a href="#pratica">Na prática</a><a href="#para-quem">Pra você?</a><a href="#atuar">Onde atuar</a><a href="#faq">Dúvidas</a>
</div></nav>

<section class="blk blk-sobre" id="sobre"><div class="wrap">
  <span class="bigword" aria-hidden="true">${esc(c.area)}</span>
  <div class="about">
    <div class="reveal"><span class="pill pill-new">Por dentro do curso</span><h2>${esc(c.shortName)}</h2><p class="lead-dark">${esc(c.about)}</p>
      <div class="mini-tags"><span>${icon('pin')} Presencial</span><span>${icon('tool')} Prática</span><span>${icon('users')} Turmas</span></div></div>
    ${media([`curso-${c.slug}-2`, `curso-${c.slug}`], { icon: c.icon, sizes: '(min-width: 900px) 45vw, 100vw', cls: 'tilt' })}
  </div>
</div></section>

<section class="blk blk-modulos" id="aprender">
  <div class="wrap"><span class="pill pill-red">Conteúdo do curso</span><h2>O que você vai aprender</h2><p class="hint">Arraste para o lado ${icon('arrow')}</p></div>
  <div class="mod-scroller" tabindex="0" aria-label="Módulos do curso">
    ${c.learn.map((l, i) => `<article class="mod"><span class="mod-n">${String(i + 1).padStart(2, '0')}</span><h3>${esc(l)}</h3><span class="mod-tag">Módulo</span></article>`).join('')}
    <article class="mod mod-cta"><h3>Quer o conteúdo completo?</h3><a class="btn btn-red btn-sm" ${wa(c, null, 'curso-modulos')}>${waIcon} Pedir no WhatsApp</a></article>
  </div>
</section>

<section class="blk blk-pratica" id="pratica"><div class="wrap">
  <span class="pill pill-light">Na prática</span><h2>Mão na massa durante o curso</h2>
  <ol class="timeline">${c.practice.map((p, i) => `<li class="reveal"><span class="tl-dot">${i + 1}</span><div class="tl-card"><span class="tl-tag">NA PRÁTICA</span><p>${esc(p)}</p></div></li>`).join('')}</ol>
</div></section>

<section class="blk blk-pravoce" id="para-quem"><div class="wrap">
  <span class="pill pill-red">Teste rápido</span><h2>Esse curso é pra você se…</h2><p class="hint">Toque nos que combinam com você</p>
  <div class="match-grid">${c.audience.map(a => `<button type="button" class="match reveal" aria-pressed="false"><span class="match-ico">${icon('arrow')}</span>${esc(a)}</button>`).join('')}</div>
  <div class="match-result" hidden><strong>Combina com você!</strong> <a class="btn btn-red btn-sm" href="/matricula/?curso=${c.slug}">Garantir minha vaga ${icon('arrow')}</a></div>
</div></section>

<section class="blk blk-atuar" id="atuar">
  <div class="wrap"><span class="pill pill-dark">Possibilidades</span><h2>Onde você pode atuar</h2></div>
  <div class="marquee" aria-hidden="true"><div class="marquee-track">${[...Array(3)].map(() => c.career.map((a, i) => `<span class="mq ${i % 2 ? 'mq-red' : 'mq-dark'}">${esc(a)}</span>`).join('')).join('')}</div></div>
  <div class="wrap"><ul class="sr-list">${c.career.map(a => `<li>${esc(a)}</li>`).join('')}</ul>
  <p class="small">As oportunidades dependem do mercado e do seu perfil. O curso prepara você com conhecimento e prática para buscar essas áreas.</p></div>
</section>

<section class="blk blk-faq" id="faq"><div class="wrap" style="max-width:760px">
  <div class="chat-head">${icon('chat')}<div><strong>Carreira+ responde</strong><span>Toque numa pergunta</span></div></div>
  <div class="chat">
    ${faq.map(([q, a]) => `<details class="chat-item"><summary class="bubble bubble-me">${esc(q)}</summary><div class="bubble bubble-them">${esc(a)}</div></details>`).join('')}
  </div>
</div></section>
${ctaBand(c, 'curso-final')}
<section class="section"><div class="wrap">
  <div class="section-head"><div><span class="eyebrow">Outros cursos</span><h2>Veja também</h2></div></div>
  <div class="grid cards">${others.map(o => courseCard(o, 'relacionados')).join('')}</div>
</div></section>`,
  });
}

pages['/unidades/'] = layout({
  path: '/unidades/',
  title: 'Unidades Carreira+ | Nova Iguaçu e Campo Grande RJ',
  description: 'Unidades da Carreira+ em Nova Iguaçu e Campo Grande (RJ): cursos profissionalizantes presenciais com aulas práticas.',
  schema: [orgSchema, crumbsSchema([['Início', '/'], ['Unidades', '/unidades/']])],
  body: `
<section class="phero">
  <div class="bg">${media(['unidades-hero', 'unidade-campo-grande-rj', 'unidade-nova-iguacu', 'cursos-hero'], { icon: 'pin', sizes: '100vw', eager: true })}</div>
  <div class="wrap">${crumbsHtml([['Início', '/'], ['Unidades', '/unidades/']])}<h1>Nossas unidades</h1><p class="lead">Estamos no Rio de Janeiro, em Nova Iguaçu e em Campo Grande, com aulas presenciais e práticas.</p></div>
</section>
<section class="section"><div class="wrap"><div class="grid c2">${units.map(u => unitCard(u, 'unidades')).join('')}</div></div></section>
${ctaBand(null, 'unidades-final')}`,
});

for (const u of units) {
  const path = `/unidades/${u.id}/`;
  const crumbs = [['Início', '/'], ['Unidades', '/unidades/'], [u.name, path]];
  pages[path] = layout({
    path,
    title: `Cursos presenciais em ${u.name}${u.id === 'campo-grande-rj' ? ' (RJ)' : ' – RJ'} | Carreira+`,
    description: `Unidade Carreira+ ${u.label}: cursos profissionalizantes presenciais com aulas práticas. Fale com a unidade pelo WhatsApp.`,
    schema: [orgSchema, crumbsSchema(crumbs)],
    sticky: `<div class="sticky-cta"><a class="btn btn-wa" ${wa(null, u, 'unidade-sticky')}>${waIcon} WhatsApp ${esc(u.name)}</a></div>`,
    body: `
<section class="phero">
  <div class="bg">${media([`unidade-${u.id}`], { icon: 'pin', sizes: '100vw', eager: true })}</div>
  <div class="wrap">${crumbsHtml(crumbs)}<h1>Cursos presenciais em ${esc(u.name)}</h1>
  <p class="lead">Aulas práticas na unidade Carreira+ ${esc(u.label)}. Fale com a unidade para receber o endereço, os horários e as próximas turmas.</p>
  <div class="actions" style="margin-top:20px"><a class="btn btn-wa" ${wa(null, u, 'unidade-hero')}>${waIcon} Falar com a unidade</a><a class="btn btn-light" href="#cursos">Ver cursos</a></div></div>
</section>
${u.notes.length ? `<section class="section" style="padding-bottom:0"><div class="wrap">${u.notes.map(n => `<p class="note">${esc(n)}</p>`).join('')}</div></section>` : ''}
<section class="section" id="cursos"><div class="wrap">
  <div class="section-head"><div><span class="eyebrow">Cursos</span><h2>Cursos em ${esc(u.name)}</h2></div><p>Confirme pelo WhatsApp quais turmas estão com matrículas abertas nesta unidade.</p></div>
  <div class="grid cards">${courses.map(c => courseCard(c, 'unidade')).join('')}</div>
</div></section>
${ctaBand(null, 'unidade-final')}`,
  });
}

pages['/matricula/'] = layout({
  path: '/matricula/',
  title: 'Matrícula | Carreira+',
  description: 'Faça sua pré-matrícula na Carreira+: escolha o curso e a unidade e fale com a nossa equipe pelo WhatsApp.',
  body: `
<section class="phero">
  <div class="bg">${media(['atendimento', 'home-hero'], { icon: 'cap', sizes: '100vw', eager: true })}</div>
  <div class="wrap">${crumbsHtml([['Início', '/'], ['Matrícula', '/matricula/']])}<h1>Garanta já a sua matrícula</h1><p class="lead">Preencha seus dados e dê o próximo passo para uma nova profissão.</p></div>
</section>
<section class="section"><div class="wrap" style="max-width:980px">
  <div class="steps" aria-hidden="true"><div class="on">Seus dados</div><div>Atendimento</div><div>Matrícula</div><div>Início das aulas</div></div>
  <div class="grid c2" style="align-items:start">
    <form class="form-card" id="form-matricula" novalidate>
      <h3>Seus dados</h3>
      <div class="field"><label for="f-nome">Nome completo</label><input id="f-nome" name="nome" autocomplete="name" required></div>
      <div class="field"><label for="f-curso">Curso escolhido</label><select id="f-curso" name="curso" required><option value="">Selecione</option>${courses.map(c => `<option value="${c.slug}" data-name="${esc(c.shortName)}">${esc(c.name)}</option>`).join('')}</select></div>
      <div class="field"><label for="f-unidade">Unidade</label><select id="f-unidade" name="unidade" required><option value="">Selecione</option>${units.map(u => `<option value="${u.id}" data-name="${esc(u.name)}" data-wa="${u.whatsapp}">${esc(u.label)}</option>`).join('')}</select></div>
      <button class="btn btn-primary btn-block" type="submit">Continuar no WhatsApp ${icon('arrow')}</button>
      <p class="small" style="margin-top:12px">Seus dados não ficam salvos neste site: eles vão direto na mensagem para o WhatsApp da unidade escolhida, só para o nosso atendimento. Veja a <a href="/politica-de-privacidade/">Política de Privacidade</a>.</p>
    </form>
    <div>
      <div class="form-card" style="margin-bottom:18px">
        ${offerNote()}
        <h3 style="margin-top:14px">Como funciona</h3>
        <ul class="checklist"><li>Você escolhe o curso e a unidade.</li><li>Nossa equipe responde no WhatsApp com datas, horários e valores.</li><li>A matrícula é concluída com o atendimento da unidade.</li></ul>
      </div>
      <div class="form-card">
        <h3>Prefere falar direto?</h3>
        ${units.map(u => `<a class="btn btn-wa btn-block" style="margin-top:10px" ${wa(null, u, 'matricula')}>${waIcon} WhatsApp ${esc(u.name)}</a>`).join('')}
      </div>
    </div>
  </div>
</div></section>`,
});

pages['/contato/'] = layout({
  path: '/contato/',
  title: 'Contato | Carreira+',
  description: 'Fale com a Carreira+ pelo WhatsApp das unidades de Nova Iguaçu e Campo Grande (RJ).',
  schema: [orgSchema, crumbsSchema([['Início', '/'], ['Contato', '/contato/']])],
  body: `
<section class="phero">
  <div class="bg">${media(['atendimento', 'cursos-hero'], { icon: 'chat', sizes: '100vw', eager: true })}</div>
  <div class="wrap">${crumbsHtml([['Início', '/'], ['Contato', '/contato/']])}<h1>Fale com a gente</h1><p class="lead">Tire suas dúvidas, receba orientações e encontre o curso ideal para você.</p></div>
</section>
<section class="section"><div class="wrap"><div class="grid c2">${units.map(u => unitCard(u, 'contato')).join('')}</div>
<p class="small" style="margin-top:18px">Instagram: <a href="https://www.instagram.com/${site.instagram}/" target="_blank" rel="noopener">@${site.instagram}</a></p></div></section>`,
});

pages['/politica-de-privacidade/'] = layout({
  path: '/politica-de-privacidade/',
  title: 'Política de Privacidade | Carreira+',
  description: 'Como a Carreira+ trata os dados de quem visita o site e entra em contato.',
  body: `
<section class="phero"><div class="wrap"><h1>Política de Privacidade</h1></div></section>
<section class="section"><div class="wrap prose">
<p>Esta política explica como o ${esc(site.legalName)} ("Carreira+") trata as informações de quem visita este site, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
<h2>Que dados coletamos</h2>
<p>Este site não armazena cadastros e não usa cookies de publicidade ou rastreamento. Na página de matrícula, o nome, o curso e a unidade que você informar são usados apenas para montar a mensagem que você mesmo envia pelo WhatsApp. A conversa acontece no aplicativo WhatsApp, e recebemos as informações que você enviar.</p>
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
  body: `<section class="phero"><div class="wrap"><h1>Página não encontrada</h1><p class="lead">O endereço pode ter mudado. Veja os cursos ou fale com a gente.</p><div class="actions" style="margin-top:18px"><a class="btn btn-light" href="/cursos/">Ver cursos</a><a class="btn btn-wa" ${wa(null, null, '404')}>${waIcon} Fale no WhatsApp</a></div></div></section>`,
});

// ---------- escrever ----------
for (const [p, html] of Object.entries(pages)) {
  const file = p.endsWith('/') ? join(OUT, p, 'index.html') : join(OUT, p);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
for (const f of ['style.css', 'main.js', 'og.jpg', 'favicon.png', 'logo-claro.webp']) copyFileSync(join('src', f), join(OUT, f));
copyFileSync('src/logo-escuro.webp', join(OUT, 'logo.webp'));

const urls = Object.keys(pages).filter(p => p.endsWith('/'));
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${site.domain}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.domain}/sitemap.xml\n`);
writeFileSync(join(OUT, '_headers'), `https://:project.pages.dev/*\n  X-Robots-Tag: noindex\n\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n\n/img/*\n  Cache-Control: public, max-age=2592000\n`);
console.log('OK', Object.keys(pages).length, 'páginas,', Object.keys(IMAGES).length, 'fotos', sharp ? '(otimizadas)' : '(sem otimização)');
