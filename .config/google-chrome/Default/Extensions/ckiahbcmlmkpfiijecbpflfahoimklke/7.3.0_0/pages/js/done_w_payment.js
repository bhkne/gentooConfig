(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/base64-js/lib/b64.js","/../node_modules/base64-js/lib")
},{"buffer":2,"pBGvAp":4}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/buffer/index.js","/../node_modules/buffer")
},{"base64-js":1,"buffer":2,"ieee754":3,"pBGvAp":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/ieee754/index.js","/../node_modules/ieee754")
},{"buffer":2,"pBGvAp":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../node_modules/process/browser.js","/../node_modules/process")
},{"buffer":2,"pBGvAp":4}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var base, config, constants, en_messages, final, iced, keys, pages, proxy_activation_errors, proxy_loading_states, proxy_states, __iced_k, __iced_k_noop,
  __slice = [].slice;

iced = {
  Deferrals: (function() {
    function _Class(_arg) {
      this.continuation = _arg;
      this.count = 1;
      this.ret = null;
    }

    _Class.prototype._fulfill = function() {
      if (!--this.count) {
        return this.continuation(this.ret);
      }
    };

    _Class.prototype.defer = function(defer_params) {
      ++this.count;
      return (function(_this) {
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      })(this);
    };

    return _Class;

  })(),
  findDeferral: function() {
    return null;
  },
  trampoline: function(_fn) {
    return _fn();
  }
};
__iced_k = __iced_k_noop = function() {};

config = require('./config');

final = require('./enum/final');

keys = require('./enum/keys');

proxy_states = require('./enum/proxy_states');

proxy_loading_states = require('./enum/proxy_loading_states');

proxy_activation_errors = require('./enum/proxy_activation_errors');

pages = require('./enum/pages');

en_messages = require('./messages/en');

constants = require('./constants');

base = {
  helloWorld: function() {
    return console.log("hello world");
  },
  acceptInvite: function(inviteToken, deferredCallback) {
    var apiHost, serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getApiHost(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return apiHost = arguments[0];
            };
          })(),
          lineno: 16
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return serviceToken = arguments[0];
              };
            })(),
            lineno: 17
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: constants.AJAX_TIMEOUT_MS,
            type: "POST",
            url: "" + apiHost + config.API_SUFFIX + "/users/invite/accept",
            data: {
              service_token: serviceToken,
              invite_token: inviteToken
            },
            crossDomain: true,
            success: function() {
              return deferredCallback();
            },
            error: function() {
              return deferredCallback();
            }
          });
        });
      };
    })(this));
  },
  redirect: function(url) {
    return document.location.href = url;
  },
  getChomeWebstoreUrl: function() {
    var manifest;
    manifest = chrome.runtime.getManifest();
    if (manifest.name === constants.GOM_SG_NAME) {
      return config.GOM_SG_CHROME_STORE_LINK;
    }
    return config.GOM_CHROME_STORE_LINK;
  },
  openPage: function(page, focusOnTab) {
    if (focusOnTab == null) {
      focusOnTab = true;
    }
    return chrome.tabs.create({
      url: page,
      active: focusOnTab
    });
  },
  addAddonToInstallList: function(addon, deferredCallback) {
    var installedADdons, isSet, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.ADDONS, [], __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return installedADdons = arguments[0];
            };
          })(),
          lineno: 46
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        installedADdons.push(addon);
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.setLocalData(keys.ADDONS, installedADdons, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return isSet = arguments[0];
              };
            })(),
            lineno: 48
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return deferredCallback(isSet);
        });
      };
    })(this));
  },
  rmAddonToInstallList: function(addonId, deferredCallback) {
    var addon, installedADdons, newLlis, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.ADDONS, [], __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return installedADdons = arguments[0];
            };
          })(),
          lineno: 52
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        var _i, _len;
        newLlis = [];
        for (_i = 0, _len = installedADdons.length; _i < _len; _i++) {
          addon = installedADdons[_i];
          if (addon["id"] !== addonId) {
            newLlis.push(addon);
          }
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.setLocalData(keys.ADDONS, newLlis, __iced_deferrals.defer({
            lineno: 57
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return deferredCallback();
        });
      };
    })(this));
  },
  isAddonIdInstalled: function(addonId, deferredCallback) {
    var addon, installedAddons, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.ADDONS, [], __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return installedAddons = arguments[0];
            };
          })(),
          lineno: 61
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        var _i, _len;
        for (_i = 0, _len = installedAddons.length; _i < _len; _i++) {
          addon = installedAddons[_i];
          if (addon["id"] === addonId) {
            deferredCallback(true);
            return;
          }
        }
        return deferredCallback(false);
      };
    })(this));
  },
  resendVerificationEmail: function(email, deferredCallback) {
    var apiHost, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getApiHost(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return apiHost = arguments[0];
            };
          })(),
          lineno: 69
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return $.ajax({
          timeout: constants.AJAX_TIMEOUT_MS,
          type: "GET",
          url: "" + apiHost + config.API_SUFFIX + "/users/email/verification",
          alt: "json",
          data: {
            email: email
          },
          dataType: "json",
          crossDomain: true,
          success: function(data) {
            return deferredCallback(true);
          },
          error: function() {
            return deferredCallback(false);
          }
        });
      };
    })(this));
  },
  reloadSpdyProxy: function() {
    var proxyState, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);

    /* clears proxy settings, and set it again (to it's current state) */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.PROXY_STATE, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return proxyState = arguments[0];
            };
          })(),
          lineno: 86
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        base.clearSpdyProxy();
        return base.toggleSpdyProxyActivation(proxyState === proxy_states.ACTIVE);
      };
    })(this));
  },
  fetchPricing: function(deferredCallback) {
    var apiHost, country, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.COUNTRY, constants.DEFAULT_COUNTRY_CODE, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return country = arguments[0];
            };
          })(),
          lineno: 92
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getApiHost(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return apiHost = arguments[0];
              };
            })(),
            lineno: 93
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: constants.FAST_AJAX_TIMEOUT_MS,
            type: "GET",
            url: "" + apiHost + config.API_SUFFIX + "/payments/pricing",
            dataType: "json",
            crossDomain: true,
            data: {
              country: country
            },
            success: function(data) {
              return deferredCallback(data);
            },
            error: function() {
              return deferredCallback(constants.DEFAULT_PRICES);
            }
          });
        });
      };
    })(this));
  },
  isLogined: function(deferCallback) {
    var accountInfo, email, paymentCredit, paymentPlan, serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferCallback == null) {
      deferCallback = (function() {});
    }

    /* checks if the current user has signed into gom */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return serviceToken = arguments[0];
            };
          })(),
          lineno: 109
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.CACHED_EMAIL, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return email = arguments[0];
              };
            })(),
            lineno: 110
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getLocalData(keys.CACHED_ACCOUNT_INFO, null, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return accountInfo = arguments[0];
                };
              })(),
              lineno: 111
            }));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.getLocalData(keys.CACHED_PAYMENT_CREDIT, null, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return paymentCredit = arguments[0];
                  };
                })(),
                lineno: 112
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.getLocalData(keys.CACHED_PAYMENT_PLAN, null, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return paymentPlan = arguments[0];
                    };
                  })(),
                  lineno: 113
                }));
                __iced_deferrals._fulfill();
              })(function() {
                return deferCallback((typeof serviceToken !== "undefined" && serviceToken !== null) && (typeof email !== "undefined" && email !== null) && (typeof accountInfo !== "undefined" && accountInfo !== null) && (typeof paymentCredit !== "undefined" && paymentCredit !== null) && (typeof paymentPlan !== "undefined" && paymentPlan !== null));
              });
            });
          });
        });
      };
    })(this));
  },
  getUserEmailFromAuthToken: function(token, deferredCallback) {
    return $.ajax({
      timeout: constants.AJAX_TIMEOUT_MS,
      type: "GET",
      url: "https://www.googleapis.com/oauth2/v2/userinfo",
      data: {
        alt: "json",
        access_token: token
      },
      dataType: "json",
      crossDomain: true,
      success: function(data) {
        var email;
        email = data["email"];
        return deferredCallback(email);
      },
      error: function() {
        return deferredCallback(null);
      }
    });
  },
  signInViaOauth: function(accessToken, email, deferCallback) {
    var apiHost, deviceId, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferCallback == null) {
      deferCallback = (function() {});
    }

    /* Signs a user in via Oauth2's access token, returns a `serviceToken` */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.DEVICE_ID, base.genUuid(), __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return deviceId = arguments[0];
            };
          })(),
          lineno: 134
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getApiHost(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return apiHost = arguments[0];
              };
            })(),
            lineno: 135
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: constants.AJAX_TIMEOUT_MS,
            type: "POST",
            url: "" + apiHost + config.API_SUFFIX + "/users/oauth",
            data: {
              oauth_token: accessToken,
              email: email,
              device_id: deviceId,
              device_platform: constants.DEVICE_PLATFORM
            },
            dataType: "json",
            crossDomain: true,
            success: function(data) {
              var serviceToken;
              serviceToken = data["service_token"];
              base.setLocalData(keys.USER_ID, data["account_info"]["id"]);
              base.setLocalData(keys.EMAIL, data["account_info"]["email"]);
              base.setLocalData(keys.SERVICE_TOKEN, serviceToken);
              base.setLocalData(keys.PROXY_STARTED_UNIX_TIMESTAMP, base.now());
              return deferCallback(serviceToken);
            },
            error: function() {
              deferCallback(null);
              return base.pingAllApiHosts();
            }
          });
        });
      };
    })(this));
  },
  inviteContacts: function(accessToken, deferredCallback) {
    var apiHost, serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return serviceToken = arguments[0];
            };
          })(),
          lineno: 159
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getApiHost(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return apiHost = arguments[0];
              };
            })(),
            lineno: 160
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: constants.AJAX_TIMEOUT_MS,
            type: "POST",
            url: "" + apiHost + config.API_SUFFIX + "/users/invite_contacts",
            data: {
              service_token: serviceToken,
              access_token: accessToken
            },
            dataType: "json",
            crossDomain: true,
            success: function(data) {
              var success;
              success = data["success"];
              return deferredCallback(success);
            },
            error: function() {
              return deferredCallback(false, null);
            }
          });
        });
      };
    })(this));
  },
  sync: function(deferredCallback) {
    var apiHost, serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return serviceToken = arguments[0];
            };
          })(),
          lineno: 177
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (typeof serviceToken === "undefined" || serviceToken === null) {
          deferredCallback(false);
          return;
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getApiHost(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return apiHost = arguments[0];
              };
            })(),
            lineno: 182
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: base.AJAX_TIMEOUT_MS,
            type: "GET",
            url: "" + apiHost + config.API_SUFFIX + "/users",
            data: {
              service_token: serviceToken
            },
            dataType: "json",
            crossDomain: true,
            success: function(data) {
              var accountInfo, gold, paymentCredit, paymentPlan;
              accountInfo = data["account_info"];
              paymentPlan = data["payment_plan"];
              paymentCredit = data["payment_credit"];
              gold = data["gold"];
              base.setLocalData(keys.CACHED_ACCOUNT_INFO, accountInfo);
              base.setLocalData(keys.CACHED_PAYMENT_PLAN, paymentPlan);
              base.setLocalData(keys.CACHED_PAYMENT_CREDIT, paymentCredit);
              base.setLocalData(keys.CACHED_GOLD, gold);
              base.setLocalData(keys.NEEDS_VERIFICATION, !data["verified"]);
              return deferredCallback(true);
            },
            error: function() {
              deferredCallback(false);
              return base.pingAllApiHosts();
            }
          });
        });
      };
    })(this));
  },
  isPaymentNeeded: function(deferCallback) {
    var diff, expiry_epoch, paymentPlan, paymentTimeCredit, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferCallback == null) {
      deferCallback = (function() {});
    }

    /* checks if this user is a free user */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.CACHED_PAYMENT_PLAN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return paymentPlan = arguments[0];
            };
          })(),
          lineno: 208
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if ((typeof paymentPlan !== "undefined" && paymentPlan !== null) && "status" in paymentPlan && paymentPlan.status === "pending") {
          deferCallback(false);
          return;
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.CACHED_PAYMENT_CREDIT, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return paymentTimeCredit = arguments[0];
              };
            })(),
            lineno: 213
          }));
          __iced_deferrals._fulfill();
        })(function() {
          if (typeof paymentTimeCredit !== "undefined" && paymentTimeCredit !== null) {
            expiry_epoch = paymentTimeCredit["credit_expiry_epoch"];
            diff = parseInt(expiry_epoch) - base.now();
            deferCallback(diff <= 0);
            return;
          }
          return deferCallback(true);
        });
      };
    })(this));
  },
  log: function(msg) {
    return chrome.extension.getBackgroundPage().gom.log(msg);
  },
  showSignInNagNotification: function() {
    var defaultFreeTierMins, minsLeft, minsSinceActivation, proxyStartedUnixTimestamp, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.PROXY_STARTED_UNIX_TIMESTAMP, 0, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return proxyStartedUnixTimestamp = arguments[0];
            };
          })(),
          lineno: 225
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.FREE_TIER_MINS, constants.DEFAULT_FREE_TIER_MINS, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return defaultFreeTierMins = arguments[0];
              };
            })(),
            lineno: 226
          }));
          __iced_deferrals._fulfill();
        })(function() {
          minsSinceActivation = (base.now() - proxyStartedUnixTimestamp) / 60;
          minsLeft = defaultFreeTierMins - minsSinceActivation;
          return base.showRichNotification(en_messages.NOT_SIGNED_IN, "Gom will disconnect in " + (parseInt(minsLeft)) + " minutes", [
            {
              title: en_messages.SIGN_IN_FOR_UNINTERRUPTED_ACCESS,
              icon: "/assets/images/green_round_tick.png",
              next: function() {
                return base.openPage(pages.SIGN_IN, true);
              }
            }
          ]);
        });
      };
    })(this));
  },
  showFreeTierDeactivationNotification: function() {
    var btns, isLogined, isPaymentNeeded, rechargeMins, seconds, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.isPaymentNeeded(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return isPaymentNeeded = arguments[0];
            };
          })(),
          lineno: 237
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.isLogined(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return isLogined = arguments[0];
              };
            })(),
            lineno: 238
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getLocalData(keys.FREE_TIER_RECHARGE_MINS, constants.FREE_TIER_RECHARGE_MINS, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return rechargeMins = arguments[0];
                };
              })(),
              lineno: 239
            }));
            __iced_deferrals._fulfill();
          })(function() {
            btns = [];
            if (!isLogined) {
              btns = [
                {
                  title: en_messages.SIGN_IN_FOR_UNINTERRUPTED_ACCESS,
                  icon: "/assets/images/green_round_tick.png",
                  next: function() {
                    return base.openPage(pages.SIGN_IN, true);
                  }
                }
              ];
            } else if (isPaymentNeeded) {
              btns = [
                {
                  title: en_messages.GO_PRO_FOR_UNINTERRUPTED_ACCESS,
                  icon: "/assets/images/green_round_tick.png",
                  next: function() {
                    return base.openPage(pages.PRICING, true);
                  }
                }
              ];
            }
            seconds = parseInt(rechargeMins * 60);
            return base.showRichNotification(en_messages.GOM_TURNED_OFF, "You can activate Gom again in " + seconds + " seconds", btns);
          });
        });
      };
    })(this));
  },
  showGoProNagNotification: function() {
    var cumUsage, diffSecs, freeTierMins, mins, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.FREE_TIER_MINS, constants.DEFAULT_FREE_TIER_MINS, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return freeTierMins = arguments[0];
            };
          })(),
          lineno: 261
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.ACTIVATION_USAGE, {
            seconds: 0,
            lastTick: base.now()
          }, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return cumUsage = arguments[0];
              };
            })(),
            lineno: 262
          }));
          __iced_deferrals._fulfill();
        })(function() {
          diffSecs = freeTierMins * 60 - cumUsage.seconds;
          mins = parseInt(diffSecs / 60);
          return base.showRichNotification(en_messages.ON_FREE_PLAN, "Gom will disconnect in " + mins + " minutes", [
            {
              title: en_messages.GO_PRO_FOR_UNINTERRUPTED_ACCESS,
              icon: "/assets/images/green_round_tick.png",
              next: function() {
                return base.openPage(pages.PRICING, true);
              }
            }
          ]);
        });
      };
    })(this));
  },
  getGoldLearnMoreUrl: function() {
    var websiteUrl;
    websiteUrl = base.getWebsite();
    return "" + websiteUrl + "/gold/learn";
  },
  getGoldDashboardLoginUrl: function(deferredCallback) {
    var serviceToken, websiteUrl, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return serviceToken = arguments[0];
            };
          })(),
          lineno: 277
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        websiteUrl = base.getWebsite();
        if (typeof serviceToken !== "undefined" && serviceToken !== null) {
          deferredCallback("" + websiteUrl + "/gold/dashboard/login/service_token?service_token=" + serviceToken);
          return;
        }
        return deferredCallback("" + websiteUrl + "/gold/dashboard");
      };
    })(this));
  },
  showRechargeNotification: function() {
    var defaultFreeTierMins, message, rechargeMins, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.FREE_TIER_MINS, constants.DEFAULT_FREE_TIER_MINS, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return defaultFreeTierMins = arguments[0];
            };
          })(),
          lineno: 285
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.FREE_TIER_RECHARGE_MINS, constants.FREE_TIER_RECHARGE_MINS, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return rechargeMins = arguments[0];
              };
            })(),
            lineno: 286
          }));
          __iced_deferrals._fulfill();
        })(function() {
          message = en_messages.USED_BEYOND_FREE_TIER.replace("{{free_tier_mins}}", defaultFreeTierMins).replace("{{recharge_mins}}", rechargeMins);
          return base.showRichNotification(en_messages.ON_FREE_PLAN, message, [
            {
              title: en_messages.GO_PRO_FOR_UNINTERRUPTED_ACCESS,
              icon: "/assets/images/green_round_tick.png",
              next: function() {
                return base.openPage(pages.PRICING, true);
              }
            }
          ]);
        });
      };
    })(this));
  },
  isIncognitoPermissionEnabled: function(deferredCallback) {
    var isAllowed, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        chrome.extension.isAllowedIncognitoAccess(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return isAllowed = arguments[0];
            };
          })(),
          lineno: 296
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return deferredCallback(isAllowed);
      };
    })(this));
  },
  showActivationNotification: function() {
    var btns, gold, goldDashboardLoginUrl, hasRatedGom, isIncognitoEnabled, isLogined, isPaymentNeeded, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.isLogined(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return isLogined = arguments[0];
            };
          })(),
          lineno: 300
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.isPaymentNeeded(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return isPaymentNeeded = arguments[0];
              };
            })(),
            lineno: 301
          }));
          __iced_deferrals._fulfill();
        })(function() {
          btns = [];
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.isIncognitoPermissionEnabled(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return isIncognitoEnabled = arguments[0];
                };
              })(),
              lineno: 305
            }));
            __iced_deferrals._fulfill();
          })(function() {
            if (!isIncognitoEnabled) {
              btns.push({
                "title": en_messages.ALLOW_INCOGNITO,
                next: function() {
                  return base.openPage("chrome://extensions");
                }
              });
            }
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.getLocalData(keys.HAS_RATED_GOM, false, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return hasRatedGom = arguments[0];
                  };
                })(),
                lineno: 314
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                if (!hasRatedGom) {
                  return __iced_k(btns.push({
                    "title": en_messages.RATE_5_STARS,
                    next: function() {
                      base.openPage(base.getChomeWebstoreUrl());
                      return base.setLocalData(keys.HAS_RATED_GOM, true);
                    }
                  }));
                } else {
                  (function(__iced_k) {
                    if (!isLogined) {
                      return __iced_k(btns.push({
                        title: en_messages.SIGN_IN_FOR_UNINTERRUPTED_ACCESS,
                        icon: "/assets/images/green_round_tick.png",
                        next: function() {
                          return base.openPage(pages.SIGN_IN, true);
                        }
                      }));
                    } else {
                      (function(__iced_k) {
                        if (isPaymentNeeded) {
                          return __iced_k(btns.push({
                            title: en_messages.GO_PRO_FOR_UNINTERRUPTED_ACCESS,
                            icon: "/assets/images/green_round_tick.png",
                            next: function() {
                              return base.openPage(pages.PRICING, true);
                            }
                          }));
                        } else {
                          (function(__iced_k) {
                            __iced_deferrals = new iced.Deferrals(__iced_k, {
                              parent: ___iced_passed_deferral,
                              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                            });
                            base.getGoldDashboardLoginUrl(__iced_deferrals.defer({
                              assign_fn: (function() {
                                return function() {
                                  return goldDashboardLoginUrl = arguments[0];
                                };
                              })(),
                              lineno: 340
                            }));
                            __iced_deferrals._fulfill();
                          })(function() {
                            (function(__iced_k) {
                              __iced_deferrals = new iced.Deferrals(__iced_k, {
                                parent: ___iced_passed_deferral,
                                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                              });
                              base.getLocalData(keys.CACHED_GOLD, {
                                total_balance: 10.00
                              }, __iced_deferrals.defer({
                                assign_fn: (function() {
                                  return function() {
                                    return gold = arguments[0];
                                  };
                                })(),
                                lineno: 341
                              }));
                              __iced_deferrals._fulfill();
                            })(function() {
                              return __iced_k(btns.push({
                                title: "Withdraw $" + (gold.total_balance.toFixed(2)) + " from your Gom Gold balance",
                                icon: "/assets/images/green_round_tick.png",
                                next: function() {
                                  return base.openPage(goldDashboardLoginUrl, true);
                                }
                              }));
                            });
                          });
                        }
                      })(__iced_k);
                    }
                  })(__iced_k);
                }
              })(function() {
                return base.showRichNotification(en_messages.SMART_VPN_ENABLED, en_messages.SUCCESS_MSG, btns);
              });
            });
          });
        });
      };
    })(this));
  },
  isTabBlocked: function(tabId, deferCallback) {
    var error;
    if (deferCallback == null) {
      deferCallback = (function() {});
    }
    try {
      return chrome.tabs.executeScript(tabId, {
        file: "./inject.js"
      }, function() {
        return chrome.tabs.sendMessage(tabId, {
          method: "isBlocked"
        }, function(response) {
          if ((response != null) && "method" in response) {
            deferCallback((response.method === "isBlocked") && response.blocked);
            return;
          }
          return deferCallback(false);
        });
      });
    } catch (_error) {
      error = _error;
      return deferCallback(false);
    } finally {
      null;
    }
  },
  signIn: function(email, passwd, deferredCallback) {
    var apiHost, deviceId, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.DEVICE_ID, base.genUuid(), __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return deviceId = arguments[0];
            };
          })(),
          lineno: 369
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getApiHost(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return apiHost = arguments[0];
              };
            })(),
            lineno: 370
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: constants.AJAX_TIMEOUT_MS,
            type: "POST",
            url: "" + apiHost + config.API_SUFFIX + "/users/auth",
            alt: "json",
            contentType: "application/json",
            data: JSON.stringify({
              email: email,
              password: passwd,
              device_id: deviceId,
              device_platform: constants.DEVICE_PLATFORM
            }),
            dataType: "json",
            crossDomain: true,
            success: function(data) {
              var serviceToken;
              serviceToken = data["service_token"];
              base.setLocalData(keys.USER_ID, data["account_info"]["id"]);
              base.setLocalData(keys.EMAIL, data["account_info"]["email"]);
              base.setLocalData(keys.NEEDS_VERIFICATION, !data["verified"]);
              base.setLocalData(keys.SERVICE_TOKEN, serviceToken);
              base.setLocalData(keys.PROXY_STARTED_UNIX_TIMESTAMP, base.now());
              return deferredCallback(serviceToken);
            },
            error: function() {
              deferredCallback(null);
              return base.pingAllApiHosts();
            }
          });
        });
      };
    })(this));
  },
  isGold: function(deferredCallback) {
    var diff, expiryEpoch, paymentCredit, paymentPlan, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }

    /* checks if this current user is a `Pro` account or not, it defers from isPaymentNeeded() because then you can also be trial with some trial days */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.CACHED_PAYMENT_CREDIT, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return paymentCredit = arguments[0];
            };
          })(),
          lineno: 400
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.CACHED_PAYMENT_PLAN, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return paymentPlan = arguments[0];
              };
            })(),
            lineno: 401
          }));
          __iced_deferrals._fulfill();
        })(function() {
          if ((typeof paymentCredit === "undefined" || paymentCredit === null) || (typeof paymentPlan === "undefined" || paymentPlan === null)) {
            deferredCallback(false);
            return;
          }
          expiryEpoch = paymentCredit["credit_expiry_epoch"];
          diff = parseInt(expiryEpoch) - base.now();
          if ("plan" in paymentPlan && paymentPlan["plan"] === "gold" && diff > 0) {
            deferredCallback(true);
            return;
          }
          return deferredCallback(false);
        });
      };
    })(this));
  },
  isPro: function(deferredCallback) {
    var diff, expiryEpoch, paymentCredit, paymentPlan, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }

    /* checks if this current user is a `Pro` account or not, it defers from isPaymentNeeded() because then you can also be trial with some trial days */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.CACHED_PAYMENT_CREDIT, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return paymentCredit = arguments[0];
            };
          })(),
          lineno: 417
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.CACHED_PAYMENT_PLAN, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return paymentPlan = arguments[0];
              };
            })(),
            lineno: 418
          }));
          __iced_deferrals._fulfill();
        })(function() {
          var _ref;
          if ((typeof paymentCredit === "undefined" || paymentCredit === null) || (typeof paymentPlan === "undefined" || paymentPlan === null)) {
            deferredCallback(false);
            return;
          }
          expiryEpoch = paymentCredit["credit_expiry_epoch"];
          diff = parseInt(expiryEpoch) - base.now();
          if (diff > (31 * 24 * 60 * 60)) {
            deferredCallback(true);
            return;
          }
          if ("plan" in paymentPlan && ((_ref = paymentPlan["plan"]) === "pro" || _ref === "gold") && diff > 0) {
            deferredCallback(true);
            return;
          }
          return deferredCallback(false);
        });
      };
    })(this));
  },
  register: function(email, passwd, deferredCallback) {
    var apiHost, deviceId, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.DEVICE_ID, base.genUuid(), __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return deviceId = arguments[0];
            };
          })(),
          lineno: 437
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getApiHost(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return apiHost = arguments[0];
              };
            })(),
            lineno: 438
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return $.ajax({
            timeout: constants.AJAX_TIMEOUT_MS,
            type: "PUT",
            url: "" + apiHost + config.API_SUFFIX + "/users/",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify({
              email: email,
              password: passwd,
              device_id: deviceId,
              device_platform: constants.DEVICE_PLATFORM
            }),
            crossDomain: true,
            success: function(data) {
              var serviceToken;
              serviceToken = data["service_token"];
              base.setLocalData(keys.USER_ID, data["account_info"]["id"]);
              base.setLocalData(keys.EMAIL, data["account_info"]["email"]);
              base.setLocalData(keys.NEEDS_VERIFICATION, !data["verified"]);
              base.setLocalData(keys.SERVICE_TOKEN, serviceToken);
              return deferredCallback(serviceToken);
            },
            error: function() {
              deferredCallback(null);
              return base.pingAllApiHosts();
            }
          });
        });
      };
    })(this));
  },
  isEmailValidAndOAuth: function(email, deferredCallback) {
    var apiHost, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getApiHost(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return apiHost = arguments[0];
            };
          })(),
          lineno: 465
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return $.ajax({
          timeout: constants.AJAX_TIMEOUT_MS,
          type: "GET",
          url: "" + apiHost + config.API_SUFFIX + "/users/valid_email",
          data: {
            email: email
          },
          dataType: "json",
          crossDomain: true,
          success: function(data) {
            return deferredCallback(data["exists"], data["is_oauth"], data["has_password"]);
          },
          error: function() {
            return deferredCallback(false, false, false);
          }
        });
      };
    })(this));
  },
  injectContentScript: function(tab_id, defer_cb) {
    var error, tab, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (defer_cb == null) {
      defer_cb = (function() {});
    }
    try {
      (function(_this) {
        return (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          chrome.tabs.get(tab_id, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return tab = arguments[0];
              };
            })(),
            lineno: 482
          }));
          __iced_deferrals._fulfill();
        });
      })(this)((function(_this) {
        return function() {
          if (tab.url.substr(0, 6) === "chrome") {
            defer_cb(false);
            return;
          }
          return chrome.tabs.executeScript(tab_id, {
            file: "./inject.js"
          }, function() {
            return defer_cb(true);
          });
        };
      })(this));
    } catch (_error) {
      error = _error;
      return null;
    } finally {
      null;
    }
  },
  clearSpdyProxy: function() {
    var settings;
    settings = {
      scope: "regular"
    };
    return chrome.proxy.settings.clear(settings);
  },
  canSetProxy: function(defer_cb) {
    var cfg, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (defer_cb == null) {
      defer_cb = (function() {});
    }

    /* checks if the extension can set proxy (might be controlled by other extension */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        chrome.proxy.settings.get({}, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return cfg = arguments[0];
            };
          })(),
          lineno: 503
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (typeof cfg === "undefined" || cfg === null) {
          defer_cb(true);
          return;
        }
        if ((cfg.levelOfControl === "controllable_by_this_extension") || (cfg.levelOfControl === "controlled_by_this_extension")) {
          defer_cb(true);
          return;
        }
        return defer_cb(false);
      };
    })(this));
  },
  fetchSpdyProxy: function(deferredCallback) {
    var apiHost, deviceId, paymentPlan, proxyType, serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }

    /*
    fetches proxy info from api server
    returns (freeProxyObj ,speedBoostedProxy, proxy_activation_error_ENUM)
     */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.DEVICE_ID, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return deviceId = arguments[0];
            };
          })(),
          lineno: 520
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return serviceToken = arguments[0];
              };
            })(),
            lineno: 521
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getApiHost(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return apiHost = arguments[0];
                };
              })(),
              lineno: 522
            }));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.getLocalData(keys.CACHED_PAYMENT_PLAN, null, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return paymentPlan = arguments[0];
                  };
                })(),
                lineno: 523
              }));
              __iced_deferrals._fulfill();
            })(function() {
              proxyType = (typeof paymentPlan !== "undefined" && paymentPlan !== null) && paymentPlan.plan === 'gold' ? 'gold_spdy' : constants.PROXY_TYPE;
              return $.ajax({
                timeout: constants.AJAX_TIMEOUT_MS,
                type: "GET",
                url: "" + apiHost + config.API_SUFFIX + "/proxies",
                data: {
                  service_token: serviceToken,
                  device_id: deviceId,
                  type: proxyType
                },
                dataType: "json",
                crossDomain: true,
                success: function(data) {
                  var freeTierMins, freeTierRechargeMins;
                  freeTierMins = data['free_tier_mins'];
                  freeTierRechargeMins = data['free_tier_recharge_mins'];
                  base.setLocalData(keys.FREE_TIER_MINS, freeTierMins);
                  base.setLocalData(keys.FREE_TIER_RECHARGE_MINS, freeTierRechargeMins);
                  return deferredCallback(data[proxyType], null);
                },
                error: function(xhr) {
                  if (xhr.status === 401) {
                    base.setLocalData(keys.NEEDS_VERIFICATION, true);
                    deferredCallback(null, null, proxy_activation_errors.REQUIRE_EMAIL_VERIFICATION);
                    return;
                  }
                  deferredCallback(null, null, proxy_activation_errors.NETWORK_ERROR);
                  return base.pingAllApiHosts();
                }
              });
            });
          });
        });
      };
    })(this));
  },
  showExtensionConflictNotification: function() {
    return base.showRichNotification(en_messages.DISABLE_OTHER_EXTENSIONS, en_messages.OTHER_EXTENSIONS_USING, [
      {
        title: en_messages.SHOW_ALL_EXTS,
        next: function() {
          return base.openPage("chrome://extensions");
        }
      }
    ]);
  },
  showServerErrorNotification: function() {
    return base.showRichNotification(en_messages.OOPS, en_messages.ERROR_CONTACTING_SERVER, [
      {
        title: en_messages.EMAIL_ADMIN,
        next: function() {
          return base.openPage(constants.EMAIL_ADMIN_URL);
        }
      }
    ]);
  },
  fetchAndSaveSpdyProxy: function(deferredCallback) {
    var proxyLoadingErrorEnum, proxyObj, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.fetchSpdyProxy(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              proxyObj = arguments[0];
              return proxyLoadingErrorEnum = arguments[1];
            };
          })(),
          lineno: 568
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (typeof proxyObj === "undefined" || proxyObj === null) {
          base.resetDeactivate();
          deferredCallback(false, proxy_activation_errors.NETWORK_ERROR);
          return;
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.setLocalData(keys.CACHED_PROXY_OBJ, proxyObj, __iced_deferrals.defer({
            lineno: 573
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.setLocalData(keys.PROXY_FETCH_TIMESTAMP, base.now(), __iced_deferrals.defer({
              lineno: 574
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return deferredCallback();
          });
        });
      };
    })(this));
  },
  toggleSpdyProxyActivation: function(doActivate, deferredCallback) {
    var canSetProxy, hasShownTip, proxyLoadingErrorEnum, proxyObj, wildcardLis, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }

    /*
        toggles on/off spdy proxy
        returns `(success_BOOL, error_ENUM)`
     */
    base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.LOADING);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.canSetProxy(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return canSetProxy = arguments[0];
            };
          })(),
          lineno: 587
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (!canSetProxy) {
          base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.NETWORK_ERROR);
          base.resetDeactivate();
          deferredCallback(false, proxy_activation_errors.CONFLICTING_EXTENSION);
          return;
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.CACHED_PROXY_OBJ, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return proxyObj = arguments[0];
              };
            })(),
            lineno: 595
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            if (typeof proxyObj === "undefined" || proxyObj === null) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.fetchSpdyProxy(__iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      proxyObj = arguments[0];
                      return proxyLoadingErrorEnum = arguments[1];
                    };
                  })(),
                  lineno: 597
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (typeof proxyLoadingErrorEnum !== "undefined" && proxyLoadingErrorEnum !== null) {
                  base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.NETWORK_ERROR);
                  base.resetDeactivate();
                  deferredCallback(false, proxyLoadingErrorEnum);
                  return;
                }
                if (typeof proxyObj === "undefined" || proxyObj === null) {
                  base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.NETWORK_ERROR);
                  base.resetDeactivate();
                  deferredCallback(false, proxy_activation_errors.NETWORK_ERROR);
                  return;
                }
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                  });
                  base.setLocalData(keys.CACHED_PROXY_OBJ, proxyObj, __iced_deferrals.defer({
                    lineno: 609
                  }));
                  __iced_deferrals._fulfill();
                })(function() {
                  return __iced_k(base.setLocalData(keys.PROXY_FETCH_TIMESTAMP, base.now()));
                });
              });
            } else {
              return __iced_k();
            }
          })(function() {
            if (!doActivate) {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.getAllAddonWildcards(__iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return wildcardLis = arguments[0];
                    };
                  })(),
                  lineno: 614
                }));
                __iced_deferrals._fulfill();
              })(function() {
                base.applyProxy(wildcardLis, deferredCallback);
                base.setLocalData(keys.PROXY_STATE, proxy_states.PASSIVE);
                base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.SUCCESS);
                base.activateBrowserIcon(false);
                return __iced_k(base.updateBrowserIconPopup());
              });
            } else {
              base.applyProxy(["*"], deferredCallback);
              base.setLocalData(keys.PROXY_STATE, proxy_states.ACTIVE);
              base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.SUCCESS);
              base.setLocalData(keys.PROXY_STARTED_UNIX_TIMESTAMP, base.now());
              base.setLocalData(keys.LAST_FREE_PLAN_NAG_TIMESTAMP, base.now());
              base.activateBrowserIcon(true);
              base.updateBrowserIconPopup();
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.getLocalData(keys.HAS_SHOWN_TIPS, false, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return hasShownTip = arguments[0];
                    };
                  })(),
                  lineno: 632
                }));
                __iced_deferrals._fulfill();
              })(function() {
                (function(__iced_k) {
                  if (!hasShownTip) {
                    base.openPage(pages.TIP, true);
                    (function(__iced_k) {
                      __iced_deferrals = new iced.Deferrals(__iced_k, {
                        parent: ___iced_passed_deferral,
                        filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                      });
                      base.setLocalData(keys.HAS_SHOWN_TIPS, true);
                      __iced_deferrals._fulfill();
                    })(__iced_k);
                  } else {
                    return __iced_k();
                  }
                })(function() {
                  (function(__iced_k) {
                    __iced_deferrals = new iced.Deferrals(__iced_k, {
                      parent: ___iced_passed_deferral,
                      filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                    });
                    base.sync(__iced_deferrals.defer({
                      lineno: 637
                    }));
                    __iced_deferrals._fulfill();
                  })(function() {
                    return __iced_k(base.applyProxy(["*"]));
                  });
                });
              });
            }
          });
        });
      };
    })(this));
  },
  getAllAddonWildcards: function(deferCallback) {
    var addon, installedAddons, isPaymentNeeded, url, wildcardLis, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferCallback == null) {
      deferCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.ADDONS, [], __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return installedAddons = arguments[0];
            };
          })(),
          lineno: 641
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.isPaymentNeeded(__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return isPaymentNeeded = arguments[0];
              };
            })(),
            lineno: 642
          }));
          __iced_deferrals._fulfill();
        })(function() {
          var _i, _j, _len, _len1, _ref;
          wildcardLis = [];
          if (isPaymentNeeded) {
            deferCallback([]);
          }
          for (_i = 0, _len = installedAddons.length; _i < _len; _i++) {
            addon = installedAddons[_i];
            _ref = addon.orig_wildcard_domains;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              url = _ref[_j];
              wildcardLis.push(url);
            }
          }
          return deferCallback(wildcardLis);
        });
      };
    })(this));
  },
  activateBrowserIcon: function(doActivate) {

    /* updates the actual browser icon with a diff color */
    if (doActivate) {
      chrome.browserAction.setIcon({
        path: "/assets/images/icon-19-clicked.png"
      });
      chrome.browserAction.setBadgeText({
        text: "UP"
      });
      return chrome.browserAction.setTitle({
        title: ""
      });
    } else {
      chrome.browserAction.setIcon({
        path: "/assets/images/icon-19.png"
      });
      chrome.browserAction.setBadgeText({
        text: ""
      });
      return chrome.browserAction.setTitle({
        title: ""
      });
    }
  },
  now: function() {
    return new Date().getTime() / 1000;
  },
  rearrangePorts: function(proxyObj, portPref) {
    var p, port_type, rearrangedPorts, _i, _j, _len, _len1, _ref;
    if (portPref == null) {
      return proxyObj.ports;
    }
    rearrangedPorts = [];
    for (_i = 0, _len = portPref.length; _i < _len; _i++) {
      port_type = portPref[_i];
      _ref = proxyObj.ports;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        p = _ref[_j];
        if (port_type === p.type) {
          rearrangedPorts.push(p);
        }
      }
    }
    if (rearrangedPorts.length === 0) {
      return proxyObj.ports;
    }
    return rearrangedPorts;
  },
  getPort: function(portLis, type) {
    var port2Use, _i, _len;
    for (_i = 0, _len = portLis.length; _i < _len; _i++) {
      port2Use = portLis[_i];
      if (port2Use["type"] === type) {
        return port2Use;
      }
    }
  },
  applyProxy: function(autoBypassRegexLis, deferCallback) {
    var isHttp, port2Use, portPref, proxyObj, proxyObj2Use, rearrangedPorts, useSpdyDefault, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (autoBypassRegexLis == null) {
      autoBypassRegexLis = ["*"];
    }
    if (deferCallback == null) {
      deferCallback = (function() {});
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.CACHED_PROXY_OBJ, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return proxyObj = arguments[0];
            };
          })(),
          lineno: 694
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.USE_SPDY_DEFAULT, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return useSpdyDefault = arguments[0];
              };
            })(),
            lineno: 695
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getLocalData(keys.PORT_PREFERENCE_LIST, null, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return portPref = arguments[0];
                };
              })(),
              lineno: 696
            }));
            __iced_deferrals._fulfill();
          })(function() {
            var _i, _j, _len, _len1;
            proxyObj2Use = proxyObj;
            rearrangedPorts = base.rearrangePorts(proxyObj2Use);
            for (_i = 0, _len = rearrangedPorts.length; _i < _len; _i++) {
              port2Use = rearrangedPorts[_i];
              isHttp = port2Use["type"] === "http";
              if (useSpdyDefault && isHttp) {
                continue;
              } else if (isHttp) {
                base.setHttpProxy(proxyObj2Use.host, port2Use.number, autoBypassRegexLis, deferCallback);
                return;
              } else {
                base.setSpdyProxy(proxyObj2Use.host, port2Use.number, autoBypassRegexLis, deferCallback);
                return;
              }
            }
            for (_j = 0, _len1 = rearrangedPorts.length; _j < _len1; _j++) {
              port2Use = rearrangedPorts[_j];
              isHttp = port2Use["type"] === "http";
              if (isHttp) {
                base.setHttpProxy(proxyObj2Use.host, port2Use.number, autoBypassRegexLis, deferCallback);
                return;
              } else {
                base.setSpdyProxy(proxyObj2Use.host, port2Use.number, autoBypassRegexLis, deferCallback);
                return;
              }
            }
          });
        });
      };
    })(this));
  },
  setHttpProxy: function(host, port, autoBypassRegexLis, deferCallback) {
    var cfg;
    if (autoBypassRegexLis == null) {
      autoBypassRegexLis = ["*"];
    }
    if (deferCallback == null) {
      deferCallback = (function() {});
    }
    cfg = {
      pacScript: {
        data: base.genPacScript(host, port, autoBypassRegexLis, "PROXY")
      },
      mode: "pac_script"
    };
    return chrome.proxy.settings.set({
      value: cfg,
      scope: "regular"
    }, function() {
      return deferCallback();
    });
  },
  setSpdyProxy: function(host, port, autoBypassRegexLis, deferCallback) {
    var cfg;
    if (autoBypassRegexLis == null) {
      autoBypassRegexLis = ["*"];
    }
    if (deferCallback == null) {
      deferCallback = (function() {});
    }
    cfg = {
      pacScript: {
        data: base.genPacScript(host, port, autoBypassRegexLis)
      },
      mode: "pac_script"
    };
    return chrome.proxy.settings.set({
      value: cfg,
      scope: "regular"
    }, function() {
      return deferCallback();
    });
  },
  genPacScript: function(host, port, autoBypassRegexLis, type) {
    var autoBypassUrl, bypassStr, script, _i, _len;
    if (autoBypassRegexLis == null) {
      autoBypassRegexLis = [];
    }
    if (type == null) {
      type = "HTTPS";
    }
    bypassStr = "";
    for (_i = 0, _len = autoBypassRegexLis.length; _i < _len; _i++) {
      autoBypassUrl = autoBypassRegexLis[_i];
      bypassStr += "if (shExpMatch(url, \"" + autoBypassUrl + "\")) return \"" + type + " " + host + ":" + port + "\";";
    }
    script = "function FindProxyForURL(url, host) {\n\n    if (isPlainHostName(host) ||\n        shExpMatch(host, \"*.local\") ||\n        isInNet(dnsResolve(host), \"10.0.0.0\", \"255.0.0.0\") ||\n        isInNet(dnsResolve(host), \"172.16.0.0\", \"255.240.0.0\") ||\n        isInNet(dnsResolve(host), \"192.168.0.0\", \"255.255.0.0\") ||\n        isInNet(dnsResolve(host), \"127.0.0.0\", \"255.255.255.0\"))\n        return \"DIRECT\";\n\n    " + bypassStr + "\n\n    return \"DIRECT\";\n}";
    return script;
  },
  resetDeactivate: function() {

    /* does the proxy deactivation reset routine */
    base.clearSpdyProxy();
    base.setLocalData(keys.PROXY_STATE, proxy_states.PASSIVE);
    base.activateBrowserIcon(false);
    return base.updateBrowserIconPopup();
  },
  reset: function(deferredCallback) {
    var isResetting, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }

    /* reset routing everytime the browser/extension restarts */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.IS_RESETTING, false, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return isResetting = arguments[0];
            };
          })(),
          lineno: 788
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (isResetting) {
          return;
        }
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.setLocalData(keys.IS_RESETTING, true, __iced_deferrals.defer({
            lineno: 792
          }));
          __iced_deferrals._fulfill();
        })(function() {
          base.resetDeactivate();
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.fetchAndSaveSpdyProxy(__iced_deferrals.defer({
              lineno: 794
            }));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.sync(__iced_deferrals.defer({
                lineno: 795
              }));
              __iced_deferrals._fulfill();
            })(function() {
              deferredCallback();
              base.toggleSpdyProxyActivation(false);
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.setLocalData(keys.IS_RESETTING, false, __iced_deferrals.defer({
                lineno: 798
              }));
              __iced_deferrals._fulfill();
            });
          });
        });
      };
    })(this));
  },
  updateBrowserIconPopup: function() {
    var proxyState, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);

    /* updates the popup when you click the browser icon given the current circumstance */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.PROXY_STATE, proxy_states.PASSIVE, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return proxyState = arguments[0];
            };
          })(),
          lineno: 802
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (proxyState === proxy_states.ACTIVE) {
          chrome.browserAction.setPopup({
            "popup": pages.POPUP.DISCONNECT
          });
          return chrome.browserAction.setTitle({
            "title": en_messages.DISCONNECT_GOM
          });
        } else if (proxyState === proxy_states.PASSIVE) {
          chrome.browserAction.setPopup({
            "popup": pages.POPUP.ACTIVATION
          });
          return chrome.browserAction.setTitle({
            "title": en_messages.ACTIVATE_GOM
          });
        }
      };
    })(this));
  },
  e: function(m) {
    var enc, iv, key;
    key = CryptoJS.enc.Hex.parse(constants.CRYPTOJS_KEY);
    iv = CryptoJS.enc.Hex.parse(constants.CRYPTOJS_IV);
    enc = CryptoJS.AES.encrypt(m, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return enc.toString();
  },
  d: function(em) {
    var c, iv, key;
    key = CryptoJS.enc.Hex.parse(constants.CRYPTOJS_KEY);
    iv = CryptoJS.enc.Hex.parse(constants.CRYPTOJS_IV);
    c = CryptoJS.AES.decrypt(em, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return c.toString(CryptoJS.enc.Utf8);
  },
  genUuid: function() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r, v;
      r = Math.random() * 16 | 0;
      v = (c === "x" ? r : r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  getWebsite: function() {
    if (!config.PRODUCTION) {
      return config.DEV_WEBSITE;
    }
    return config.GOM_WEBSITE;
  },
  getApiHost: function(deferredCallback) {
    var encrypted_host, ping_results, ping_success, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (!config.PRODUCTION) {
      deferredCallback(config.DEV_API_HOST);
      return;
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.API_HOST_PING_RESULTS, {}, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return ping_results = arguments[0];
            };
          })(),
          lineno: 859
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        for (encrypted_host in ping_results) {
          ping_success = ping_results[encrypted_host];
          if (ping_success) {
            deferredCallback(base.d(encrypted_host));
            return;
          }
        }
        return deferredCallback(base.d(config.API_HOSTS[0]));
      };
    })(this));
  },
  touch: function(device_id, defer_cb) {
    var endpoint, host, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (defer_cb == null) {
      defer_cb = (function() {});
    }
    endpoint = "" + config.API_SUFFIX + "/users/touch";
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getApiHost(__iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return host = arguments[0];
            };
          })(),
          lineno: 870
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        return $.ajax({
          timeout: constants.FAST_AJAX_TIMEOUT_MS,
          type: "GET",
          url: "" + host + endpoint,
          data: {
            device_id: device_id
          },
          alt: "json",
          dataType: "json",
          crossDomain: true,
          success: function() {
            base.setLocalData(keys.HAS_TOUCHED_DEVICE_ID, true);
            return defer_cb(true);
          },
          error: function() {
            return defer_cb(false);
          }
        });
      };
    })(this));
  },
  pingAllApiHosts: function(defer_cb) {
    var full_host, h, host, ip, pingHost, ping_results, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (defer_cb == null) {
      defer_cb = (function() {});
    }
    base.setLocalData(keys.API_HOST_PING_RESULTS, {});
    pingHost = function(host, done_cb) {
      if (done_cb == null) {
        done_cb = (function() {});
      }
      return $.ajax({
        timeout: constants.AJAX_TIMEOUT_MS,
        type: "GET",
        url: "" + host + "/gom4/test?" + (base.genUuid()),
        alt: "json",
        dataType: "json",
        crossDomain: true,
        success: function(data) {
          var ping_results, ___iced_passed_deferral1, __iced_deferrals, __iced_k;
          __iced_k = __iced_k_noop;
          ___iced_passed_deferral1 = iced.findDeferral(arguments);
          (function(_this) {
            return (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral1,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.getLocalData(keys.API_HOST_PING_RESULTS, {}, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return ping_results = arguments[0];
                  };
                })(),
                lineno: 898
              }));
              __iced_deferrals._fulfill();
            });
          })(this)((function(_this) {
            return function() {
              ping_results[base.e(host)] = true;
              base.setLocalData(keys.API_HOST_PING_RESULTS, ping_results);
              return done_cb(true);
            };
          })(this));
        },
        error: function() {
          var ping_results, ___iced_passed_deferral1, __iced_deferrals, __iced_k;
          __iced_k = __iced_k_noop;
          ___iced_passed_deferral1 = iced.findDeferral(arguments);
          (function(_this) {
            return (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral1,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              base.getLocalData(keys.API_HOST_PING_RESULTS, {}, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return ping_results = arguments[0];
                  };
                })(),
                lineno: 903
              }));
              __iced_deferrals._fulfill();
            });
          })(this)((function(_this) {
            return function() {
              ping_results[base.e(host)] = false;
              base.setLocalData(keys.API_HOST_PING_RESULTS, ping_results);
              return done_cb(false);
            };
          })(this));
        }
      });
    };
    (function(_this) {
      return (function(__iced_k) {
        var _i, _len, _ref, _results, _while;
        _ref = config.API_HOSTS;
        _len = _ref.length;
        _i = 0;
        _while = function(__iced_k) {
          var _break, _continue, _next;
          _break = __iced_k;
          _continue = function() {
            return iced.trampoline(function() {
              ++_i;
              return _while(__iced_k);
            });
          };
          _next = _continue;
          if (!(_i < _len)) {
            return _break();
          } else {
            h = _ref[_i];
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
              });
              pingHost(base.d(h), __iced_deferrals.defer({
                lineno: 909
              }));
              __iced_deferrals._fulfill();
            })(_next);
          }
        };
        _while(__iced_k);
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = config.MIRROR_HOSTS;
          _len = _ref.length;
          _i = 0;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                ++_i;
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!(_i < _len)) {
              return _break();
            } else {
              h = _ref[_i];
              host = base.d(h);
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.resolve(host, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return ip = arguments[0];
                    };
                  })(),
                  lineno: 913
                }));
                __iced_deferrals._fulfill();
              })(function() {
                full_host = "http://" + ip;
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                  });
                  pingHost(full_host, __iced_deferrals.defer({
                    lineno: 915
                  }));
                  __iced_deferrals._fulfill();
                })(_next);
              });
            }
          };
          _while(__iced_k);
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getLocalData(keys.API_HOST_PING_RESULTS, {}, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return ping_results = arguments[0];
                };
              })(),
              lineno: 917
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return defer_cb(ping_results);
          });
        });
      };
    })(this));
  },
  getLocalData: function(key, default_value, defer_cb) {
    var items, potential_res, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        chrome.storage.local.get(key, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return items = arguments[0];
            };
          })(),
          lineno: 921
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (key in items && (items[key] != null)) {
          defer_cb(items[key]);
          return;
        }
        potential_res = localStorage.getItem(key);
        if (potential_res != null) {
          defer_cb(potential_res);
          chrome.storage.local.set({
            key: potential_res
          }, (function() {}));
          return;
        }
        return defer_cb(default_value);
      };
    })(this));
  },
  setLocalData: function(dic_key, val, defer_cb) {
    var dic;
    if (defer_cb == null) {
      defer_cb = (function() {});
    }
    dic = {};
    dic[dic_key] = val;
    return chrome.storage.local.set(dic, (function() {
      return defer_cb();
    }));
  },
  getPersistentData: function(key, default_value, defer_cb) {
    return chrome.cookies.get({
      url: config.GOM_WEBSITE,
      name: key
    }, function(cookie) {
      if (cookie == null) {
        defer_cb(default_value);
        return;
      }
      return defer_cb(cookie.value);
    });
  },
  setPersistentData: function(key, val, defer_cb) {
    var five_years_from_now, now;
    if (defer_cb == null) {
      defer_cb = (function() {});
    }
    now = Math.round(new Date().getTime() / 1000);
    five_years_from_now = now + (365 * 5 * 24 * 60 * 60);
    return chrome.cookies.set({
      url: config.GOM_WEBSITE,
      name: key,
      value: val,
      expirationDate: five_years_from_now
    }, function() {
      return defer_cb();
    });
  },
  setBrowserActionPopup: function(popup_page, msg) {
    chrome.browserAction.setPopup({
      "popup": popup_page
    });
    return chrome.browserAction.setTitle({
      "title": msg
    });
  },
  showRichNotification: function(title, body, btns, iconUrl) {
    var b, bindButtonClickEvent, btnLis, i, thisId, _i, _len;
    if (btns == null) {
      btns = [];
    }
    if (iconUrl == null) {
      iconUrl = "/assets/images/gom_big_icon.png";
    }

    /*
    Uses the new Chrome (rich) notifications API
    
    `buttons` -- is a list of dicts with 3 values.
    
    example:
        [{
            "title": "Title of the button",
            "icon": "images/rabbit.png",
            "next": function() {..}
        }]
     */
    thisId = base.genUuid();
    bindButtonClickEvent = function(btn, idx, id) {
      return (function(btn) {
        return (function(idx) {
          return (function(id) {
            chrome.notifications.onButtonClicked.removeListener();
            return chrome.notifications.onButtonClicked.addListener(function(notification_id, btn_idx) {
              if (notification_id === id && btn_idx === idx) {
                return btn.next();
              }
            });
          })(id);
        })(idx);
      })(btn);
    };
    btnLis = [];
    i = 0;
    for (_i = 0, _len = btns.length; _i < _len; _i++) {
      b = btns[_i];
      btnLis.push({
        title: b.title,
        iconUrl: b.icon
      });
      bindButtonClickEvent(b, i, thisId);
      i += 1;
    }
    chrome.notifications.clear(title, (function() {}));
    return chrome.notifications.create(thisId, {
      type: "basic",
      title: title,
      message: body,
      iconUrl: iconUrl,
      buttons: btnLis
    }, (function() {}));
  },
  makeToast: function(msg, durationMs) {
    if (durationMs == null) {
      durationMs = 4000;
    }
    if (msg == null) {
      return;
    }
    return $.snackbar({
      content: msg,
      style: "toast",
      timeout: durationMs
    });
  },
  fetchPaymentUrl: function(plan, deferredCallback) {
    var apiHost, country, serviceToken, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (plan == null) {
      deferredCallback(null, null, null, null);
      return;
    }
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.COUNTRY, constants.DEFAULT_COUNTRY_CODE, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return country = arguments[0];
            };
          })(),
          lineno: 1024
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
          });
          base.getLocalData(keys.SERVICE_TOKEN, null, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return serviceToken = arguments[0];
              };
            })(),
            lineno: 1025
          }));
          __iced_deferrals._fulfill();
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getApiHost(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return apiHost = arguments[0];
                };
              })(),
              lineno: 1026
            }));
            __iced_deferrals._fulfill();
          })(function() {
            return $.ajax({
              timeout: constants.AJAX_TIMEOUT_MS,
              type: "GET",
              url: "" + apiHost + config.API_SUFFIX + "/payments/url",
              data: {
                service_token: serviceToken,
                plan: plan,
                country: country
              },
              dataType: "json",
              crossDomain: true,
              success: function(data) {
                return deferredCallback(data.url, data.saasy_url, data.price.raw, data.price.fee, data.price.total);
              },
              error: function() {
                deferredCallback(null, null, null, null);
                return base.pingAllApiHosts();
              }
            });
          });
        });
      };
    })(this));
  },
  repair: function(progressCallback) {
    var apiHost, currentHost, i, j, newProxyObj, portObj, proxyObj, success, successfulPortType, url, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (progressCallback == null) {
      progressCallback = (function() {});
    }
    base.toggleSpdyProxyActivation(false);
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.CACHED_PROXY_OBJ, null, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return proxyObj = arguments[0];
            };
          })(),
          lineno: 1045
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        if (typeof proxyObj === "undefined" || proxyObj === null) {
          progressCallback(100);
          return;
        }
        currentHost = proxyObj.host;
        i = 0;
        (function(__iced_k) {
          var _begin, _end, _i, _positive, _results, _step, _while;
          j = i;
          _begin = i;
          _end = constants.MAX_TRIES_FOR_IP_CHANGE;
          if (_end > _begin) {
            _step = 1;
          } else {
            _step = -1;
          }
          _positive = _end > _begin;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                j += _step;
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!!((_positive === true && j > constants.MAX_TRIES_FOR_IP_CHANGE) || (_positive === false && j < constants.MAX_TRIES_FOR_IP_CHANGE))) {
              return _break();
            } else {

              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.fetchAndSaveSpdyProxy(__iced_deferrals.defer({
                  lineno: 1055
                }));
                __iced_deferrals._fulfill();
              })(function() {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                  });
                  base.getLocalData(keys.CACHED_PROXY_OBJ, null, __iced_deferrals.defer({
                    assign_fn: (function() {
                      return function() {
                        return newProxyObj = arguments[0];
                      };
                    })(),
                    lineno: 1056
                  }));
                  __iced_deferrals._fulfill();
                })(function() {
                  (function(__iced_k) {
                    if (newProxyObj.host !== currentHost) {
                      proxyObj = newProxyObj;
                      (function(__iced_k) {
_break()
                      })(__iced_k);
                    } else {
                      return __iced_k();
                    }
                  })(function() {
                    return _next(progressCallback(i));
                  });
                });
              });
            }
          };
          _while(__iced_k);
        })(function() {
          i = constants.MAX_TRIES_FOR_IP_CHANGE;
          progressCallback(i);
          successfulPortType = [];
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getApiHost(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return apiHost = arguments[0];
                };
              })(),
              lineno: 1066
            }));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              var _i, _len, _ref, _results, _while;
              _ref = proxyObj.ports;
              _len = _ref.length;
              _i = 0;
              _while = function(__iced_k) {
                var _break, _continue, _next;
                _break = __iced_k;
                _continue = function() {
                  return iced.trampoline(function() {
                    ++_i;
                    return _while(__iced_k);
                  });
                };
                _next = _continue;
                if (!(_i < _len)) {
                  return _break();
                } else {
                  portObj = _ref[_i];
                  (function(__iced_k) {
                    if (portObj.type === "http") {
                      (function(__iced_k) {
                        __iced_deferrals = new iced.Deferrals(__iced_k, {
                          parent: ___iced_passed_deferral,
                          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                        });
                        base.setHttpProxy(proxyObj.host, "1234", ['*'], __iced_deferrals.defer({
                          lineno: 1069
                        }));
                        __iced_deferrals._fulfill();
                      })(__iced_k);
                    } else {
                      (function(__iced_k) {
                        __iced_deferrals = new iced.Deferrals(__iced_k, {
                          parent: ___iced_passed_deferral,
                          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                        });
                        base.setSpdyProxy(proxyObj.host, portObj.number, ['*'], __iced_deferrals.defer({
                          lineno: 1070
                        }));
                        __iced_deferrals._fulfill();
                      })(__iced_k);
                    }
                  })(function() {
                    url = "https://api.gomcomm.com/gom4/test?" + (base.genUuid());
                    (function(__iced_k) {
                      __iced_deferrals = new iced.Deferrals(__iced_k, {
                        parent: ___iced_passed_deferral,
                        filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                      });
                      base.pingEndpoint(url, constants.AJAX_TIMEOUT_MS, __iced_deferrals.defer({
                        assign_fn: (function() {
                          return function() {
                            return success = arguments[0];
                          };
                        })(),
                        lineno: 1072
                      }));
                      __iced_deferrals._fulfill();
                    })(function() {
                      if (success) {
                        successfulPortType.push(portObj.type);
                      }
                      i += 30;
                      return _next(progressCallback(i));
                    });
                  });
                }
              };
              _while(__iced_k);
            })(function() {
              base.setLocalData(keys.PORT_PREFERENCE_LIST, successfulPortType);
              progressCallback(100);
              base.toggleSpdyProxyActivation(false);
              return base.sync();
            });
          });
        });
      };
    })(this));
  },
  pingEndpoint: function(endpoint, timeout, deferredCallback) {
    if (timeout == null) {
      timeout = constants.AJAX_TIMEOUT_MS;
    }
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    return $.ajax({
      timeout: timeout,
      type: "GET",
      url: "" + endpoint + "/?" + (base.genUuid()),
      crossDomain: true,
      success: function(data) {
        return deferredCallback(true);
      },
      error: function() {
        return deferredCallback(false);
      }
    });
  },
  testHttpProxyEndpointValidity: function(host, port, urlLis, deferredCallback, progressCallback) {
    var i, pingSuccess, successfulEndpoints, url, x, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    if (progressCallback == null) {
      progressCallback = (function() {});
    }

    /*
    checks if a `http` proxy is valid by running it through a series of endpoints; # defer_cb(lis): a list of endpoints w/ status code of 200 # progress_cb(progress_percentage)
     */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.setHttpProxy(host, port, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = urlLis.length; _i < _len; _i++) {
            x = urlLis[_i];
            _results.push("*" + (base.d(x)) + "*");
          }
          return _results;
        })(), __iced_deferrals.defer({
          lineno: 1097
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        successfulEndpoints = [];
        i = 0;
        (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = urlLis;
          _len = _ref.length;
          _i = 0;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                ++_i;
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!(_i < _len)) {
              return _break();
            } else {
              url = _ref[_i];
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.pingEndpoint("http://" + (base.d(url)), constants.AJAX_TIMEOUT_MS, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return pingSuccess = arguments[0];
                    };
                  })(),
                  lineno: 1101
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (pingSuccess) {
                  successfulEndpoints.push(base.d(url));
                }
                i += 1;
                return _next(progressCallback(parseInt(i / urlLis.length * 100)));
              });
            }
          };
          _while(__iced_k);
        })(function() {
          progressCallback(100);
          return deferredCallback(successfulEndpoints);
        });
      };
    })(this));
  },
  testSpdyProxyEndpointValidity: function(host, port, urlLis, deferredCallback, progressCallback) {
    var i, pingSuccess, successfulEndpoints, url, x, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    if (progressCallback == null) {
      progressCallback = (function() {});
    }
    "checks if a `spdy` proxy is valid by running it through a series of endpoints; # callback return: a list of endpoints w/ status code of 200 # defer_cb(lis): a list of endpoints w/ status code of 200 # progress_cb(progress_percentage)";
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.setSpdyProxy(host, port, (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = urlLis.length; _i < _len; _i++) {
            x = urlLis[_i];
            _results.push("*" + (base.d(x)) + "*");
          }
          return _results;
        })(), __iced_deferrals.defer({
          lineno: 1113
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        successfulEndpoints = [];
        i = 0;
        (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = urlLis;
          _len = _ref.length;
          _i = 0;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                ++_i;
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!(_i < _len)) {
              return _break();
            } else {
              url = _ref[_i];
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.pingEndpoint("http://" + (base.d(url)), constants.AJAX_TIMEOUT_MS, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return pingSuccess = arguments[0];
                    };
                  })(),
                  lineno: 1117
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (pingSuccess) {
                  successfulEndpoints.push(url);
                }
                i += 1;
                return _next(progressCallback(parseInt(i / urlLis.length * 100)));
              });
            }
          };
          _while(__iced_k);
        })(function() {
          progressCallback(100);
          return deferredCallback(successfulEndpoints);
        });
      };
    })(this));
  },
  fetchPortPriority: function(proxyObj, deferredCallback, progressCallback) {
    var currentProgress, host, i, isHttp, p, port, portArray, portNo, portPref, portTestResult, proxyState, sortedArr, testResults, useSpdyAsDefault, ___iced_passed_deferral, __iced_deferrals, __iced_k;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    if (deferredCallback == null) {
      deferredCallback = (function() {});
    }
    if (progressCallback == null) {
      progressCallback = (function() {});
    }

    /*
     requires KEYS.PROXY_STATE to be ACTIVATION_MODES.PASSIVE (because it assigns random proxies) # figures our which ports from proxy_obj are better
     (for example, non-spdy ports serve videos faster) # callback return: defer_cb(successfully_optimized, port_type_lis) # callback return: progress_cb(progress_percentage)
     */
    (function(_this) {
      return (function(__iced_k) {
        __iced_deferrals = new iced.Deferrals(__iced_k, {
          parent: ___iced_passed_deferral,
          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
        });
        base.getLocalData(keys.USE_SPDY_DEFAULT, false, __iced_deferrals.defer({
          assign_fn: (function() {
            return function() {
              return useSpdyAsDefault = arguments[0];
            };
          })(),
          lineno: 1130
        }));
        __iced_deferrals._fulfill();
      });
    })(this)((function(_this) {
      return function() {
        host = proxyObj.host;
        portArray = proxyObj["ports"];
        portTestResult = [];
        i = 0;
        currentProgress = 0;
        (function(__iced_k) {
          var _i, _len, _ref, _results, _while;
          _ref = portArray;
          _len = _ref.length;
          _i = 0;
          _while = function(__iced_k) {
            var _break, _continue, _next;
            _break = __iced_k;
            _continue = function() {
              return iced.trampoline(function() {
                ++_i;
                return _while(__iced_k);
              });
            };
            _next = _continue;
            if (!(_i < _len)) {
              return _break();
            } else {
              port = _ref[_i];
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                });
                base.getLocalData(keys.PROXY_STATE, proxy_states.PASSIVE, __iced_deferrals.defer({
                  assign_fn: (function() {
                    return function() {
                      return proxyState = arguments[0];
                    };
                  })(),
                  lineno: 1139
                }));
                __iced_deferrals._fulfill();
              })(function() {
                if (proxyState === proxy_states.ACTIVE) {
                  deferredCallback(false, []);
                  return;
                }
                isHttp = port["type"] === "http";
                portNo = port["number"];
                (function(__iced_k) {
                  if (useSpdyAsDefault && isHttp) {
                    (function(__iced_k) {
_continue()
                    })(__iced_k);
                  } else {
                    return __iced_k();
                  }
                })(function() {
                  (function(__iced_k) {
                    if (isHttp) {
                      (function(__iced_k) {
                        __iced_deferrals = new iced.Deferrals(__iced_k, {
                          parent: ___iced_passed_deferral,
                          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                        });
                        base.testHttpProxyEndpointValidity(host, portNo, constants.ENDPOINTS_TO_TEST, __iced_deferrals.defer({
                          assign_fn: (function() {
                            return function() {
                              return testResults = arguments[0];
                            };
                          })(),
                          lineno: 1149
                        }), function(progress) {
                          return progressCallback(parseInt(currentProgress + (progress / portArray.length)));
                        });
                        __iced_deferrals._fulfill();
                      })(__iced_k);
                    } else {
                      (function(__iced_k) {
                        __iced_deferrals = new iced.Deferrals(__iced_k, {
                          parent: ___iced_passed_deferral,
                          filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
                        });
                        base.testSpdyProxyEndpointValidity(host, portNo, constants.ENDPOINTS_TO_TEST, __iced_deferrals.defer({
                          assign_fn: (function() {
                            return function() {
                              return testResults = arguments[0];
                            };
                          })(),
                          lineno: 1152
                        }), function(progress) {
                          return progressCallback(parseInt(currentProgress + (progress / portArray.length)));
                        });
                        __iced_deferrals._fulfill();
                      })(__iced_k);
                    }
                  })(function() {
                    if (testResults.length > 0) {
                      portTestResult.push([port, testResults]);
                    }
                    i += 1;
                    progressCallback(parseInt(i / portArray.length * 100));
                    return _next(currentProgress = parseInt(i / portArray.length * 100));
                  });
                });
              });
            }
          };
          _while(__iced_k);
        })(function() {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/base.coffee"
            });
            base.getLocalData(keys.PROXY_STATE, proxy_states.PASSIVE, __iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return proxyState = arguments[0];
                };
              })(),
              lineno: 1161
            }));
            __iced_deferrals._fulfill();
          })(function() {
            if (proxyState === proxy_states.ACTIVE) {
              deferredCallback(false, []);
              return;
            }
            sortedArr = portTestResult.sort(function(a, b) {
              var aHttpBonus, bHttpBonus;
              aHttpBonus = a[0]["type"] === "http" ? 1 : 0;
              bHttpBonus = b[0]["type"] === "http" ? 1 : 0;
              return (aHttpBonus + a[1].length) - (bHttpBonus + b[1].length);
            });
            sortedArr = sortedArr.reverse();
            portPref = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = sortedArr.length; _i < _len; _i++) {
                p = sortedArr[_i];
                _results.push(p[0]["type"]);
              }
              return _results;
            })();
            return deferredCallback(true, portPref);
          });
        });
      };
    })(this));
  },
  resolve: function(name, deferredCallback) {
    return $.ajax({
      url: "https://dns.google.com/resolve?name=" + name,
      type: 'GET',
      dataType: 'json',
      timeout: final.SHORT_MS,
      success: function(data) {
        var _ref;
        return deferredCallback((_ref = data.Answer) != null ? _ref[0].data : void 0);
      },
      error: function() {
        return deferredCallback(null);
      }
    });
  }
};

module.exports = base;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/base.js","/")
},{"./config":6,"./constants":7,"./enum/final":8,"./enum/keys":9,"./enum/pages":10,"./enum/proxy_activation_errors":11,"./enum/proxy_loading_states":12,"./enum/proxy_states":13,"./messages/en":15,"buffer":2,"pBGvAp":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var config;

config = {
  GOM_CHROME_STORE_LINK: "https://chrome.google.com/webstore/detail/ckiahbcmlmkpfiijecbpflfahoimklke/reviews",
  GOM_SG_CHROME_STORE_LINK: "https://chrome.google.com/webstore/detail/lledpflfnanamkogoclkgaggfdgoalok/reviews",
  GOM_WEBSITE: "https://getgom.com",
  API_SUFFIX: "/api/v7",
  API_HOSTS: ["cAW0dWMJo7K3QQP+0p+q2O5ueJpDmjJkqesdVHpDb9g=", "hDWJWpx9rbZU/jUIZFBq8nmKrBPsElXXqFBPyLWWas/lC1rHos2EC1hl65Ow4N2T"],
  MIRROR_HOSTS: ["/dDbg7kWCY5I4sUSCzGk33uCqkQWkNuuCTvIn4bthtU="],
  API_HOSTS_WILDCARD: ["3Dzxn1v7+58yTnxRYJT21iaOzVpIkqt5CKqsrHiYhx8=", "AbdENVegqqNy+UyO3o0SIzU6QoSkmiSSUQNVOBXElPQ=", "jGmJ/y7ZxKHx89lfilx6qa4sIPcZnXyTFrnDyM8c8Fm8oDydwUi5w9y/Bmdq9TQQ"],
  DEV_API_HOST: "http://api-staging.gomcomm.com",
  DEV_WEBSITE: 'https://staging.getgom.com',
  PRODUCTION: true
};

module.exports = config;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/config.js","/")
},{"buffer":2,"pBGvAp":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var constants;

constants = {
  CRYPTOJS_KEY: '36ebe205bcdfc499a25e6923f4450fa8',
  CRYPTOJS_IV: 'be410fea41df7162a679875ec131cf2c',
  AJAX_TIMEOUT_MS: 15000,
  FAST_AJAX_TIMEOUT_MS: 5000,
  SECS_FOR_PROXY_TO_EXPIRE: 86400,
  PROXY_TYPE: 'spdy',
  API_SUFFIX: '/api/v7',
  SECS_PER_SPEED_BOOSTER_NAG: 1200,
  SECS_TILL_FIRST_SPEED_BOOSTER_NAG: 30,
  DEVICE_PLATFORM: 'chrome',
  DEFAULT_COUNTRY_CODE: 'us',
  DEFAULT_PRICES: {
    prices: {
      "pro": 4.99,
      "life": 199,
      "supreme": 3.33,
      "gold": 19.99
    },
    symbol: "$"
  },
  PRICING_PLANS: {
    PRO: "pro",
    SUPREME: "supreme",
    LIFE: "life",
    GOLD: "gold"
  },
  PRICING_PLAN_DURATION: {
    'pro': "Monthly",
    'supreme': "10 months term",
    'life': "Lifetime"
  },
  MAX_TRIES_FOR_IP_CHANGE: 5,
  ENDPOINTS_TO_TEST: ["u0t4h2/VUnVs1IlNaCPX5g==", "XMdXqVqksfgwvLQBG6GVdQ==", "ufCMhMb7MA+nCbJw35bWAg==", "G0l9FCY1HNndWaYJGhvcjw==", "FlkWdTKT7IMiNEUwanoiZw==", "v6bAsIIImRZOlA0ihFcMPA==", "65vZh2qMwbe4LkhWDZnn+g==", "6gn/T5qNttiyIoMCailtyA==", "2QNYDd+zYZAcZIvtP4YsoQ=="],
  DEFAULT_INSTALLED_ADDONS: [
    {
      bypass_entity: "Gom VPN's Website",
      title: "GetGom.com",
      description: "Bypasses getgom.com automatically if getgom.com is blocked",
      orig_wildcard_domains: ["getgom.com*"],
      url_domains: ["getgom.com.*"],
      id: "getgom.com"
    }
  ],
  DEFAULT_SUGGESTED_ADDONS: [
    {
      bypass_entity: "Netflix - Bypass a US-only movie streaming service",
      title: "Netflix-Ninja",
      description: "Bypasses Netflix",
      orig_wildcard_domains: ["*netflix.com*"],
      url_domains: [".*netflix.com.*"],
      id: "netflix.com"
    }, {
      bypass_entity: "Pandora - Bypass a US-only free music radio streaming service",
      title: "Pandora-Panda",
      description: "Bypasses Pandora",
      orig_wildcard_domains: ["*pandora.com*"],
      url_domains: [".*pandora.com.*"],
      id: "pandora.com"
    }
  ],
  GOM_SG_NAME: "Go away MDA - Bypass MDA blocked sites",
  EMAIL_ADMIN_URL: "mailto:go@getgom.com?subject=Server+issue",
  DEFAULT_FREE_TIER_MINS: 15,
  FREE_TIER_RECHARGE_MINS: 0.5,
  DEFAULT_CUMULATIVE_USAGE: {
    seconds: 0,
    lastTick: new Date().getTime() / 1000,
    waitedSeconds: 0
  }
};

module.exports = constants;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/constants.js","/")
},{"buffer":2,"pBGvAp":4}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var final;

final = {
  LONG_MS: 10000,
  SHORT_MS: 7000
};

module.exports = final;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/final.js","/enum")
},{"buffer":2,"pBGvAp":4}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var keys;

keys = {
  HAS_TOUCHED_DEVICE_ID: 'has_touched_device_id',
  USE_SPDY_DEFAULT: "proxies_use_spdy_default",
  PORT_PREFERENCE_LIST: "port_preference_list",
  NEEDS_VERIFICATION: "needs_verification",
  SIGN_IN_CACHED_EMAIL: "sign_in_cached_email",
  INSTANT_TRIAL_EXPIRY_EPOCH: "instant_trial_expiry_epoch",
  INSTANT_TRIAL_STARTED_EPOCH: "instant_trial_started_epoch",
  API_HOST_PING_RESULTS: "api_host_ping_results",
  SHOW_UPGRADE_WINDOW_IN_OPTIONS: "show_upgrade_options",
  HAS_SHOWN_ANXIETY_NOTIFICATION_30MIN: "has_shown_anxiety_notification_30min",
  HAS_SHOWN_ANXIETY_NOTIFICATION_30MIN: "has_shown_anxiety_notification_30min",
  HAS_SHOWN_ANXIETY_NOTIFICATION_5MIN: "has_shown_anxiety_notification_5min",
  HAS_SHOWN_ANXIETY_NOTIFICATION_1MIN: "has_shown_anxiety_notification_1min",
  LAST_ACTIVATION_TIMESTAMP: "last_activation_timestamp",
  ACTIVATION_TIMESTAMP_LOGS: "activation_timestamp_logs",
  DAILY_HOURLY_LIMIT: "daily_hourly_limit",
  DAILY_MINUTE_LIMIT: "daily_minute_limit",
  HAS_CHOSEN_PLAN: "has_chosen_plan",
  SPDY_AUTH_CREDS: "spdy_auth_creds",
  IS_MAKING_PAYMENT: "is_making_payment",
  PRICING: "pricing",
  COUNTRY: "country",
  PROXY_DURATION: "proxy_duration",
  GOM_BUTTON_PRESS_COUNT: "gom_button_press_count",
  HAS_ACCOUNT_ISSUES: "has_account_issues",
  SUGGESTED_ADDONS: "suggested_addons",
  ADDONS: "installed_addons",
  IS_HOW_TO_USE_OPTION_TOOLTIP_HIDDEN: "is_how_to_use_option_tooltip_hidden",
  COUNTRY: "country",
  HIDE_INCOG_TOOLTIP: "hide_incog_tooltip",
  HAS_RATED_GOM: "has_rated_gom",
  CACHED_ACCOUNT_INFO: "cached_account_info",
  CACHED_PAYMENT_PLAN: "cached_payment_plan",
  CACHED_PAYMENT_CREDIT: "cached_payment_credit",
  CACHED_GOLD: "cached_gold_info",
  CACHED_PROXY_OBJ: "cached_proxy_obj",
  PAYMENT_URL: "payment_url",
  SAASY_PAYMENT_URL: "saasy_payment_url",
  EMAIL: "gom4_email",
  PASSWORD: "gom4_passwd",
  ACCESS_TOKEN: "gom4_access_token",
  CACHED_TOKEN: "cached_token",
  CACHED_EMAIL: "cached_email",
  USER_ID: "user_id",
  DEVICE_ID: "device_id",
  SERVICE_TOKEN: "service_token",
  HAS_SHOWN_TIPS: "has_shown_tips",
  PROXY_STATE: "proxy_state",
  LOAD_PROXY_STATE: "proxy_loading_state",
  PROXY_STARTED_UNIX_TIMESTAMP: "proxy_started_unix_timestamp",
  PRICING_FEE: "pricing_fee",
  PRICING_RAW: "pricing_raw",
  PRICING_TOTAL: "pricing_total",
  PRICING_PLAN: "pricing_plan",
  LAST_FREE_PLAN_NAG_TIMESTAMP: "last_speed_booster_nag_timestamp",
  PROXY_FETCH_TIMESTAMP: "proxy_fetch_timestamp",
  IS_RESETTING: "is_resetting",
  RELOAD_COUNT: "reload_count",
  FREE_TIER_MINS: "free_tier_mins",
  FREE_TIER_RECHARGE_MINS: "free_tier_recharge_mins",
  HAS_ALREADY_INVITED_USERS: "has_invited_users",
  ACTIVATION_USAGE: 'activation_usage'
};

module.exports = keys;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/keys.js","/enum")
},{"buffer":2,"pBGvAp":4}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var pages;

pages = {
  POPUP: {
    SIGN_IN: '/pages/popups/sign_in.html',
    COUNTDOWN: '/pages/popups/free_tier_countdown.html',
    ACTIVATION: '/pages/popups/activation.html',
    DISCONNECT: '/pages/popups/disconnect.html',
    VERIFY_EMAIL: '/pages/popups/verify_email.html',
    DONE_WITH_PAYMENT: '/pages/popups/done_with_payment.html'
  },
  OPTIONS: '/pages/options.html',
  SIGN_IN: '/pages/sign_in.html',
  PRICING: '/pages/pricing.html',
  REGISTRATION_PASSWORD: '/pages/register.html',
  REPAIR: '/pages/repair.html',
  REGISTRATION_SIGN_IN_PASSWD: '/pages/sign_in_w_password.html',
  HOW_TO_USE: '/pages/begin_using.html',
  TIP: '/pages/tip.html',
  QUOTATION: '/pages/quotation.html',
  INVITE: '/pages/invite.html',
  INVITE_SUCCESS: '/pages/successfully_invited.html',
  GOLD_PROMOTION: '/pages/gold.html'
};

module.exports = pages;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/pages.js","/enum")
},{"buffer":2,"pBGvAp":4}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var errors;

errors = {
  CONFLICTING_EXTENSION: "conflicitng_extension",
  REQUIRE_EMAIL_VERIFICATION: "require_email_verification",
  NETWORK_ERROR: "network_error"
};

module.exports = errors;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/proxy_activation_errors.js","/enum")
},{"buffer":2,"pBGvAp":4}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var proxy_loading_state;

proxy_loading_state = {
  LOADING: 'loading',
  SUCCESS: 'success',
  NETWORK_ERROR: 'network_error'
};

module.exports = proxy_loading_state;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/proxy_loading_states.js","/enum")
},{"buffer":2,"pBGvAp":4}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var proxy_state;

proxy_state = {
  ACTIVE: 'active',
  PASSIVE: 'passive'
};

module.exports = proxy_state;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/enum/proxy_states.js","/enum")
},{"buffer":2,"pBGvAp":4}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var base, keys, pages;

base = require('./base');

keys = require('./enum/keys');

pages = require('./enum/pages');

$(document).ready(function() {
  return $("#done-with-payment-btn").on("click", function() {
    return base.openPage(pages.OPTIONS);
  });
});

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_2230c1d4.js","/")
},{"./base":5,"./enum/keys":9,"./enum/pages":10,"buffer":2,"pBGvAp":4}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var messages;

messages = {
  TRYING_GOM: "You are currently trying Gom",
  TRIAL_WILL_EXPIRE: "Your trial will expire in %{duration}",
  SIGN_IN_FOR_FULL_GOM: "Sign in for the full Gom experience",
  SIGNING_YOU_IN: "Signing you in..",
  SYNCING_ACCOUNT_INFO: "Syncing account info..",
  ANXIETY_BODY_CTA: "Get more time",
  ANXIETY_TITLE_30MINS: "30 minutes left",
  ANXIETY_BODY: "You can currently on the Free plan. You can use Gom for %{hour} hour(s) / day.",
  ANXIETY_TITLE_5MINS: "5 minutes left",
  ANXIETY_TITLE_1MIN: "1 minute left",
  ANXIETY_TITLE_EXPIRE: "Gom is paused",
  ANXIETY_BODY_EXPIRE: "You have finished your daily free limit of Gom",
  GOM_PREVIEW_EXPIRED: "Sign in to begin",
  SIGN_IN_TO_CONTINUE_GOM: "Immediately bypass blocked sites",
  VIEW_ADDONS: "See all installed addons",
  SMART_VPN_ENABLED: "Gom enabled",
  SUCCESS_MSG: "Enter your favourite blocked site's URL and enjoy absolute freedom!",
  ERROR_CONTACTING_SERVER: "There is an error trying to contact the server. Please try again later!",
  SHOW_ALL_EXTS: "Show all extensions",
  DISABLE_OTHER_EXTENSIONS: "Please disable other extensions to use Gom",
  OTHER_EXTENSIONS_USING: "Other extensions are preventing Gom from being enabled",
  RATE_5_STARS: "Do you find Gom useful? Help rate Gom 5 stars :)",
  ERROR_ENABLING_GOM: "Error activating Gom",
  ISSUES: "There are issues with your account",
  EMAIL_ADMIN: "Email admin",
  OOPS: "Oops",
  ALLOW_INCOGNITO: "Enable Gom to be used in Incognito mode",
  REINSTALL_GOM: "Oops, there seems to be an issue with Gom. Please reinstall Gom at http://getgom.com",
  NO_MORE_INSTANT_TRIAL: "Instant trial is not available for this device. Please sign in to continue using Gom.",
  ACTIVATE_GOM: "Activate Gom VPN",
  DISCONNECT_GOM: "Disconnect Gom",
  GETTING_PERMISSION: "Getting permission to log you in..",
  SIGNIN_ERROR: "There is an error signing you in. Either your email or your password is incorrect.",
  SEAMLESS_SIGN_IN_ERROR: "There are issues signing you in.\n\n\nClick on Sign In, of which there should be a popup asking you to authorize Google to sign you into GOM. You must click OK.\n\n\n\nIf your Chrome is not synced with a Gmail account, it will open a new window asking you to sign into your Gmail account. Of which you should do that, and then you will be logged into GOM.",
  SERVER_ERROR: "There seems to be an error communicating with the server. Please try again later.",
  REGISTRATION_ERROR: "Oops, there is an error registering your account. It could either be that the account already exists, or that we cannot contact the server. Please try again later!",
  STREAM_MUSIC_AND_FASTER_FASTER: "Stream music and videos faster",
  GOM_VPN_UPGRADED: "Gom VPN is now upgraded to super-fast 1000gbit speeds",
  SIGN_IN_FOR_UNINTERRUPTED_ACCESS: "Sign in for uninterrupted access",
  NOT_SIGNED_IN: "You are currently not signed in",
  ON_FREE_PLAN: "You are on Gom's free plan",
  GO_PRO_FOR_UNINTERRUPTED_ACCESS: "Upgrade to Pro for uninterrupted access",
  GOM_TURNED_OFF: "Gom is now turned off",
  USED_BEYOND_FREE_TIER: "You have just used {{free_tier_mins}} minutes of Gom, and will have to wait {{recharge_mins}} minutes before you can use Gom again",
  ACQUIRING_CONTACTS: "Getting permissions to fetch your contacts...",
  ACQUIRE_CONTACTS_SCOPE_ERROR: "There was an issue retriving your contacts. Please refresh the page and click OK when asked to authorize Gom in order to proceed.",
  INVITE_CONTACTS_SUCCESS: "Successfully invited your contacts to Gom. You will receive Pro credits when your friends accept your invite",
  ACCEPTING_INVITE: "Extending your free trial because you accepted an invite",
  ENCRYPTION_TURN_OFF: "(Turn off for more speed)",
  ENCRYPTION_TURN_ON: "(Turn on for more security)"
};

module.exports = messages;

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/messages/en.js","/messages")
},{"buffer":2,"pBGvAp":4}]},{},[14])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvdG1wL2Jhc2UuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9jb25maWcuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9jb25zdGFudHMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9lbnVtL2ZpbmFsLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvZW51bS9rZXlzLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvZW51bS9wYWdlcy5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvdG1wL2VudW0vcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9lbnVtL3Byb3h5X2xvYWRpbmdfc3RhdGVzLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvZW51bS9wcm94eV9zdGF0ZXMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9mYWtlXzIyMzBjMWQ0LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvbWVzc2FnZXMvZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1K0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanNcIixcIi8uLi9ub2RlX21vZHVsZXMvaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBiYXNlLCBjb25maWcsIGNvbnN0YW50cywgZW5fbWVzc2FnZXMsIGZpbmFsLCBpY2VkLCBrZXlzLCBwYWdlcywgcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMsIHByb3h5X2xvYWRpbmdfc3RhdGVzLCBwcm94eV9zdGF0ZXMsIF9faWNlZF9rLCBfX2ljZWRfa19ub29wLFxuICBfX3NsaWNlID0gW10uc2xpY2U7XG5cbmljZWQgPSB7XG4gIERlZmVycmFsczogKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9DbGFzcyhfYXJnKSB7XG4gICAgICB0aGlzLmNvbnRpbnVhdGlvbiA9IF9hcmc7XG4gICAgICB0aGlzLmNvdW50ID0gMTtcbiAgICAgIHRoaXMucmV0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBfQ2xhc3MucHJvdG90eXBlLl9mdWxmaWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIS0tdGhpcy5jb3VudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250aW51YXRpb24odGhpcy5yZXQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBfQ2xhc3MucHJvdG90eXBlLmRlZmVyID0gZnVuY3Rpb24oZGVmZXJfcGFyYW1zKSB7XG4gICAgICArK3RoaXMuY291bnQ7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgaW5uZXJfcGFyYW1zLCBfcmVmO1xuICAgICAgICAgIGlubmVyX3BhcmFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IF9fc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICAgICAgaWYgKGRlZmVyX3BhcmFtcyAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoKF9yZWYgPSBkZWZlcl9wYXJhbXMuYXNzaWduX2ZuKSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgIF9yZWYuYXBwbHkobnVsbCwgaW5uZXJfcGFyYW1zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF90aGlzLl9mdWxmaWxsKCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIF9DbGFzcztcblxuICB9KSgpLFxuICBmaW5kRGVmZXJyYWw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9LFxuICB0cmFtcG9saW5lOiBmdW5jdGlvbihfZm4pIHtcbiAgICByZXR1cm4gX2ZuKCk7XG4gIH1cbn07XG5fX2ljZWRfayA9IF9faWNlZF9rX25vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG5jb25maWcgPSByZXF1aXJlKCcuL2NvbmZpZycpO1xuXG5maW5hbCA9IHJlcXVpcmUoJy4vZW51bS9maW5hbCcpO1xuXG5rZXlzID0gcmVxdWlyZSgnLi9lbnVtL2tleXMnKTtcblxucHJveHlfc3RhdGVzID0gcmVxdWlyZSgnLi9lbnVtL3Byb3h5X3N0YXRlcycpO1xuXG5wcm94eV9sb2FkaW5nX3N0YXRlcyA9IHJlcXVpcmUoJy4vZW51bS9wcm94eV9sb2FkaW5nX3N0YXRlcycpO1xuXG5wcm94eV9hY3RpdmF0aW9uX2Vycm9ycyA9IHJlcXVpcmUoJy4vZW51bS9wcm94eV9hY3RpdmF0aW9uX2Vycm9ycycpO1xuXG5wYWdlcyA9IHJlcXVpcmUoJy4vZW51bS9wYWdlcycpO1xuXG5lbl9tZXNzYWdlcyA9IHJlcXVpcmUoJy4vbWVzc2FnZXMvZW4nKTtcblxuY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxuYmFzZSA9IHtcbiAgaGVsbG9Xb3JsZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiaGVsbG8gd29ybGRcIik7XG4gIH0sXG4gIGFjY2VwdEludml0ZTogZnVuY3Rpb24oaW52aXRlVG9rZW4sIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgc2VydmljZVRva2VuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRBcGlIb3N0KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYXBpSG9zdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDE2XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDE3XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vycy9pbnZpdGUvYWNjZXB0XCIsXG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgIHNlcnZpY2VfdG9rZW46IHNlcnZpY2VUb2tlbixcbiAgICAgICAgICAgICAgaW52aXRlX3Rva2VuOiBpbnZpdGVUb2tlblxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICByZWRpcmVjdDogZnVuY3Rpb24odXJsKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmxvY2F0aW9uLmhyZWYgPSB1cmw7XG4gIH0sXG4gIGdldENob21lV2Vic3RvcmVVcmw6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYW5pZmVzdDtcbiAgICBtYW5pZmVzdCA9IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCk7XG4gICAgaWYgKG1hbmlmZXN0Lm5hbWUgPT09IGNvbnN0YW50cy5HT01fU0dfTkFNRSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5HT01fU0dfQ0hST01FX1NUT1JFX0xJTks7XG4gICAgfVxuICAgIHJldHVybiBjb25maWcuR09NX0NIUk9NRV9TVE9SRV9MSU5LO1xuICB9LFxuICBvcGVuUGFnZTogZnVuY3Rpb24ocGFnZSwgZm9jdXNPblRhYikge1xuICAgIGlmIChmb2N1c09uVGFiID09IG51bGwpIHtcbiAgICAgIGZvY3VzT25UYWIgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gY2hyb21lLnRhYnMuY3JlYXRlKHtcbiAgICAgIHVybDogcGFnZSxcbiAgICAgIGFjdGl2ZTogZm9jdXNPblRhYlxuICAgIH0pO1xuICB9LFxuICBhZGRBZGRvblRvSW5zdGFsbExpc3Q6IGZ1bmN0aW9uKGFkZG9uLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGluc3RhbGxlZEFEZG9ucywgaXNTZXQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkFERE9OUywgW10sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFsbGVkQURkb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNDZcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaW5zdGFsbGVkQURkb25zLnB1c2goYWRkb24pO1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQURET05TLCBpbnN0YWxsZWRBRGRvbnMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaXNTZXQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA0OFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGlzU2V0KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgcm1BZGRvblRvSW5zdGFsbExpc3Q6IGZ1bmN0aW9uKGFkZG9uSWQsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYWRkb24sIGluc3RhbGxlZEFEZG9ucywgbmV3TGxpcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQURET05TLCBbXSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YWxsZWRBRGRvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA1MlxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2ksIF9sZW47XG4gICAgICAgIG5ld0xsaXMgPSBbXTtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBpbnN0YWxsZWRBRGRvbnMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBhZGRvbiA9IGluc3RhbGxlZEFEZG9uc1tfaV07XG4gICAgICAgICAgaWYgKGFkZG9uW1wiaWRcIl0gIT09IGFkZG9uSWQpIHtcbiAgICAgICAgICAgIG5ld0xsaXMucHVzaChhZGRvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5BRERPTlMsIG5ld0xsaXMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgbGluZW5vOiA1N1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGlzQWRkb25JZEluc3RhbGxlZDogZnVuY3Rpb24oYWRkb25JZCwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBhZGRvbiwgaW5zdGFsbGVkQWRkb25zLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5BRERPTlMsIFtdLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbGxlZEFkZG9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDYxXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfaSwgX2xlbjtcbiAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBpbnN0YWxsZWRBZGRvbnMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICBhZGRvbiA9IGluc3RhbGxlZEFkZG9uc1tfaV07XG4gICAgICAgICAgaWYgKGFkZG9uW1wiaWRcIl0gPT09IGFkZG9uSWQpIHtcbiAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICByZXNlbmRWZXJpZmljYXRpb25FbWFpbDogZnVuY3Rpb24oZW1haWwsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA2OVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnMvZW1haWwvdmVyaWZpY2F0aW9uXCIsXG4gICAgICAgICAgYWx0OiBcImpzb25cIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBlbWFpbDogZW1haWxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHJlbG9hZFNwZHlQcm94eTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByb3h5U3RhdGUsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuXG4gICAgLyogY2xlYXJzIHByb3h5IHNldHRpbmdzLCBhbmQgc2V0IGl0IGFnYWluICh0byBpdCdzIGN1cnJlbnQgc3RhdGUpICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBVEUsIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJveHlTdGF0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDg2XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGJhc2UuY2xlYXJTcGR5UHJveHkoKTtcbiAgICAgICAgcmV0dXJuIGJhc2UudG9nZ2xlU3BkeVByb3h5QWN0aXZhdGlvbihwcm94eVN0YXRlID09PSBwcm94eV9zdGF0ZXMuQUNUSVZFKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBmZXRjaFByaWNpbmc6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgY291bnRyeSwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ09VTlRSWSwgY29uc3RhbnRzLkRFRkFVTFRfQ09VTlRSWV9DT0RFLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvdW50cnkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA5MlxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA5M1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkZBU1RfQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3BheW1lbnRzL3ByaWNpbmdcIixcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBjb3VudHJ5OiBjb3VudHJ5XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGNvbnN0YW50cy5ERUZBVUxUX1BSSUNFUyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGlzTG9naW5lZDogZnVuY3Rpb24oZGVmZXJDYWxsYmFjaykge1xuICAgIHZhciBhY2NvdW50SW5mbywgZW1haWwsIHBheW1lbnRDcmVkaXQsIHBheW1lbnRQbGFuLCBzZXJ2aWNlVG9rZW4sIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlckNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVyQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLyogY2hlY2tzIGlmIHRoZSBjdXJyZW50IHVzZXIgaGFzIHNpZ25lZCBpbnRvIGdvbSAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlNFUlZJQ0VfVE9LRU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VydmljZVRva2VuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMTA5XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfRU1BSUwsIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW1haWwgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiAxMTBcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9BQ0NPVU5UX0lORk8sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYWNjb3VudEluZm8gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiAxMTFcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX0NSRURJVCwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXltZW50Q3JlZGl0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgIGxpbmVubzogMTEyXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9QTEFOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRQbGFuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgIGxpbmVubzogMTEzXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyQ2FsbGJhY2soKHR5cGVvZiBzZXJ2aWNlVG9rZW4gIT09IFwidW5kZWZpbmVkXCIgJiYgc2VydmljZVRva2VuICE9PSBudWxsKSAmJiAodHlwZW9mIGVtYWlsICE9PSBcInVuZGVmaW5lZFwiICYmIGVtYWlsICE9PSBudWxsKSAmJiAodHlwZW9mIGFjY291bnRJbmZvICE9PSBcInVuZGVmaW5lZFwiICYmIGFjY291bnRJbmZvICE9PSBudWxsKSAmJiAodHlwZW9mIHBheW1lbnRDcmVkaXQgIT09IFwidW5kZWZpbmVkXCIgJiYgcGF5bWVudENyZWRpdCAhPT0gbnVsbCkgJiYgKHR5cGVvZiBwYXltZW50UGxhbiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwYXltZW50UGxhbiAhPT0gbnVsbCkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBnZXRVc2VyRW1haWxGcm9tQXV0aFRva2VuOiBmdW5jdGlvbih0b2tlbiwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICB1cmw6IFwiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YyL3VzZXJpbmZvXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGFsdDogXCJqc29uXCIsXG4gICAgICAgIGFjY2Vzc190b2tlbjogdG9rZW5cbiAgICAgIH0sXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIGVtYWlsO1xuICAgICAgICBlbWFpbCA9IGRhdGFbXCJlbWFpbFwiXTtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZW1haWwpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2sobnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIHNpZ25JblZpYU9hdXRoOiBmdW5jdGlvbihhY2Nlc3NUb2tlbiwgZW1haWwsIGRlZmVyQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgZGV2aWNlSWQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlckNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVyQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLyogU2lnbnMgYSB1c2VyIGluIHZpYSBPYXV0aDIncyBhY2Nlc3MgdG9rZW4sIHJldHVybnMgYSBgc2VydmljZVRva2VuYCAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkRFVklDRV9JRCwgYmFzZS5nZW5VdWlkKCksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGV2aWNlSWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxMzRcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMTM1XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vycy9vYXV0aFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBvYXV0aF90b2tlbjogYWNjZXNzVG9rZW4sXG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgZGV2aWNlX2lkOiBkZXZpY2VJZCxcbiAgICAgICAgICAgICAgZGV2aWNlX3BsYXRmb3JtOiBjb25zdGFudHMuREVWSUNFX1BMQVRGT1JNXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIHZhciBzZXJ2aWNlVG9rZW47XG4gICAgICAgICAgICAgIHNlcnZpY2VUb2tlbiA9IGRhdGFbXCJzZXJ2aWNlX3Rva2VuXCJdO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlVTRVJfSUQsIGRhdGFbXCJhY2NvdW50X2luZm9cIl1bXCJpZFwiXSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuRU1BSUwsIGRhdGFbXCJhY2NvdW50X2luZm9cIl1bXCJlbWFpbFwiXSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgc2VydmljZVRva2VuKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFSVEVEX1VOSVhfVElNRVNUQU1QLCBiYXNlLm5vdygpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVyQ2FsbGJhY2soc2VydmljZVRva2VuKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGRlZmVyQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgIHJldHVybiBiYXNlLnBpbmdBbGxBcGlIb3N0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpbnZpdGVDb250YWN0czogZnVuY3Rpb24oYWNjZXNzVG9rZW4sIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgc2VydmljZVRva2VuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDE1OVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiAxNjBcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3VzZXJzL2ludml0ZV9jb250YWN0c1wiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBzZXJ2aWNlX3Rva2VuOiBzZXJ2aWNlVG9rZW4sXG4gICAgICAgICAgICAgIGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3M7XG4gICAgICAgICAgICAgIHN1Y2Nlc3MgPSBkYXRhW1wic3VjY2Vzc1wiXTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soc3VjY2Vzcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhmYWxzZSwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHN5bmM6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgc2VydmljZVRva2VuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDE3N1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIHNlcnZpY2VUb2tlbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBzZXJ2aWNlVG9rZW4gPT09IG51bGwpIHtcbiAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMTgyXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB0aW1lb3V0OiBiYXNlLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vyc1wiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBzZXJ2aWNlX3Rva2VuOiBzZXJ2aWNlVG9rZW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgdmFyIGFjY291bnRJbmZvLCBnb2xkLCBwYXltZW50Q3JlZGl0LCBwYXltZW50UGxhbjtcbiAgICAgICAgICAgICAgYWNjb3VudEluZm8gPSBkYXRhW1wiYWNjb3VudF9pbmZvXCJdO1xuICAgICAgICAgICAgICBwYXltZW50UGxhbiA9IGRhdGFbXCJwYXltZW50X3BsYW5cIl07XG4gICAgICAgICAgICAgIHBheW1lbnRDcmVkaXQgPSBkYXRhW1wicGF5bWVudF9jcmVkaXRcIl07XG4gICAgICAgICAgICAgIGdvbGQgPSBkYXRhW1wiZ29sZFwiXTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfQUNDT1VOVF9JTkZPLCBhY2NvdW50SW5mbyk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BBWU1FTlRfUExBTiwgcGF5bWVudFBsYW4pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX0NSRURJVCwgcGF5bWVudENyZWRpdCk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX0dPTEQsIGdvbGQpO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLk5FRURTX1ZFUklGSUNBVElPTiwgIWRhdGFbXCJ2ZXJpZmllZFwiXSk7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICAgIHJldHVybiBiYXNlLnBpbmdBbGxBcGlIb3N0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc1BheW1lbnROZWVkZWQ6IGZ1bmN0aW9uKGRlZmVyQ2FsbGJhY2spIHtcbiAgICB2YXIgZGlmZiwgZXhwaXJ5X2Vwb2NoLCBwYXltZW50UGxhbiwgcGF5bWVudFRpbWVDcmVkaXQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlckNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVyQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLyogY2hlY2tzIGlmIHRoaXMgdXNlciBpcyBhIGZyZWUgdXNlciAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX1BMQU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGF5bWVudFBsYW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAyMDhcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCh0eXBlb2YgcGF5bWVudFBsYW4gIT09IFwidW5kZWZpbmVkXCIgJiYgcGF5bWVudFBsYW4gIT09IG51bGwpICYmIFwic3RhdHVzXCIgaW4gcGF5bWVudFBsYW4gJiYgcGF5bWVudFBsYW4uc3RhdHVzID09PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgIGRlZmVyQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BBWU1FTlRfQ1JFRElULCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRUaW1lQ3JlZGl0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMjEzXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBwYXltZW50VGltZUNyZWRpdCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwYXltZW50VGltZUNyZWRpdCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgZXhwaXJ5X2Vwb2NoID0gcGF5bWVudFRpbWVDcmVkaXRbXCJjcmVkaXRfZXhwaXJ5X2Vwb2NoXCJdO1xuICAgICAgICAgICAgZGlmZiA9IHBhcnNlSW50KGV4cGlyeV9lcG9jaCkgLSBiYXNlLm5vdygpO1xuICAgICAgICAgICAgZGVmZXJDYWxsYmFjayhkaWZmIDw9IDApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJDYWxsYmFjayh0cnVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgbG9nOiBmdW5jdGlvbihtc2cpIHtcbiAgICByZXR1cm4gY2hyb21lLmV4dGVuc2lvbi5nZXRCYWNrZ3JvdW5kUGFnZSgpLmdvbS5sb2cobXNnKTtcbiAgfSxcbiAgc2hvd1NpZ25Jbk5hZ05vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmF1bHRGcmVlVGllck1pbnMsIG1pbnNMZWZ0LCBtaW5zU2luY2VBY3RpdmF0aW9uLCBwcm94eVN0YXJ0ZWRVbml4VGltZXN0YW1wLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFSVEVEX1VOSVhfVElNRVNUQU1QLCAwLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3h5U3RhcnRlZFVuaXhUaW1lc3RhbXAgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAyMjVcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkZSRUVfVElFUl9NSU5TLCBjb25zdGFudHMuREVGQVVMVF9GUkVFX1RJRVJfTUlOUywgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0RnJlZVRpZXJNaW5zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMjI2XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbWluc1NpbmNlQWN0aXZhdGlvbiA9IChiYXNlLm5vdygpIC0gcHJveHlTdGFydGVkVW5peFRpbWVzdGFtcCkgLyA2MDtcbiAgICAgICAgICBtaW5zTGVmdCA9IGRlZmF1bHRGcmVlVGllck1pbnMgLSBtaW5zU2luY2VBY3RpdmF0aW9uO1xuICAgICAgICAgIHJldHVybiBiYXNlLnNob3dSaWNoTm90aWZpY2F0aW9uKGVuX21lc3NhZ2VzLk5PVF9TSUdORURfSU4sIFwiR29tIHdpbGwgZGlzY29ubmVjdCBpbiBcIiArIChwYXJzZUludChtaW5zTGVmdCkpICsgXCIgbWludXRlc1wiLCBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRpdGxlOiBlbl9tZXNzYWdlcy5TSUdOX0lOX0ZPUl9VTklOVEVSUlVQVEVEX0FDQ0VTUyxcbiAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShwYWdlcy5TSUdOX0lOLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzaG93RnJlZVRpZXJEZWFjdGl2YXRpb25Ob3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBidG5zLCBpc0xvZ2luZWQsIGlzUGF5bWVudE5lZWRlZCwgcmVjaGFyZ2VNaW5zLCBzZWNvbmRzLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5pc1BheW1lbnROZWVkZWQoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpc1BheW1lbnROZWVkZWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAyMzdcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmlzTG9naW5lZChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTG9naW5lZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDIzOFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuRlJFRV9USUVSX1JFQ0hBUkdFX01JTlMsIGNvbnN0YW50cy5GUkVFX1RJRVJfUkVDSEFSR0VfTUlOUywgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiByZWNoYXJnZU1pbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiAyMzlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGJ0bnMgPSBbXTtcbiAgICAgICAgICAgIGlmICghaXNMb2dpbmVkKSB7XG4gICAgICAgICAgICAgIGJ0bnMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLlNJR05fSU5fRk9SX1VOSU5URVJSVVBURURfQUNDRVNTLFxuICAgICAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLm9wZW5QYWdlKHBhZ2VzLlNJR05fSU4sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNQYXltZW50TmVlZGVkKSB7XG4gICAgICAgICAgICAgIGJ0bnMgPSBbXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLkdPX1BST19GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1MsXG4gICAgICAgICAgICAgICAgICBpY29uOiBcIi9hc3NldHMvaW1hZ2VzL2dyZWVuX3JvdW5kX3RpY2sucG5nXCIsXG4gICAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UocGFnZXMuUFJJQ0lORywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2Vjb25kcyA9IHBhcnNlSW50KHJlY2hhcmdlTWlucyAqIDYwKTtcbiAgICAgICAgICAgIHJldHVybiBiYXNlLnNob3dSaWNoTm90aWZpY2F0aW9uKGVuX21lc3NhZ2VzLkdPTV9UVVJORURfT0ZGLCBcIllvdSBjYW4gYWN0aXZhdGUgR29tIGFnYWluIGluIFwiICsgc2Vjb25kcyArIFwiIHNlY29uZHNcIiwgYnRucyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHNob3dHb1Byb05hZ05vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN1bVVzYWdlLCBkaWZmU2VjcywgZnJlZVRpZXJNaW5zLCBtaW5zLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5GUkVFX1RJRVJfTUlOUywgY29uc3RhbnRzLkRFRkFVTFRfRlJFRV9USUVSX01JTlMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnJlZVRpZXJNaW5zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjYxXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5BQ1RJVkFUSU9OX1VTQUdFLCB7XG4gICAgICAgICAgICBzZWNvbmRzOiAwLFxuICAgICAgICAgICAgbGFzdFRpY2s6IGJhc2Uubm93KClcbiAgICAgICAgICB9LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1bVVzYWdlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMjYyXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZGlmZlNlY3MgPSBmcmVlVGllck1pbnMgKiA2MCAtIGN1bVVzYWdlLnNlY29uZHM7XG4gICAgICAgICAgbWlucyA9IHBhcnNlSW50KGRpZmZTZWNzIC8gNjApO1xuICAgICAgICAgIHJldHVybiBiYXNlLnNob3dSaWNoTm90aWZpY2F0aW9uKGVuX21lc3NhZ2VzLk9OX0ZSRUVfUExBTiwgXCJHb20gd2lsbCBkaXNjb25uZWN0IGluIFwiICsgbWlucyArIFwiIG1pbnV0ZXNcIiwgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuR09fUFJPX0ZPUl9VTklOVEVSUlVQVEVEX0FDQ0VTUyxcbiAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShwYWdlcy5QUklDSU5HLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBnZXRHb2xkTGVhcm5Nb3JlVXJsOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgd2Vic2l0ZVVybDtcbiAgICB3ZWJzaXRlVXJsID0gYmFzZS5nZXRXZWJzaXRlKCk7XG4gICAgcmV0dXJuIFwiXCIgKyB3ZWJzaXRlVXJsICsgXCIvZ29sZC9sZWFyblwiO1xuICB9LFxuICBnZXRHb2xkRGFzaGJvYXJkTG9naW5Vcmw6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgc2VydmljZVRva2VuLCB3ZWJzaXRlVXJsLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDI3N1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB3ZWJzaXRlVXJsID0gYmFzZS5nZXRXZWJzaXRlKCk7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VydmljZVRva2VuICE9PSBcInVuZGVmaW5lZFwiICYmIHNlcnZpY2VUb2tlbiAhPT0gbnVsbCkge1xuICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soXCJcIiArIHdlYnNpdGVVcmwgKyBcIi9nb2xkL2Rhc2hib2FyZC9sb2dpbi9zZXJ2aWNlX3Rva2VuP3NlcnZpY2VfdG9rZW49XCIgKyBzZXJ2aWNlVG9rZW4pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhcIlwiICsgd2Vic2l0ZVVybCArIFwiL2dvbGQvZGFzaGJvYXJkXCIpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHNob3dSZWNoYXJnZU5vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRlZmF1bHRGcmVlVGllck1pbnMsIG1lc3NhZ2UsIHJlY2hhcmdlTWlucywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuRlJFRV9USUVSX01JTlMsIGNvbnN0YW50cy5ERUZBVUxUX0ZSRUVfVElFUl9NSU5TLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmF1bHRGcmVlVGllck1pbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAyODVcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkZSRUVfVElFUl9SRUNIQVJHRV9NSU5TLCBjb25zdGFudHMuRlJFRV9USUVSX1JFQ0hBUkdFX01JTlMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjaGFyZ2VNaW5zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMjg2XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IGVuX21lc3NhZ2VzLlVTRURfQkVZT05EX0ZSRUVfVElFUi5yZXBsYWNlKFwie3tmcmVlX3RpZXJfbWluc319XCIsIGRlZmF1bHRGcmVlVGllck1pbnMpLnJlcGxhY2UoXCJ7e3JlY2hhcmdlX21pbnN9fVwiLCByZWNoYXJnZU1pbnMpO1xuICAgICAgICAgIHJldHVybiBiYXNlLnNob3dSaWNoTm90aWZpY2F0aW9uKGVuX21lc3NhZ2VzLk9OX0ZSRUVfUExBTiwgbWVzc2FnZSwgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuR09fUFJPX0ZPUl9VTklOVEVSUlVQVEVEX0FDQ0VTUyxcbiAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShwYWdlcy5QUklDSU5HLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc0luY29nbml0b1Blcm1pc3Npb25FbmFibGVkOiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGlzQWxsb3dlZCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNocm9tZS5leHRlbnNpb24uaXNBbGxvd2VkSW5jb2duaXRvQWNjZXNzKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaXNBbGxvd2VkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjk2XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGlzQWxsb3dlZCk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgc2hvd0FjdGl2YXRpb25Ob3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBidG5zLCBnb2xkLCBnb2xkRGFzaGJvYXJkTG9naW5VcmwsIGhhc1JhdGVkR29tLCBpc0luY29nbml0b0VuYWJsZWQsIGlzTG9naW5lZCwgaXNQYXltZW50TmVlZGVkLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5pc0xvZ2luZWQoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpc0xvZ2luZWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAzMDBcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmlzUGF5bWVudE5lZWRlZChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzUGF5bWVudE5lZWRlZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDMwMVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGJ0bnMgPSBbXTtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmlzSW5jb2duaXRvUGVybWlzc2lvbkVuYWJsZWQoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpc0luY29nbml0b0VuYWJsZWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiAzMDVcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghaXNJbmNvZ25pdG9FbmFibGVkKSB7XG4gICAgICAgICAgICAgIGJ0bnMucHVzaCh7XG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBlbl9tZXNzYWdlcy5BTExPV19JTkNPR05JVE8sXG4gICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShcImNocm9tZTovL2V4dGVuc2lvbnNcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkhBU19SQVRFRF9HT00sIGZhbHNlLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGhhc1JhdGVkR29tID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgIGxpbmVubzogMzE0XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIGlmICghaGFzUmF0ZWRHb20pIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfayhidG5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBcInRpdGxlXCI6IGVuX21lc3NhZ2VzLlJBVEVfNV9TVEFSUyxcbiAgICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgYmFzZS5vcGVuUGFnZShiYXNlLmdldENob21lV2Vic3RvcmVVcmwoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuSEFTX1JBVEVEX0dPTSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaXNMb2dpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKGJ0bnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuU0lHTl9JTl9GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1MsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBcIi9hc3NldHMvaW1hZ2VzL2dyZWVuX3JvdW5kX3RpY2sucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UocGFnZXMuU0lHTl9JTiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUGF5bWVudE5lZWRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soYnRucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuR09fUFJPX0ZPUl9VTklOVEVSUlVQVEVEX0FDQ0VTUyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBcIi9hc3NldHMvaW1hZ2VzL2dyZWVuX3JvdW5kX3RpY2sucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShwYWdlcy5QUklDSU5HLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5nZXRHb2xkRGFzaGJvYXJkTG9naW5VcmwoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnb2xkRGFzaGJvYXJkTG9naW5VcmwgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAzNDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9HT0xELCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsX2JhbGFuY2U6IDEwLjAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdvbGQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAzNDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfayhidG5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJXaXRoZHJhdyAkXCIgKyAoZ29sZC50b3RhbF9iYWxhbmNlLnRvRml4ZWQoMikpICsgXCIgZnJvbSB5b3VyIEdvbSBHb2xkIGJhbGFuY2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShnb2xkRGFzaGJvYXJkTG9naW5VcmwsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0pKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uuc2hvd1JpY2hOb3RpZmljYXRpb24oZW5fbWVzc2FnZXMuU01BUlRfVlBOX0VOQUJMRUQsIGVuX21lc3NhZ2VzLlNVQ0NFU1NfTVNHLCBidG5zKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaXNUYWJCbG9ja2VkOiBmdW5jdGlvbih0YWJJZCwgZGVmZXJDYWxsYmFjaykge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZGVmZXJDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlckNhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiSWQsIHtcbiAgICAgICAgZmlsZTogXCIuL2luamVjdC5qc1wiXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYklkLCB7XG4gICAgICAgICAgbWV0aG9kOiBcImlzQmxvY2tlZFwiXG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgaWYgKChyZXNwb25zZSAhPSBudWxsKSAmJiBcIm1ldGhvZFwiIGluIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBkZWZlckNhbGxiYWNrKChyZXNwb25zZS5tZXRob2QgPT09IFwiaXNCbG9ja2VkXCIpICYmIHJlc3BvbnNlLmJsb2NrZWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJDYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBlcnJvciA9IF9lcnJvcjtcbiAgICAgIHJldHVybiBkZWZlckNhbGxiYWNrKGZhbHNlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgbnVsbDtcbiAgICB9XG4gIH0sXG4gIHNpZ25JbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3ZCwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBhcGlIb3N0LCBkZXZpY2VJZCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuREVWSUNFX0lELCBiYXNlLmdlblV1aWQoKSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZXZpY2VJZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDM2OVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiAzNzBcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3VzZXJzL2F1dGhcIixcbiAgICAgICAgICAgIGFsdDogXCJqc29uXCIsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3ZCxcbiAgICAgICAgICAgICAgZGV2aWNlX2lkOiBkZXZpY2VJZCxcbiAgICAgICAgICAgICAgZGV2aWNlX3BsYXRmb3JtOiBjb25zdGFudHMuREVWSUNFX1BMQVRGT1JNXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICB2YXIgc2VydmljZVRva2VuO1xuICAgICAgICAgICAgICBzZXJ2aWNlVG9rZW4gPSBkYXRhW1wic2VydmljZV90b2tlblwiXTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5VU0VSX0lELCBkYXRhW1wiYWNjb3VudF9pbmZvXCJdW1wiaWRcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkVNQUlMLCBkYXRhW1wiYWNjb3VudF9pbmZvXCJdW1wiZW1haWxcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLk5FRURTX1ZFUklGSUNBVElPTiwgIWRhdGFbXCJ2ZXJpZmllZFwiXSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgc2VydmljZVRva2VuKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFSVEVEX1VOSVhfVElNRVNUQU1QLCBiYXNlLm5vdygpKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soc2VydmljZVRva2VuKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgIHJldHVybiBiYXNlLnBpbmdBbGxBcGlIb3N0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc0dvbGQ6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgZGlmZiwgZXhwaXJ5RXBvY2gsIHBheW1lbnRDcmVkaXQsIHBheW1lbnRQbGFuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIGNoZWNrcyBpZiB0aGlzIGN1cnJlbnQgdXNlciBpcyBhIGBQcm9gIGFjY291bnQgb3Igbm90LCBpdCBkZWZlcnMgZnJvbSBpc1BheW1lbnROZWVkZWQoKSBiZWNhdXNlIHRoZW4geW91IGNhbiBhbHNvIGJlIHRyaWFsIHdpdGggc29tZSB0cmlhbCBkYXlzICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BBWU1FTlRfQ1JFRElULCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRDcmVkaXQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA0MDBcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX1BMQU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bWVudFBsYW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA0MDFcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoKHR5cGVvZiBwYXltZW50Q3JlZGl0ID09PSBcInVuZGVmaW5lZFwiIHx8IHBheW1lbnRDcmVkaXQgPT09IG51bGwpIHx8ICh0eXBlb2YgcGF5bWVudFBsYW4gPT09IFwidW5kZWZpbmVkXCIgfHwgcGF5bWVudFBsYW4gPT09IG51bGwpKSB7XG4gICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXhwaXJ5RXBvY2ggPSBwYXltZW50Q3JlZGl0W1wiY3JlZGl0X2V4cGlyeV9lcG9jaFwiXTtcbiAgICAgICAgICBkaWZmID0gcGFyc2VJbnQoZXhwaXJ5RXBvY2gpIC0gYmFzZS5ub3coKTtcbiAgICAgICAgICBpZiAoXCJwbGFuXCIgaW4gcGF5bWVudFBsYW4gJiYgcGF5bWVudFBsYW5bXCJwbGFuXCJdID09PSBcImdvbGRcIiAmJiBkaWZmID4gMCkge1xuICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc1BybzogZnVuY3Rpb24oZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBkaWZmLCBleHBpcnlFcG9jaCwgcGF5bWVudENyZWRpdCwgcGF5bWVudFBsYW4sIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLyogY2hlY2tzIGlmIHRoaXMgY3VycmVudCB1c2VyIGlzIGEgYFByb2AgYWNjb3VudCBvciBub3QsIGl0IGRlZmVycyBmcm9tIGlzUGF5bWVudE5lZWRlZCgpIGJlY2F1c2UgdGhlbiB5b3UgY2FuIGFsc28gYmUgdHJpYWwgd2l0aCBzb21lIHRyaWFsIGRheXMgKi9cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9DUkVESVQsIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGF5bWVudENyZWRpdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDQxN1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BBWU1FTlRfUExBTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXltZW50UGxhbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDQxOFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfcmVmO1xuICAgICAgICAgIGlmICgodHlwZW9mIHBheW1lbnRDcmVkaXQgPT09IFwidW5kZWZpbmVkXCIgfHwgcGF5bWVudENyZWRpdCA9PT0gbnVsbCkgfHwgKHR5cGVvZiBwYXltZW50UGxhbiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBwYXltZW50UGxhbiA9PT0gbnVsbCkpIHtcbiAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBleHBpcnlFcG9jaCA9IHBheW1lbnRDcmVkaXRbXCJjcmVkaXRfZXhwaXJ5X2Vwb2NoXCJdO1xuICAgICAgICAgIGRpZmYgPSBwYXJzZUludChleHBpcnlFcG9jaCkgLSBiYXNlLm5vdygpO1xuICAgICAgICAgIGlmIChkaWZmID4gKDMxICogMjQgKiA2MCAqIDYwKSkge1xuICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKFwicGxhblwiIGluIHBheW1lbnRQbGFuICYmICgoX3JlZiA9IHBheW1lbnRQbGFuW1wicGxhblwiXSkgPT09IFwicHJvXCIgfHwgX3JlZiA9PT0gXCJnb2xkXCIpICYmIGRpZmYgPiAwKSB7XG4gICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHJlZ2lzdGVyOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dkLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIGRldmljZUlkLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5ERVZJQ0VfSUQsIGJhc2UuZ2VuVXVpZCgpLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRldmljZUlkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNDM3XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRBcGlIb3N0KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBpSG9zdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDQzOFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIHR5cGU6IFwiUFVUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vycy9cIixcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dkLFxuICAgICAgICAgICAgICBkZXZpY2VfaWQ6IGRldmljZUlkLFxuICAgICAgICAgICAgICBkZXZpY2VfcGxhdGZvcm06IGNvbnN0YW50cy5ERVZJQ0VfUExBVEZPUk1cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIHZhciBzZXJ2aWNlVG9rZW47XG4gICAgICAgICAgICAgIHNlcnZpY2VUb2tlbiA9IGRhdGFbXCJzZXJ2aWNlX3Rva2VuXCJdO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlVTRVJfSUQsIGRhdGFbXCJhY2NvdW50X2luZm9cIl1bXCJpZFwiXSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuRU1BSUwsIGRhdGFbXCJhY2NvdW50X2luZm9cIl1bXCJlbWFpbFwiXSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTkVFRFNfVkVSSUZJQ0FUSU9OLCAhZGF0YVtcInZlcmlmaWVkXCJdKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBzZXJ2aWNlVG9rZW4pO1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhzZXJ2aWNlVG9rZW4pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGJhc2UucGluZ0FsbEFwaUhvc3RzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGlzRW1haWxWYWxpZEFuZE9BdXRoOiBmdW5jdGlvbihlbWFpbCwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBhcGlIb3N0LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRBcGlIb3N0KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gYXBpSG9zdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDQ2NVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnMvdmFsaWRfZW1haWxcIixcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBlbWFpbDogZW1haWxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhkYXRhW1wiZXhpc3RzXCJdLCBkYXRhW1wiaXNfb2F1dGhcIl0sIGRhdGFbXCJoYXNfcGFzc3dvcmRcIl0pO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIGZhbHNlLCBmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpbmplY3RDb250ZW50U2NyaXB0OiBmdW5jdGlvbih0YWJfaWQsIGRlZmVyX2NiKSB7XG4gICAgdmFyIGVycm9yLCB0YWIsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcl9jYiA9PSBudWxsKSB7XG4gICAgICBkZWZlcl9jYiA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjaHJvbWUudGFicy5nZXQodGFiX2lkLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhYiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDQ4MlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAodGFiLnVybC5zdWJzdHIoMCwgNikgPT09IFwiY2hyb21lXCIpIHtcbiAgICAgICAgICAgIGRlZmVyX2NiKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGNocm9tZS50YWJzLmV4ZWN1dGVTY3JpcHQodGFiX2lkLCB7XG4gICAgICAgICAgICBmaWxlOiBcIi4vaW5qZWN0LmpzXCJcbiAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcl9jYih0cnVlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIGVycm9yID0gX2Vycm9yO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIG51bGw7XG4gICAgfVxuICB9LFxuICBjbGVhclNwZHlQcm94eTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNldHRpbmdzO1xuICAgIHNldHRpbmdzID0ge1xuICAgICAgc2NvcGU6IFwicmVndWxhclwiXG4gICAgfTtcbiAgICByZXR1cm4gY2hyb21lLnByb3h5LnNldHRpbmdzLmNsZWFyKHNldHRpbmdzKTtcbiAgfSxcbiAgY2FuU2V0UHJveHk6IGZ1bmN0aW9uKGRlZmVyX2NiKSB7XG4gICAgdmFyIGNmZywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVyX2NiID09IG51bGwpIHtcbiAgICAgIGRlZmVyX2NiID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIGNoZWNrcyBpZiB0aGUgZXh0ZW5zaW9uIGNhbiBzZXQgcHJveHkgKG1pZ2h0IGJlIGNvbnRyb2xsZWQgYnkgb3RoZXIgZXh0ZW5zaW9uICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNocm9tZS5wcm94eS5zZXR0aW5ncy5nZXQoe30sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2ZnID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNTAzXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2ZnID09PSBcInVuZGVmaW5lZFwiIHx8IGNmZyA9PT0gbnVsbCkge1xuICAgICAgICAgIGRlZmVyX2NiKHRydWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGNmZy5sZXZlbE9mQ29udHJvbCA9PT0gXCJjb250cm9sbGFibGVfYnlfdGhpc19leHRlbnNpb25cIikgfHwgKGNmZy5sZXZlbE9mQ29udHJvbCA9PT0gXCJjb250cm9sbGVkX2J5X3RoaXNfZXh0ZW5zaW9uXCIpKSB7XG4gICAgICAgICAgZGVmZXJfY2IodHJ1ZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcl9jYihmYWxzZSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgZmV0Y2hTcGR5UHJveHk6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgZGV2aWNlSWQsIHBheW1lbnRQbGFuLCBwcm94eVR5cGUsIHNlcnZpY2VUb2tlbiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgIGZldGNoZXMgcHJveHkgaW5mbyBmcm9tIGFwaSBzZXJ2ZXJcbiAgICByZXR1cm5zIChmcmVlUHJveHlPYmogLHNwZWVkQm9vc3RlZFByb3h5LCBwcm94eV9hY3RpdmF0aW9uX2Vycm9yX0VOVU0pXG4gICAgICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuREVWSUNFX0lELCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRldmljZUlkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNTIwXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDUyMVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiA1MjJcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX1BMQU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF5bWVudFBsYW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgbGluZW5vOiA1MjNcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcHJveHlUeXBlID0gKHR5cGVvZiBwYXltZW50UGxhbiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwYXltZW50UGxhbiAhPT0gbnVsbCkgJiYgcGF5bWVudFBsYW4ucGxhbiA9PT0gJ2dvbGQnID8gJ2dvbGRfc3BkeScgOiBjb25zdGFudHMuUFJPWFlfVFlQRTtcbiAgICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3Byb3hpZXNcIixcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICBzZXJ2aWNlX3Rva2VuOiBzZXJ2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgICBkZXZpY2VfaWQ6IGRldmljZUlkLFxuICAgICAgICAgICAgICAgICAgdHlwZTogcHJveHlUeXBlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICAgdmFyIGZyZWVUaWVyTWlucywgZnJlZVRpZXJSZWNoYXJnZU1pbnM7XG4gICAgICAgICAgICAgICAgICBmcmVlVGllck1pbnMgPSBkYXRhWydmcmVlX3RpZXJfbWlucyddO1xuICAgICAgICAgICAgICAgICAgZnJlZVRpZXJSZWNoYXJnZU1pbnMgPSBkYXRhWydmcmVlX3RpZXJfcmVjaGFyZ2VfbWlucyddO1xuICAgICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5GUkVFX1RJRVJfTUlOUywgZnJlZVRpZXJNaW5zKTtcbiAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuRlJFRV9USUVSX1JFQ0hBUkdFX01JTlMsIGZyZWVUaWVyUmVjaGFyZ2VNaW5zKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGRhdGFbcHJveHlUeXBlXSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oeGhyKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTkVFRFNfVkVSSUZJQ0FUSU9OLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhudWxsLCBudWxsLCBwcm94eV9hY3RpdmF0aW9uX2Vycm9ycy5SRVFVSVJFX0VNQUlMX1ZFUklGSUNBVElPTik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sobnVsbCwgbnVsbCwgcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5waW5nQWxsQXBpSG9zdHMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHNob3dFeHRlbnNpb25Db25mbGljdE5vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhc2Uuc2hvd1JpY2hOb3RpZmljYXRpb24oZW5fbWVzc2FnZXMuRElTQUJMRV9PVEhFUl9FWFRFTlNJT05TLCBlbl9tZXNzYWdlcy5PVEhFUl9FWFRFTlNJT05TX1VTSU5HLCBbXG4gICAgICB7XG4gICAgICAgIHRpdGxlOiBlbl9tZXNzYWdlcy5TSE9XX0FMTF9FWFRTLFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShcImNocm9tZTovL2V4dGVuc2lvbnNcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICBdKTtcbiAgfSxcbiAgc2hvd1NlcnZlckVycm9yTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYmFzZS5zaG93UmljaE5vdGlmaWNhdGlvbihlbl9tZXNzYWdlcy5PT1BTLCBlbl9tZXNzYWdlcy5FUlJPUl9DT05UQUNUSU5HX1NFUlZFUiwgW1xuICAgICAge1xuICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuRU1BSUxfQURNSU4sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBiYXNlLm9wZW5QYWdlKGNvbnN0YW50cy5FTUFJTF9BRE1JTl9VUkwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXSk7XG4gIH0sXG4gIGZldGNoQW5kU2F2ZVNwZHlQcm94eTogZnVuY3Rpb24oZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBwcm94eUxvYWRpbmdFcnJvckVudW0sIHByb3h5T2JqLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5mZXRjaFNwZHlQcm94eShfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcHJveHlPYmogPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIHJldHVybiBwcm94eUxvYWRpbmdFcnJvckVudW0gPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA1NjhcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm94eU9iaiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBwcm94eU9iaiA9PT0gbnVsbCkge1xuICAgICAgICAgIGJhc2UucmVzZXREZWFjdGl2YXRlKCk7XG4gICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhmYWxzZSwgcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUFJPWFlfT0JKLCBwcm94eU9iaiwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBsaW5lbm86IDU3M1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfRkVUQ0hfVElNRVNUQU1QLCBiYXNlLm5vdygpLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgbGluZW5vOiA1NzRcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHRvZ2dsZVNwZHlQcm94eUFjdGl2YXRpb246IGZ1bmN0aW9uKGRvQWN0aXZhdGUsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgY2FuU2V0UHJveHksIGhhc1Nob3duVGlwLCBwcm94eUxvYWRpbmdFcnJvckVudW0sIHByb3h5T2JqLCB3aWxkY2FyZExpcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAgICB0b2dnbGVzIG9uL29mZiBzcGR5IHByb3h5XG4gICAgICAgIHJldHVybnMgYChzdWNjZXNzX0JPT0wsIGVycm9yX0VOVU0pYFxuICAgICAqL1xuICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTE9BRF9QUk9YWV9TVEFURSwgcHJveHlfbG9hZGluZ19zdGF0ZXMuTE9BRElORyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuY2FuU2V0UHJveHkoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYW5TZXRQcm94eSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDU4N1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIWNhblNldFByb3h5KSB7XG4gICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5MT0FEX1BST1hZX1NUQVRFLCBwcm94eV9sb2FkaW5nX3N0YXRlcy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICBiYXNlLnJlc2V0RGVhY3RpdmF0ZSgpO1xuICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIHByb3h5X2FjdGl2YXRpb25fZXJyb3JzLkNPTkZMSUNUSU5HX0VYVEVOU0lPTik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUFJPWFlfT0JKLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb3h5T2JqID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogNTk1XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHByb3h5T2JqID09PSBcInVuZGVmaW5lZFwiIHx8IHByb3h5T2JqID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5mZXRjaFNwZHlQcm94eShfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcHJveHlPYmogPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3h5TG9hZGluZ0Vycm9yRW51bSA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDU5N1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJveHlMb2FkaW5nRXJyb3JFbnVtICE9PSBcInVuZGVmaW5lZFwiICYmIHByb3h5TG9hZGluZ0Vycm9yRW51bSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5MT0FEX1BST1hZX1NUQVRFLCBwcm94eV9sb2FkaW5nX3N0YXRlcy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgICAgICAgIGJhc2UucmVzZXREZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlLCBwcm94eUxvYWRpbmdFcnJvckVudW0pO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3h5T2JqID09PSBcInVuZGVmaW5lZFwiIHx8IHByb3h5T2JqID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkxPQURfUFJPWFlfU1RBVEUsIHByb3h5X2xvYWRpbmdfc3RhdGVzLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgICAgICAgICAgYmFzZS5yZXNldERlYWN0aXZhdGUoKTtcbiAgICAgICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIHByb3h5X2FjdGl2YXRpb25fZXJyb3JzLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QUk9YWV9PQkosIHByb3h5T2JqLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgbGluZW5vOiA2MDlcbiAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfayhiYXNlLnNldExvY2FsRGF0YShrZXlzLlBST1hZX0ZFVENIX1RJTUVTVEFNUCwgYmFzZS5ub3coKSkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCFkb0FjdGl2YXRlKSB7XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5nZXRBbGxBZGRvbldpbGRjYXJkcyhfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdpbGRjYXJkTGlzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgIGxpbmVubzogNjE0XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5hcHBseVByb3h5KHdpbGRjYXJkTGlzLCBkZWZlcnJlZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuUEFTU0lWRSk7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5MT0FEX1BST1hZX1NUQVRFLCBwcm94eV9sb2FkaW5nX3N0YXRlcy5TVUNDRVNTKTtcbiAgICAgICAgICAgICAgICBiYXNlLmFjdGl2YXRlQnJvd3Nlckljb24oZmFsc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfayhiYXNlLnVwZGF0ZUJyb3dzZXJJY29uUG9wdXAoKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgYmFzZS5hcHBseVByb3h5KFtcIipcIl0sIGRlZmVycmVkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuQUNUSVZFKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5MT0FEX1BST1hZX1NUQVRFLCBwcm94eV9sb2FkaW5nX3N0YXRlcy5TVUNDRVNTKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFSVEVEX1VOSVhfVElNRVNUQU1QLCBiYXNlLm5vdygpKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5MQVNUX0ZSRUVfUExBTl9OQUdfVElNRVNUQU1QLCBiYXNlLm5vdygpKTtcbiAgICAgICAgICAgICAgYmFzZS5hY3RpdmF0ZUJyb3dzZXJJY29uKHRydWUpO1xuICAgICAgICAgICAgICBiYXNlLnVwZGF0ZUJyb3dzZXJJY29uUG9wdXAoKTtcbiAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkhBU19TSE9XTl9USVBTLCBmYWxzZSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXNTaG93blRpcCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDYzMlxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgaWYgKCFoYXNTaG93blRpcCkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLm9wZW5QYWdlKHBhZ2VzLlRJUCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5IQVNfU0hPV05fVElQUywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9KShfX2ljZWRfayk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnN5bmMoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiA2MzdcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKGJhc2UuYXBwbHlQcm94eShbXCIqXCJdKSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGdldEFsbEFkZG9uV2lsZGNhcmRzOiBmdW5jdGlvbihkZWZlckNhbGxiYWNrKSB7XG4gICAgdmFyIGFkZG9uLCBpbnN0YWxsZWRBZGRvbnMsIGlzUGF5bWVudE5lZWRlZCwgdXJsLCB3aWxkY2FyZExpcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVyQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQURET05TLCBbXSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YWxsZWRBZGRvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA2NDFcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmlzUGF5bWVudE5lZWRlZChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzUGF5bWVudE5lZWRlZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDY0MlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBfaSwgX2osIF9sZW4sIF9sZW4xLCBfcmVmO1xuICAgICAgICAgIHdpbGRjYXJkTGlzID0gW107XG4gICAgICAgICAgaWYgKGlzUGF5bWVudE5lZWRlZCkge1xuICAgICAgICAgICAgZGVmZXJDYWxsYmFjayhbXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaW5zdGFsbGVkQWRkb25zLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICBhZGRvbiA9IGluc3RhbGxlZEFkZG9uc1tfaV07XG4gICAgICAgICAgICBfcmVmID0gYWRkb24ub3JpZ193aWxkY2FyZF9kb21haW5zO1xuICAgICAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gX3JlZi5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICAgICAgdXJsID0gX3JlZltfal07XG4gICAgICAgICAgICAgIHdpbGRjYXJkTGlzLnB1c2godXJsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVyQ2FsbGJhY2sod2lsZGNhcmRMaXMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBhY3RpdmF0ZUJyb3dzZXJJY29uOiBmdW5jdGlvbihkb0FjdGl2YXRlKSB7XG5cbiAgICAvKiB1cGRhdGVzIHRoZSBhY3R1YWwgYnJvd3NlciBpY29uIHdpdGggYSBkaWZmIGNvbG9yICovXG4gICAgaWYgKGRvQWN0aXZhdGUpIHtcbiAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEljb24oe1xuICAgICAgICBwYXRoOiBcIi9hc3NldHMvaW1hZ2VzL2ljb24tMTktY2xpY2tlZC5wbmdcIlxuICAgICAgfSk7XG4gICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQoe1xuICAgICAgICB0ZXh0OiBcIlVQXCJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHtcbiAgICAgICAgdGl0bGU6IFwiXCJcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKHtcbiAgICAgICAgcGF0aDogXCIvYXNzZXRzL2ltYWdlcy9pY29uLTE5LnBuZ1wiXG4gICAgICB9KTtcbiAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldEJhZGdlVGV4dCh7XG4gICAgICAgIHRleHQ6IFwiXCJcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHtcbiAgICAgICAgdGl0bGU6IFwiXCJcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcbiAgbm93OiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwO1xuICB9LFxuICByZWFycmFuZ2VQb3J0czogZnVuY3Rpb24ocHJveHlPYmosIHBvcnRQcmVmKSB7XG4gICAgdmFyIHAsIHBvcnRfdHlwZSwgcmVhcnJhbmdlZFBvcnRzLCBfaSwgX2osIF9sZW4sIF9sZW4xLCBfcmVmO1xuICAgIGlmIChwb3J0UHJlZiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcHJveHlPYmoucG9ydHM7XG4gICAgfVxuICAgIHJlYXJyYW5nZWRQb3J0cyA9IFtdO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gcG9ydFByZWYubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIHBvcnRfdHlwZSA9IHBvcnRQcmVmW19pXTtcbiAgICAgIF9yZWYgPSBwcm94eU9iai5wb3J0cztcbiAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgIHAgPSBfcmVmW19qXTtcbiAgICAgICAgaWYgKHBvcnRfdHlwZSA9PT0gcC50eXBlKSB7XG4gICAgICAgICAgcmVhcnJhbmdlZFBvcnRzLnB1c2gocCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHJlYXJyYW5nZWRQb3J0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBwcm94eU9iai5wb3J0cztcbiAgICB9XG4gICAgcmV0dXJuIHJlYXJyYW5nZWRQb3J0cztcbiAgfSxcbiAgZ2V0UG9ydDogZnVuY3Rpb24ocG9ydExpcywgdHlwZSkge1xuICAgIHZhciBwb3J0MlVzZSwgX2ksIF9sZW47XG4gICAgZm9yIChfaSA9IDAsIF9sZW4gPSBwb3J0TGlzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBwb3J0MlVzZSA9IHBvcnRMaXNbX2ldO1xuICAgICAgaWYgKHBvcnQyVXNlW1widHlwZVwiXSA9PT0gdHlwZSkge1xuICAgICAgICByZXR1cm4gcG9ydDJVc2U7XG4gICAgICB9XG4gICAgfVxuICB9LFxuICBhcHBseVByb3h5OiBmdW5jdGlvbihhdXRvQnlwYXNzUmVnZXhMaXMsIGRlZmVyQ2FsbGJhY2spIHtcbiAgICB2YXIgaXNIdHRwLCBwb3J0MlVzZSwgcG9ydFByZWYsIHByb3h5T2JqLCBwcm94eU9iajJVc2UsIHJlYXJyYW5nZWRQb3J0cywgdXNlU3BkeURlZmF1bHQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChhdXRvQnlwYXNzUmVnZXhMaXMgPT0gbnVsbCkge1xuICAgICAgYXV0b0J5cGFzc1JlZ2V4TGlzID0gW1wiKlwiXTtcbiAgICB9XG4gICAgaWYgKGRlZmVyQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BST1hZX09CSiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm94eU9iaiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDY5NFxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuVVNFX1NQRFlfREVGQVVMVCwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1c2VTcGR5RGVmYXVsdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDY5NVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuUE9SVF9QUkVGRVJFTkNFX0xJU1QsIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcG9ydFByZWYgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiA2OTZcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBfaSwgX2osIF9sZW4sIF9sZW4xO1xuICAgICAgICAgICAgcHJveHlPYmoyVXNlID0gcHJveHlPYmo7XG4gICAgICAgICAgICByZWFycmFuZ2VkUG9ydHMgPSBiYXNlLnJlYXJyYW5nZVBvcnRzKHByb3h5T2JqMlVzZSk7XG4gICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHJlYXJyYW5nZWRQb3J0cy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICBwb3J0MlVzZSA9IHJlYXJyYW5nZWRQb3J0c1tfaV07XG4gICAgICAgICAgICAgIGlzSHR0cCA9IHBvcnQyVXNlW1widHlwZVwiXSA9PT0gXCJodHRwXCI7XG4gICAgICAgICAgICAgIGlmICh1c2VTcGR5RGVmYXVsdCAmJiBpc0h0dHApIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0h0dHApIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNldEh0dHBQcm94eShwcm94eU9iajJVc2UuaG9zdCwgcG9ydDJVc2UubnVtYmVyLCBhdXRvQnlwYXNzUmVnZXhMaXMsIGRlZmVyQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNldFNwZHlQcm94eShwcm94eU9iajJVc2UuaG9zdCwgcG9ydDJVc2UubnVtYmVyLCBhdXRvQnlwYXNzUmVnZXhMaXMsIGRlZmVyQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gcmVhcnJhbmdlZFBvcnRzLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgICAgICBwb3J0MlVzZSA9IHJlYXJyYW5nZWRQb3J0c1tfal07XG4gICAgICAgICAgICAgIGlzSHR0cCA9IHBvcnQyVXNlW1widHlwZVwiXSA9PT0gXCJodHRwXCI7XG4gICAgICAgICAgICAgIGlmIChpc0h0dHApIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNldEh0dHBQcm94eShwcm94eU9iajJVc2UuaG9zdCwgcG9ydDJVc2UubnVtYmVyLCBhdXRvQnlwYXNzUmVnZXhMaXMsIGRlZmVyQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYXNlLnNldFNwZHlQcm94eShwcm94eU9iajJVc2UuaG9zdCwgcG9ydDJVc2UubnVtYmVyLCBhdXRvQnlwYXNzUmVnZXhMaXMsIGRlZmVyQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzZXRIdHRwUHJveHk6IGZ1bmN0aW9uKGhvc3QsIHBvcnQsIGF1dG9CeXBhc3NSZWdleExpcywgZGVmZXJDYWxsYmFjaykge1xuICAgIHZhciBjZmc7XG4gICAgaWYgKGF1dG9CeXBhc3NSZWdleExpcyA9PSBudWxsKSB7XG4gICAgICBhdXRvQnlwYXNzUmVnZXhMaXMgPSBbXCIqXCJdO1xuICAgIH1cbiAgICBpZiAoZGVmZXJDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlckNhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBjZmcgPSB7XG4gICAgICBwYWNTY3JpcHQ6IHtcbiAgICAgICAgZGF0YTogYmFzZS5nZW5QYWNTY3JpcHQoaG9zdCwgcG9ydCwgYXV0b0J5cGFzc1JlZ2V4TGlzLCBcIlBST1hZXCIpXG4gICAgICB9LFxuICAgICAgbW9kZTogXCJwYWNfc2NyaXB0XCJcbiAgICB9O1xuICAgIHJldHVybiBjaHJvbWUucHJveHkuc2V0dGluZ3Muc2V0KHtcbiAgICAgIHZhbHVlOiBjZmcsXG4gICAgICBzY29wZTogXCJyZWd1bGFyXCJcbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZlckNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH0sXG4gIHNldFNwZHlQcm94eTogZnVuY3Rpb24oaG9zdCwgcG9ydCwgYXV0b0J5cGFzc1JlZ2V4TGlzLCBkZWZlckNhbGxiYWNrKSB7XG4gICAgdmFyIGNmZztcbiAgICBpZiAoYXV0b0J5cGFzc1JlZ2V4TGlzID09IG51bGwpIHtcbiAgICAgIGF1dG9CeXBhc3NSZWdleExpcyA9IFtcIipcIl07XG4gICAgfVxuICAgIGlmIChkZWZlckNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVyQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIGNmZyA9IHtcbiAgICAgIHBhY1NjcmlwdDoge1xuICAgICAgICBkYXRhOiBiYXNlLmdlblBhY1NjcmlwdChob3N0LCBwb3J0LCBhdXRvQnlwYXNzUmVnZXhMaXMpXG4gICAgICB9LFxuICAgICAgbW9kZTogXCJwYWNfc2NyaXB0XCJcbiAgICB9O1xuICAgIHJldHVybiBjaHJvbWUucHJveHkuc2V0dGluZ3Muc2V0KHtcbiAgICAgIHZhbHVlOiBjZmcsXG4gICAgICBzY29wZTogXCJyZWd1bGFyXCJcbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkZWZlckNhbGxiYWNrKCk7XG4gICAgfSk7XG4gIH0sXG4gIGdlblBhY1NjcmlwdDogZnVuY3Rpb24oaG9zdCwgcG9ydCwgYXV0b0J5cGFzc1JlZ2V4TGlzLCB0eXBlKSB7XG4gICAgdmFyIGF1dG9CeXBhc3NVcmwsIGJ5cGFzc1N0ciwgc2NyaXB0LCBfaSwgX2xlbjtcbiAgICBpZiAoYXV0b0J5cGFzc1JlZ2V4TGlzID09IG51bGwpIHtcbiAgICAgIGF1dG9CeXBhc3NSZWdleExpcyA9IFtdO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PSBudWxsKSB7XG4gICAgICB0eXBlID0gXCJIVFRQU1wiO1xuICAgIH1cbiAgICBieXBhc3NTdHIgPSBcIlwiO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gYXV0b0J5cGFzc1JlZ2V4TGlzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBhdXRvQnlwYXNzVXJsID0gYXV0b0J5cGFzc1JlZ2V4TGlzW19pXTtcbiAgICAgIGJ5cGFzc1N0ciArPSBcImlmIChzaEV4cE1hdGNoKHVybCwgXFxcIlwiICsgYXV0b0J5cGFzc1VybCArIFwiXFxcIikpIHJldHVybiBcXFwiXCIgKyB0eXBlICsgXCIgXCIgKyBob3N0ICsgXCI6XCIgKyBwb3J0ICsgXCJcXFwiO1wiO1xuICAgIH1cbiAgICBzY3JpcHQgPSBcImZ1bmN0aW9uIEZpbmRQcm94eUZvclVSTCh1cmwsIGhvc3QpIHtcXG5cXG4gICAgaWYgKGlzUGxhaW5Ib3N0TmFtZShob3N0KSB8fFxcbiAgICAgICAgc2hFeHBNYXRjaChob3N0LCBcXFwiKi5sb2NhbFxcXCIpIHx8XFxuICAgICAgICBpc0luTmV0KGRuc1Jlc29sdmUoaG9zdCksIFxcXCIxMC4wLjAuMFxcXCIsIFxcXCIyNTUuMC4wLjBcXFwiKSB8fFxcbiAgICAgICAgaXNJbk5ldChkbnNSZXNvbHZlKGhvc3QpLCBcXFwiMTcyLjE2LjAuMFxcXCIsIFxcXCIyNTUuMjQwLjAuMFxcXCIpIHx8XFxuICAgICAgICBpc0luTmV0KGRuc1Jlc29sdmUoaG9zdCksIFxcXCIxOTIuMTY4LjAuMFxcXCIsIFxcXCIyNTUuMjU1LjAuMFxcXCIpIHx8XFxuICAgICAgICBpc0luTmV0KGRuc1Jlc29sdmUoaG9zdCksIFxcXCIxMjcuMC4wLjBcXFwiLCBcXFwiMjU1LjI1NS4yNTUuMFxcXCIpKVxcbiAgICAgICAgcmV0dXJuIFxcXCJESVJFQ1RcXFwiO1xcblxcbiAgICBcIiArIGJ5cGFzc1N0ciArIFwiXFxuXFxuICAgIHJldHVybiBcXFwiRElSRUNUXFxcIjtcXG59XCI7XG4gICAgcmV0dXJuIHNjcmlwdDtcbiAgfSxcbiAgcmVzZXREZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblxuICAgIC8qIGRvZXMgdGhlIHByb3h5IGRlYWN0aXZhdGlvbiByZXNldCByb3V0aW5lICovXG4gICAgYmFzZS5jbGVhclNwZHlQcm94eSgpO1xuICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBVEUsIHByb3h5X3N0YXRlcy5QQVNTSVZFKTtcbiAgICBiYXNlLmFjdGl2YXRlQnJvd3Nlckljb24oZmFsc2UpO1xuICAgIHJldHVybiBiYXNlLnVwZGF0ZUJyb3dzZXJJY29uUG9wdXAoKTtcbiAgfSxcbiAgcmVzZXQ6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgaXNSZXNldHRpbmcsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLyogcmVzZXQgcm91dGluZyBldmVyeXRpbWUgdGhlIGJyb3dzZXIvZXh0ZW5zaW9uIHJlc3RhcnRzICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuSVNfUkVTRVRUSU5HLCBmYWxzZSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpc1Jlc2V0dGluZyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDc4OFxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoaXNSZXNldHRpbmcpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLklTX1JFU0VUVElORywgdHJ1ZSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBsaW5lbm86IDc5MlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGJhc2UucmVzZXREZWFjdGl2YXRlKCk7XG4gICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5mZXRjaEFuZFNhdmVTcGR5UHJveHkoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGxpbmVubzogNzk0XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYmFzZS5zeW5jKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgIGxpbmVubzogNzk1XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgYmFzZS50b2dnbGVTcGR5UHJveHlBY3RpdmF0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5JU19SRVNFVFRJTkcsIGZhbHNlLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICBsaW5lbm86IDc5OFxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICB1cGRhdGVCcm93c2VySWNvblBvcHVwOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcHJveHlTdGF0ZSwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG5cbiAgICAvKiB1cGRhdGVzIHRoZSBwb3B1cCB3aGVuIHlvdSBjbGljayB0aGUgYnJvd3NlciBpY29uIGdpdmVuIHRoZSBjdXJyZW50IGNpcmN1bXN0YW5jZSAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuUEFTU0lWRSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm94eVN0YXRlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogODAyXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChwcm94eVN0YXRlID09PSBwcm94eV9zdGF0ZXMuQUNUSVZFKSB7XG4gICAgICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0UG9wdXAoe1xuICAgICAgICAgICAgXCJwb3B1cFwiOiBwYWdlcy5QT1BVUC5ESVNDT05ORUNUXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHtcbiAgICAgICAgICAgIFwidGl0bGVcIjogZW5fbWVzc2FnZXMuRElTQ09OTkVDVF9HT01cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChwcm94eVN0YXRlID09PSBwcm94eV9zdGF0ZXMuUEFTU0lWRSkge1xuICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtcbiAgICAgICAgICAgIFwicG9wdXBcIjogcGFnZXMuUE9QVVAuQUNUSVZBVElPTlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7XG4gICAgICAgICAgICBcInRpdGxlXCI6IGVuX21lc3NhZ2VzLkFDVElWQVRFX0dPTVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgZTogZnVuY3Rpb24obSkge1xuICAgIHZhciBlbmMsIGl2LCBrZXk7XG4gICAga2V5ID0gQ3J5cHRvSlMuZW5jLkhleC5wYXJzZShjb25zdGFudHMuQ1JZUFRPSlNfS0VZKTtcbiAgICBpdiA9IENyeXB0b0pTLmVuYy5IZXgucGFyc2UoY29uc3RhbnRzLkNSWVBUT0pTX0lWKTtcbiAgICBlbmMgPSBDcnlwdG9KUy5BRVMuZW5jcnlwdChtLCBrZXksIHtcbiAgICAgIGl2OiBpdixcbiAgICAgIG1vZGU6IENyeXB0b0pTLm1vZGUuQ0JDLFxuICAgICAgcGFkZGluZzogQ3J5cHRvSlMucGFkLlBrY3M3XG4gICAgfSk7XG4gICAgcmV0dXJuIGVuYy50b1N0cmluZygpO1xuICB9LFxuICBkOiBmdW5jdGlvbihlbSkge1xuICAgIHZhciBjLCBpdiwga2V5O1xuICAgIGtleSA9IENyeXB0b0pTLmVuYy5IZXgucGFyc2UoY29uc3RhbnRzLkNSWVBUT0pTX0tFWSk7XG4gICAgaXYgPSBDcnlwdG9KUy5lbmMuSGV4LnBhcnNlKGNvbnN0YW50cy5DUllQVE9KU19JVik7XG4gICAgYyA9IENyeXB0b0pTLkFFUy5kZWNyeXB0KGVtLCBrZXksIHtcbiAgICAgIGl2OiBpdixcbiAgICAgIG1vZGU6IENyeXB0b0pTLm1vZGUuQ0JDLFxuICAgICAgcGFkZGluZzogQ3J5cHRvSlMucGFkLlBrY3M3XG4gICAgfSk7XG4gICAgcmV0dXJuIGMudG9TdHJpbmcoQ3J5cHRvSlMuZW5jLlV0ZjgpO1xuICB9LFxuICBnZW5VdWlkOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJ4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHhcIi5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgIHZhciByLCB2O1xuICAgICAgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDA7XG4gICAgICB2ID0gKGMgPT09IFwieFwiID8gciA6IHIgJiAweDMgfCAweDgpO1xuICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xuICB9LFxuICBnZXRXZWJzaXRlOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWNvbmZpZy5QUk9EVUNUSU9OKSB7XG4gICAgICByZXR1cm4gY29uZmlnLkRFVl9XRUJTSVRFO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnLkdPTV9XRUJTSVRFO1xuICB9LFxuICBnZXRBcGlIb3N0OiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGVuY3J5cHRlZF9ob3N0LCBwaW5nX3Jlc3VsdHMsIHBpbmdfc3VjY2VzcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKCFjb25maWcuUFJPRFVDVElPTikge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayhjb25maWcuREVWX0FQSV9IT1NUKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQVBJX0hPU1RfUElOR19SRVNVTFRTLCB7fSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwaW5nX3Jlc3VsdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA4NTlcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgZm9yIChlbmNyeXB0ZWRfaG9zdCBpbiBwaW5nX3Jlc3VsdHMpIHtcbiAgICAgICAgICBwaW5nX3N1Y2Nlc3MgPSBwaW5nX3Jlc3VsdHNbZW5jcnlwdGVkX2hvc3RdO1xuICAgICAgICAgIGlmIChwaW5nX3N1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soYmFzZS5kKGVuY3J5cHRlZF9ob3N0KSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGJhc2UuZChjb25maWcuQVBJX0hPU1RTWzBdKSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgdG91Y2g6IGZ1bmN0aW9uKGRldmljZV9pZCwgZGVmZXJfY2IpIHtcbiAgICB2YXIgZW5kcG9pbnQsIGhvc3QsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcl9jYiA9PSBudWxsKSB7XG4gICAgICBkZWZlcl9jYiA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgZW5kcG9pbnQgPSBcIlwiICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vycy90b3VjaFwiO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBob3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogODcwXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5GQVNUX0FKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgIHVybDogXCJcIiArIGhvc3QgKyBlbmRwb2ludCxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBkZXZpY2VfaWQ6IGRldmljZV9pZFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYWx0OiBcImpzb25cIixcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkhBU19UT1VDSEVEX0RFVklDRV9JRCwgdHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJfY2IodHJ1ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJfY2IoZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgcGluZ0FsbEFwaUhvc3RzOiBmdW5jdGlvbihkZWZlcl9jYikge1xuICAgIHZhciBmdWxsX2hvc3QsIGgsIGhvc3QsIGlwLCBwaW5nSG9zdCwgcGluZ19yZXN1bHRzLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJfY2IgPT0gbnVsbCkge1xuICAgICAgZGVmZXJfY2IgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQVBJX0hPU1RfUElOR19SRVNVTFRTLCB7fSk7XG4gICAgcGluZ0hvc3QgPSBmdW5jdGlvbihob3N0LCBkb25lX2NiKSB7XG4gICAgICBpZiAoZG9uZV9jYiA9PSBudWxsKSB7XG4gICAgICAgIGRvbmVfY2IgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgdXJsOiBcIlwiICsgaG9zdCArIFwiL2dvbTQvdGVzdD9cIiArIChiYXNlLmdlblV1aWQoKSksXG4gICAgICAgIGFsdDogXCJqc29uXCIsXG4gICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICB2YXIgcGluZ19yZXN1bHRzLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbDEsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgICAgICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICAgICAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbDEgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgICAgICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbDEsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5BUElfSE9TVF9QSU5HX1JFU1VMVFMsIHt9LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpbmdfcmVzdWx0cyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICBsaW5lbm86IDg5OFxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBwaW5nX3Jlc3VsdHNbYmFzZS5lKGhvc3QpXSA9IHRydWU7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQVBJX0hPU1RfUElOR19SRVNVTFRTLCBwaW5nX3Jlc3VsdHMpO1xuICAgICAgICAgICAgICByZXR1cm4gZG9uZV9jYih0cnVlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHBpbmdfcmVzdWx0cywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwxLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICAgICAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgICAgICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwxID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAgICAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwxLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQVBJX0hPU1RfUElOR19SRVNVTFRTLCB7fSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwaW5nX3Jlc3VsdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgbGluZW5vOiA5MDNcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcGluZ19yZXN1bHRzW2Jhc2UuZShob3N0KV0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5BUElfSE9TVF9QSU5HX1JFU1VMVFMsIHBpbmdfcmVzdWx0cyk7XG4gICAgICAgICAgICAgIHJldHVybiBkb25lX2NiKGZhbHNlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzLCBfd2hpbGU7XG4gICAgICAgIF9yZWYgPSBjb25maWcuQVBJX0hPU1RTO1xuICAgICAgICBfbGVuID0gX3JlZi5sZW5ndGg7XG4gICAgICAgIF9pID0gMDtcbiAgICAgICAgX3doaWxlID0gZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgIF9jb250aW51ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgKytfaTtcbiAgICAgICAgICAgICAgcmV0dXJuIF93aGlsZShfX2ljZWRfayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIF9uZXh0ID0gX2NvbnRpbnVlO1xuICAgICAgICAgIGlmICghKF9pIDwgX2xlbikpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJlYWsoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaCA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHBpbmdIb3N0KGJhc2UuZChoKSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgbGluZW5vOiA5MDlcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KShfbmV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHMsIF93aGlsZTtcbiAgICAgICAgICBfcmVmID0gY29uZmlnLk1JUlJPUl9IT1NUUztcbiAgICAgICAgICBfbGVuID0gX3JlZi5sZW5ndGg7XG4gICAgICAgICAgX2kgPSAwO1xuICAgICAgICAgIF93aGlsZSA9IGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgICAgX2JyZWFrID0gX19pY2VkX2s7XG4gICAgICAgICAgICBfY29udGludWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICArK19pO1xuICAgICAgICAgICAgICAgIHJldHVybiBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfbmV4dCA9IF9jb250aW51ZTtcbiAgICAgICAgICAgIGlmICghKF9pIDwgX2xlbikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9icmVhaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaCA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICBob3N0ID0gYmFzZS5kKGgpO1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UucmVzb2x2ZShob3N0LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlwID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgIGxpbmVubzogOTEzXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZnVsbF9ob3N0ID0gXCJodHRwOi8vXCIgKyBpcDtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBwaW5nSG9zdChmdWxsX2hvc3QsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICBsaW5lbm86IDkxNVxuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgIH0pKF9uZXh0KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkFQSV9IT1NUX1BJTkdfUkVTVUxUUywge30sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcGluZ19yZXN1bHRzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogOTE3XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJfY2IocGluZ19yZXN1bHRzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgZ2V0TG9jYWxEYXRhOiBmdW5jdGlvbihrZXksIGRlZmF1bHRfdmFsdWUsIGRlZmVyX2NiKSB7XG4gICAgdmFyIGl0ZW1zLCBwb3RlbnRpYWxfcmVzLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KGtleSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpdGVtcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDkyMVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoa2V5IGluIGl0ZW1zICYmIChpdGVtc1trZXldICE9IG51bGwpKSB7XG4gICAgICAgICAgZGVmZXJfY2IoaXRlbXNba2V5XSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHBvdGVudGlhbF9yZXMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICAgICAgICBpZiAocG90ZW50aWFsX3JlcyAhPSBudWxsKSB7XG4gICAgICAgICAgZGVmZXJfY2IocG90ZW50aWFsX3Jlcyk7XG4gICAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KHtcbiAgICAgICAgICAgIGtleTogcG90ZW50aWFsX3Jlc1xuICAgICAgICAgIH0sIChmdW5jdGlvbigpIHt9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZlcl9jYihkZWZhdWx0X3ZhbHVlKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzZXRMb2NhbERhdGE6IGZ1bmN0aW9uKGRpY19rZXksIHZhbCwgZGVmZXJfY2IpIHtcbiAgICB2YXIgZGljO1xuICAgIGlmIChkZWZlcl9jYiA9PSBudWxsKSB7XG4gICAgICBkZWZlcl9jYiA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgZGljID0ge307XG4gICAgZGljW2RpY19rZXldID0gdmFsO1xuICAgIHJldHVybiBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoZGljLCAoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmZXJfY2IoKTtcbiAgICB9KSk7XG4gIH0sXG4gIGdldFBlcnNpc3RlbnREYXRhOiBmdW5jdGlvbihrZXksIGRlZmF1bHRfdmFsdWUsIGRlZmVyX2NiKSB7XG4gICAgcmV0dXJuIGNocm9tZS5jb29raWVzLmdldCh7XG4gICAgICB1cmw6IGNvbmZpZy5HT01fV0VCU0lURSxcbiAgICAgIG5hbWU6IGtleVxuICAgIH0sIGZ1bmN0aW9uKGNvb2tpZSkge1xuICAgICAgaWYgKGNvb2tpZSA9PSBudWxsKSB7XG4gICAgICAgIGRlZmVyX2NiKGRlZmF1bHRfdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmZXJfY2IoY29va2llLnZhbHVlKTtcbiAgICB9KTtcbiAgfSxcbiAgc2V0UGVyc2lzdGVudERhdGE6IGZ1bmN0aW9uKGtleSwgdmFsLCBkZWZlcl9jYikge1xuICAgIHZhciBmaXZlX3llYXJzX2Zyb21fbm93LCBub3c7XG4gICAgaWYgKGRlZmVyX2NiID09IG51bGwpIHtcbiAgICAgIGRlZmVyX2NiID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBub3cgPSBNYXRoLnJvdW5kKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMCk7XG4gICAgZml2ZV95ZWFyc19mcm9tX25vdyA9IG5vdyArICgzNjUgKiA1ICogMjQgKiA2MCAqIDYwKTtcbiAgICByZXR1cm4gY2hyb21lLmNvb2tpZXMuc2V0KHtcbiAgICAgIHVybDogY29uZmlnLkdPTV9XRUJTSVRFLFxuICAgICAgbmFtZToga2V5LFxuICAgICAgdmFsdWU6IHZhbCxcbiAgICAgIGV4cGlyYXRpb25EYXRlOiBmaXZlX3llYXJzX2Zyb21fbm93XG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmZXJfY2IoKTtcbiAgICB9KTtcbiAgfSxcbiAgc2V0QnJvd3NlckFjdGlvblBvcHVwOiBmdW5jdGlvbihwb3B1cF9wYWdlLCBtc2cpIHtcbiAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCh7XG4gICAgICBcInBvcHVwXCI6IHBvcHVwX3BhZ2VcbiAgICB9KTtcbiAgICByZXR1cm4gY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoe1xuICAgICAgXCJ0aXRsZVwiOiBtc2dcbiAgICB9KTtcbiAgfSxcbiAgc2hvd1JpY2hOb3RpZmljYXRpb246IGZ1bmN0aW9uKHRpdGxlLCBib2R5LCBidG5zLCBpY29uVXJsKSB7XG4gICAgdmFyIGIsIGJpbmRCdXR0b25DbGlja0V2ZW50LCBidG5MaXMsIGksIHRoaXNJZCwgX2ksIF9sZW47XG4gICAgaWYgKGJ0bnMgPT0gbnVsbCkge1xuICAgICAgYnRucyA9IFtdO1xuICAgIH1cbiAgICBpZiAoaWNvblVybCA9PSBudWxsKSB7XG4gICAgICBpY29uVXJsID0gXCIvYXNzZXRzL2ltYWdlcy9nb21fYmlnX2ljb24ucG5nXCI7XG4gICAgfVxuXG4gICAgLypcbiAgICBVc2VzIHRoZSBuZXcgQ2hyb21lIChyaWNoKSBub3RpZmljYXRpb25zIEFQSVxuICAgIFxuICAgIGBidXR0b25zYCAtLSBpcyBhIGxpc3Qgb2YgZGljdHMgd2l0aCAzIHZhbHVlcy5cbiAgICBcbiAgICBleGFtcGxlOlxuICAgICAgICBbe1xuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIlRpdGxlIG9mIHRoZSBidXR0b25cIixcbiAgICAgICAgICAgIFwiaWNvblwiOiBcImltYWdlcy9yYWJiaXQucG5nXCIsXG4gICAgICAgICAgICBcIm5leHRcIjogZnVuY3Rpb24oKSB7Li59XG4gICAgICAgIH1dXG4gICAgICovXG4gICAgdGhpc0lkID0gYmFzZS5nZW5VdWlkKCk7XG4gICAgYmluZEJ1dHRvbkNsaWNrRXZlbnQgPSBmdW5jdGlvbihidG4sIGlkeCwgaWQpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oYnRuKSB7XG4gICAgICAgIHJldHVybiAoZnVuY3Rpb24oaWR4KSB7XG4gICAgICAgICAgcmV0dXJuIChmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY2hyb21lLm5vdGlmaWNhdGlvbnMub25CdXR0b25DbGlja2VkLnJlbW92ZUxpc3RlbmVyKCk7XG4gICAgICAgICAgICByZXR1cm4gY2hyb21lLm5vdGlmaWNhdGlvbnMub25CdXR0b25DbGlja2VkLmFkZExpc3RlbmVyKGZ1bmN0aW9uKG5vdGlmaWNhdGlvbl9pZCwgYnRuX2lkeCkge1xuICAgICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uX2lkID09PSBpZCAmJiBidG5faWR4ID09PSBpZHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYnRuLm5leHQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkoaWQpO1xuICAgICAgICB9KShpZHgpO1xuICAgICAgfSkoYnRuKTtcbiAgICB9O1xuICAgIGJ0bkxpcyA9IFtdO1xuICAgIGkgPSAwO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gYnRucy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgYiA9IGJ0bnNbX2ldO1xuICAgICAgYnRuTGlzLnB1c2goe1xuICAgICAgICB0aXRsZTogYi50aXRsZSxcbiAgICAgICAgaWNvblVybDogYi5pY29uXG4gICAgICB9KTtcbiAgICAgIGJpbmRCdXR0b25DbGlja0V2ZW50KGIsIGksIHRoaXNJZCk7XG4gICAgICBpICs9IDE7XG4gICAgfVxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNsZWFyKHRpdGxlLCAoZnVuY3Rpb24oKSB7fSkpO1xuICAgIHJldHVybiBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUodGhpc0lkLCB7XG4gICAgICB0eXBlOiBcImJhc2ljXCIsXG4gICAgICB0aXRsZTogdGl0bGUsXG4gICAgICBtZXNzYWdlOiBib2R5LFxuICAgICAgaWNvblVybDogaWNvblVybCxcbiAgICAgIGJ1dHRvbnM6IGJ0bkxpc1xuICAgIH0sIChmdW5jdGlvbigpIHt9KSk7XG4gIH0sXG4gIG1ha2VUb2FzdDogZnVuY3Rpb24obXNnLCBkdXJhdGlvbk1zKSB7XG4gICAgaWYgKGR1cmF0aW9uTXMgPT0gbnVsbCkge1xuICAgICAgZHVyYXRpb25NcyA9IDQwMDA7XG4gICAgfVxuICAgIGlmIChtc2cgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXR1cm4gJC5zbmFja2Jhcih7XG4gICAgICBjb250ZW50OiBtc2csXG4gICAgICBzdHlsZTogXCJ0b2FzdFwiLFxuICAgICAgdGltZW91dDogZHVyYXRpb25Nc1xuICAgIH0pO1xuICB9LFxuICBmZXRjaFBheW1lbnRVcmw6IGZ1bmN0aW9uKHBsYW4sIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgY291bnRyeSwgc2VydmljZVRva2VuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAocGxhbiA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrKG51bGwsIG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DT1VOVFJZLCBjb25zdGFudHMuREVGQVVMVF9DT1VOVFJZX0NPREUsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gY291bnRyeSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDEwMjRcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlNFUlZJQ0VfVE9LRU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VydmljZVRva2VuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMTAyNVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiAxMDI2XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvcGF5bWVudHMvdXJsXCIsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlX3Rva2VuOiBzZXJ2aWNlVG9rZW4sXG4gICAgICAgICAgICAgICAgcGxhbjogcGxhbixcbiAgICAgICAgICAgICAgICBjb3VudHJ5OiBjb3VudHJ5XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhkYXRhLnVybCwgZGF0YS5zYWFzeV91cmwsIGRhdGEucHJpY2UucmF3LCBkYXRhLnByaWNlLmZlZSwgZGF0YS5wcmljZS50b3RhbCk7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKG51bGwsIG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLnBpbmdBbGxBcGlIb3N0cygpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgcmVwYWlyOiBmdW5jdGlvbihwcm9ncmVzc0NhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIGN1cnJlbnRIb3N0LCBpLCBqLCBuZXdQcm94eU9iaiwgcG9ydE9iaiwgcHJveHlPYmosIHN1Y2Nlc3MsIHN1Y2Nlc3NmdWxQb3J0VHlwZSwgdXJsLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAocHJvZ3Jlc3NDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBwcm9ncmVzc0NhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBiYXNlLnRvZ2dsZVNwZHlQcm94eUFjdGl2YXRpb24oZmFsc2UpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QUk9YWV9PQkosIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJveHlPYmogPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxMDQ1XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJveHlPYmogPT09IFwidW5kZWZpbmVkXCIgfHwgcHJveHlPYmogPT09IG51bGwpIHtcbiAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrKDEwMCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRIb3N0ID0gcHJveHlPYmouaG9zdDtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIHZhciBfYmVnaW4sIF9lbmQsIF9pLCBfcG9zaXRpdmUsIF9yZXN1bHRzLCBfc3RlcCwgX3doaWxlO1xuICAgICAgICAgIGogPSBpO1xuICAgICAgICAgIF9iZWdpbiA9IGk7XG4gICAgICAgICAgX2VuZCA9IGNvbnN0YW50cy5NQVhfVFJJRVNfRk9SX0lQX0NIQU5HRTtcbiAgICAgICAgICBpZiAoX2VuZCA+IF9iZWdpbikge1xuICAgICAgICAgICAgX3N0ZXAgPSAxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfc3RlcCA9IC0xO1xuICAgICAgICAgIH1cbiAgICAgICAgICBfcG9zaXRpdmUgPSBfZW5kID4gX2JlZ2luO1xuICAgICAgICAgIF93aGlsZSA9IGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgICAgX2JyZWFrID0gX19pY2VkX2s7XG4gICAgICAgICAgICBfY29udGludWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBqICs9IF9zdGVwO1xuICAgICAgICAgICAgICAgIHJldHVybiBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfbmV4dCA9IF9jb250aW51ZTtcbiAgICAgICAgICAgIGlmICghISgoX3Bvc2l0aXZlID09PSB0cnVlICYmIGogPiBjb25zdGFudHMuTUFYX1RSSUVTX0ZPUl9JUF9DSEFOR0UpIHx8IChfcG9zaXRpdmUgPT09IGZhbHNlICYmIGogPCBjb25zdGFudHMuTUFYX1RSSUVTX0ZPUl9JUF9DSEFOR0UpKSkge1xuICAgICAgICAgICAgICByZXR1cm4gX2JyZWFrKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5mZXRjaEFuZFNhdmVTcGR5UHJveHkoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDEwNTVcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QUk9YWV9PQkosIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3UHJveHlPYmogPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMDU2XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1Byb3h5T2JqLmhvc3QgIT09IGN1cnJlbnRIb3N0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgcHJveHlPYmogPSBuZXdQcm94eU9iajtcbiAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbl9icmVhaygpXG4gICAgICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfaygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9uZXh0KHByb2dyZXNzQ2FsbGJhY2soaSkpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaSA9IGNvbnN0YW50cy5NQVhfVFJJRVNfRk9SX0lQX0NIQU5HRTtcbiAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrKGkpO1xuICAgICAgICAgIHN1Y2Nlc3NmdWxQb3J0VHlwZSA9IFtdO1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgbGluZW5vOiAxMDY2XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cywgX3doaWxlO1xuICAgICAgICAgICAgICBfcmVmID0gcHJveHlPYmoucG9ydHM7XG4gICAgICAgICAgICAgIF9sZW4gPSBfcmVmLmxlbmd0aDtcbiAgICAgICAgICAgICAgX2kgPSAwO1xuICAgICAgICAgICAgICBfd2hpbGUgPSBmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIHZhciBfYnJlYWssIF9jb250aW51ZSwgX25leHQ7XG4gICAgICAgICAgICAgICAgX2JyZWFrID0gX19pY2VkX2s7XG4gICAgICAgICAgICAgICAgX2NvbnRpbnVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaWNlZC50cmFtcG9saW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICArK19pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgX25leHQgPSBfY29udGludWU7XG4gICAgICAgICAgICAgICAgaWYgKCEoX2kgPCBfbGVuKSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIF9icmVhaygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwb3J0T2JqID0gX3JlZltfaV07XG4gICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBvcnRPYmoudHlwZSA9PT0gXCJodHRwXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLnNldEh0dHBQcm94eShwcm94eU9iai5ob3N0LCBcIjEyMzRcIiwgWycqJ10sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lbm86IDEwNjlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KShfX2ljZWRfayk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5zZXRTcGR5UHJveHkocHJveHlPYmouaG9zdCwgcG9ydE9iai5udW1iZXIsIFsnKiddLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMDcwXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsID0gXCJodHRwczovL2FwaS5nb21jb21tLmNvbS9nb200L3Rlc3Q/XCIgKyAoYmFzZS5nZW5VdWlkKCkpO1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIGJhc2UucGluZ0VuZHBvaW50KHVybCwgY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUywgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWNjZXNzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVubzogMTA3MlxuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsUG9ydFR5cGUucHVzaChwb3J0T2JqLnR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICBpICs9IDMwO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfbmV4dChwcm9ncmVzc0NhbGxiYWNrKGkpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIF93aGlsZShfX2ljZWRfayk7XG4gICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QT1JUX1BSRUZFUkVOQ0VfTElTVCwgc3VjY2Vzc2Z1bFBvcnRUeXBlKTtcbiAgICAgICAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjaygxMDApO1xuICAgICAgICAgICAgICBiYXNlLnRvZ2dsZVNwZHlQcm94eUFjdGl2YXRpb24oZmFsc2UpO1xuICAgICAgICAgICAgICByZXR1cm4gYmFzZS5zeW5jKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgcGluZ0VuZHBvaW50OiBmdW5jdGlvbihlbmRwb2ludCwgdGltZW91dCwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIGlmICh0aW1lb3V0ID09IG51bGwpIHtcbiAgICAgIHRpbWVvdXQgPSBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TO1xuICAgIH1cbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHRpbWVvdXQ6IHRpbWVvdXQsXG4gICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgdXJsOiBcIlwiICsgZW5kcG9pbnQgKyBcIi8/XCIgKyAoYmFzZS5nZW5VdWlkKCkpLFxuICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKHRydWUpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICB0ZXN0SHR0cFByb3h5RW5kcG9pbnRWYWxpZGl0eTogZnVuY3Rpb24oaG9zdCwgcG9ydCwgdXJsTGlzLCBkZWZlcnJlZENhbGxiYWNrLCBwcm9ncmVzc0NhbGxiYWNrKSB7XG4gICAgdmFyIGksIHBpbmdTdWNjZXNzLCBzdWNjZXNzZnVsRW5kcG9pbnRzLCB1cmwsIHgsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIGlmIChwcm9ncmVzc0NhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIHByb2dyZXNzQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLypcbiAgICBjaGVja3MgaWYgYSBgaHR0cGAgcHJveHkgaXMgdmFsaWQgYnkgcnVubmluZyBpdCB0aHJvdWdoIGEgc2VyaWVzIG9mIGVuZHBvaW50czsgIyBkZWZlcl9jYihsaXMpOiBhIGxpc3Qgb2YgZW5kcG9pbnRzIHcvIHN0YXR1cyBjb2RlIG9mIDIwMCAjIHByb2dyZXNzX2NiKHByb2dyZXNzX3BlcmNlbnRhZ2UpXG4gICAgICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2Uuc2V0SHR0cFByb3h5KGhvc3QsIHBvcnQsIChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSB1cmxMaXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIHggPSB1cmxMaXNbX2ldO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChcIipcIiArIChiYXNlLmQoeCkpICsgXCIqXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH0pKCksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGxpbmVubzogMTA5N1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzdWNjZXNzZnVsRW5kcG9pbnRzID0gW107XG4gICAgICAgIGkgPSAwO1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzLCBfd2hpbGU7XG4gICAgICAgICAgX3JlZiA9IHVybExpcztcbiAgICAgICAgICBfbGVuID0gX3JlZi5sZW5ndGg7XG4gICAgICAgICAgX2kgPSAwO1xuICAgICAgICAgIF93aGlsZSA9IGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgICAgX2JyZWFrID0gX19pY2VkX2s7XG4gICAgICAgICAgICBfY29udGludWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICArK19pO1xuICAgICAgICAgICAgICAgIHJldHVybiBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfbmV4dCA9IF9jb250aW51ZTtcbiAgICAgICAgICAgIGlmICghKF9pIDwgX2xlbikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9icmVhaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXJsID0gX3JlZltfaV07XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5waW5nRW5kcG9pbnQoXCJodHRwOi8vXCIgKyAoYmFzZS5kKHVybCkpLCBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpbmdTdWNjZXNzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgIGxpbmVubzogMTEwMVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwaW5nU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bEVuZHBvaW50cy5wdXNoKGJhc2UuZCh1cmwpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgIHJldHVybiBfbmV4dChwcm9ncmVzc0NhbGxiYWNrKHBhcnNlSW50KGkgLyB1cmxMaXMubGVuZ3RoICogMTAwKSkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIF93aGlsZShfX2ljZWRfayk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHByb2dyZXNzQ2FsbGJhY2soMTAwKTtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhzdWNjZXNzZnVsRW5kcG9pbnRzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgdGVzdFNwZHlQcm94eUVuZHBvaW50VmFsaWRpdHk6IGZ1bmN0aW9uKGhvc3QsIHBvcnQsIHVybExpcywgZGVmZXJyZWRDYWxsYmFjaywgcHJvZ3Jlc3NDYWxsYmFjaykge1xuICAgIHZhciBpLCBwaW5nU3VjY2Vzcywgc3VjY2Vzc2Z1bEVuZHBvaW50cywgdXJsLCB4LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBpZiAocHJvZ3Jlc3NDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBwcm9ncmVzc0NhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBcImNoZWNrcyBpZiBhIGBzcGR5YCBwcm94eSBpcyB2YWxpZCBieSBydW5uaW5nIGl0IHRocm91Z2ggYSBzZXJpZXMgb2YgZW5kcG9pbnRzOyAjIGNhbGxiYWNrIHJldHVybjogYSBsaXN0IG9mIGVuZHBvaW50cyB3LyBzdGF0dXMgY29kZSBvZiAyMDAgIyBkZWZlcl9jYihsaXMpOiBhIGxpc3Qgb2YgZW5kcG9pbnRzIHcvIHN0YXR1cyBjb2RlIG9mIDIwMCAjIHByb2dyZXNzX2NiKHByb2dyZXNzX3BlcmNlbnRhZ2UpXCI7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2Uuc2V0U3BkeVByb3h5KGhvc3QsIHBvcnQsIChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSB1cmxMaXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgIHggPSB1cmxMaXNbX2ldO1xuICAgICAgICAgICAgX3Jlc3VsdHMucHVzaChcIipcIiArIChiYXNlLmQoeCkpICsgXCIqXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgIH0pKCksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGxpbmVubzogMTExM1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzdWNjZXNzZnVsRW5kcG9pbnRzID0gW107XG4gICAgICAgIGkgPSAwO1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzLCBfd2hpbGU7XG4gICAgICAgICAgX3JlZiA9IHVybExpcztcbiAgICAgICAgICBfbGVuID0gX3JlZi5sZW5ndGg7XG4gICAgICAgICAgX2kgPSAwO1xuICAgICAgICAgIF93aGlsZSA9IGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgICAgX2JyZWFrID0gX19pY2VkX2s7XG4gICAgICAgICAgICBfY29udGludWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICArK19pO1xuICAgICAgICAgICAgICAgIHJldHVybiBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfbmV4dCA9IF9jb250aW51ZTtcbiAgICAgICAgICAgIGlmICghKF9pIDwgX2xlbikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9icmVhaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdXJsID0gX3JlZltfaV07XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5waW5nRW5kcG9pbnQoXCJodHRwOi8vXCIgKyAoYmFzZS5kKHVybCkpLCBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpbmdTdWNjZXNzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgIGxpbmVubzogMTExN1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwaW5nU3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bEVuZHBvaW50cy5wdXNoKHVybCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX25leHQocHJvZ3Jlc3NDYWxsYmFjayhwYXJzZUludChpIC8gdXJsTGlzLmxlbmd0aCAqIDEwMCkpKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrKDEwMCk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soc3VjY2Vzc2Z1bEVuZHBvaW50cyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGZldGNoUG9ydFByaW9yaXR5OiBmdW5jdGlvbihwcm94eU9iaiwgZGVmZXJyZWRDYWxsYmFjaywgcHJvZ3Jlc3NDYWxsYmFjaykge1xuICAgIHZhciBjdXJyZW50UHJvZ3Jlc3MsIGhvc3QsIGksIGlzSHR0cCwgcCwgcG9ydCwgcG9ydEFycmF5LCBwb3J0Tm8sIHBvcnRQcmVmLCBwb3J0VGVzdFJlc3VsdCwgcHJveHlTdGF0ZSwgc29ydGVkQXJyLCB0ZXN0UmVzdWx0cywgdXNlU3BkeUFzRGVmYXVsdCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgaWYgKHByb2dyZXNzQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgcHJvZ3Jlc3NDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICByZXF1aXJlcyBLRVlTLlBST1hZX1NUQVRFIHRvIGJlIEFDVElWQVRJT05fTU9ERVMuUEFTU0lWRSAoYmVjYXVzZSBpdCBhc3NpZ25zIHJhbmRvbSBwcm94aWVzKSAjIGZpZ3VyZXMgb3VyIHdoaWNoIHBvcnRzIGZyb20gcHJveHlfb2JqIGFyZSBiZXR0ZXJcbiAgICAgKGZvciBleGFtcGxlLCBub24tc3BkeSBwb3J0cyBzZXJ2ZSB2aWRlb3MgZmFzdGVyKSAjIGNhbGxiYWNrIHJldHVybjogZGVmZXJfY2Ioc3VjY2Vzc2Z1bGx5X29wdGltaXplZCwgcG9ydF90eXBlX2xpcykgIyBjYWxsYmFjayByZXR1cm46IHByb2dyZXNzX2NiKHByb2dyZXNzX3BlcmNlbnRhZ2UpXG4gICAgICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuVVNFX1NQRFlfREVGQVVMVCwgZmFsc2UsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gdXNlU3BkeUFzRGVmYXVsdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDExMzBcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaG9zdCA9IHByb3h5T2JqLmhvc3Q7XG4gICAgICAgIHBvcnRBcnJheSA9IHByb3h5T2JqW1wicG9ydHNcIl07XG4gICAgICAgIHBvcnRUZXN0UmVzdWx0ID0gW107XG4gICAgICAgIGkgPSAwO1xuICAgICAgICBjdXJyZW50UHJvZ3Jlc3MgPSAwO1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzLCBfd2hpbGU7XG4gICAgICAgICAgX3JlZiA9IHBvcnRBcnJheTtcbiAgICAgICAgICBfbGVuID0gX3JlZi5sZW5ndGg7XG4gICAgICAgICAgX2kgPSAwO1xuICAgICAgICAgIF93aGlsZSA9IGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgICAgX2JyZWFrID0gX19pY2VkX2s7XG4gICAgICAgICAgICBfY29udGludWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICArK19pO1xuICAgICAgICAgICAgICAgIHJldHVybiBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBfbmV4dCA9IF9jb250aW51ZTtcbiAgICAgICAgICAgIGlmICghKF9pIDwgX2xlbikpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9icmVhaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcG9ydCA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBVEUsIHByb3h5X3N0YXRlcy5QQVNTSVZFLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb3h5U3RhdGUgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMTM5XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb3h5U3RhdGUgPT09IHByb3h5X3N0YXRlcy5BQ1RJVkUpIHtcbiAgICAgICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIFtdKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNIdHRwID0gcG9ydFtcInR5cGVcIl0gPT09IFwiaHR0cFwiO1xuICAgICAgICAgICAgICAgIHBvcnRObyA9IHBvcnRbXCJudW1iZXJcIl07XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICBpZiAodXNlU3BkeUFzRGVmYXVsdCAmJiBpc0h0dHApIHtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG5fY29udGludWUoKVxuICAgICAgICAgICAgICAgICAgICB9KShfX2ljZWRfayk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNIdHRwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS50ZXN0SHR0cFByb3h5RW5kcG9pbnRWYWxpZGl0eShob3N0LCBwb3J0Tm8sIGNvbnN0YW50cy5FTkRQT0lOVFNfVE9fVEVTVCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXN0UmVzdWx0cyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBsaW5lbm86IDExNDlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLCBmdW5jdGlvbihwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvZ3Jlc3NDYWxsYmFjayhwYXJzZUludChjdXJyZW50UHJvZ3Jlc3MgKyAocHJvZ3Jlc3MgLyBwb3J0QXJyYXkubGVuZ3RoKSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UudGVzdFNwZHlQcm94eUVuZHBvaW50VmFsaWRpdHkoaG9zdCwgcG9ydE5vLCBjb25zdGFudHMuRU5EUE9JTlRTX1RPX1RFU1QsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdFJlc3VsdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMTUyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSwgZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2dyZXNzQ2FsbGJhY2socGFyc2VJbnQoY3VycmVudFByb2dyZXNzICsgKHByb2dyZXNzIC8gcG9ydEFycmF5Lmxlbmd0aCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXN0UmVzdWx0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcG9ydFRlc3RSZXN1bHQucHVzaChbcG9ydCwgdGVzdFJlc3VsdHNdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIHByb2dyZXNzQ2FsbGJhY2socGFyc2VJbnQoaSAvIHBvcnRBcnJheS5sZW5ndGggKiAxMDApKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9uZXh0KGN1cnJlbnRQcm9ncmVzcyA9IHBhcnNlSW50KGkgLyBwb3J0QXJyYXkubGVuZ3RoICogMTAwKSk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuUEFTU0lWRSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBwcm94eVN0YXRlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMTE2MVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHByb3h5U3RhdGUgPT09IHByb3h5X3N0YXRlcy5BQ1RJVkUpIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhmYWxzZSwgW10pO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzb3J0ZWRBcnIgPSBwb3J0VGVzdFJlc3VsdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgdmFyIGFIdHRwQm9udXMsIGJIdHRwQm9udXM7XG4gICAgICAgICAgICAgIGFIdHRwQm9udXMgPSBhWzBdW1widHlwZVwiXSA9PT0gXCJodHRwXCIgPyAxIDogMDtcbiAgICAgICAgICAgICAgYkh0dHBCb251cyA9IGJbMF1bXCJ0eXBlXCJdID09PSBcImh0dHBcIiA/IDEgOiAwO1xuICAgICAgICAgICAgICByZXR1cm4gKGFIdHRwQm9udXMgKyBhWzFdLmxlbmd0aCkgLSAoYkh0dHBCb251cyArIGJbMV0ubGVuZ3RoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc29ydGVkQXJyID0gc29ydGVkQXJyLnJldmVyc2UoKTtcbiAgICAgICAgICAgIHBvcnRQcmVmID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZXN1bHRzO1xuICAgICAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHNvcnRlZEFyci5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgICAgIHAgPSBzb3J0ZWRBcnJbX2ldO1xuICAgICAgICAgICAgICAgIF9yZXN1bHRzLnB1c2gocFswXVtcInR5cGVcIl0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayh0cnVlLCBwb3J0UHJlZik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHJlc29sdmU6IGZ1bmN0aW9uKG5hbWUsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHVybDogXCJodHRwczovL2Rucy5nb29nbGUuY29tL3Jlc29sdmU/bmFtZT1cIiArIG5hbWUsXG4gICAgICB0eXBlOiAnR0VUJyxcbiAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICB0aW1lb3V0OiBmaW5hbC5TSE9SVF9NUyxcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIF9yZWY7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKChfcmVmID0gZGF0YS5BbnN3ZXIpICE9IG51bGwgPyBfcmVmWzBdLmRhdGEgOiB2b2lkIDApO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2sobnVsbCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9iYXNlLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGNvbmZpZztcblxuY29uZmlnID0ge1xuICBHT01fQ0hST01FX1NUT1JFX0xJTks6IFwiaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwvY2tpYWhiY21sbWtwZmlpamVjYnBmbGZhaG9pbWtsa2UvcmV2aWV3c1wiLFxuICBHT01fU0dfQ0hST01FX1NUT1JFX0xJTks6IFwiaHR0cHM6Ly9jaHJvbWUuZ29vZ2xlLmNvbS93ZWJzdG9yZS9kZXRhaWwvbGxlZHBmbGZuYW5hbWtvZ29jbGtnYWdnZmRnb2Fsb2svcmV2aWV3c1wiLFxuICBHT01fV0VCU0lURTogXCJodHRwczovL2dldGdvbS5jb21cIixcbiAgQVBJX1NVRkZJWDogXCIvYXBpL3Y3XCIsXG4gIEFQSV9IT1NUUzogW1wiY0FXMGRXTUpvN0szUVFQKzBwK3EyTzV1ZUpwRG1qSmtxZXNkVkhwRGI5Zz1cIiwgXCJoRFdKV3B4OXJiWlUvalVJWkZCcThubUtyQlBzRWxYWHFGQlB5TFdXYXMvbEMxckhvczJFQzFobDY1T3c0TjJUXCJdLFxuICBNSVJST1JfSE9TVFM6IFtcIi9kRGJnN2tXQ1k1STRzVVNDekdrMzN1Q3FrUVdrTnV1Q1R2SW40YnRodFU9XCJdLFxuICBBUElfSE9TVFNfV0lMRENBUkQ6IFtcIjNEenhuMXY3KzU4eVRueFJZSlQyMWlhT3pWcElrcXQ1Q0txc3JIaVloeDg9XCIsIFwiQWJkRU5WZWdxcU55K1V5TzNvMFNJelU2UW9Ta21pU1NVUU5WT0JYRWxQUT1cIiwgXCJqR21KL3k3WnhLSHg4OWxmaWx4NnFhNHNJUGNablh5VEZybkR5TThjOEZtOG9EeWR3VWk1dzl5L0JtZHE5VFFRXCJdLFxuICBERVZfQVBJX0hPU1Q6IFwiaHR0cDovL2FwaS1zdGFnaW5nLmdvbWNvbW0uY29tXCIsXG4gIERFVl9XRUJTSVRFOiAnaHR0cHM6Ly9zdGFnaW5nLmdldGdvbS5jb20nLFxuICBQUk9EVUNUSU9OOiB0cnVlXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbmZpZztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb25maWcuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgY29uc3RhbnRzO1xuXG5jb25zdGFudHMgPSB7XG4gIENSWVBUT0pTX0tFWTogJzM2ZWJlMjA1YmNkZmM0OTlhMjVlNjkyM2Y0NDUwZmE4JyxcbiAgQ1JZUFRPSlNfSVY6ICdiZTQxMGZlYTQxZGY3MTYyYTY3OTg3NWVjMTMxY2YyYycsXG4gIEFKQVhfVElNRU9VVF9NUzogMTUwMDAsXG4gIEZBU1RfQUpBWF9USU1FT1VUX01TOiA1MDAwLFxuICBTRUNTX0ZPUl9QUk9YWV9UT19FWFBJUkU6IDg2NDAwLFxuICBQUk9YWV9UWVBFOiAnc3BkeScsXG4gIEFQSV9TVUZGSVg6ICcvYXBpL3Y3JyxcbiAgU0VDU19QRVJfU1BFRURfQk9PU1RFUl9OQUc6IDEyMDAsXG4gIFNFQ1NfVElMTF9GSVJTVF9TUEVFRF9CT09TVEVSX05BRzogMzAsXG4gIERFVklDRV9QTEFURk9STTogJ2Nocm9tZScsXG4gIERFRkFVTFRfQ09VTlRSWV9DT0RFOiAndXMnLFxuICBERUZBVUxUX1BSSUNFUzoge1xuICAgIHByaWNlczoge1xuICAgICAgXCJwcm9cIjogNC45OSxcbiAgICAgIFwibGlmZVwiOiAxOTksXG4gICAgICBcInN1cHJlbWVcIjogMy4zMyxcbiAgICAgIFwiZ29sZFwiOiAxOS45OVxuICAgIH0sXG4gICAgc3ltYm9sOiBcIiRcIlxuICB9LFxuICBQUklDSU5HX1BMQU5TOiB7XG4gICAgUFJPOiBcInByb1wiLFxuICAgIFNVUFJFTUU6IFwic3VwcmVtZVwiLFxuICAgIExJRkU6IFwibGlmZVwiLFxuICAgIEdPTEQ6IFwiZ29sZFwiXG4gIH0sXG4gIFBSSUNJTkdfUExBTl9EVVJBVElPTjoge1xuICAgICdwcm8nOiBcIk1vbnRobHlcIixcbiAgICAnc3VwcmVtZSc6IFwiMTAgbW9udGhzIHRlcm1cIixcbiAgICAnbGlmZSc6IFwiTGlmZXRpbWVcIlxuICB9LFxuICBNQVhfVFJJRVNfRk9SX0lQX0NIQU5HRTogNSxcbiAgRU5EUE9JTlRTX1RPX1RFU1Q6IFtcInUwdDRoMi9WVW5WczFJbE5hQ1BYNWc9PVwiLCBcIlhNZFhxVnFrc2Znd3ZMUUJHNkdWZFE9PVwiLCBcInVmQ01oTWI3TUErbkNiSnczNWJXQWc9PVwiLCBcIkcwbDlGQ1kxSE5uZFdhWUpHaHZjanc9PVwiLCBcIkZsa1dkVEtUN0lNaU5FVXdhbm9pWnc9PVwiLCBcInY2YkFzSUlJbVJaT2xBMGloRmNNUEE9PVwiLCBcIjY1dlpoMnFNd2JlNExraFdEWm5uK2c9PVwiLCBcIjZnbi9UNXFOdHRpeUlvTUNhaWx0eUE9PVwiLCBcIjJRTllEZCt6WVpBY1pJdnRQNFlzb1E9PVwiXSxcbiAgREVGQVVMVF9JTlNUQUxMRURfQURET05TOiBbXG4gICAge1xuICAgICAgYnlwYXNzX2VudGl0eTogXCJHb20gVlBOJ3MgV2Vic2l0ZVwiLFxuICAgICAgdGl0bGU6IFwiR2V0R29tLmNvbVwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiQnlwYXNzZXMgZ2V0Z29tLmNvbSBhdXRvbWF0aWNhbGx5IGlmIGdldGdvbS5jb20gaXMgYmxvY2tlZFwiLFxuICAgICAgb3JpZ193aWxkY2FyZF9kb21haW5zOiBbXCJnZXRnb20uY29tKlwiXSxcbiAgICAgIHVybF9kb21haW5zOiBbXCJnZXRnb20uY29tLipcIl0sXG4gICAgICBpZDogXCJnZXRnb20uY29tXCJcbiAgICB9XG4gIF0sXG4gIERFRkFVTFRfU1VHR0VTVEVEX0FERE9OUzogW1xuICAgIHtcbiAgICAgIGJ5cGFzc19lbnRpdHk6IFwiTmV0ZmxpeCAtIEJ5cGFzcyBhIFVTLW9ubHkgbW92aWUgc3RyZWFtaW5nIHNlcnZpY2VcIixcbiAgICAgIHRpdGxlOiBcIk5ldGZsaXgtTmluamFcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkJ5cGFzc2VzIE5ldGZsaXhcIixcbiAgICAgIG9yaWdfd2lsZGNhcmRfZG9tYWluczogW1wiKm5ldGZsaXguY29tKlwiXSxcbiAgICAgIHVybF9kb21haW5zOiBbXCIuKm5ldGZsaXguY29tLipcIl0sXG4gICAgICBpZDogXCJuZXRmbGl4LmNvbVwiXG4gICAgfSwge1xuICAgICAgYnlwYXNzX2VudGl0eTogXCJQYW5kb3JhIC0gQnlwYXNzIGEgVVMtb25seSBmcmVlIG11c2ljIHJhZGlvIHN0cmVhbWluZyBzZXJ2aWNlXCIsXG4gICAgICB0aXRsZTogXCJQYW5kb3JhLVBhbmRhXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJCeXBhc3NlcyBQYW5kb3JhXCIsXG4gICAgICBvcmlnX3dpbGRjYXJkX2RvbWFpbnM6IFtcIipwYW5kb3JhLmNvbSpcIl0sXG4gICAgICB1cmxfZG9tYWluczogW1wiLipwYW5kb3JhLmNvbS4qXCJdLFxuICAgICAgaWQ6IFwicGFuZG9yYS5jb21cIlxuICAgIH1cbiAgXSxcbiAgR09NX1NHX05BTUU6IFwiR28gYXdheSBNREEgLSBCeXBhc3MgTURBIGJsb2NrZWQgc2l0ZXNcIixcbiAgRU1BSUxfQURNSU5fVVJMOiBcIm1haWx0bzpnb0BnZXRnb20uY29tP3N1YmplY3Q9U2VydmVyK2lzc3VlXCIsXG4gIERFRkFVTFRfRlJFRV9USUVSX01JTlM6IDE1LFxuICBGUkVFX1RJRVJfUkVDSEFSR0VfTUlOUzogMC41LFxuICBERUZBVUxUX0NVTVVMQVRJVkVfVVNBR0U6IHtcbiAgICBzZWNvbmRzOiAwLFxuICAgIGxhc3RUaWNrOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgd2FpdGVkU2Vjb25kczogMFxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvbnN0YW50cztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9jb25zdGFudHMuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgZmluYWw7XG5cbmZpbmFsID0ge1xuICBMT05HX01TOiAxMDAwMCxcbiAgU0hPUlRfTVM6IDcwMDBcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZmluYWw7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW51bS9maW5hbC5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIga2V5cztcblxua2V5cyA9IHtcbiAgSEFTX1RPVUNIRURfREVWSUNFX0lEOiAnaGFzX3RvdWNoZWRfZGV2aWNlX2lkJyxcbiAgVVNFX1NQRFlfREVGQVVMVDogXCJwcm94aWVzX3VzZV9zcGR5X2RlZmF1bHRcIixcbiAgUE9SVF9QUkVGRVJFTkNFX0xJU1Q6IFwicG9ydF9wcmVmZXJlbmNlX2xpc3RcIixcbiAgTkVFRFNfVkVSSUZJQ0FUSU9OOiBcIm5lZWRzX3ZlcmlmaWNhdGlvblwiLFxuICBTSUdOX0lOX0NBQ0hFRF9FTUFJTDogXCJzaWduX2luX2NhY2hlZF9lbWFpbFwiLFxuICBJTlNUQU5UX1RSSUFMX0VYUElSWV9FUE9DSDogXCJpbnN0YW50X3RyaWFsX2V4cGlyeV9lcG9jaFwiLFxuICBJTlNUQU5UX1RSSUFMX1NUQVJURURfRVBPQ0g6IFwiaW5zdGFudF90cmlhbF9zdGFydGVkX2Vwb2NoXCIsXG4gIEFQSV9IT1NUX1BJTkdfUkVTVUxUUzogXCJhcGlfaG9zdF9waW5nX3Jlc3VsdHNcIixcbiAgU0hPV19VUEdSQURFX1dJTkRPV19JTl9PUFRJT05TOiBcInNob3dfdXBncmFkZV9vcHRpb25zXCIsXG4gIEhBU19TSE9XTl9BTlhJRVRZX05PVElGSUNBVElPTl8zME1JTjogXCJoYXNfc2hvd25fYW54aWV0eV9ub3RpZmljYXRpb25fMzBtaW5cIixcbiAgSEFTX1NIT1dOX0FOWElFVFlfTk9USUZJQ0FUSU9OXzMwTUlOOiBcImhhc19zaG93bl9hbnhpZXR5X25vdGlmaWNhdGlvbl8zMG1pblwiLFxuICBIQVNfU0hPV05fQU5YSUVUWV9OT1RJRklDQVRJT05fNU1JTjogXCJoYXNfc2hvd25fYW54aWV0eV9ub3RpZmljYXRpb25fNW1pblwiLFxuICBIQVNfU0hPV05fQU5YSUVUWV9OT1RJRklDQVRJT05fMU1JTjogXCJoYXNfc2hvd25fYW54aWV0eV9ub3RpZmljYXRpb25fMW1pblwiLFxuICBMQVNUX0FDVElWQVRJT05fVElNRVNUQU1QOiBcImxhc3RfYWN0aXZhdGlvbl90aW1lc3RhbXBcIixcbiAgQUNUSVZBVElPTl9USU1FU1RBTVBfTE9HUzogXCJhY3RpdmF0aW9uX3RpbWVzdGFtcF9sb2dzXCIsXG4gIERBSUxZX0hPVVJMWV9MSU1JVDogXCJkYWlseV9ob3VybHlfbGltaXRcIixcbiAgREFJTFlfTUlOVVRFX0xJTUlUOiBcImRhaWx5X21pbnV0ZV9saW1pdFwiLFxuICBIQVNfQ0hPU0VOX1BMQU46IFwiaGFzX2Nob3Nlbl9wbGFuXCIsXG4gIFNQRFlfQVVUSF9DUkVEUzogXCJzcGR5X2F1dGhfY3JlZHNcIixcbiAgSVNfTUFLSU5HX1BBWU1FTlQ6IFwiaXNfbWFraW5nX3BheW1lbnRcIixcbiAgUFJJQ0lORzogXCJwcmljaW5nXCIsXG4gIENPVU5UUlk6IFwiY291bnRyeVwiLFxuICBQUk9YWV9EVVJBVElPTjogXCJwcm94eV9kdXJhdGlvblwiLFxuICBHT01fQlVUVE9OX1BSRVNTX0NPVU5UOiBcImdvbV9idXR0b25fcHJlc3NfY291bnRcIixcbiAgSEFTX0FDQ09VTlRfSVNTVUVTOiBcImhhc19hY2NvdW50X2lzc3Vlc1wiLFxuICBTVUdHRVNURURfQURET05TOiBcInN1Z2dlc3RlZF9hZGRvbnNcIixcbiAgQURET05TOiBcImluc3RhbGxlZF9hZGRvbnNcIixcbiAgSVNfSE9XX1RPX1VTRV9PUFRJT05fVE9PTFRJUF9ISURERU46IFwiaXNfaG93X3RvX3VzZV9vcHRpb25fdG9vbHRpcF9oaWRkZW5cIixcbiAgQ09VTlRSWTogXCJjb3VudHJ5XCIsXG4gIEhJREVfSU5DT0dfVE9PTFRJUDogXCJoaWRlX2luY29nX3Rvb2x0aXBcIixcbiAgSEFTX1JBVEVEX0dPTTogXCJoYXNfcmF0ZWRfZ29tXCIsXG4gIENBQ0hFRF9BQ0NPVU5UX0lORk86IFwiY2FjaGVkX2FjY291bnRfaW5mb1wiLFxuICBDQUNIRURfUEFZTUVOVF9QTEFOOiBcImNhY2hlZF9wYXltZW50X3BsYW5cIixcbiAgQ0FDSEVEX1BBWU1FTlRfQ1JFRElUOiBcImNhY2hlZF9wYXltZW50X2NyZWRpdFwiLFxuICBDQUNIRURfR09MRDogXCJjYWNoZWRfZ29sZF9pbmZvXCIsXG4gIENBQ0hFRF9QUk9YWV9PQko6IFwiY2FjaGVkX3Byb3h5X29ialwiLFxuICBQQVlNRU5UX1VSTDogXCJwYXltZW50X3VybFwiLFxuICBTQUFTWV9QQVlNRU5UX1VSTDogXCJzYWFzeV9wYXltZW50X3VybFwiLFxuICBFTUFJTDogXCJnb200X2VtYWlsXCIsXG4gIFBBU1NXT1JEOiBcImdvbTRfcGFzc3dkXCIsXG4gIEFDQ0VTU19UT0tFTjogXCJnb200X2FjY2Vzc190b2tlblwiLFxuICBDQUNIRURfVE9LRU46IFwiY2FjaGVkX3Rva2VuXCIsXG4gIENBQ0hFRF9FTUFJTDogXCJjYWNoZWRfZW1haWxcIixcbiAgVVNFUl9JRDogXCJ1c2VyX2lkXCIsXG4gIERFVklDRV9JRDogXCJkZXZpY2VfaWRcIixcbiAgU0VSVklDRV9UT0tFTjogXCJzZXJ2aWNlX3Rva2VuXCIsXG4gIEhBU19TSE9XTl9USVBTOiBcImhhc19zaG93bl90aXBzXCIsXG4gIFBST1hZX1NUQVRFOiBcInByb3h5X3N0YXRlXCIsXG4gIExPQURfUFJPWFlfU1RBVEU6IFwicHJveHlfbG9hZGluZ19zdGF0ZVwiLFxuICBQUk9YWV9TVEFSVEVEX1VOSVhfVElNRVNUQU1QOiBcInByb3h5X3N0YXJ0ZWRfdW5peF90aW1lc3RhbXBcIixcbiAgUFJJQ0lOR19GRUU6IFwicHJpY2luZ19mZWVcIixcbiAgUFJJQ0lOR19SQVc6IFwicHJpY2luZ19yYXdcIixcbiAgUFJJQ0lOR19UT1RBTDogXCJwcmljaW5nX3RvdGFsXCIsXG4gIFBSSUNJTkdfUExBTjogXCJwcmljaW5nX3BsYW5cIixcbiAgTEFTVF9GUkVFX1BMQU5fTkFHX1RJTUVTVEFNUDogXCJsYXN0X3NwZWVkX2Jvb3N0ZXJfbmFnX3RpbWVzdGFtcFwiLFxuICBQUk9YWV9GRVRDSF9USU1FU1RBTVA6IFwicHJveHlfZmV0Y2hfdGltZXN0YW1wXCIsXG4gIElTX1JFU0VUVElORzogXCJpc19yZXNldHRpbmdcIixcbiAgUkVMT0FEX0NPVU5UOiBcInJlbG9hZF9jb3VudFwiLFxuICBGUkVFX1RJRVJfTUlOUzogXCJmcmVlX3RpZXJfbWluc1wiLFxuICBGUkVFX1RJRVJfUkVDSEFSR0VfTUlOUzogXCJmcmVlX3RpZXJfcmVjaGFyZ2VfbWluc1wiLFxuICBIQVNfQUxSRUFEWV9JTlZJVEVEX1VTRVJTOiBcImhhc19pbnZpdGVkX3VzZXJzXCIsXG4gIEFDVElWQVRJT05fVVNBR0U6ICdhY3RpdmF0aW9uX3VzYWdlJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2VudW0va2V5cy5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgcGFnZXM7XG5cbnBhZ2VzID0ge1xuICBQT1BVUDoge1xuICAgIFNJR05fSU46ICcvcGFnZXMvcG9wdXBzL3NpZ25faW4uaHRtbCcsXG4gICAgQ09VTlRET1dOOiAnL3BhZ2VzL3BvcHVwcy9mcmVlX3RpZXJfY291bnRkb3duLmh0bWwnLFxuICAgIEFDVElWQVRJT046ICcvcGFnZXMvcG9wdXBzL2FjdGl2YXRpb24uaHRtbCcsXG4gICAgRElTQ09OTkVDVDogJy9wYWdlcy9wb3B1cHMvZGlzY29ubmVjdC5odG1sJyxcbiAgICBWRVJJRllfRU1BSUw6ICcvcGFnZXMvcG9wdXBzL3ZlcmlmeV9lbWFpbC5odG1sJyxcbiAgICBET05FX1dJVEhfUEFZTUVOVDogJy9wYWdlcy9wb3B1cHMvZG9uZV93aXRoX3BheW1lbnQuaHRtbCdcbiAgfSxcbiAgT1BUSU9OUzogJy9wYWdlcy9vcHRpb25zLmh0bWwnLFxuICBTSUdOX0lOOiAnL3BhZ2VzL3NpZ25faW4uaHRtbCcsXG4gIFBSSUNJTkc6ICcvcGFnZXMvcHJpY2luZy5odG1sJyxcbiAgUkVHSVNUUkFUSU9OX1BBU1NXT1JEOiAnL3BhZ2VzL3JlZ2lzdGVyLmh0bWwnLFxuICBSRVBBSVI6ICcvcGFnZXMvcmVwYWlyLmh0bWwnLFxuICBSRUdJU1RSQVRJT05fU0lHTl9JTl9QQVNTV0Q6ICcvcGFnZXMvc2lnbl9pbl93X3Bhc3N3b3JkLmh0bWwnLFxuICBIT1dfVE9fVVNFOiAnL3BhZ2VzL2JlZ2luX3VzaW5nLmh0bWwnLFxuICBUSVA6ICcvcGFnZXMvdGlwLmh0bWwnLFxuICBRVU9UQVRJT046ICcvcGFnZXMvcXVvdGF0aW9uLmh0bWwnLFxuICBJTlZJVEU6ICcvcGFnZXMvaW52aXRlLmh0bWwnLFxuICBJTlZJVEVfU1VDQ0VTUzogJy9wYWdlcy9zdWNjZXNzZnVsbHlfaW52aXRlZC5odG1sJyxcbiAgR09MRF9QUk9NT1RJT046ICcvcGFnZXMvZ29sZC5odG1sJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwYWdlcztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtL3BhZ2VzLmpzXCIsXCIvZW51bVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBlcnJvcnM7XG5cbmVycm9ycyA9IHtcbiAgQ09ORkxJQ1RJTkdfRVhURU5TSU9OOiBcImNvbmZsaWNpdG5nX2V4dGVuc2lvblwiLFxuICBSRVFVSVJFX0VNQUlMX1ZFUklGSUNBVElPTjogXCJyZXF1aXJlX2VtYWlsX3ZlcmlmaWNhdGlvblwiLFxuICBORVRXT1JLX0VSUk9SOiBcIm5ldHdvcmtfZXJyb3JcIlxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBlcnJvcnM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW51bS9wcm94eV9hY3RpdmF0aW9uX2Vycm9ycy5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgcHJveHlfbG9hZGluZ19zdGF0ZTtcblxucHJveHlfbG9hZGluZ19zdGF0ZSA9IHtcbiAgTE9BRElORzogJ2xvYWRpbmcnLFxuICBTVUNDRVNTOiAnc3VjY2VzcycsXG4gIE5FVFdPUktfRVJST1I6ICduZXR3b3JrX2Vycm9yJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcm94eV9sb2FkaW5nX3N0YXRlO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2VudW0vcHJveHlfbG9hZGluZ19zdGF0ZXMuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHByb3h5X3N0YXRlO1xuXG5wcm94eV9zdGF0ZSA9IHtcbiAgQUNUSVZFOiAnYWN0aXZlJyxcbiAgUEFTU0lWRTogJ3Bhc3NpdmUnXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3h5X3N0YXRlO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2VudW0vcHJveHlfc3RhdGVzLmpzXCIsXCIvZW51bVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBiYXNlLCBrZXlzLCBwYWdlcztcblxuYmFzZSA9IHJlcXVpcmUoJy4vYmFzZScpO1xuXG5rZXlzID0gcmVxdWlyZSgnLi9lbnVtL2tleXMnKTtcblxucGFnZXMgPSByZXF1aXJlKCcuL2VudW0vcGFnZXMnKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKFwiI2RvbmUtd2l0aC1wYXltZW50LWJ0blwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYXNlLm9wZW5QYWdlKHBhZ2VzLk9QVElPTlMpO1xuICB9KTtcbn0pO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfMjIzMGMxZDQuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbWVzc2FnZXM7XG5cbm1lc3NhZ2VzID0ge1xuICBUUllJTkdfR09NOiBcIllvdSBhcmUgY3VycmVudGx5IHRyeWluZyBHb21cIixcbiAgVFJJQUxfV0lMTF9FWFBJUkU6IFwiWW91ciB0cmlhbCB3aWxsIGV4cGlyZSBpbiAle2R1cmF0aW9ufVwiLFxuICBTSUdOX0lOX0ZPUl9GVUxMX0dPTTogXCJTaWduIGluIGZvciB0aGUgZnVsbCBHb20gZXhwZXJpZW5jZVwiLFxuICBTSUdOSU5HX1lPVV9JTjogXCJTaWduaW5nIHlvdSBpbi4uXCIsXG4gIFNZTkNJTkdfQUNDT1VOVF9JTkZPOiBcIlN5bmNpbmcgYWNjb3VudCBpbmZvLi5cIixcbiAgQU5YSUVUWV9CT0RZX0NUQTogXCJHZXQgbW9yZSB0aW1lXCIsXG4gIEFOWElFVFlfVElUTEVfMzBNSU5TOiBcIjMwIG1pbnV0ZXMgbGVmdFwiLFxuICBBTlhJRVRZX0JPRFk6IFwiWW91IGNhbiBjdXJyZW50bHkgb24gdGhlIEZyZWUgcGxhbi4gWW91IGNhbiB1c2UgR29tIGZvciAle2hvdXJ9IGhvdXIocykgLyBkYXkuXCIsXG4gIEFOWElFVFlfVElUTEVfNU1JTlM6IFwiNSBtaW51dGVzIGxlZnRcIixcbiAgQU5YSUVUWV9USVRMRV8xTUlOOiBcIjEgbWludXRlIGxlZnRcIixcbiAgQU5YSUVUWV9USVRMRV9FWFBJUkU6IFwiR29tIGlzIHBhdXNlZFwiLFxuICBBTlhJRVRZX0JPRFlfRVhQSVJFOiBcIllvdSBoYXZlIGZpbmlzaGVkIHlvdXIgZGFpbHkgZnJlZSBsaW1pdCBvZiBHb21cIixcbiAgR09NX1BSRVZJRVdfRVhQSVJFRDogXCJTaWduIGluIHRvIGJlZ2luXCIsXG4gIFNJR05fSU5fVE9fQ09OVElOVUVfR09NOiBcIkltbWVkaWF0ZWx5IGJ5cGFzcyBibG9ja2VkIHNpdGVzXCIsXG4gIFZJRVdfQURET05TOiBcIlNlZSBhbGwgaW5zdGFsbGVkIGFkZG9uc1wiLFxuICBTTUFSVF9WUE5fRU5BQkxFRDogXCJHb20gZW5hYmxlZFwiLFxuICBTVUNDRVNTX01TRzogXCJFbnRlciB5b3VyIGZhdm91cml0ZSBibG9ja2VkIHNpdGUncyBVUkwgYW5kIGVuam95IGFic29sdXRlIGZyZWVkb20hXCIsXG4gIEVSUk9SX0NPTlRBQ1RJTkdfU0VSVkVSOiBcIlRoZXJlIGlzIGFuIGVycm9yIHRyeWluZyB0byBjb250YWN0IHRoZSBzZXJ2ZXIuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIhXCIsXG4gIFNIT1dfQUxMX0VYVFM6IFwiU2hvdyBhbGwgZXh0ZW5zaW9uc1wiLFxuICBESVNBQkxFX09USEVSX0VYVEVOU0lPTlM6IFwiUGxlYXNlIGRpc2FibGUgb3RoZXIgZXh0ZW5zaW9ucyB0byB1c2UgR29tXCIsXG4gIE9USEVSX0VYVEVOU0lPTlNfVVNJTkc6IFwiT3RoZXIgZXh0ZW5zaW9ucyBhcmUgcHJldmVudGluZyBHb20gZnJvbSBiZWluZyBlbmFibGVkXCIsXG4gIFJBVEVfNV9TVEFSUzogXCJEbyB5b3UgZmluZCBHb20gdXNlZnVsPyBIZWxwIHJhdGUgR29tIDUgc3RhcnMgOilcIixcbiAgRVJST1JfRU5BQkxJTkdfR09NOiBcIkVycm9yIGFjdGl2YXRpbmcgR29tXCIsXG4gIElTU1VFUzogXCJUaGVyZSBhcmUgaXNzdWVzIHdpdGggeW91ciBhY2NvdW50XCIsXG4gIEVNQUlMX0FETUlOOiBcIkVtYWlsIGFkbWluXCIsXG4gIE9PUFM6IFwiT29wc1wiLFxuICBBTExPV19JTkNPR05JVE86IFwiRW5hYmxlIEdvbSB0byBiZSB1c2VkIGluIEluY29nbml0byBtb2RlXCIsXG4gIFJFSU5TVEFMTF9HT006IFwiT29wcywgdGhlcmUgc2VlbXMgdG8gYmUgYW4gaXNzdWUgd2l0aCBHb20uIFBsZWFzZSByZWluc3RhbGwgR29tIGF0IGh0dHA6Ly9nZXRnb20uY29tXCIsXG4gIE5PX01PUkVfSU5TVEFOVF9UUklBTDogXCJJbnN0YW50IHRyaWFsIGlzIG5vdCBhdmFpbGFibGUgZm9yIHRoaXMgZGV2aWNlLiBQbGVhc2Ugc2lnbiBpbiB0byBjb250aW51ZSB1c2luZyBHb20uXCIsXG4gIEFDVElWQVRFX0dPTTogXCJBY3RpdmF0ZSBHb20gVlBOXCIsXG4gIERJU0NPTk5FQ1RfR09NOiBcIkRpc2Nvbm5lY3QgR29tXCIsXG4gIEdFVFRJTkdfUEVSTUlTU0lPTjogXCJHZXR0aW5nIHBlcm1pc3Npb24gdG8gbG9nIHlvdSBpbi4uXCIsXG4gIFNJR05JTl9FUlJPUjogXCJUaGVyZSBpcyBhbiBlcnJvciBzaWduaW5nIHlvdSBpbi4gRWl0aGVyIHlvdXIgZW1haWwgb3IgeW91ciBwYXNzd29yZCBpcyBpbmNvcnJlY3QuXCIsXG4gIFNFQU1MRVNTX1NJR05fSU5fRVJST1I6IFwiVGhlcmUgYXJlIGlzc3VlcyBzaWduaW5nIHlvdSBpbi5cXG5cXG5cXG5DbGljayBvbiBTaWduIEluLCBvZiB3aGljaCB0aGVyZSBzaG91bGQgYmUgYSBwb3B1cCBhc2tpbmcgeW91IHRvIGF1dGhvcml6ZSBHb29nbGUgdG8gc2lnbiB5b3UgaW50byBHT00uIFlvdSBtdXN0IGNsaWNrIE9LLlxcblxcblxcblxcbklmIHlvdXIgQ2hyb21lIGlzIG5vdCBzeW5jZWQgd2l0aCBhIEdtYWlsIGFjY291bnQsIGl0IHdpbGwgb3BlbiBhIG5ldyB3aW5kb3cgYXNraW5nIHlvdSB0byBzaWduIGludG8geW91ciBHbWFpbCBhY2NvdW50LiBPZiB3aGljaCB5b3Ugc2hvdWxkIGRvIHRoYXQsIGFuZCB0aGVuIHlvdSB3aWxsIGJlIGxvZ2dlZCBpbnRvIEdPTS5cIixcbiAgU0VSVkVSX0VSUk9SOiBcIlRoZXJlIHNlZW1zIHRvIGJlIGFuIGVycm9yIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgc2VydmVyLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLlwiLFxuICBSRUdJU1RSQVRJT05fRVJST1I6IFwiT29wcywgdGhlcmUgaXMgYW4gZXJyb3IgcmVnaXN0ZXJpbmcgeW91ciBhY2NvdW50LiBJdCBjb3VsZCBlaXRoZXIgYmUgdGhhdCB0aGUgYWNjb3VudCBhbHJlYWR5IGV4aXN0cywgb3IgdGhhdCB3ZSBjYW5ub3QgY29udGFjdCB0aGUgc2VydmVyLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIVwiLFxuICBTVFJFQU1fTVVTSUNfQU5EX0ZBU1RFUl9GQVNURVI6IFwiU3RyZWFtIG11c2ljIGFuZCB2aWRlb3MgZmFzdGVyXCIsXG4gIEdPTV9WUE5fVVBHUkFERUQ6IFwiR29tIFZQTiBpcyBub3cgdXBncmFkZWQgdG8gc3VwZXItZmFzdCAxMDAwZ2JpdCBzcGVlZHNcIixcbiAgU0lHTl9JTl9GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1M6IFwiU2lnbiBpbiBmb3IgdW5pbnRlcnJ1cHRlZCBhY2Nlc3NcIixcbiAgTk9UX1NJR05FRF9JTjogXCJZb3UgYXJlIGN1cnJlbnRseSBub3Qgc2lnbmVkIGluXCIsXG4gIE9OX0ZSRUVfUExBTjogXCJZb3UgYXJlIG9uIEdvbSdzIGZyZWUgcGxhblwiLFxuICBHT19QUk9fRk9SX1VOSU5URVJSVVBURURfQUNDRVNTOiBcIlVwZ3JhZGUgdG8gUHJvIGZvciB1bmludGVycnVwdGVkIGFjY2Vzc1wiLFxuICBHT01fVFVSTkVEX09GRjogXCJHb20gaXMgbm93IHR1cm5lZCBvZmZcIixcbiAgVVNFRF9CRVlPTkRfRlJFRV9USUVSOiBcIllvdSBoYXZlIGp1c3QgdXNlZCB7e2ZyZWVfdGllcl9taW5zfX0gbWludXRlcyBvZiBHb20sIGFuZCB3aWxsIGhhdmUgdG8gd2FpdCB7e3JlY2hhcmdlX21pbnN9fSBtaW51dGVzIGJlZm9yZSB5b3UgY2FuIHVzZSBHb20gYWdhaW5cIixcbiAgQUNRVUlSSU5HX0NPTlRBQ1RTOiBcIkdldHRpbmcgcGVybWlzc2lvbnMgdG8gZmV0Y2ggeW91ciBjb250YWN0cy4uLlwiLFxuICBBQ1FVSVJFX0NPTlRBQ1RTX1NDT1BFX0VSUk9SOiBcIlRoZXJlIHdhcyBhbiBpc3N1ZSByZXRyaXZpbmcgeW91ciBjb250YWN0cy4gUGxlYXNlIHJlZnJlc2ggdGhlIHBhZ2UgYW5kIGNsaWNrIE9LIHdoZW4gYXNrZWQgdG8gYXV0aG9yaXplIEdvbSBpbiBvcmRlciB0byBwcm9jZWVkLlwiLFxuICBJTlZJVEVfQ09OVEFDVFNfU1VDQ0VTUzogXCJTdWNjZXNzZnVsbHkgaW52aXRlZCB5b3VyIGNvbnRhY3RzIHRvIEdvbS4gWW91IHdpbGwgcmVjZWl2ZSBQcm8gY3JlZGl0cyB3aGVuIHlvdXIgZnJpZW5kcyBhY2NlcHQgeW91ciBpbnZpdGVcIixcbiAgQUNDRVBUSU5HX0lOVklURTogXCJFeHRlbmRpbmcgeW91ciBmcmVlIHRyaWFsIGJlY2F1c2UgeW91IGFjY2VwdGVkIGFuIGludml0ZVwiLFxuICBFTkNSWVBUSU9OX1RVUk5fT0ZGOiBcIihUdXJuIG9mZiBmb3IgbW9yZSBzcGVlZClcIixcbiAgRU5DUllQVElPTl9UVVJOX09OOiBcIihUdXJuIG9uIGZvciBtb3JlIHNlY3VyaXR5KVwiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lc3NhZ2VzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21lc3NhZ2VzL2VuLmpzXCIsXCIvbWVzc2FnZXNcIikiXX0=
