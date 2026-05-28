const fetch = require('node-fetch');

async function check() {
  try {
    const r = await fetch('https://vedaai-1-n5bb.onrender.com/create');
    const html = await r.text();
    const m = html.match(/src="(\/_next\/static\/chunks\/app\/create\/page-[^"]+\.js)"/);
    if(m) {
      const jsUrl = 'https://vedaai-1-n5bb.onrender.com' + m[1];
      const r2 = await fetch(jsUrl);
      const js = await r2.text();
      const idx = js.indexOf('vedaai-hykv');
      if (idx !== -1) {
        console.log('SURROUNDING CODE:');
        console.log(js.substring(idx - 100, idx + 150));
      } else {
        console.log('hykv NOT FOUND');
      }
    } else {
      console.log('chunk not found');
    }
  } catch(e) {
    console.error(e);
  }
}
check();
