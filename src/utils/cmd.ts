import { concat } from '@std/bytes/concat'

type CmdSubstitution = string | string[]

export function toCommandParams(
	template: { raw: readonly string[] },
	...substitutions: CmdSubstitution[]
): ConstructorParameters<typeof Deno.Command> {
	const [cmdName, ...args] = template.raw[0]!.trim().split(/\s+/)

	for (const [i, substitution] of substitutions.entries()) {
		const templateParts = template.raw[i + 1]!.trim().split(/\s+/)

		for (const part of templateParts) {
			if (/[^\w\-]/.test(part)) {
				// only allow alphanumeric characters and hyphens for now
				// args containing other chars need to be supplied as substitutions
				throw new Error(`Invalid template part: ${part}`)
			}
		}

		args.push(...(Array.isArray(substitution) ? substitution : [substitution]))
		args.push(...templateParts.filter(Boolean))
	}

	return [cmdName!, { args }]
}

export async function $(template: { raw: readonly string[] }, ...substitutions: CmdSubstitution[]) {
	const params = toCommandParams(template, ...substitutions)
	const [cmdName, { args } = {}] = params

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
