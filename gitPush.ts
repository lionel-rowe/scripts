const td = new TextDecoder()

async function getOutput(cmd: string) {
	const [cmdName, ...args] = cmd.split(/\s+/)

	const result = await new Deno.Command(cmdName, {
		args,
		stdout: 'piped',
		stderr: 'piped',
	}).spawn().output()

	return {
		code: result.code,
		output: td.decode(result.stderr.length > 0 ? result.stderr : result.stdout),
	}
}

const push = await getOutput('git push')

if (/fatal: The current branch .+ has no upstream branch/.test(push.output)) {
	const { output: remoteOutput } = await getOutput('git remote --v')
	const remoteName = remoteOutput.match(/(own)\s+.+\s+\(push\)/)?.[1] ??
		remoteOutput.match(/(origin)\s+.+\s+\(push\)/)?.[1]

	if (!remoteName) {
		throw new Error('Could not find remote')
	}

	const branch = (await getOutput('git rev-parse --abbrev-ref HEAD')).output.trim()

	const result = await getOutput(`git push -u ${remoteName} ${branch}`)
	console.info(result.output)

	Deno.exitCode = result.code
} else {
	console.info(push.output)
	Deno.exitCode = push.code
}
