import { building } from "$app/environment";
import { jobsQueue, setupBullMQProcessor } from "$lib/server/background-jobs";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

if (!building) {
  setupBullMQProcessor();
}

const bullboard = (() => {
  const serverAdapter = new HonoAdapter(serveStatic);

  createBullBoard({
    queues: [new BullMQAdapter(jobsQueue)],
    serverAdapter,
  });
  const app = new Hono({ strict: false });
  const basePath = "/jobs";
  serverAdapter.setBasePath(basePath);
  app.route(basePath, serverAdapter.registerPlugin());

  return app;
})();

export const handle = async ({ event, resolve }) => {
  if (event.url.pathname.match(/^\/jobs($|\/)/)) {
    return bullboard.fetch(event.request);
  }

  return resolve(event);
};
