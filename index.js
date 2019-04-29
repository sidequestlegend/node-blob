// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js
// (MIT licensed)

const { Readable } = require('stream')

const BUFFER = Symbol('buffer')
const TYPE = Symbol('type')

class Blob {
  constructor (blobParts = [], options = {}) {
    this[TYPE] = ''

    const buffers = []
    let size = 0

    const a = blobParts
    const length = Number(a.length)
    for (let i = 0; i < length; i++) {
      const element = a[i]
      let buffer
      if (element instanceof Buffer) {
        buffer = element
      } else if (ArrayBuffer.isView(element)) {
        buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength)
      } else if (element instanceof ArrayBuffer) {
        buffer = Buffer.from(element)
      } else if (element instanceof Blob) {
        buffer = element[BUFFER]
      } else {
        buffer = Buffer.from(typeof element === 'string' ? element : String(element))
      }
      size += buffer.length
      buffers.push(buffer)
    }

    this[BUFFER] = Buffer.concat(buffers, size)

    let type = options.type !== undefined && String(options.type).toLowerCase()
    if (type && !/[^\u0020-\u007E]/.test(type)) {
      this[TYPE] = type
    }
  }
  get size () {
    return this[BUFFER].length
  }
  get type () {
    return this[TYPE]
  }
  text () {
    return Promise.resolve(this[BUFFER].toString())
  }
  arrayBuffer () {
    const buf = this[BUFFER]
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    return Promise.resolve(ab)
  }
  stream () {
    const readable = new Readable()
    readable._read = () => {}
    readable.push(this[BUFFER])
    readable.push(null)
    return readable
  }
  toString () {
    return '[object Blob]'
  }
  slice (start = 0, end = this.size, type = '') {
    const buffer = this[BUFFER]
    const slicedBuffer = buffer.slice(start, end)
    const blob = new Blob([], { type })
    blob[BUFFER] = slicedBuffer
    return blob
  }
}

Object.defineProperties(Blob.prototype, {
  size: { enumerable: true },
  type: { enumerable: true },
  slice: { enumerable: true }
})

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
  value: 'Blob',
  writable: false,
  enumerable: false,
  configurable: true
})

module.exports = Blob
