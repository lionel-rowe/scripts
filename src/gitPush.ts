// alias to `gp`

import { $ } from './utils/cmd.ts'

const $push = await $`git push`

if (/fatal: The current branch .+ has no upstream branch/.test($push.output)) {
	const $remote = await $`git remote`
	const remotes = $remote.output.split(/\r?\n/)
	const remoteName = first(['own', 'origin'], remotes)

	if (remoteName == null) throw new Error('Could not find remote')

	const $branch = await $`git rev-parse --abbrev-ref HEAD`
	const $result = await $`git push -u ${remoteName} ${$branch.output}`

	console.info($result.output)
	Deno.exitCode = $result.code
} else {
	console.info($push.output)
	Deno.exitCode = $push.code
}

function first<T extends string>(of: T[], from: string[]) {
	return of.find((x) => from.includes(x)) ?? null
}
