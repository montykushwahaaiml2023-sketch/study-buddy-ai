const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const ngrok = require("ngrok");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

app.prepare().then(async () => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, async (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);

    // Automatically start ngrok for Twilio webhooks
    try {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTHTOKEN, // Optional: add to .env
      });
      console.log(`> 🚀 Public URL: ${url}`);
      console.log(`> 📝 Update NEXT_PUBLIC_BASE_URL in .env to this URL for Twilio to work!`);
      
      // Update process.env for internal use during this session
      process.env.NEXT_PUBLIC_BASE_URL = url;
    } catch (e) {
      console.error("> ⚠️  ngrok failed to start. You may need to set NGROK_AUTHTOKEN in .env");
      console.error(e.message);
    }
  });
});
