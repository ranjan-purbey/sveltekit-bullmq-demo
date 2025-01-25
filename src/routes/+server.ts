import { jobsQueue } from "$lib/server/background-jobs";

export const POST = async () => {
  const { id: jobId } = await jobsQueue.add("job", {});

  /*
  The following code passes the job's progress to the client as a stream.
  If you don't need to update the client with the progress, you can skip
  the following. You can also use web-sockets or polling for that.
  */
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

      // wait for 1-second before sending the next status update
      await new Promise((r) => setTimeout(r, 1e3));
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/plain" },
  });
};
