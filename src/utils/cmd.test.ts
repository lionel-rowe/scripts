import { assertEquals } from '@std/assert'
import { toCommandParams } from './cmd.ts'

Deno.test(toCommandParams.name, async (t) => {
	await t.step('returns command parameters', () => {
		const cmd = toCommandParams`cmd ${['foo', 'bar', 'baz quux']} -f ${'file.txt'}`
		assertEquals(cmd, ['cmd', { args: ['foo', 'bar', 'baz quux', '-f', 'file.txt'] }])
	})
	await t.step('empty string', () => {
		const cmd = toCommandParams``
		assertEquals(cmd, ['', { args: [] }])
	})
	await t.step('no args', () => {
		const cmd = toCommandParams`abc`
		assertEquals(cmd, ['abc', { args: [] }])
	})
	await t.step('array args', () => {
		const cmd = toCommandParams`abc ${['a', 'b']}`
		assertEquals(cmd, ['abc', { args: ['a', 'b'] }])
	})
	await t.step('scalar args', () => {
		const cmd = toCommandParams`abc ${'a'} ${'b'}`
		assertEquals(cmd, ['abc', { args: ['a', 'b'] }])
	})
	await t.step('white space at end', () => {
		const cmd = toCommandParams`abc ${'a'} ${'b'} `
		assertEquals(cmd, ['abc', { args: ['a', 'b'] }])
	})
	await t.step('white space in array arg', () => {
		const cmd = toCommandParams`abc ${['a', ' ']}`
		assertEquals(cmd, ['abc', { args: ['a', ' '] }])
	})
	await t.step('white space in scalar arg', () => {
		const cmd = toCommandParams`abc ${'a'} ${' '}`
		assertEquals(cmd, ['abc', { args: ['a', ' '] }])
	})
	await t.step('split template str', () => {
		const cmd = toCommandParams`git rev-parse --abbrev-ref HEAD`
		assertEquals(cmd, ['git', { args: ['rev-parse', '--abbrev-ref', 'HEAD'] }])
	})
	await t.step('split template str plus args', () => {
		const cmd = toCommandParams`a b c ${'d'} e f ${['g', 'h']} i j`
		assertEquals(cmd, ['a', { args: ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] }])
	})
})
