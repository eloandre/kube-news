// vulnerable-server.js
// AVISO: Código intencionalmente vulnerável para fins educativos.
// NÃO use em produção. Contém XSS refletido, SQL Injection por concatenação
// e segredos codificados como PLACEHOLDERS (NÃO são credenciais reais).
//
// Para testar (em ambiente isolado):
//   npm init -y
//   npm install express sqlite3 body-parser
//   node vulnerable-server.js
//
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const DB_USER = 'usuario';
const PASSWORD = 'TrURe8u7uPVPulFXl3eznuzWhNS8YDtbQ76dUt1GIbxmeRXq';
const API_KEY = 'API_KEY_1234567890';

// In-memory SQLite DB for demonstration
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, bio TEXT)");
  db.run("INSERT INTO users (username, bio) VALUES ('alice', 'I like cats'), ('bob', 'I like dogs')");
});

// Vulnerable: reflected XSS - echoes 'name' param without escaping
app.get('/greet', (req, res) => {
  const name = req.query.name || 'mundo';
  // This directly returns user input into HTML -> Reflected XSS
  res.send(`<h1>Olá, ${name}!</h1>`);
});

// Vulnerable: SQL Injection via string concatenation
app.get('/user', (req, res) => {
  const username = req.query.username || '';
  // UNSAFE: building SQL query with user-controlled input
  const query = "SELECT id, username, bio FROM users WHERE username = '" + username + "';";
  db.all(query, (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error', details: err.message });
    res.json({ query_executed: query, results: rows });
  });
});

// Vulnerable: unsafe eval-like behavior (do not do this)
app.post('/calc', (req, res) => {
  const expr = req.body.expr || '0';
  // UNSAFE: using eval on user input (demonstration only)
  try {
    // eslint-disable-next-line no-eval
    const result = eval(expr);
    res.json({ expr, result });
  } catch (e) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

// Health and info endpoint that leaks "secrets" (simulated) - BAD PRACTICE
app.get('/info', (req, res) => {
  res.json({
    note: 'Exemplo inseguro — NÃO armazenar segredos em código-fonte',
    db_user: DB_USER,
    db_pass: PASSWORD,
    api_key: API_KEY
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Vulnerable server listening on port', PORT));
