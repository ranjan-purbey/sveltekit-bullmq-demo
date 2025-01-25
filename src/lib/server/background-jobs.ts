import { REDIS_URL } from "$env/static/private";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const Q_NAME = "q";

export const jobsQueue = new Queue(Q_NAME, {
  connection: new IORedis(REDIS_URL),
});

const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t * 100));

export const setupBullMQProcessor = () => {
  new Worker(
    Q_NAME,
    async (job) => {
      for (let i = 0; i <= 100; i++) {
        await sleep(Math.random());
        await job.updateProgress(i);
        await job.log(`Processing job at interval ${i}`);

        if (Math.random() * 200 < 1) throw new Error(`Random error at ${i}`);
      }

      return `This is the return value of job (${job.id})`;
    },
    { connection: new IORedis(REDIS_URL, { maxRetriesPerRequest: null }) }
  );
};
