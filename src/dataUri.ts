import { typeByExtension } from '@std/media-types'
import { encodeBase64 } from '@std/encoding/base64'

const filePathOrUrl = Deno.args[0]

if (filePathOrUrl == null) {
	console.error('Usage: data-uri <file-path-or-url>')
	Deno.exit(1)
}

type DataUriConfig = {
	contentType: string | null
	bytes: Uint8Array
}

async function getFromUrl(url: string): Promise<DataUriConfig> {
	const res = await fetch(url)
	return {
		contentType: res.headers.get('Content-Type') ?? typeByExtension(url.split('.').at(-1)!) ?? null,
		bytes: await res.bytes(),
	}
}

async function getFromFile(path: string): Promise<DataUriConfig> {
	return {
		contentType: typeByExtension(path.split('.').at(-1)!) ?? null,
		bytes: await Deno.readFile(path),
	}
}

const { bytes, contentType } =
	await (/^\w+:\/\//.test(filePathOrUrl) ? getFromUrl(filePathOrUrl) : getFromFile(filePathOrUrl))

const dataUri = `data:${contentType};base64,${encodeBase64(bytes)}`

console.info(dataUri)
