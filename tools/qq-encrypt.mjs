#!/usr/bin/env node
/*
 * qq-encrypt.mjs — re-encrypt the /qq-x7k4 quick-quote payload.
 *
 * WHY THIS EXISTS
 * The quick-quote tool mirrors the order form's fee calculation. Pricing is
 * private (PUBLISHING-PLAYBOOK.md, standing rule), so the calculator's markup,
 * its script and its numbers must never appear in the served bytes of
 * qq-x7k4.html — a `hidden` div is not a gate, the response body still carries
 * everything. Instead the whole calculator ships as AES-256-GCM ciphertext that
 * only the admin access code can open, and the page decrypts it in the browser
 * after a successful unlock.
 *
 * USAGE
 *   node tools/qq-encrypt.mjs <payload.html> [qq-x7k4.html]
 *
 * <payload.html> is the PLAINTEXT calculator (the inner HTML of #app plus its
 * <script>). It is deliberately NOT in this repo — keep your working copy
 * outside the checkout (or in an ignored path) and never commit it. The access
 * code is read from the terminal without echo, or from $QQ_CODE when set; it is
 * never written to disk, to the page, or to this file.
 *
 * With a second argument the script rewrites the QQ-PAYLOAD block in that HTML
 * file in place. Without it, the JSON block is printed to stdout so you can
 * paste it yourself.
 *
 * The parameters below MUST stay in step with the reader in qq-x7k4.html:
 * PBKDF2-SHA-256 over the trimmed, upper-cased code, a fresh 16-byte salt per
 * run, AES-256-GCM with a fresh 12-byte IV, and the 16-byte auth tag appended
 * to the ciphertext (WebCrypto's expected layout).
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';

const ITERATIONS = 250000; // >= 200,000; raise here and the page follows (it reads the value from the block)
const SALT_BYTES = 16;
const IV_BYTES = 12;

const BEGIN = '<!-- QQ-PAYLOAD:BEGIN -->';
const END = '<!-- QQ-PAYLOAD:END -->';

function die(msg) {
  process.stderr.write('qq-encrypt: ' + msg + '\n');
  process.exit(1);
}

/* Read the access code without echoing it to the terminal, so it does not end
   up in a screen recording or scrollback. Falls back to a plain read when
   stdin is a pipe. */
function readCode(promptText) {
  if (process.env.QQ_CODE) return Promise.resolve(process.env.QQ_CODE);
  return new Promise((resolve) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      let data = '';
      stdin.setEncoding('utf8');
      stdin.on('data', (chunk) => { data += chunk; });
      stdin.on('end', () => resolve(data.split('\n')[0]));
      return;
    }
    process.stdout.write(promptText);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let buf = '';
    /* Compared by character code on purpose: control characters written as
       escape literals get mangled by tools that re-encode this file. */
    const onData = (ch) => {
      const c = ch.charCodeAt(0);
      if (c === 13 || c === 10 || c === 4) {        // Enter / Ctrl-D - done
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(buf);
      } else if (c === 3) {                         // Ctrl-C - give up
        stdin.setRawMode(false);
        process.stdout.write('\n');
        process.exit(130);
      } else if (c === 127 || c === 8) {            // Backspace / Delete
        buf = buf.slice(0, -1);
      } else {
        buf += ch;
      }
    };
    stdin.on('data', onData);
  });
}

const [payloadPath, htmlPath] = process.argv.slice(2);
if (!payloadPath) die('usage: node tools/qq-encrypt.mjs <payload.html> [qq-x7k4.html]');

let plaintext;
try {
  plaintext = readFileSync(payloadPath, 'utf8');
} catch (e) {
  die('cannot read payload file ' + payloadPath + ' (' + e.code + ')');
}
if (!plaintext.trim()) die('payload file is empty');

const code = (await readCode('Access code: ')).trim().toUpperCase();
if (!code) die('no access code given');

const salt = randomBytes(SALT_BYTES);
const iv = randomBytes(IV_BYTES);
const key = pbkdf2Sync(code, salt, ITERATIONS, 32, 'sha256');

const cipher = createCipheriv('aes-256-gcm', key, iv);
const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
/* WebCrypto's AES-GCM expects the auth tag appended to the ciphertext. */
const ciphertext = Buffer.concat([body, cipher.getAuthTag()]);

const block = {
  v: 1,
  kdf: 'PBKDF2-SHA-256',
  iterations: ITERATIONS,
  cipher: 'AES-256-GCM',
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ciphertext: ciphertext.toString('base64')
};

const json = JSON.stringify(block, null, 2);

if (!htmlPath) {
  process.stdout.write(BEGIN + '\n<script id="qq-payload" type="application/json">\n' + json + '\n</script>\n' + END + '\n');
  process.exit(0);
}

let html;
try {
  html = readFileSync(htmlPath, 'utf8');
} catch (e) {
  die('cannot read ' + htmlPath + ' (' + e.code + ')');
}
const start = html.indexOf(BEGIN);
const stop = html.indexOf(END);
if (start === -1 || stop === -1 || stop < start) {
  die('no QQ-PAYLOAD block found in ' + htmlPath + ' — expected the ' + BEGIN + ' / ' + END + ' markers');
}
const replacement = BEGIN + '\n<script id="qq-payload" type="application/json">\n' + json + '\n</script>\n' + END;
writeFileSync(htmlPath, html.slice(0, start) + replacement + html.slice(stop + END.length), 'utf8');
process.stderr.write('qq-encrypt: rewrote the payload block in ' + htmlPath +
  ' (' + plaintext.length + ' chars -> ' + ciphertext.length + ' bytes, ' + ITERATIONS + ' PBKDF2 iterations)\n');
