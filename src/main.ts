import * as core from '@actions/core'

import { createActionAuth } from "@octokit/auth-action";
import { Octokit } from "@octokit/core";

// {
//   type: 'token',
//   token: 'v1.1234567890abcdef1234567890abcdef12345678',
//   tokenType: 'oauth'
// }

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const auth = createActionAuth();
    const authentication = await auth();
    const octokit = new Octokit({ authentication });

    const response = await octokit.request("GET /notifications", {});
    console.log(response.data);
    core.info(`response: ${JSON.stringify(response)}`);

    // // Log the current timestamp, wait, then log the new timestamp
    // core.debug(new Date().toTimeString())
    // await wait(parseInt(ms, 10))
    // core.debug(new Date().toTimeString())
    //
    // // Set outputs for other workflow steps to use
    // core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
