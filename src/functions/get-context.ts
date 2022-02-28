import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
import {Inputs} from '../types/inputs'

const repoToken = core.getInput('repo-token')
core.setSecret(repoToken)
export const github = getOctokit(repoToken)
export const {owner: owner, repo: repo} = context.repo

export async function validateInputs(): Promise<Inputs> {
  const result = {} as unknown as Inputs
  try {
    //Validate and assign days-before-stale & days-before-delete
    const inputDaysBeforeStale = Number(core.getInput('days-before-stale'))
    const inputDaysBeforeDelete = Number(core.getInput('days-before-delete'))

    if (inputDaysBeforeStale >= inputDaysBeforeDelete) {
      core.setFailed('days-before-stale cannot be greater than or equal to days-before-delete')
      throw new Error('days-before-stale cannot be greater than or equal to days-before-delete')
    }

    if (inputDaysBeforeStale.toString() === 'NaN') {
      core.setFailed('days-before-stale must be a number')
      throw new Error('days-before-stale must be a number')
    }

    if (inputDaysBeforeDelete.toString() === 'NaN') {
      core.setFailed('days-before-delete must be a number')
      throw new Error('days-before-delete must be a number')
    }

    if (inputDaysBeforeStale < 0) {
      core.setFailed('days-before-stale must be greater than zero')
      throw new Error('days-before-stale must be greater than zero')
    }

    result.daysBeforeStale = inputDaysBeforeStale
    result.daysBeforeDelete = inputDaysBeforeDelete

    //Validate and assign comment-updates
    const inputCommentUpdates = core.getBooleanInput('comment-updates')
    result.commentUpdates = inputCommentUpdates

    //Validate and assign max-issues
    const inputMaxIssues = Number(core.getInput('max-issues'))

    if (inputMaxIssues.toString() === 'NaN') {
      core.setFailed('max-issues must be a number')
      throw new Error('max-issues must be a number')
    }

    if (inputMaxIssues < 0) {
      core.setFailed('max-issues must be greater than zero')
      throw new Error('max-issues must be greater than zero')
    }

    result.maxIssues = inputMaxIssues

    //Validate and assign tag-committer
    const inputTagLastCommitter = core.getBooleanInput('tag-committer')
    result.tagLastCommitter = inputTagLastCommitter

    //Validate and assign stale-branch-label
    const inputStaleBranchLabel = String(core.getInput('stale-branch-label'))
    if (inputStaleBranchLabel.length > 50) {
      core.setFailed('stale-branch-label must be 50 characters or less')
      throw new Error('stale-branch-label must be 50 characters or less')
    }
    result.staleBranchLabel = inputStaleBranchLabel
  } catch (err: unknown) {
    if (err instanceof Error) {
      core.setFailed(`Failed to validate inputs. Error: ${err.message}`)
    }
    if (err instanceof TypeError) {
      core.setFailed(`Failed to validate inputs. Error: ${err.message}`)
    }
    if (typeof err === 'string') {
      core.setFailed(`Failed to validate inputs. Error: ${err}`)
    }
  }
  return result
}
