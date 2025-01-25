import { building } from "$app/environment";
import { setupBullMQProcessor } from "$lib/server/background-jobs";

if (!building) {
  setupBullMQProcessor();
}
