import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.setViewport({ width: 1440, height: 900 });
const URL = 'http://127.0.0.1:8000/connect-mw.html';
await page.goto(URL, { waitUntil: 'networkidle0' });
await page.evaluate(() => localStorage.clear()); await page.reload({ waitUntil: 'networkidle0' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = async (text, sel = 'button') => {
  const ok = await page.evaluate((text, sel) => {
    const el = [...document.querySelectorAll(sel)].find((b) => b.textContent.trim()===text && !b.disabled);
    if (el) { el.click(); return true; } return false;
  }, text, sel);
  if (!ok) errors.push('NOT FOUND: ' + text); await wait(350); return ok;
};
const body = () => page.evaluate(() => document.body.innerText);
// Sets a React-controlled input/select found by its <label> text.
const fill = (label, value) => page.evaluate((label, value) => {
  const l = [...document.querySelectorAll('label')].find((x) => x.textContent.trim() === label);
  const el = l?.parentElement.querySelector('input, select, textarea');
  const proto = el instanceof HTMLSelectElement ? HTMLSelectElement : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement : HTMLInputElement;
  Object.getOwnPropertyDescriptor(proto.prototype, 'value').set.call(el, value);
  el.dispatchEvent(new Event(el instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }));
}, label, value);
// register, log out, sign in again
await page.screenshot({ path: 'shots/00-auth.png' });
await fill('Full name', 'Test Person'); await fill('Email', 'test@example.com'); await fill('Role', 'Engineer');
await fill('Password', 'secret1'); await fill('Confirm password', 'nope'); await clickText('Create account');
console.log('password mismatch shown:', (await body()).includes('Passwords do not match'));
await fill('Confirm password', 'secret1'); await clickText('Create account'); await wait(300);
console.log('registered -> onboarding:', (await body()).includes('Welcome, Test!'));
await clickText('Just browse'); await clickText('Log out');
console.log('logged out:', (await body()).includes('Welcome back.'));
await fill('Email', 'test@example.com'); await fill('Password', 'wrong'); await clickText('Sign in', 'form button[type=submit]');
console.log('bad password rejected:', (await body()).includes('Incorrect email or password'));
await fill('Password', 'secret1'); await clickText('Sign in', 'form button[type=submit]'); await wait(300);
console.log('signed in as new user:', (await body()).includes('Test Person'));
await clickText('Log out'); await clickText('Continue with demo account (Aditi Rao)'); await wait(300);
await page.screenshot({ path: 'shots/01-onboarding.png' });
await page.click('input[type=checkbox]'); await clickText('Opt in & get started');
await wait(400); await page.screenshot({ path: 'shots/02-dashboard.png', fullPage: true });
const firstSection = () => page.evaluate(() => document.querySelector('main section h2, main section h3')?.textContent);
console.log('first dashboard section:', await firstSection());
console.log('pending list removed:', !(await body()).includes("all caught up") && !(await page.evaluate(() => [...document.querySelectorAll('main button')].some((b) => b.textContent.trim() === 'Accept'))));
console.log('sidebar profile ring:', await page.evaluate(() => document.querySelector('aside [title^="Profile"]')?.getAttribute('title')));
// bell badge clears after first click; accept from the Requests tab
const bell = () => page.$eval('button[aria-label$="new requests"]', (b) => b.getAttribute('aria-label'));
console.log('bell before:', await bell());
await page.click('button[aria-label$="new requests"]'); await wait(400);
console.log('bell after first click:', await bell());
await clickText('Accept'); console.log('after accept toast:', (await body()).includes("You're now connected"));
// discover
await page.goto(URL + '#/discover'); await wait(500);
await page.type('input[aria-label="Search people"]', 'trek'); await wait(300);
const c1 = await page.evaluate(() => document.body.innerText.match(/(\d+) (people|person)/)?.[0]); console.log('search trek:', c1);
await page.select('select[aria-label="Office location"]', 'Munich'); await wait(300);
console.log('trek+Munich:', await page.evaluate(() => document.body.innerText.match(/(\d+) (people|person)/)?.[0]));
await clickText('Clear all filters');
console.log('cleared:', await page.evaluate(() => document.body.innerText.match(/(\d+) (people|person)/)?.[0]));
await page.screenshot({ path: 'shots/03-discover.png' });
// connect from first card
await clickText('Connect'); await wait(300); await page.screenshot({ path: 'shots/04-connect-modal.png' });
await clickText('Send request'); console.log('request sent:', (await body()).includes('Request sent'));
await wait(5600); console.log('simulated accept:', (await body()).includes('accepted your request'));
// profile modal
await page.evaluate(() => document.querySelector('.card.cursor-pointer')?.click()); await wait(400);
await page.screenshot({ path: 'shots/05-profile-modal.png' });
await page.keyboard.press('Escape'); await wait(200);
// connections + coffee
await page.goto(URL + '#/connections'); await wait(500);
await clickText('Plan coffee'); await wait(300); await page.screenshot({ path: 'shots/06-coffee.png' });
await clickText('Send coffee invite'); await page.goto(URL + '#/connections?tab=coffee'); await wait(400);
console.log('coffee chats:', (await body()).match(/Coffee with [A-Z][a-z]+/g));
// communities
await page.goto(URL + '#/communities'); await wait(500);
await clickText('Join'); console.log('joined toast:', (await body()).includes('Welcome to the community'));
await clickText('Create community'); await wait(300);
await clickText('Create community', '[role=dialog] button'); console.log('community validation shown:', (await body()).includes('Give your community a name'));
await fill('Name', 'Weekend Cyclists'); await fill('Tagline', 'Pedal, chat, repeat'); await fill('Description', 'Easy Saturday rides around the city.');
await clickText('🚴Cycling'); await clickText('Create community', '[role=dialog] button'); await wait(300);
console.log('community created:', (await body()).includes('is live!') && (await body()).includes('Weekend Cyclists'));
await page.screenshot({ path: 'shots/07-communities.png' });
// events: register + create
await page.goto(URL + '#/events'); await wait(500);
await clickText('Register'); console.log('registered:', (await body()).includes("You're registered"));
await clickText('Create event'); await wait(300);
await clickText('Publish event'); console.log('validation shown:', (await body()).includes('Give your event a title'));
await page.type('input[placeholder="e.g. Saturday Cycling Loop"]', 'Lunch Chess Blitz');
const d = new Date(); d.setDate(d.getDate() + 3); const iso = d.toISOString().slice(0, 10);
await page.evaluate((iso) => { const el = document.querySelector('input[type=date]'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, iso); el.dispatchEvent(new Event('input', { bubbles: true })); }, iso);
await page.type('input[placeholder^="e.g. Bangalore office"]', 'Level 2 lounge');
await page.type('textarea[placeholder^="What should people expect"]', 'Five-minute blitz games, all levels.');
await clickText('Publish event'); await wait(300);
console.log('event created:', (await body()).includes('Event published'));
await page.screenshot({ path: 'shots/08-events.png' });
// surprise
await page.goto(URL + '#/dashboard'); await wait(400);
await page.evaluate(()=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Surprise Connect').click()); await wait(400); await page.screenshot({ path: 'shots/09-surprise.png' });
await clickText('Shuffle'); await page.keyboard.press('Escape');
// profile edit + persistence
await page.goto(URL + '#/profile'); await wait(500);
await page.$eval('#pn', (e) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(e, ''); e.dispatchEvent(new Event('input', { bubbles: true })); }); await page.type('#pn', 'Sam Iyer');
await clickText('Save profile'); await page.reload({ waitUntil: 'networkidle0' }); await wait(300);
console.log('persisted name:', await page.$eval('#pn', (e) => e.value));
await page.screenshot({ path: 'shots/10-profile.png', fullPage: true });
// block flow
await page.goto(URL + '#/discover'); await wait(400);
await page.evaluate(() => document.querySelector('.card.cursor-pointer')?.click()); await wait(300);
await page.click('button[aria-label="More options"]'); await wait(200);
await clickText('Block'); await wait(200); await page.evaluate(() => [...document.querySelectorAll('button')].filter(b=>b.textContent.trim()==='Block').pop().click()); await wait(300);
console.log('blocked toast:', (await body()).includes('is blocked'));
// mobile
await page.setViewport({ width: 390, height: 844, isMobile: true }); await page.goto(URL + '#/dashboard'); await wait(500);
await page.screenshot({ path: 'shots/11-mobile.png' });
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
