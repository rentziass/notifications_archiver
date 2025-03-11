import * as core from '@actions/core'

import { createActionAuth } from '@octokit/auth-action'
import { Octokit } from '@octokit/core'
import { paginateRest } from '@octokit/plugin-paginate-rest'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const auth = createActionAuth()
    const authentication = await auth()
    const PaginatedOctokit = Octokit.plugin(paginateRest)
    const octokit = new PaginatedOctokit({ auth: authentication.token })

    const notifications = await octokit.paginate('GET /notifications', {})
    console.log(notifications)

    // loop through notifications and check the status of the subject
    // if the subject is either an issue or a pull request. If the status is closed,
    // mark the notification as done
    for (const notification of notifications) {
      console.log(notification)
      if (
        notification.subject.type === 'Issue' ||
        notification.subject.type === 'PullRequest'
      ) {
        const response = await octokit.request(
          `GET ${notification.subject.url}`
        )
        const subject = response.data
        if (subject.state === 'closed') {
          await octokit.request(
            `DELETE /notifications/threads/${notification.id}`,
            {
              thread_id: notification.id
            }
          )
          core.notice(
            `Marked notification as done: [${subject.title}](${subject.html_url})`
          )
        }
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
