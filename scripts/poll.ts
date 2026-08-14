/**
 * Run polling directly from a cron job or terminal, without going through
 * the HTTP API. Usage: npm run poll
 */
import { pollAllRepos } from "../lib/poll";

pollAllRepos()
  .then((result) => {
    console.log(
      `Checked ${result.reposChecked} repos, created ${result.notificationsCreated} notifications`
    );
    if (result.errors.length) {
      console.error("Errors:", result.errors);
      process.exitCode = 1;
    }
  })
  .catch((err) => {
    console.error("Poll failed:", err);
    process.exitCode = 1;
  });
