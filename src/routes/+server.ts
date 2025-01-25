import { jobsQueue } from "$lib/server/background-jobs";

export const POST = async () => {
  const { id: jobId } = await jobsQueue.add("job", {});
  const stream = new ReadableStream({
    async pull(controller) {
      const job = await jobsQueue.getJob(jobId);
      controller.enqueue(
        JSON.stringify(
          job.failedReason
            ? { error: job.failedReason }
            : job.returnvalue
            ? { data: job.returnvalue }
            : { progress: job.progress }
        )
      );
      controller.enqueue("\n");

      if (job.finishedOn) {
        controller.close();
      }
      await new Promise((r) => setTimeout(r, 1e3));
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain" },
  });
};
