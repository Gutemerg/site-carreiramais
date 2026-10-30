# Site Carreira+ (carreiramais.com.br)

Site estático do Instituto Profissionalizante Carreira+.

- `content/site.json` — todos os dados (cursos, unidades, WhatsApp). Edite aqui.
- `build.mjs` — gera as páginas em `dist/` (`npm run build`).
- `src/` — estilos, script, logo e imagens.

Publicação: Cloudflare Pages ligado a este repositório. Build `npm run build`, saída `dist`. Todo push na `main` publica.

Regras de conteúdo: nunca inventar endereço, preço, data, duração ou depoimento. Links de WhatsApp só pelo helper `createWhatsAppLink`.
