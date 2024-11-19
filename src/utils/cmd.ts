import { concat } from '@std/bytes/concat'

export async function $(template: { raw: readonly string[] }, ...substitutions: unknown[]) {
	const cmd = String.raw(template, ...substitutions)

	const [cmdName, ...args] = cmd.split(/\s+/)

	const result = await new Deno.Command(cmdName, {
		args,
		stdout: 'piped',
		stderr: 'piped',
	}).spawn().output()

	return {
		success: result.success,
		code: result.code,
		output: new TextDecoder().decode(concat([result.stderr, result.stdout])).trim(),
	}
}
