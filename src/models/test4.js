/**
 * vulnerable-demo.js
 *
 * Propósito: EXEMPLO EDUCACIONAL com vulnerabilidades típicas.
 * - Contém credenciais fictícias embutidas (user/pass, API key).
 * - Demonstra patterns vulneráveis: SQL injection, XSS, (simulada) RCE.
 *
 * SEGURANÇA:
 * - NÃO execute este código em produção ou em hosts acessíveis publicamente.
 * - Execute somente em um ambiente isolado para estudo.
 */

const express = require('express');
const bodyParser = require('body-parser');
const escapeHtml = require('escape-html'); // usado apenas para mostrar mitigação depois
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ---------- Credenciais e chaves EMBUTIDAS (fictícias) ---------- */
// *Vulnerabilidade: credenciais em código-fonte*
const HARDCODED_USER = 'adminuser';
const HARDCODED_PASS = 'P@ssw0rd123-ficticio';
const STRIPE_API_KEY = 'APIKEY_1234567890'; // exemplo fictício

/* ---------- "Banco de dados" simulado ---------- */
/* Em vez de conectar a um DB real, mantemos uma lista para fins educativos */
const fakeUsers = [
  { id: 1, username: 'alice', email: 'alice@example.com' },
  { id: 2, username: 'bob', email: 'bob@example.com' },
  { id: 3, username: 'charlie', email: 'charlie@example.com' },
];

/* ---------- Login simples (mostra usuário/senha no código) ---------- */
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vulnerabilidade: validação usando credencial hardcoded
  if (username === HARDCODED_USER && password === HARDCODED_PASS) {
    return res.send({ ok: true, msg: 'Autenticado (fictício).' });
  }

  return res.status(401).send({ ok: false, msg: 'Credenciais inválidas.' });
});

/* ---------- Rota que demonstra SQL injection (padrão inseguro) ---------- */
/* Observação: NÃO executamos SQL real aqui; apenas construímos a query e a exibimos. */
app.get('/search-users', (req, res) => {
  // parâmetro vindo do usuário
  const q = req.query.q || '';

  // Vulnerabilidade: construção de query por concatenação (prática insegura)
  const vulnerableSql = `SELECT * FROM users WHERE username LIKE '%${q}%' OR email LIKE '%${q}%'`;
  // Em aplicativos reais isso permitiria SQL Injection se executado em DB.

  // Simulamos o "resultado" filtrando o array (para estudo)
  const results = fakeUsers.filter(u =>
    u.username.includes(q) || u.email.includes(q)
  );

  res.send({
    note: 'Esta rota demonstra o padrão de SQL vulnerável — aqui a query NÃO é executada contra um DB real.',
    vulnerableSql,
    results
  });
});

/* ---------- XSS (reflexivo) ---------- */
/* Rota que injeta input do usuário numa página HTML sem escapar (vulnerável) */
app.get('/greet', (req, res) => {
  const name = req.query.name || 'visita';

  // Vulnerabilidade: inserção direta de input em HTML (XSS reflexivo)
  const unsafeHtml = `
    <html>
      <body>
        <h1>Olá, ${name}!</h1>
        <p>Mensagem insegura (poderia executar script se name contiver JS)</p>
        <hr/>
        <p>Exemplo de comentário: <strong>${name}</strong></p>
      </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(unsafeHtml);
});

/* ---------- RCE (simulada / DESATIVADA) ---------- */
/**
 * Abaixo mostramos como NÃO fazer: executar entrada do usuário com child_process.
 * A linha perigosa está comentada para evitar execução real.
 *
 * Se você deseja testar em ambiente isolado, remova comentários SOMENTE em uma VM isolada.
 */
const { exec } = require('child_process');

app.post('/run-command', (req, res) => {
  const { cmd } = req.body || {};

  // Vulnerabilidade potencial: executar input do usuário — NÃO FAÇA ISSO.
  // Exemplo perigoso (DESATIVADO):
  // exec(cmd, (err, stdout, stderr) => { ... })

  // Simulação segura: não executamos, só mostramos o que seria executado.
  res.send({
    note: 'RCE demonstrada apenas como simulação. O comando NÃO foi executado.',
    wouldRun: cmd
  });
});

/* ---------- Uso indevido de API key embutida (exemplo fictício) ---------- */
app.get('/pay', (req, res) => {
  // Simulação de uso de API key sensível embutida no código
  // Vulnerabilidade: chave em código; facilitará vazamento e uso indevido
  res.send({
    note: 'Simulação de endpoint que usaria a STRIPE_API_KEY embutida (fictícia).',
    stripeApiKeyInCode: STRIPE_API_KEY
  });
});

/* ---------- Rotas de mitigação / boas práticas para estudo ---------- */
/* 1) Versão segura do /greet usando escaping */
app.get('/greet-safe', (req, res) => {
  const name = req.query.name || 'visita';
  const safeName = escapeHtml(name); // evita XSS
  const safeHtml = `
    <html>
      <body>
        <h1>Olá, ${safeName}!</h1>
        <p>Esta versão escapa caracteres perigosos.</p>
      </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(safeHtml);
});

/* 2) Exemplo de como NÃO construir SQL e conselho para usar consultas parametrizadas */
// (aqui apenas texto explicativo)
app.get('/sql-mitigation', (req, res) => {
  res.send({
    advice: [
      'Nunca construa queries concatenando strings com input do usuário.',
      'Use consultas parametrizadas / prepared statements (ex: INSERT ... WHERE id = ?).',
      'Use ORM ou query builder que suporte binding de parâmetros.'
    ]
  });
});

/* ---------- Start server ---------- */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Vulnerable demo rodando em http://localhost:${PORT}`);
  console.log('>>> LEMBRETE: rode apenas em ambiente isolado para estudo.');
});

