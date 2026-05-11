import { router } from "./router";
import { InMemoryStorage } from "./storage";
import { getHealth } from "./routes/get-health";
import { postHash } from "./routes/post-hash";
import { postContent } from "./routes/post-content";
import { getContent } from "./routes/get-content";

const context = {
  storage: new InMemoryStorage(),
  secretSalt: process.env.SECRET_SALT || "default-secret-salt",
};

const PORT = parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "0.0.0.0";

Bun.serve({
  port: PORT,
  hostname: HOST,
  fetch: router([getHealth, postHash, postContent, getContent], context),
});

console.log(`Server running at http://${HOST}:${PORT}`);
