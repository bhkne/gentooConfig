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
var base, doCreateAccountSubmit, en_messages, iced, initView, keys, pages, proxy_loading_states, proxy_states, __iced_k, __iced_k_noop,
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

en_messages = require('./messages/en');

base = require('./base');

keys = require('./enum/keys');

pages = require('./enum/pages');

proxy_states = require('./enum/proxy_states');

proxy_loading_states = require('./enum/proxy_loading_states');

doCreateAccountSubmit = function() {
  var cookie, emailAddr, isPaymentNeeded, laddaBtn, passwd, serviceToken, successfullySynced, ___iced_passed_deferral, __iced_deferrals, __iced_k;
  __iced_k = __iced_k_noop;
  ___iced_passed_deferral = iced.findDeferral(arguments);
  laddaBtn = Ladda.create(document.querySelector('#new-account-password-ladda-btn'));
  (function(_this) {
    return (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral,
        filename: "/Users/nubela/Workspace/gom-chrome/src/pages/js/register.coffee"
      });
      base.getLocalData(keys.SIGN_IN_CACHED_EMAIL, null, __iced_deferrals.defer({
        assign_fn: (function() {
          return function() {
            return emailAddr = arguments[0];
          };
        })(),
        lineno: 9
      }));
      __iced_deferrals._fulfill();
    });
  })(this)((function(_this) {
    return function() {
      if (typeof emailAddr === "undefined" || emailAddr === null) {
        redirect(pages.SIGN_IN);
        return;
      }
      if ($("#new-account-form").parsley().validate()) {
        laddaBtn.start();
        passwd = $("#passwd").val();
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            filename: "/Users/nubela/Workspace/gom-chrome/src/pages/js/register.coffee"
          });
          base.register(emailAddr, passwd, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return serviceToken = arguments[0];
              };
            })(),
            lineno: 17
          }));
          __iced_deferrals._fulfill();
        })(function() {
          if (typeof serviceToken === "undefined" || serviceToken === null) {
            laddaBtn.stop();
            base.makeToast(en_messages.REGISTRATION_ERROR, 10000);
            return;
          }
          base.setLocalData(keys.SERVICE_TOKEN, serviceToken);
          base.setLocalData(keys.CACHED_EMAIL, emailAddr);
          base.makeToast(en_messages.SYNCING_ACCOUNT_INFO);
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              filename: "/Users/nubela/Workspace/gom-chrome/src/pages/js/register.coffee"
            });
            base.sync(__iced_deferrals.defer({
              assign_fn: (function() {
                return function() {
                  return successfullySynced = arguments[0];
                };
              })(),
              lineno: 29
            }));
            __iced_deferrals._fulfill();
          })(function() {
            if (!successfullySynced) {
              laddaBtn.stop();
              base.makeToast(SERVER_ERROR);
              return;
            }
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                filename: "/Users/nubela/Workspace/gom-chrome/src/pages/js/register.coffee"
              });
              chrome.cookies.get({
                url: base.getWebsite(),
                name: 't'
              }, __iced_deferrals.defer({
                assign_fn: (function() {
                  return function() {
                    return cookie = arguments[0];
                  };
                })(),
                lineno: 39
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                if (typeof cookie !== "undefined" && cookie !== null) {
                  base.makeToast(en_messages.ACCEPTING_INVITE);
                  (function(__iced_k) {
                    __iced_deferrals = new iced.Deferrals(__iced_k, {
                      parent: ___iced_passed_deferral,
                      filename: "/Users/nubela/Workspace/gom-chrome/src/pages/js/register.coffee"
                    });
                    base.acceptInvite(cookie.value, __iced_deferrals.defer({
                      lineno: 42
                    }));
                    __iced_deferrals._fulfill();
                  })(__iced_k);
                } else {
                  return __iced_k();
                }
              })(function() {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    filename: "/Users/nubela/Workspace/gom-chrome/src/pages/js/register.coffee"
                  });
                  base.isPaymentNeeded(__iced_deferrals.defer({
                    assign_fn: (function() {
                      return function() {
                        return isPaymentNeeded = arguments[0];
                      };
                    })(),
                    lineno: 44
                  }));
                  __iced_deferrals._fulfill();
                })(function() {
                  if (isPaymentNeeded) {
                    base.redirect(pages.OPTIONS);
                    return;
                  }
                  base.setLocalData(keys.LOAD_PROXY_STATE, proxy_loading_states.LOADING);
                  base.setLocalData(keys.PROXY_STATE, proxy_states.PASSIVE);
                  return __iced_k(base.redirect(pages.OPTIONS));
                });
              });
            });
          });
        });
      } else {
        return __iced_k();
      }
    };
  })(this));
};

initView = function() {
  $("#new-account-form").on("submit", function(e) {
    e.preventDefault();
    doCreateAccountSubmit();
    return false;
  });
  return $("#new-account-password-btn").on("click", function() {
    doCreateAccountSubmit();
    return false;
  });
};

$(document).ready(function() {
  return initView();
});

}).call(this,require("pBGvAp"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_7b2aa8d0.js","/")
},{"./base":5,"./enum/keys":9,"./enum/pages":10,"./enum/proxy_loading_states":12,"./enum/proxy_states":13,"./messages/en":15,"buffer":2,"pBGvAp":4}],15:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvdG1wL2Jhc2UuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9jb25maWcuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9jb25zdGFudHMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9lbnVtL2ZpbmFsLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvZW51bS9rZXlzLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvZW51bS9wYWdlcy5qcyIsIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvdG1wL2VudW0vcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9lbnVtL3Byb3h5X2xvYWRpbmdfc3RhdGVzLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvZW51bS9wcm94eV9zdGF0ZXMuanMiLCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3RtcC9mYWtlXzdiMmFhOGQwLmpzIiwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS90bXAvbWVzc2FnZXMvZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1K0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBsb29rdXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7XG5cbjsoZnVuY3Rpb24gKGV4cG9ydHMpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG4gIHZhciBBcnIgPSAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKVxuICAgID8gVWludDhBcnJheVxuICAgIDogQXJyYXlcblxuXHR2YXIgUExVUyAgID0gJysnLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIICA9ICcvJy5jaGFyQ29kZUF0KDApXG5cdHZhciBOVU1CRVIgPSAnMCcuY2hhckNvZGVBdCgwKVxuXHR2YXIgTE9XRVIgID0gJ2EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFVQUEVSICA9ICdBJy5jaGFyQ29kZUF0KDApXG5cdHZhciBQTFVTX1VSTF9TQUZFID0gJy0nLmNoYXJDb2RlQXQoMClcblx0dmFyIFNMQVNIX1VSTF9TQUZFID0gJ18nLmNoYXJDb2RlQXQoMClcblxuXHRmdW5jdGlvbiBkZWNvZGUgKGVsdCkge1xuXHRcdHZhciBjb2RlID0gZWx0LmNoYXJDb2RlQXQoMClcblx0XHRpZiAoY29kZSA9PT0gUExVUyB8fFxuXHRcdCAgICBjb2RlID09PSBQTFVTX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSCB8fFxuXHRcdCAgICBjb2RlID09PSBTTEFTSF9VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qc1wiLFwiLy4uL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MlxuXG4vKipcbiAqIElmIGBCdWZmZXIuX3VzZVR5cGVkQXJyYXlzYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFVzZSBPYmplY3QgaW1wbGVtZW50YXRpb24gKGNvbXBhdGlibGUgZG93biB0byBJRTYpXG4gKi9cbkJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgPSAoZnVuY3Rpb24gKCkge1xuICAvLyBEZXRlY3QgaWYgYnJvd3NlciBzdXBwb3J0cyBUeXBlZCBBcnJheXMuIFN1cHBvcnRlZCBicm93c2VycyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLFxuICAvLyBDaHJvbWUgNyssIFNhZmFyaSA1LjErLCBPcGVyYSAxMS42KywgaU9TIDQuMisuIElmIHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkaW5nXG4gIC8vIHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgIGluc3RhbmNlcywgdGhlbiB0aGF0J3MgdGhlIHNhbWUgYXMgbm8gYFVpbnQ4QXJyYXlgIHN1cHBvcnRcbiAgLy8gYmVjYXVzZSB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gYWRkIGFsbCB0aGUgbm9kZSBCdWZmZXIgQVBJIG1ldGhvZHMuIFRoaXMgaXMgYW4gaXNzdWVcbiAgLy8gaW4gRmlyZWZveCA0LTI5LiBOb3cgZml4ZWQ6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOFxuICB0cnkge1xuICAgIHZhciBidWYgPSBuZXcgQXJyYXlCdWZmZXIoMClcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoYnVmKVxuICAgIGFyci5mb28gPSBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9XG4gICAgcmV0dXJuIDQyID09PSBhcnIuZm9vKCkgJiZcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAvLyBDaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59KSgpXG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEJ1ZmZlcikpXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybylcblxuICB2YXIgdHlwZSA9IHR5cGVvZiBzdWJqZWN0XG5cbiAgLy8gV29ya2Fyb3VuZDogbm9kZSdzIGJhc2U2NCBpbXBsZW1lbnRhdGlvbiBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgc3RyaW5nc1xuICAvLyB3aGlsZSBiYXNlNjQtanMgZG9lcyBub3QuXG4gIGlmIChlbmNvZGluZyA9PT0gJ2Jhc2U2NCcgJiYgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KVxuICAgIHdoaWxlIChzdWJqZWN0Lmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgJz0nXG4gICAgfVxuICB9XG5cbiAgLy8gRmluZCB0aGUgbGVuZ3RoXG4gIHZhciBsZW5ndGhcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KVxuICBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJylcbiAgICBsZW5ndGggPSBCdWZmZXIuYnl0ZUxlbmd0aChzdWJqZWN0LCBlbmNvZGluZylcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ29iamVjdCcpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QubGVuZ3RoKSAvLyBhc3N1bWUgdGhhdCBvYmplY3QgaXMgYXJyYXktbGlrZVxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCBuZWVkcyB0byBiZSBhIG51bWJlciwgYXJyYXkgb3Igc3RyaW5nLicpXG5cbiAgdmFyIGJ1ZlxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIC8vIFByZWZlcnJlZDogUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UgZm9yIGJlc3QgcGVyZm9ybWFuY2VcbiAgICBidWYgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIFRISVMgaW5zdGFuY2Ugb2YgQnVmZmVyIChjcmVhdGVkIGJ5IGBuZXdgKVxuICAgIGJ1ZiA9IHRoaXNcbiAgICBidWYubGVuZ3RoID0gbGVuZ3RoXG4gICAgYnVmLl9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmIHR5cGVvZiBzdWJqZWN0LmJ5dGVMZW5ndGggPT09ICdudW1iZXInKSB7XG4gICAgLy8gU3BlZWQgb3B0aW1pemF0aW9uIC0tIHVzZSBzZXQgaWYgd2UncmUgY29weWluZyBmcm9tIGEgdHlwZWQgYXJyYXlcbiAgICBidWYuX3NldChzdWJqZWN0KVxuICB9IGVsc2UgaWYgKGlzQXJyYXlpc2goc3ViamVjdCkpIHtcbiAgICAvLyBUcmVhdCBhcnJheS1pc2ggb2JqZWN0cyBhcyBhIGJ5dGUgYXJyYXlcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkpXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3QucmVhZFVJbnQ4KGkpXG4gICAgICBlbHNlXG4gICAgICAgIGJ1ZltpXSA9IHN1YmplY3RbaV1cbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBidWYud3JpdGUoc3ViamVjdCwgMCwgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgIW5vWmVybykge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgYnVmW2ldID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuLy8gU1RBVElDIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiAoYikge1xuICByZXR1cm4gISEoYiAhPT0gbnVsbCAmJiBiICE9PSB1bmRlZmluZWQgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gZnVuY3Rpb24gKHN0ciwgZW5jb2RpbmcpIHtcbiAgdmFyIHJldFxuICBzdHIgPSBzdHIgKyAnJ1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8ICd1dGY4Jykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoIC8gMlxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdyYXcnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gYmFzZTY0VG9CeXRlcyhzdHIpLmxlbmd0aFxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAqIDJcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGFzc2VydChpc0FycmF5KGxpc3QpLCAnVXNhZ2U6IEJ1ZmZlci5jb25jYXQobGlzdCwgW3RvdGFsTGVuZ3RoXSlcXG4nICtcbiAgICAgICdsaXN0IHNob3VsZCBiZSBhbiBBcnJheS4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH0gZWxzZSBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICByZXR1cm4gbGlzdFswXVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgdG90YWxMZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcih0b3RhbExlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBCVUZGRVIgSU5TVEFOQ0UgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gX2hleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgYXNzZXJ0KHN0ckxlbiAlIDIgPT09IDAsICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBhc3NlcnQoIWlzTmFOKGJ5dGUpLCAnSW52YWxpZCBoZXggc3RyaW5nJylcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBieXRlXG4gIH1cbiAgQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBpICogMlxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBfdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2FzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX2JpbmFyeVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIF9hc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBTdXBwb3J0IGJvdGggKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKVxuICAvLyBhbmQgdGhlIGxlZ2FjeSAoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpXG4gIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgaWYgKCFpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoXG4gICAgbGVuZ3RoID0gc3dhcFxuICB9XG5cbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgc2VsZiA9IHRoaXNcblxuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKClcbiAgc3RhcnQgPSBOdW1iZXIoc3RhcnQpIHx8IDBcbiAgZW5kID0gKGVuZCAhPT0gdW5kZWZpbmVkKVxuICAgID8gTnVtYmVyKGVuZClcbiAgICA6IGVuZCA9IHNlbGYubGVuZ3RoXG5cbiAgLy8gRmFzdHBhdGggZW1wdHkgc3RyaW5nc1xuICBpZiAoZW5kID09PSBzdGFydClcbiAgICByZXR1cm4gJydcblxuICB2YXIgcmV0XG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gX2hleFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IF91dGY4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgICAgcmV0ID0gX2FzY2lpU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldCA9IF9iaW5hcnlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0ID0gX2Jhc2U2NFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBfdXRmMTZsZVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gKHRhcmdldCwgdGFyZ2V0X3N0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIHZhciBzb3VyY2UgPSB0aGlzXG5cbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKCF0YXJnZXRfc3RhcnQpIHRhcmdldF9zdGFydCA9IDBcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCBzb3VyY2UubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdzb3VyY2VFbmQgPCBzb3VyY2VTdGFydCcpXG4gIGFzc2VydCh0YXJnZXRfc3RhcnQgPj0gMCAmJiB0YXJnZXRfc3RhcnQgPCB0YXJnZXQubGVuZ3RoLFxuICAgICAgJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSBzb3VyY2UubGVuZ3RoLCAnc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aClcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCA8IGVuZCAtIHN0YXJ0KVxuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydFxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuXG4gIGlmIChsZW4gPCAxMDAgfHwgIUJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRfc3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRfc3RhcnQpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2Jhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiBfdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJlcyA9ICcnXG4gIHZhciB0bXAgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBpZiAoYnVmW2ldIDw9IDB4N0YpIHtcbiAgICAgIHJlcyArPSBkZWNvZGVVdGY4Q2hhcih0bXApICsgU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gICAgICB0bXAgPSAnJ1xuICAgIH0gZWxzZSB7XG4gICAgICB0bXAgKz0gJyUnICsgYnVmW2ldLnRvU3RyaW5nKDE2KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXMgKyBkZWNvZGVVdGY4Q2hhcih0bXApXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKylcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gX2JpbmFyeVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgcmV0dXJuIF9hc2NpaVNsaWNlKGJ1Ziwgc3RhcnQsIGVuZClcbn1cblxuZnVuY3Rpb24gX2hleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSsxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSBjbGFtcChzdGFydCwgbGVuLCAwKVxuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKVxuXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgdmFyIG5ld0J1ZiA9IG5ldyBCdWZmZXIoc2xpY2VMZW4sIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWNlTGVuOyBpKyspIHtcbiAgICAgIG5ld0J1ZltpXSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgICByZXR1cm4gbmV3QnVmXG4gIH1cbn1cblxuLy8gYGdldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgd2lsbCBiZSByZW1vdmVkIGluIE5vZGUgMC4xMytcbkJ1ZmZlci5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgdmFsID0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICB9IGVsc2Uge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV1cbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDJdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgICB2YWwgfD0gYnVmW29mZnNldF1cbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApXG4gIH0gZWxzZSB7XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMV0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMl0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAzXVxuICAgIHZhbCA9IHZhbCArIChidWZbb2Zmc2V0XSA8PCAyNCA+Pj4gMClcbiAgfVxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICB2YXIgbmVnID0gdGhpc1tvZmZzZXRdICYgMHg4MFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQxNihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MzIoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMDAwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZmZmZmYgLSB2YWwgKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRmxvYXQgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWREb3VibGUgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgcmV0dXJuIGllZWU3NTQucmVhZChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWREb3VibGUodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuXG5cbiAgdGhpc1tvZmZzZXRdID0gdmFsdWVcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAgICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmZmZmZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKVxuICB9XG5cbiAgaWYgKG9mZnNldCA+PSB0aGlzLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICB0aGlzLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICB0aGlzLndyaXRlVUludDgoMHhmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQxNihidWYsIDB4ZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQzMihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MzIoYnVmLCAweGZmZmZmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsdWUgPSB2YWx1ZS5jaGFyQ29kZUF0KDApXG4gIH1cblxuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiAhaXNOYU4odmFsdWUpLCAndmFsdWUgaXMgbm90IGEgbnVtYmVyJylcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgdGhpcy5sZW5ndGgsICdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KGVuZCA+PSAwICYmIGVuZCA8PSB0aGlzLmxlbmd0aCwgJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHRoaXNbaV0gPSB2YWx1ZVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG91dCA9IFtdXG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgb3V0W2ldID0gdG9IZXgodGhpc1tpXSlcbiAgICBpZiAoaSA9PT0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUykge1xuICAgICAgb3V0W2kgKyAxXSA9ICcuLi4nXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIG91dC5qb2luKCcgJykgKyAnPidcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpXG4gICAgICAgIGJ1ZltpXSA9IHRoaXNbaV1cbiAgICAgIHJldHVybiBidWYuYnVmZmVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gKGFycikge1xuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgZ2V0L3NldCBtZXRob2RzIGJlZm9yZSBvdmVyd3JpdGluZ1xuICBhcnIuX2dldCA9IGFyci5nZXRcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZCwgd2lsbCBiZSByZW1vdmVkIGluIG5vZGUgMC4xMytcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxuLy8gc2xpY2Uoc3RhcnQsIGVuZClcbmZ1bmN0aW9uIGNsYW1wIChpbmRleCwgbGVuLCBkZWZhdWx0VmFsdWUpIHtcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgaW5kZXggPSB+fmluZGV4OyAgLy8gQ29lcmNlIHRvIGludGVnZXIuXG4gIGlmIChpbmRleCA+PSBsZW4pIHJldHVybiBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICBpbmRleCArPSBsZW5cbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleFxuICByZXR1cm4gMFxufVxuXG5mdW5jdGlvbiBjb2VyY2UgKGxlbmd0aCkge1xuICAvLyBDb2VyY2UgbGVuZ3RoIHRvIGEgbnVtYmVyIChwb3NzaWJseSBOYU4pLCByb3VuZCB1cFxuICAvLyBpbiBjYXNlIGl0J3MgZnJhY3Rpb25hbCAoZS5nLiAxMjMuNDU2KSB0aGVuIGRvIGFcbiAgLy8gZG91YmxlIG5lZ2F0ZSB0byBjb2VyY2UgYSBOYU4gdG8gMC4gRWFzeSwgcmlnaHQ/XG4gIGxlbmd0aCA9IH5+TWF0aC5jZWlsKCtsZW5ndGgpXG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aFxufVxuXG5mdW5jdGlvbiBpc0FycmF5IChzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiAoc3ViamVjdCkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ViamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgfSkoc3ViamVjdClcbn1cblxuZnVuY3Rpb24gaXNBcnJheWlzaCAoc3ViamVjdCkge1xuICByZXR1cm4gaXNBcnJheShzdWJqZWN0KSB8fCBCdWZmZXIuaXNCdWZmZXIoc3ViamVjdCkgfHxcbiAgICAgIHN1YmplY3QgJiYgdHlwZW9mIHN1YmplY3QgPT09ICdvYmplY3QnICYmXG4gICAgICB0eXBlb2Ygc3ViamVjdC5sZW5ndGggPT09ICdudW1iZXInXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYiA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaWYgKGIgPD0gMHg3RilcbiAgICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpKVxuICAgIGVsc2Uge1xuICAgICAgdmFyIHN0YXJ0ID0gaVxuICAgICAgaWYgKGIgPj0gMHhEODAwICYmIGIgPD0gMHhERkZGKSBpKytcbiAgICAgIHZhciBoID0gZW5jb2RlVVJJQ29tcG9uZW50KHN0ci5zbGljZShzdGFydCwgaSsxKSkuc3Vic3RyKDEpLnNwbGl0KCclJylcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKVxuICAgIH1cbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShzdHIpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpXG4gICAgICBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIGRlY29kZVV0ZjhDaGFyIChzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cilcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoMHhGRkZEKSAvLyBVVEYgOCBpbnZhbGlkIGNoYXJcbiAgfVxufVxuXG4vKlxuICogV2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgYSB2YWxpZCBpbnRlZ2VyLiBUaGlzIG1lYW5zIHRoYXQgaXRcbiAqIGlzIG5vbi1uZWdhdGl2ZS4gSXQgaGFzIG5vIGZyYWN0aW9uYWwgY29tcG9uZW50IGFuZCB0aGF0IGl0IGRvZXMgbm90XG4gKiBleGNlZWQgdGhlIG1heGltdW0gYWxsb3dlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gdmVyaWZ1aW50ICh2YWx1ZSwgbWF4KSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA+PSAwLCAnc3BlY2lmaWVkIGEgbmVnYXRpdmUgdmFsdWUgZm9yIHdyaXRpbmcgYW4gdW5zaWduZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgaXMgbGFyZ2VyIHRoYW4gbWF4aW11bSB2YWx1ZSBmb3IgdHlwZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmc2ludCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydChNYXRoLmZsb29yKHZhbHVlKSA9PT0gdmFsdWUsICd2YWx1ZSBoYXMgYSBmcmFjdGlvbmFsIGNvbXBvbmVudCcpXG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCAodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInLCAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBsYXJnZXIgdGhhbiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQodmFsdWUgPj0gbWluLCAndmFsdWUgc21hbGxlciB0aGFuIG1pbmltdW0gYWxsb3dlZCB2YWx1ZScpXG59XG5cbmZ1bmN0aW9uIGFzc2VydCAodGVzdCwgbWVzc2FnZSkge1xuICBpZiAoIXRlc3QpIHRocm93IG5ldyBFcnJvcihtZXNzYWdlIHx8ICdGYWlsZWQgYXNzZXJ0aW9uJylcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2J1ZmZlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbmV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL2llZWU3NTRcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHZhciBxdWV1ZSA9IFtdO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIsXCIvLi4vbm9kZV9tb2R1bGVzL3Byb2Nlc3NcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgYmFzZSwgY29uZmlnLCBjb25zdGFudHMsIGVuX21lc3NhZ2VzLCBmaW5hbCwgaWNlZCwga2V5cywgcGFnZXMsIHByb3h5X2FjdGl2YXRpb25fZXJyb3JzLCBwcm94eV9sb2FkaW5nX3N0YXRlcywgcHJveHlfc3RhdGVzLCBfX2ljZWRfaywgX19pY2VkX2tfbm9vcCxcbiAgX19zbGljZSA9IFtdLnNsaWNlO1xuXG5pY2VkID0ge1xuICBEZWZlcnJhbHM6IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfQ2xhc3MoX2FyZykge1xuICAgICAgdGhpcy5jb250aW51YXRpb24gPSBfYXJnO1xuICAgICAgdGhpcy5jb3VudCA9IDE7XG4gICAgICB0aGlzLnJldCA9IG51bGw7XG4gICAgfVxuXG4gICAgX0NsYXNzLnByb3RvdHlwZS5fZnVsZmlsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEtLXRoaXMuY291bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGludWF0aW9uKHRoaXMucmV0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX0NsYXNzLnByb3RvdHlwZS5kZWZlciA9IGZ1bmN0aW9uKGRlZmVyX3BhcmFtcykge1xuICAgICAgKyt0aGlzLmNvdW50O1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGlubmVyX3BhcmFtcywgX3JlZjtcbiAgICAgICAgICBpbm5lcl9wYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgICAgIGlmIChkZWZlcl9wYXJhbXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKChfcmVmID0gZGVmZXJfcGFyYW1zLmFzc2lnbl9mbikgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfcmVmLmFwcGx5KG51bGwsIGlubmVyX3BhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfdGhpcy5fZnVsZmlsbCgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfTtcblxuICAgIHJldHVybiBfQ2xhc3M7XG5cbiAgfSkoKSxcbiAgZmluZERlZmVycmFsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcbiAgdHJhbXBvbGluZTogZnVuY3Rpb24oX2ZuKSB7XG4gICAgcmV0dXJuIF9mbigpO1xuICB9XG59O1xuX19pY2VkX2sgPSBfX2ljZWRfa19ub29wID0gZnVuY3Rpb24oKSB7fTtcblxuY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKTtcblxuZmluYWwgPSByZXF1aXJlKCcuL2VudW0vZmluYWwnKTtcblxua2V5cyA9IHJlcXVpcmUoJy4vZW51bS9rZXlzJyk7XG5cbnByb3h5X3N0YXRlcyA9IHJlcXVpcmUoJy4vZW51bS9wcm94eV9zdGF0ZXMnKTtcblxucHJveHlfbG9hZGluZ19zdGF0ZXMgPSByZXF1aXJlKCcuL2VudW0vcHJveHlfbG9hZGluZ19zdGF0ZXMnKTtcblxucHJveHlfYWN0aXZhdGlvbl9lcnJvcnMgPSByZXF1aXJlKCcuL2VudW0vcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMnKTtcblxucGFnZXMgPSByZXF1aXJlKCcuL2VudW0vcGFnZXMnKTtcblxuZW5fbWVzc2FnZXMgPSByZXF1aXJlKCcuL21lc3NhZ2VzL2VuJyk7XG5cbmNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbmJhc2UgPSB7XG4gIGhlbGxvV29ybGQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZyhcImhlbGxvIHdvcmxkXCIpO1xuICB9LFxuICBhY2NlcHRJbnZpdGU6IGZ1bmN0aW9uKGludml0ZVRva2VuLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIHNlcnZpY2VUb2tlbiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxNlxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlVG9rZW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiAxN1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnMvaW52aXRlL2FjY2VwdFwiLFxuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICBzZXJ2aWNlX3Rva2VuOiBzZXJ2aWNlVG9rZW4sXG4gICAgICAgICAgICAgIGludml0ZV90b2tlbjogaW52aXRlVG9rZW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgcmVkaXJlY3Q6IGZ1bmN0aW9uKHVybCkge1xuICAgIHJldHVybiBkb2N1bWVudC5sb2NhdGlvbi5ocmVmID0gdXJsO1xuICB9LFxuICBnZXRDaG9tZVdlYnN0b3JlVXJsOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFuaWZlc3Q7XG4gICAgbWFuaWZlc3QgPSBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpO1xuICAgIGlmIChtYW5pZmVzdC5uYW1lID09PSBjb25zdGFudHMuR09NX1NHX05BTUUpIHtcbiAgICAgIHJldHVybiBjb25maWcuR09NX1NHX0NIUk9NRV9TVE9SRV9MSU5LO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnLkdPTV9DSFJPTUVfU1RPUkVfTElOSztcbiAgfSxcbiAgb3BlblBhZ2U6IGZ1bmN0aW9uKHBhZ2UsIGZvY3VzT25UYWIpIHtcbiAgICBpZiAoZm9jdXNPblRhYiA9PSBudWxsKSB7XG4gICAgICBmb2N1c09uVGFiID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGNocm9tZS50YWJzLmNyZWF0ZSh7XG4gICAgICB1cmw6IHBhZ2UsXG4gICAgICBhY3RpdmU6IGZvY3VzT25UYWJcbiAgICB9KTtcbiAgfSxcbiAgYWRkQWRkb25Ub0luc3RhbGxMaXN0OiBmdW5jdGlvbihhZGRvbiwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBpbnN0YWxsZWRBRGRvbnMsIGlzU2V0LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5BRERPTlMsIFtdLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RhbGxlZEFEZG9ucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDQ2XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGluc3RhbGxlZEFEZG9ucy5wdXNoKGFkZG9uKTtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkFERE9OUywgaW5zdGFsbGVkQURkb25zLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzU2V0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogNDhcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhpc1NldCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHJtQWRkb25Ub0luc3RhbGxMaXN0OiBmdW5jdGlvbihhZGRvbklkLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFkZG9uLCBpbnN0YWxsZWRBRGRvbnMsIG5ld0xsaXMsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkFERE9OUywgW10sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFsbGVkQURkb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNTJcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuO1xuICAgICAgICBuZXdMbGlzID0gW107XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaW5zdGFsbGVkQURkb25zLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgYWRkb24gPSBpbnN0YWxsZWRBRGRvbnNbX2ldO1xuICAgICAgICAgIGlmIChhZGRvbltcImlkXCJdICE9PSBhZGRvbklkKSB7XG4gICAgICAgICAgICBuZXdMbGlzLnB1c2goYWRkb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQURET05TLCBuZXdMbGlzLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGxpbmVubzogNTdcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc0FkZG9uSWRJbnN0YWxsZWQ6IGZ1bmN0aW9uKGFkZG9uSWQsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYWRkb24sIGluc3RhbGxlZEFkZG9ucywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQURET05TLCBbXSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YWxsZWRBZGRvbnMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA2MVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2ksIF9sZW47XG4gICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gaW5zdGFsbGVkQWRkb25zLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgYWRkb24gPSBpbnN0YWxsZWRBZGRvbnNbX2ldO1xuICAgICAgICAgIGlmIChhZGRvbltcImlkXCJdID09PSBhZGRvbklkKSB7XG4gICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhmYWxzZSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgcmVzZW5kVmVyaWZpY2F0aW9uRW1haWw6IGZ1bmN0aW9uKGVtYWlsLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNjlcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3VzZXJzL2VtYWlsL3ZlcmlmaWNhdGlvblwiLFxuICAgICAgICAgIGFsdDogXCJqc29uXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZW1haWw6IGVtYWlsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICByZWxvYWRTcGR5UHJveHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwcm94eVN0YXRlLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcblxuICAgIC8qIGNsZWFycyBwcm94eSBzZXR0aW5ncywgYW5kIHNldCBpdCBhZ2FpbiAodG8gaXQncyBjdXJyZW50IHN0YXRlKSAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3h5U3RhdGUgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA4NlxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBiYXNlLmNsZWFyU3BkeVByb3h5KCk7XG4gICAgICAgIHJldHVybiBiYXNlLnRvZ2dsZVNwZHlQcm94eUFjdGl2YXRpb24ocHJveHlTdGF0ZSA9PT0gcHJveHlfc3RhdGVzLkFDVElWRSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgZmV0Y2hQcmljaW5nOiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIGNvdW50cnksIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNPVU5UUlksIGNvbnN0YW50cy5ERUZBVUxUX0NPVU5UUllfQ09ERSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjb3VudHJ5ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogOTJcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogOTNcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5GQVNUX0FKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi9wYXltZW50cy9wcmljaW5nXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgY291bnRyeTogY291bnRyeVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhjb25zdGFudHMuREVGQVVMVF9QUklDRVMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc0xvZ2luZWQ6IGZ1bmN0aW9uKGRlZmVyQ2FsbGJhY2spIHtcbiAgICB2YXIgYWNjb3VudEluZm8sIGVtYWlsLCBwYXltZW50Q3JlZGl0LCBwYXltZW50UGxhbiwgc2VydmljZVRva2VuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlckNhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIGNoZWNrcyBpZiB0aGUgY3VycmVudCB1c2VyIGhhcyBzaWduZWQgaW50byBnb20gKi9cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDEwOVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX0VNQUlMLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVtYWlsID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMTEwXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfQUNDT1VOVF9JTkZPLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY291bnRJbmZvID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMTExXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9DUkVESVQsIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGF5bWVudENyZWRpdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICBsaW5lbm86IDExMlxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BBWU1FTlRfUExBTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXltZW50UGxhbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDExM1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWZlckNhbGxiYWNrKCh0eXBlb2Ygc2VydmljZVRva2VuICE9PSBcInVuZGVmaW5lZFwiICYmIHNlcnZpY2VUb2tlbiAhPT0gbnVsbCkgJiYgKHR5cGVvZiBlbWFpbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBlbWFpbCAhPT0gbnVsbCkgJiYgKHR5cGVvZiBhY2NvdW50SW5mbyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhY2NvdW50SW5mbyAhPT0gbnVsbCkgJiYgKHR5cGVvZiBwYXltZW50Q3JlZGl0ICE9PSBcInVuZGVmaW5lZFwiICYmIHBheW1lbnRDcmVkaXQgIT09IG51bGwpICYmICh0eXBlb2YgcGF5bWVudFBsYW4gIT09IFwidW5kZWZpbmVkXCIgJiYgcGF5bWVudFBsYW4gIT09IG51bGwpKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgZ2V0VXNlckVtYWlsRnJvbUF1dGhUb2tlbjogZnVuY3Rpb24odG9rZW4sIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgdXJsOiBcImh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92Mi91c2VyaW5mb1wiLFxuICAgICAgZGF0YToge1xuICAgICAgICBhbHQ6IFwianNvblwiLFxuICAgICAgICBhY2Nlc3NfdG9rZW46IHRva2VuXG4gICAgICB9LFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBlbWFpbDtcbiAgICAgICAgZW1haWwgPSBkYXRhW1wiZW1haWxcIl07XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGVtYWlsKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBzaWduSW5WaWFPYXV0aDogZnVuY3Rpb24oYWNjZXNzVG9rZW4sIGVtYWlsLCBkZWZlckNhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIGRldmljZUlkLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlckNhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIFNpZ25zIGEgdXNlciBpbiB2aWEgT2F1dGgyJ3MgYWNjZXNzIHRva2VuLCByZXR1cm5zIGEgYHNlcnZpY2VUb2tlbmAgKi9cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5ERVZJQ0VfSUQsIGJhc2UuZ2VuVXVpZCgpLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRldmljZUlkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMTM0XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRBcGlIb3N0KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBpSG9zdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDEzNVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnMvb2F1dGhcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgb2F1dGhfdG9rZW46IGFjY2Vzc1Rva2VuLFxuICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgIGRldmljZV9pZDogZGV2aWNlSWQsXG4gICAgICAgICAgICAgIGRldmljZV9wbGF0Zm9ybTogY29uc3RhbnRzLkRFVklDRV9QTEFURk9STVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICB2YXIgc2VydmljZVRva2VuO1xuICAgICAgICAgICAgICBzZXJ2aWNlVG9rZW4gPSBkYXRhW1wic2VydmljZV90b2tlblwiXTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5VU0VSX0lELCBkYXRhW1wiYWNjb3VudF9pbmZvXCJdW1wiaWRcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkVNQUlMLCBkYXRhW1wiYWNjb3VudF9pbmZvXCJdW1wiZW1haWxcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlNFUlZJQ0VfVE9LRU4sIHNlcnZpY2VUb2tlbik7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBUlRFRF9VTklYX1RJTUVTVEFNUCwgYmFzZS5ub3coKSk7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlckNhbGxiYWNrKHNlcnZpY2VUb2tlbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBkZWZlckNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICByZXR1cm4gYmFzZS5waW5nQWxsQXBpSG9zdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaW52aXRlQ29udGFjdHM6IGZ1bmN0aW9uKGFjY2Vzc1Rva2VuLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIHNlcnZpY2VUb2tlbiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlVG9rZW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxNTlcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMTYwXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vycy9pbnZpdGVfY29udGFjdHNcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgc2VydmljZV90b2tlbjogc2VydmljZVRva2VuLFxuICAgICAgICAgICAgICBhY2Nlc3NfdG9rZW46IGFjY2Vzc1Rva2VuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIHZhciBzdWNjZXNzO1xuICAgICAgICAgICAgICBzdWNjZXNzID0gZGF0YVtcInN1Y2Nlc3NcIl07XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKHN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzeW5jOiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIHNlcnZpY2VUb2tlbiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlVG9rZW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxNzdcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXJ2aWNlVG9rZW4gPT09IFwidW5kZWZpbmVkXCIgfHwgc2VydmljZVRva2VuID09PSBudWxsKSB7XG4gICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRBcGlIb3N0KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYXBpSG9zdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDE4MlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgdGltZW91dDogYmFzZS5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnNcIixcbiAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgc2VydmljZV90b2tlbjogc2VydmljZVRva2VuXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIHZhciBhY2NvdW50SW5mbywgZ29sZCwgcGF5bWVudENyZWRpdCwgcGF5bWVudFBsYW47XG4gICAgICAgICAgICAgIGFjY291bnRJbmZvID0gZGF0YVtcImFjY291bnRfaW5mb1wiXTtcbiAgICAgICAgICAgICAgcGF5bWVudFBsYW4gPSBkYXRhW1wicGF5bWVudF9wbGFuXCJdO1xuICAgICAgICAgICAgICBwYXltZW50Q3JlZGl0ID0gZGF0YVtcInBheW1lbnRfY3JlZGl0XCJdO1xuICAgICAgICAgICAgICBnb2xkID0gZGF0YVtcImdvbGRcIl07XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX0FDQ09VTlRfSU5GTywgYWNjb3VudEluZm8pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX1BMQU4sIHBheW1lbnRQbGFuKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9DUkVESVQsIHBheW1lbnRDcmVkaXQpO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9HT0xELCBnb2xkKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5ORUVEU19WRVJJRklDQVRJT04sICFkYXRhW1widmVyaWZpZWRcIl0pO1xuICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgICAgICAgICByZXR1cm4gYmFzZS5waW5nQWxsQXBpSG9zdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaXNQYXltZW50TmVlZGVkOiBmdW5jdGlvbihkZWZlckNhbGxiYWNrKSB7XG4gICAgdmFyIGRpZmYsIGV4cGlyeV9lcG9jaCwgcGF5bWVudFBsYW4sIHBheW1lbnRUaW1lQ3JlZGl0LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlckNhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIGNoZWNrcyBpZiB0aGlzIHVzZXIgaXMgYSBmcmVlIHVzZXIgKi9cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9QTEFOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRQbGFuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjA4XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgodHlwZW9mIHBheW1lbnRQbGFuICE9PSBcInVuZGVmaW5lZFwiICYmIHBheW1lbnRQbGFuICE9PSBudWxsKSAmJiBcInN0YXR1c1wiIGluIHBheW1lbnRQbGFuICYmIHBheW1lbnRQbGFuLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIpIHtcbiAgICAgICAgICBkZWZlckNhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX0NSRURJVCwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXltZW50VGltZUNyZWRpdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDIxM1xuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgcGF5bWVudFRpbWVDcmVkaXQgIT09IFwidW5kZWZpbmVkXCIgJiYgcGF5bWVudFRpbWVDcmVkaXQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGV4cGlyeV9lcG9jaCA9IHBheW1lbnRUaW1lQ3JlZGl0W1wiY3JlZGl0X2V4cGlyeV9lcG9jaFwiXTtcbiAgICAgICAgICAgIGRpZmYgPSBwYXJzZUludChleHBpcnlfZXBvY2gpIC0gYmFzZS5ub3coKTtcbiAgICAgICAgICAgIGRlZmVyQ2FsbGJhY2soZGlmZiA8PSAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVyQ2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGxvZzogZnVuY3Rpb24obXNnKSB7XG4gICAgcmV0dXJuIGNocm9tZS5leHRlbnNpb24uZ2V0QmFja2dyb3VuZFBhZ2UoKS5nb20ubG9nKG1zZyk7XG4gIH0sXG4gIHNob3dTaWduSW5OYWdOb3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0RnJlZVRpZXJNaW5zLCBtaW5zTGVmdCwgbWluc1NpbmNlQWN0aXZhdGlvbiwgcHJveHlTdGFydGVkVW5peFRpbWVzdGFtcCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBUlRFRF9VTklYX1RJTUVTVEFNUCwgMCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwcm94eVN0YXJ0ZWRVbml4VGltZXN0YW1wID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjI1XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5GUkVFX1RJRVJfTUlOUywgY29uc3RhbnRzLkRFRkFVTFRfRlJFRV9USUVSX01JTlMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVmYXVsdEZyZWVUaWVyTWlucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDIyNlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG1pbnNTaW5jZUFjdGl2YXRpb24gPSAoYmFzZS5ub3coKSAtIHByb3h5U3RhcnRlZFVuaXhUaW1lc3RhbXApIC8gNjA7XG4gICAgICAgICAgbWluc0xlZnQgPSBkZWZhdWx0RnJlZVRpZXJNaW5zIC0gbWluc1NpbmNlQWN0aXZhdGlvbjtcbiAgICAgICAgICByZXR1cm4gYmFzZS5zaG93UmljaE5vdGlmaWNhdGlvbihlbl9tZXNzYWdlcy5OT1RfU0lHTkVEX0lOLCBcIkdvbSB3aWxsIGRpc2Nvbm5lY3QgaW4gXCIgKyAocGFyc2VJbnQobWluc0xlZnQpKSArIFwiIG1pbnV0ZXNcIiwgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuU0lHTl9JTl9GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1MsXG4gICAgICAgICAgICAgIGljb246IFwiL2Fzc2V0cy9pbWFnZXMvZ3JlZW5fcm91bmRfdGljay5wbmdcIixcbiAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UocGFnZXMuU0lHTl9JTiwgdHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgc2hvd0ZyZWVUaWVyRGVhY3RpdmF0aW9uTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYnRucywgaXNMb2dpbmVkLCBpc1BheW1lbnROZWVkZWQsIHJlY2hhcmdlTWlucywgc2Vjb25kcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuaXNQYXltZW50TmVlZGVkKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaXNQYXltZW50TmVlZGVkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjM3XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5pc0xvZ2luZWQoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc0xvZ2luZWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiAyMzhcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkZSRUVfVElFUl9SRUNIQVJHRV9NSU5TLCBjb25zdGFudHMuRlJFRV9USUVSX1JFQ0hBUkdFX01JTlMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcmVjaGFyZ2VNaW5zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMjM5XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBidG5zID0gW107XG4gICAgICAgICAgICBpZiAoIWlzTG9naW5lZCkge1xuICAgICAgICAgICAgICBidG5zID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBlbl9tZXNzYWdlcy5TSUdOX0lOX0ZPUl9VTklOVEVSUlVQVEVEX0FDQ0VTUyxcbiAgICAgICAgICAgICAgICAgIGljb246IFwiL2Fzc2V0cy9pbWFnZXMvZ3JlZW5fcm91bmRfdGljay5wbmdcIixcbiAgICAgICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShwYWdlcy5TSUdOX0lOLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzUGF5bWVudE5lZWRlZCkge1xuICAgICAgICAgICAgICBidG5zID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIHRpdGxlOiBlbl9tZXNzYWdlcy5HT19QUk9fRk9SX1VOSU5URVJSVVBURURfQUNDRVNTLFxuICAgICAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLm9wZW5QYWdlKHBhZ2VzLlBSSUNJTkcsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlY29uZHMgPSBwYXJzZUludChyZWNoYXJnZU1pbnMgKiA2MCk7XG4gICAgICAgICAgICByZXR1cm4gYmFzZS5zaG93UmljaE5vdGlmaWNhdGlvbihlbl9tZXNzYWdlcy5HT01fVFVSTkVEX09GRiwgXCJZb3UgY2FuIGFjdGl2YXRlIEdvbSBhZ2FpbiBpbiBcIiArIHNlY29uZHMgKyBcIiBzZWNvbmRzXCIsIGJ0bnMpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzaG93R29Qcm9OYWdOb3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdW1Vc2FnZSwgZGlmZlNlY3MsIGZyZWVUaWVyTWlucywgbWlucywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuRlJFRV9USUVSX01JTlMsIGNvbnN0YW50cy5ERUZBVUxUX0ZSRUVfVElFUl9NSU5TLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZyZWVUaWVyTWlucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDI2MVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQUNUSVZBVElPTl9VU0FHRSwge1xuICAgICAgICAgICAgc2Vjb25kczogMCxcbiAgICAgICAgICAgIGxhc3RUaWNrOiBiYXNlLm5vdygpXG4gICAgICAgICAgfSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdW1Vc2FnZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDI2MlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRpZmZTZWNzID0gZnJlZVRpZXJNaW5zICogNjAgLSBjdW1Vc2FnZS5zZWNvbmRzO1xuICAgICAgICAgIG1pbnMgPSBwYXJzZUludChkaWZmU2VjcyAvIDYwKTtcbiAgICAgICAgICByZXR1cm4gYmFzZS5zaG93UmljaE5vdGlmaWNhdGlvbihlbl9tZXNzYWdlcy5PTl9GUkVFX1BMQU4sIFwiR29tIHdpbGwgZGlzY29ubmVjdCBpbiBcIiArIG1pbnMgKyBcIiBtaW51dGVzXCIsIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLkdPX1BST19GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1MsXG4gICAgICAgICAgICAgIGljb246IFwiL2Fzc2V0cy9pbWFnZXMvZ3JlZW5fcm91bmRfdGljay5wbmdcIixcbiAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UocGFnZXMuUFJJQ0lORywgdHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgZ2V0R29sZExlYXJuTW9yZVVybDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHdlYnNpdGVVcmw7XG4gICAgd2Vic2l0ZVVybCA9IGJhc2UuZ2V0V2Vic2l0ZSgpO1xuICAgIHJldHVybiBcIlwiICsgd2Vic2l0ZVVybCArIFwiL2dvbGQvbGVhcm5cIjtcbiAgfSxcbiAgZ2V0R29sZERhc2hib2FyZExvZ2luVXJsOiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIHNlcnZpY2VUb2tlbiwgd2Vic2l0ZVVybCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlVG9rZW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAyNzdcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgd2Vic2l0ZVVybCA9IGJhc2UuZ2V0V2Vic2l0ZSgpO1xuICAgICAgICBpZiAodHlwZW9mIHNlcnZpY2VUb2tlbiAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzZXJ2aWNlVG9rZW4gIT09IG51bGwpIHtcbiAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKFwiXCIgKyB3ZWJzaXRlVXJsICsgXCIvZ29sZC9kYXNoYm9hcmQvbG9naW4vc2VydmljZV90b2tlbj9zZXJ2aWNlX3Rva2VuPVwiICsgc2VydmljZVRva2VuKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soXCJcIiArIHdlYnNpdGVVcmwgKyBcIi9nb2xkL2Rhc2hib2FyZFwiKTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzaG93UmVjaGFyZ2VOb3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkZWZhdWx0RnJlZVRpZXJNaW5zLCBtZXNzYWdlLCByZWNoYXJnZU1pbnMsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkZSRUVfVElFUl9NSU5TLCBjb25zdGFudHMuREVGQVVMVF9GUkVFX1RJRVJfTUlOUywgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZhdWx0RnJlZVRpZXJNaW5zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMjg1XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5GUkVFX1RJRVJfUkVDSEFSR0VfTUlOUywgY29uc3RhbnRzLkZSRUVfVElFUl9SRUNIQVJHRV9NSU5TLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY2hhcmdlTWlucyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDI4NlxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG1lc3NhZ2UgPSBlbl9tZXNzYWdlcy5VU0VEX0JFWU9ORF9GUkVFX1RJRVIucmVwbGFjZShcInt7ZnJlZV90aWVyX21pbnN9fVwiLCBkZWZhdWx0RnJlZVRpZXJNaW5zKS5yZXBsYWNlKFwie3tyZWNoYXJnZV9taW5zfX1cIiwgcmVjaGFyZ2VNaW5zKTtcbiAgICAgICAgICByZXR1cm4gYmFzZS5zaG93UmljaE5vdGlmaWNhdGlvbihlbl9tZXNzYWdlcy5PTl9GUkVFX1BMQU4sIG1lc3NhZ2UsIFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLkdPX1BST19GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1MsXG4gICAgICAgICAgICAgIGljb246IFwiL2Fzc2V0cy9pbWFnZXMvZ3JlZW5fcm91bmRfdGljay5wbmdcIixcbiAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UocGFnZXMuUFJJQ0lORywgdHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaXNJbmNvZ25pdG9QZXJtaXNzaW9uRW5hYmxlZDogZnVuY3Rpb24oZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBpc0FsbG93ZWQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBjaHJvbWUuZXh0ZW5zaW9uLmlzQWxsb3dlZEluY29nbml0b0FjY2VzcyhfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGlzQWxsb3dlZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDI5NlxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhpc0FsbG93ZWQpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHNob3dBY3RpdmF0aW9uTm90aWZpY2F0aW9uOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgYnRucywgZ29sZCwgZ29sZERhc2hib2FyZExvZ2luVXJsLCBoYXNSYXRlZEdvbSwgaXNJbmNvZ25pdG9FbmFibGVkLCBpc0xvZ2luZWQsIGlzUGF5bWVudE5lZWRlZCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuaXNMb2dpbmVkKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaXNMb2dpbmVkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMzAwXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5pc1BheW1lbnROZWVkZWQoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1BheW1lbnROZWVkZWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiAzMDFcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICBidG5zID0gW107XG4gICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5pc0luY29nbml0b1Blcm1pc3Npb25FbmFibGVkKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaXNJbmNvZ25pdG9FbmFibGVkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMzA1XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoIWlzSW5jb2duaXRvRW5hYmxlZCkge1xuICAgICAgICAgICAgICBidG5zLnB1c2goe1xuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogZW5fbWVzc2FnZXMuQUxMT1dfSU5DT0dOSVRPLFxuICAgICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UoXCJjaHJvbWU6Ly9leHRlbnNpb25zXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5IQVNfUkFURURfR09NLCBmYWxzZSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoYXNSYXRlZEdvbSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICBsaW5lbm86IDMxNFxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc1JhdGVkR29tKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soYnRucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBlbl9tZXNzYWdlcy5SQVRFXzVfU1RBUlMsXG4gICAgICAgICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIGJhc2Uub3BlblBhZ2UoYmFzZS5nZXRDaG9tZVdlYnN0b3JlVXJsKCkpO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLnNldExvY2FsRGF0YShrZXlzLkhBU19SQVRFRF9HT00sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzTG9naW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfayhidG5zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLlNJR05fSU5fRk9SX1VOSU5URVJSVVBURURfQUNDRVNTLFxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLm9wZW5QYWdlKHBhZ2VzLlNJR05fSU4sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1BheW1lbnROZWVkZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKGJ0bnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLkdPX1BST19GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWNvbjogXCIvYXNzZXRzL2ltYWdlcy9ncmVlbl9yb3VuZF90aWNrLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UocGFnZXMuUFJJQ0lORywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UuZ2V0R29sZERhc2hib2FyZExvZ2luVXJsKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ29sZERhc2hib2FyZExvZ2luVXJsID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVubzogMzQwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfR09MRCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3RhbF9iYWxhbmNlOiAxMC4wMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBnb2xkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVubzogMzQxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soYnRucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiV2l0aGRyYXcgJFwiICsgKGdvbGQudG90YWxfYmFsYW5jZS50b0ZpeGVkKDIpKSArIFwiIGZyb20geW91ciBHb20gR29sZCBiYWxhbmNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IFwiL2Fzc2V0cy9pbWFnZXMvZ3JlZW5fcm91bmRfdGljay5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UoZ29sZERhc2hib2FyZExvZ2luVXJsLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9KShfX2ljZWRfayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBiYXNlLnNob3dSaWNoTm90aWZpY2F0aW9uKGVuX21lc3NhZ2VzLlNNQVJUX1ZQTl9FTkFCTEVELCBlbl9tZXNzYWdlcy5TVUNDRVNTX01TRywgYnRucyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGlzVGFiQmxvY2tlZDogZnVuY3Rpb24odGFiSWQsIGRlZmVyQ2FsbGJhY2spIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGRlZmVyQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0KHRhYklkLCB7XG4gICAgICAgIGZpbGU6IFwiLi9pbmplY3QuanNcIlxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJJZCwge1xuICAgICAgICAgIG1ldGhvZDogXCJpc0Jsb2NrZWRcIlxuICAgICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgIGlmICgocmVzcG9uc2UgIT0gbnVsbCkgJiYgXCJtZXRob2RcIiBpbiByZXNwb25zZSkge1xuICAgICAgICAgICAgZGVmZXJDYWxsYmFjaygocmVzcG9uc2UubWV0aG9kID09PSBcImlzQmxvY2tlZFwiKSAmJiByZXNwb25zZS5ibG9ja2VkKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVyQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgZXJyb3IgPSBfZXJyb3I7XG4gICAgICByZXR1cm4gZGVmZXJDYWxsYmFjayhmYWxzZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIG51bGw7XG4gICAgfVxuICB9LFxuICBzaWduSW46IGZ1bmN0aW9uKGVtYWlsLCBwYXNzd2QsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgZGV2aWNlSWQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkRFVklDRV9JRCwgYmFzZS5nZW5VdWlkKCksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZGV2aWNlSWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAzNjlcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogMzcwXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuQUpBWF9USU1FT1VUX01TLFxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi91c2Vycy9hdXRoXCIsXG4gICAgICAgICAgICBhbHQ6IFwianNvblwiLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd2QsXG4gICAgICAgICAgICAgIGRldmljZV9pZDogZGV2aWNlSWQsXG4gICAgICAgICAgICAgIGRldmljZV9wbGF0Zm9ybTogY29uc3RhbnRzLkRFVklDRV9QTEFURk9STVxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBjcm9zc0RvbWFpbjogdHJ1ZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgdmFyIHNlcnZpY2VUb2tlbjtcbiAgICAgICAgICAgICAgc2VydmljZVRva2VuID0gZGF0YVtcInNlcnZpY2VfdG9rZW5cIl07XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuVVNFUl9JRCwgZGF0YVtcImFjY291bnRfaW5mb1wiXVtcImlkXCJdKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5FTUFJTCwgZGF0YVtcImFjY291bnRfaW5mb1wiXVtcImVtYWlsXCJdKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5ORUVEU19WRVJJRklDQVRJT04sICFkYXRhW1widmVyaWZpZWRcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlNFUlZJQ0VfVE9LRU4sIHNlcnZpY2VUb2tlbik7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBUlRFRF9VTklYX1RJTUVTVEFNUCwgYmFzZS5ub3coKSk7XG4gICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKHNlcnZpY2VUb2tlbik7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICByZXR1cm4gYmFzZS5waW5nQWxsQXBpSG9zdHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaXNHb2xkOiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGRpZmYsIGV4cGlyeUVwb2NoLCBwYXltZW50Q3JlZGl0LCBwYXltZW50UGxhbiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG5cbiAgICAvKiBjaGVja3MgaWYgdGhpcyBjdXJyZW50IHVzZXIgaXMgYSBgUHJvYCBhY2NvdW50IG9yIG5vdCwgaXQgZGVmZXJzIGZyb20gaXNQYXltZW50TmVlZGVkKCkgYmVjYXVzZSB0aGVuIHlvdSBjYW4gYWxzbyBiZSB0cmlhbCB3aXRoIHNvbWUgdHJpYWwgZGF5cyAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX0NSRURJVCwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXltZW50Q3JlZGl0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNDAwXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9QTEFOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRQbGFuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgIGxpbmVubzogNDAxXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCh0eXBlb2YgcGF5bWVudENyZWRpdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCBwYXltZW50Q3JlZGl0ID09PSBudWxsKSB8fCAodHlwZW9mIHBheW1lbnRQbGFuID09PSBcInVuZGVmaW5lZFwiIHx8IHBheW1lbnRQbGFuID09PSBudWxsKSkge1xuICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4cGlyeUVwb2NoID0gcGF5bWVudENyZWRpdFtcImNyZWRpdF9leHBpcnlfZXBvY2hcIl07XG4gICAgICAgICAgZGlmZiA9IHBhcnNlSW50KGV4cGlyeUVwb2NoKSAtIGJhc2Uubm93KCk7XG4gICAgICAgICAgaWYgKFwicGxhblwiIGluIHBheW1lbnRQbGFuICYmIHBheW1lbnRQbGFuW1wicGxhblwiXSA9PT0gXCJnb2xkXCIgJiYgZGlmZiA+IDApIHtcbiAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaXNQcm86IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgZGlmZiwgZXhwaXJ5RXBvY2gsIHBheW1lbnRDcmVkaXQsIHBheW1lbnRQbGFuLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIGNoZWNrcyBpZiB0aGlzIGN1cnJlbnQgdXNlciBpcyBhIGBQcm9gIGFjY291bnQgb3Igbm90LCBpdCBkZWZlcnMgZnJvbSBpc1BheW1lbnROZWVkZWQoKSBiZWNhdXNlIHRoZW4geW91IGNhbiBhbHNvIGJlIHRyaWFsIHdpdGggc29tZSB0cmlhbCBkYXlzICovXG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BBWU1FTlRfQ1JFRElULCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRDcmVkaXQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA0MTdcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QQVlNRU5UX1BMQU4sIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF5bWVudFBsYW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA0MThcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX3JlZjtcbiAgICAgICAgICBpZiAoKHR5cGVvZiBwYXltZW50Q3JlZGl0ID09PSBcInVuZGVmaW5lZFwiIHx8IHBheW1lbnRDcmVkaXQgPT09IG51bGwpIHx8ICh0eXBlb2YgcGF5bWVudFBsYW4gPT09IFwidW5kZWZpbmVkXCIgfHwgcGF5bWVudFBsYW4gPT09IG51bGwpKSB7XG4gICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXhwaXJ5RXBvY2ggPSBwYXltZW50Q3JlZGl0W1wiY3JlZGl0X2V4cGlyeV9lcG9jaFwiXTtcbiAgICAgICAgICBkaWZmID0gcGFyc2VJbnQoZXhwaXJ5RXBvY2gpIC0gYmFzZS5ub3coKTtcbiAgICAgICAgICBpZiAoZGlmZiA+ICgzMSAqIDI0ICogNjAgKiA2MCkpIHtcbiAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sodHJ1ZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChcInBsYW5cIiBpbiBwYXltZW50UGxhbiAmJiAoKF9yZWYgPSBwYXltZW50UGxhbltcInBsYW5cIl0pID09PSBcInByb1wiIHx8IF9yZWYgPT09IFwiZ29sZFwiKSAmJiBkaWZmID4gMCkge1xuICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayh0cnVlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICByZWdpc3RlcjogZnVuY3Rpb24oZW1haWwsIHBhc3N3ZCwgZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBhcGlIb3N0LCBkZXZpY2VJZCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuREVWSUNFX0lELCBiYXNlLmdlblV1aWQoKSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZXZpY2VJZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDQzN1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA0MzhcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICB0eXBlOiBcIlBVVFwiLFxuICAgICAgICAgICAgdXJsOiBcIlwiICsgYXBpSG9zdCArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnMvXCIsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBkYXRhOiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3ZCxcbiAgICAgICAgICAgICAgZGV2aWNlX2lkOiBkZXZpY2VJZCxcbiAgICAgICAgICAgICAgZGV2aWNlX3BsYXRmb3JtOiBjb25zdGFudHMuREVWSUNFX1BMQVRGT1JNXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICB2YXIgc2VydmljZVRva2VuO1xuICAgICAgICAgICAgICBzZXJ2aWNlVG9rZW4gPSBkYXRhW1wic2VydmljZV90b2tlblwiXTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5VU0VSX0lELCBkYXRhW1wiYWNjb3VudF9pbmZvXCJdW1wiaWRcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkVNQUlMLCBkYXRhW1wiYWNjb3VudF9pbmZvXCJdW1wiZW1haWxcIl0pO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLk5FRURTX1ZFUklGSUNBVElPTiwgIWRhdGFbXCJ2ZXJpZmllZFwiXSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgc2VydmljZVRva2VuKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soc2VydmljZVRva2VuKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgIHJldHVybiBiYXNlLnBpbmdBbGxBcGlIb3N0cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBpc0VtYWlsVmFsaWRBbmRPQXV0aDogZnVuY3Rpb24oZW1haWwsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgYXBpSG9zdCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0QXBpSG9zdChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGFwaUhvc3QgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA0NjVcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgdGltZW91dDogY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUyxcbiAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3VzZXJzL3ZhbGlkX2VtYWlsXCIsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZW1haWw6IGVtYWlsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgY3Jvc3NEb21haW46IHRydWUsXG4gICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZGF0YVtcImV4aXN0c1wiXSwgZGF0YVtcImlzX29hdXRoXCJdLCBkYXRhW1wiaGFzX3Bhc3N3b3JkXCJdKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGVycm9yOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGZhbHNlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgaW5qZWN0Q29udGVudFNjcmlwdDogZnVuY3Rpb24odGFiX2lkLCBkZWZlcl9jYikge1xuICAgIHZhciBlcnJvciwgdGFiLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJfY2IgPT0gbnVsbCkge1xuICAgICAgZGVmZXJfY2IgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY2hyb21lLnRhYnMuZ2V0KHRhYl9pZCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0YWIgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA0ODJcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHRhYi51cmwuc3Vic3RyKDAsIDYpID09PSBcImNocm9tZVwiKSB7XG4gICAgICAgICAgICBkZWZlcl9jYihmYWxzZSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjaHJvbWUudGFicy5leGVjdXRlU2NyaXB0KHRhYl9pZCwge1xuICAgICAgICAgICAgZmlsZTogXCIuL2luamVjdC5qc1wiXG4gICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJfY2IodHJ1ZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICBlcnJvciA9IF9lcnJvcjtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBudWxsO1xuICAgIH1cbiAgfSxcbiAgY2xlYXJTcGR5UHJveHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IHtcbiAgICAgIHNjb3BlOiBcInJlZ3VsYXJcIlxuICAgIH07XG4gICAgcmV0dXJuIGNocm9tZS5wcm94eS5zZXR0aW5ncy5jbGVhcihzZXR0aW5ncyk7XG4gIH0sXG4gIGNhblNldFByb3h5OiBmdW5jdGlvbihkZWZlcl9jYikge1xuICAgIHZhciBjZmcsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcl9jYiA9PSBudWxsKSB7XG4gICAgICBkZWZlcl9jYiA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG5cbiAgICAvKiBjaGVja3MgaWYgdGhlIGV4dGVuc2lvbiBjYW4gc2V0IHByb3h5IChtaWdodCBiZSBjb250cm9sbGVkIGJ5IG90aGVyIGV4dGVuc2lvbiAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBjaHJvbWUucHJveHkuc2V0dGluZ3MuZ2V0KHt9LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNmZyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDUwM1xuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIGNmZyA9PT0gXCJ1bmRlZmluZWRcIiB8fCBjZmcgPT09IG51bGwpIHtcbiAgICAgICAgICBkZWZlcl9jYih0cnVlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKChjZmcubGV2ZWxPZkNvbnRyb2wgPT09IFwiY29udHJvbGxhYmxlX2J5X3RoaXNfZXh0ZW5zaW9uXCIpIHx8IChjZmcubGV2ZWxPZkNvbnRyb2wgPT09IFwiY29udHJvbGxlZF9ieV90aGlzX2V4dGVuc2lvblwiKSkge1xuICAgICAgICAgIGRlZmVyX2NiKHRydWUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJfY2IoZmFsc2UpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGZldGNoU3BkeVByb3h5OiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIGRldmljZUlkLCBwYXltZW50UGxhbiwgcHJveHlUeXBlLCBzZXJ2aWNlVG9rZW4sIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLypcbiAgICBmZXRjaGVzIHByb3h5IGluZm8gZnJvbSBhcGkgc2VydmVyXG4gICAgcmV0dXJucyAoZnJlZVByb3h5T2JqICxzcGVlZEJvb3N0ZWRQcm94eSwgcHJveHlfYWN0aXZhdGlvbl9lcnJvcl9FTlVNKVxuICAgICAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkRFVklDRV9JRCwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkZXZpY2VJZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDUyMFxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuU0VSVklDRV9UT0tFTiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZXJ2aWNlVG9rZW4gPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA1MjFcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogNTIyXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUEFZTUVOVF9QTEFOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBheW1lbnRQbGFuID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgIGxpbmVubzogNTIzXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHByb3h5VHlwZSA9ICh0eXBlb2YgcGF5bWVudFBsYW4gIT09IFwidW5kZWZpbmVkXCIgJiYgcGF5bWVudFBsYW4gIT09IG51bGwpICYmIHBheW1lbnRQbGFuLnBsYW4gPT09ICdnb2xkJyA/ICdnb2xkX3NwZHknIDogY29uc3RhbnRzLlBST1hZX1RZUEU7XG4gICAgICAgICAgICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiXCIgKyBhcGlIb3N0ICsgY29uZmlnLkFQSV9TVUZGSVggKyBcIi9wcm94aWVzXCIsXG4gICAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgICAgc2VydmljZV90b2tlbjogc2VydmljZVRva2VuLFxuICAgICAgICAgICAgICAgICAgZGV2aWNlX2lkOiBkZXZpY2VJZCxcbiAgICAgICAgICAgICAgICAgIHR5cGU6IHByb3h5VHlwZVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIHZhciBmcmVlVGllck1pbnMsIGZyZWVUaWVyUmVjaGFyZ2VNaW5zO1xuICAgICAgICAgICAgICAgICAgZnJlZVRpZXJNaW5zID0gZGF0YVsnZnJlZV90aWVyX21pbnMnXTtcbiAgICAgICAgICAgICAgICAgIGZyZWVUaWVyUmVjaGFyZ2VNaW5zID0gZGF0YVsnZnJlZV90aWVyX3JlY2hhcmdlX21pbnMnXTtcbiAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuRlJFRV9USUVSX01JTlMsIGZyZWVUaWVyTWlucyk7XG4gICAgICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkZSRUVfVElFUl9SRUNIQVJHRV9NSU5TLCBmcmVlVGllclJlY2hhcmdlTWlucyk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhkYXRhW3Byb3h5VHlwZV0sIG51bGwpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKHhocikge1xuICAgICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLk5FRURTX1ZFUklGSUNBVElPTiwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2sobnVsbCwgbnVsbCwgcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMuUkVRVUlSRV9FTUFJTF9WRVJJRklDQVRJT04pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKG51bGwsIG51bGwsIHByb3h5X2FjdGl2YXRpb25fZXJyb3JzLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGJhc2UucGluZ0FsbEFwaUhvc3RzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBzaG93RXh0ZW5zaW9uQ29uZmxpY3ROb3RpZmljYXRpb246IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYXNlLnNob3dSaWNoTm90aWZpY2F0aW9uKGVuX21lc3NhZ2VzLkRJU0FCTEVfT1RIRVJfRVhURU5TSU9OUywgZW5fbWVzc2FnZXMuT1RIRVJfRVhURU5TSU9OU19VU0lORywgW1xuICAgICAge1xuICAgICAgICB0aXRsZTogZW5fbWVzc2FnZXMuU0hPV19BTExfRVhUUyxcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGJhc2Uub3BlblBhZ2UoXCJjaHJvbWU6Ly9leHRlbnNpb25zXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgXSk7XG4gIH0sXG4gIHNob3dTZXJ2ZXJFcnJvck5vdGlmaWNhdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhc2Uuc2hvd1JpY2hOb3RpZmljYXRpb24oZW5fbWVzc2FnZXMuT09QUywgZW5fbWVzc2FnZXMuRVJST1JfQ09OVEFDVElOR19TRVJWRVIsIFtcbiAgICAgIHtcbiAgICAgICAgdGl0bGU6IGVuX21lc3NhZ2VzLkVNQUlMX0FETUlOLFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gYmFzZS5vcGVuUGFnZShjb25zdGFudHMuRU1BSUxfQURNSU5fVVJMKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIF0pO1xuICB9LFxuICBmZXRjaEFuZFNhdmVTcGR5UHJveHk6IGZ1bmN0aW9uKGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICB2YXIgcHJveHlMb2FkaW5nRXJyb3JFbnVtLCBwcm94eU9iaiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZmV0Y2hTcGR5UHJveHkoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHByb3h5T2JqID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICByZXR1cm4gcHJveHlMb2FkaW5nRXJyb3JFbnVtID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNTY4XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJveHlPYmogPT09IFwidW5kZWZpbmVkXCIgfHwgcHJveHlPYmogPT09IG51bGwpIHtcbiAgICAgICAgICBiYXNlLnJlc2V0RGVhY3RpdmF0ZSgpO1xuICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIHByb3h5X2FjdGl2YXRpb25fZXJyb3JzLk5FVFdPUktfRVJST1IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BST1hZX09CSiwgcHJveHlPYmosIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgbGluZW5vOiA1NzNcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlBST1hZX0ZFVENIX1RJTUVTVEFNUCwgYmFzZS5ub3coKSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGxpbmVubzogNTc0XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjaygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICB0b2dnbGVTcGR5UHJveHlBY3RpdmF0aW9uOiBmdW5jdGlvbihkb0FjdGl2YXRlLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGNhblNldFByb3h5LCBoYXNTaG93blRpcCwgcHJveHlMb2FkaW5nRXJyb3JFbnVtLCBwcm94eU9iaiwgd2lsZGNhcmRMaXMsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgICAgdG9nZ2xlcyBvbi9vZmYgc3BkeSBwcm94eVxuICAgICAgICByZXR1cm5zIGAoc3VjY2Vzc19CT09MLCBlcnJvcl9FTlVNKWBcbiAgICAgKi9cbiAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkxPQURfUFJPWFlfU1RBVEUsIHByb3h5X2xvYWRpbmdfc3RhdGVzLkxPQURJTkcpO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmNhblNldFByb3h5KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FuU2V0UHJveHkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA1ODdcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFjYW5TZXRQcm94eSkge1xuICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTE9BRF9QUk9YWV9TVEFURSwgcHJveHlfbG9hZGluZ19zdGF0ZXMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgYmFzZS5yZXNldERlYWN0aXZhdGUoKTtcbiAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlLCBwcm94eV9hY3RpdmF0aW9uX2Vycm9ycy5DT05GTElDVElOR19FWFRFTlNJT04pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX1BST1hZX09CSiwgbnVsbCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm94eU9iaiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDU5NVxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm94eU9iaiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBwcm94eU9iaiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UuZmV0Y2hTcGR5UHJveHkoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHByb3h5T2JqID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm94eUxvYWRpbmdFcnJvckVudW0gPSBhcmd1bWVudHNbMV07XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgICAgbGluZW5vOiA1OTdcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHByb3h5TG9hZGluZ0Vycm9yRW51bSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm94eUxvYWRpbmdFcnJvckVudW0gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTE9BRF9QUk9YWV9TVEFURSwgcHJveHlfbG9hZGluZ19zdGF0ZXMuTkVUV09SS19FUlJPUik7XG4gICAgICAgICAgICAgICAgICBiYXNlLnJlc2V0RGVhY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhmYWxzZSwgcHJveHlMb2FkaW5nRXJyb3JFbnVtKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwcm94eU9iaiA9PT0gXCJ1bmRlZmluZWRcIiB8fCBwcm94eU9iaiA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5MT0FEX1BST1hZX1NUQVRFLCBwcm94eV9sb2FkaW5nX3N0YXRlcy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgICAgICAgIGJhc2UucmVzZXREZWFjdGl2YXRlKCk7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlLCBwcm94eV9hY3RpdmF0aW9uX2Vycm9ycy5ORVRXT1JLX0VSUk9SKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUFJPWFlfT0JKLCBwcm94eU9iaiwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVubzogNjA5XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9GRVRDSF9USU1FU1RBTVAsIGJhc2Uubm93KCkpKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghZG9BY3RpdmF0ZSkge1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UuZ2V0QWxsQWRkb25XaWxkY2FyZHMoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB3aWxkY2FyZExpcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDYxNFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGJhc2UuYXBwbHlQcm94eSh3aWxkY2FyZExpcywgZGVmZXJyZWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFURSwgcHJveHlfc3RhdGVzLlBBU1NJVkUpO1xuICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTE9BRF9QUk9YWV9TVEFURSwgcHJveHlfbG9hZGluZ19zdGF0ZXMuU1VDQ0VTUyk7XG4gICAgICAgICAgICAgICAgYmFzZS5hY3RpdmF0ZUJyb3dzZXJJY29uKGZhbHNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soYmFzZS51cGRhdGVCcm93c2VySWNvblBvcHVwKCkpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGJhc2UuYXBwbHlQcm94eShbXCIqXCJdLCBkZWZlcnJlZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFURSwgcHJveHlfc3RhdGVzLkFDVElWRSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTE9BRF9QUk9YWV9TVEFURSwgcHJveHlfbG9hZGluZ19zdGF0ZXMuU1VDQ0VTUyk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuUFJPWFlfU1RBUlRFRF9VTklYX1RJTUVTVEFNUCwgYmFzZS5ub3coKSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTEFTVF9GUkVFX1BMQU5fTkFHX1RJTUVTVEFNUCwgYmFzZS5ub3coKSk7XG4gICAgICAgICAgICAgIGJhc2UuYWN0aXZhdGVCcm93c2VySWNvbih0cnVlKTtcbiAgICAgICAgICAgICAgYmFzZS51cGRhdGVCcm93c2VySWNvblBvcHVwKCk7XG4gICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5IQVNfU0hPV05fVElQUywgZmFsc2UsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaGFzU2hvd25UaXAgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgICAgbGluZW5vOiA2MzJcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgIGlmICghaGFzU2hvd25UaXApIHtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5vcGVuUGFnZShwYWdlcy5USVAsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuSEFTX1NIT1dOX1RJUFMsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5zeW5jKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICAgIGxpbmVubzogNjM3XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfX2ljZWRfayhiYXNlLmFwcGx5UHJveHkoW1wiKlwiXSkpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBnZXRBbGxBZGRvbldpbGRjYXJkczogZnVuY3Rpb24oZGVmZXJDYWxsYmFjaykge1xuICAgIHZhciBhZGRvbiwgaW5zdGFsbGVkQWRkb25zLCBpc1BheW1lbnROZWVkZWQsIHVybCwgd2lsZGNhcmRMaXMsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlckNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVyQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkFERE9OUywgW10sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdGFsbGVkQWRkb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogNjQxXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5pc1BheW1lbnROZWVkZWQoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpc1BheW1lbnROZWVkZWQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA2NDJcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgX2ksIF9qLCBfbGVuLCBfbGVuMSwgX3JlZjtcbiAgICAgICAgICB3aWxkY2FyZExpcyA9IFtdO1xuICAgICAgICAgIGlmIChpc1BheW1lbnROZWVkZWQpIHtcbiAgICAgICAgICAgIGRlZmVyQ2FsbGJhY2soW10pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGluc3RhbGxlZEFkZG9ucy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICAgICAgYWRkb24gPSBpbnN0YWxsZWRBZGRvbnNbX2ldO1xuICAgICAgICAgICAgX3JlZiA9IGFkZG9uLm9yaWdfd2lsZGNhcmRfZG9tYWlucztcbiAgICAgICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IF9yZWYubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgICAgIHVybCA9IF9yZWZbX2pdO1xuICAgICAgICAgICAgICB3aWxkY2FyZExpcy5wdXNoKHVybCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlckNhbGxiYWNrKHdpbGRjYXJkTGlzKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgYWN0aXZhdGVCcm93c2VySWNvbjogZnVuY3Rpb24oZG9BY3RpdmF0ZSkge1xuXG4gICAgLyogdXBkYXRlcyB0aGUgYWN0dWFsIGJyb3dzZXIgaWNvbiB3aXRoIGEgZGlmZiBjb2xvciAqL1xuICAgIGlmIChkb0FjdGl2YXRlKSB7XG4gICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRJY29uKHtcbiAgICAgICAgcGF0aDogXCIvYXNzZXRzL2ltYWdlcy9pY29uLTE5LWNsaWNrZWQucG5nXCJcbiAgICAgIH0pO1xuICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0QmFkZ2VUZXh0KHtcbiAgICAgICAgdGV4dDogXCJVUFwiXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7XG4gICAgICAgIHRpdGxlOiBcIlwiXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0SWNvbih7XG4gICAgICAgIHBhdGg6IFwiL2Fzc2V0cy9pbWFnZXMvaWNvbi0xOS5wbmdcIlxuICAgICAgfSk7XG4gICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRCYWRnZVRleHQoe1xuICAgICAgICB0ZXh0OiBcIlwiXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7XG4gICAgICAgIHRpdGxlOiBcIlwiXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG4gIG5vdzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC8gMTAwMDtcbiAgfSxcbiAgcmVhcnJhbmdlUG9ydHM6IGZ1bmN0aW9uKHByb3h5T2JqLCBwb3J0UHJlZikge1xuICAgIHZhciBwLCBwb3J0X3R5cGUsIHJlYXJyYW5nZWRQb3J0cywgX2ksIF9qLCBfbGVuLCBfbGVuMSwgX3JlZjtcbiAgICBpZiAocG9ydFByZWYgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHByb3h5T2JqLnBvcnRzO1xuICAgIH1cbiAgICByZWFycmFuZ2VkUG9ydHMgPSBbXTtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IHBvcnRQcmVmLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICBwb3J0X3R5cGUgPSBwb3J0UHJlZltfaV07XG4gICAgICBfcmVmID0gcHJveHlPYmoucG9ydHM7XG4gICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBfcmVmLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICBwID0gX3JlZltfal07XG4gICAgICAgIGlmIChwb3J0X3R5cGUgPT09IHAudHlwZSkge1xuICAgICAgICAgIHJlYXJyYW5nZWRQb3J0cy5wdXNoKHApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChyZWFycmFuZ2VkUG9ydHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcHJveHlPYmoucG9ydHM7XG4gICAgfVxuICAgIHJldHVybiByZWFycmFuZ2VkUG9ydHM7XG4gIH0sXG4gIGdldFBvcnQ6IGZ1bmN0aW9uKHBvcnRMaXMsIHR5cGUpIHtcbiAgICB2YXIgcG9ydDJVc2UsIF9pLCBfbGVuO1xuICAgIGZvciAoX2kgPSAwLCBfbGVuID0gcG9ydExpcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgcG9ydDJVc2UgPSBwb3J0TGlzW19pXTtcbiAgICAgIGlmIChwb3J0MlVzZVtcInR5cGVcIl0gPT09IHR5cGUpIHtcbiAgICAgICAgcmV0dXJuIHBvcnQyVXNlO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgYXBwbHlQcm94eTogZnVuY3Rpb24oYXV0b0J5cGFzc1JlZ2V4TGlzLCBkZWZlckNhbGxiYWNrKSB7XG4gICAgdmFyIGlzSHR0cCwgcG9ydDJVc2UsIHBvcnRQcmVmLCBwcm94eU9iaiwgcHJveHlPYmoyVXNlLCByZWFycmFuZ2VkUG9ydHMsIHVzZVNwZHlEZWZhdWx0LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoYXV0b0J5cGFzc1JlZ2V4TGlzID09IG51bGwpIHtcbiAgICAgIGF1dG9CeXBhc3NSZWdleExpcyA9IFtcIipcIl07XG4gICAgfVxuICAgIGlmIChkZWZlckNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVyQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkNBQ0hFRF9QUk9YWV9PQkosIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJveHlPYmogPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA2OTRcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlVTRV9TUERZX0RFRkFVTFQsIG51bGwsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdXNlU3BkeURlZmF1bHQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgbGluZW5vOiA2OTVcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlBPUlRfUFJFRkVSRU5DRV9MSVNULCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHBvcnRQcmVmID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogNjk2XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgX2ksIF9qLCBfbGVuLCBfbGVuMTtcbiAgICAgICAgICAgIHByb3h5T2JqMlVzZSA9IHByb3h5T2JqO1xuICAgICAgICAgICAgcmVhcnJhbmdlZFBvcnRzID0gYmFzZS5yZWFycmFuZ2VQb3J0cyhwcm94eU9iajJVc2UpO1xuICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSByZWFycmFuZ2VkUG9ydHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgcG9ydDJVc2UgPSByZWFycmFuZ2VkUG9ydHNbX2ldO1xuICAgICAgICAgICAgICBpc0h0dHAgPSBwb3J0MlVzZVtcInR5cGVcIl0gPT09IFwiaHR0cFwiO1xuICAgICAgICAgICAgICBpZiAodXNlU3BkeURlZmF1bHQgJiYgaXNIdHRwKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNIdHRwKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRIdHRwUHJveHkocHJveHlPYmoyVXNlLmhvc3QsIHBvcnQyVXNlLm51bWJlciwgYXV0b0J5cGFzc1JlZ2V4TGlzLCBkZWZlckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRTcGR5UHJveHkocHJveHlPYmoyVXNlLmhvc3QsIHBvcnQyVXNlLm51bWJlciwgYXV0b0J5cGFzc1JlZ2V4TGlzLCBkZWZlckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IHJlYXJyYW5nZWRQb3J0cy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICAgICAgcG9ydDJVc2UgPSByZWFycmFuZ2VkUG9ydHNbX2pdO1xuICAgICAgICAgICAgICBpc0h0dHAgPSBwb3J0MlVzZVtcInR5cGVcIl0gPT09IFwiaHR0cFwiO1xuICAgICAgICAgICAgICBpZiAoaXNIdHRwKSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRIdHRwUHJveHkocHJveHlPYmoyVXNlLmhvc3QsIHBvcnQyVXNlLm51bWJlciwgYXV0b0J5cGFzc1JlZ2V4TGlzLCBkZWZlckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZS5zZXRTcGR5UHJveHkocHJveHlPYmoyVXNlLmhvc3QsIHBvcnQyVXNlLm51bWJlciwgYXV0b0J5cGFzc1JlZ2V4TGlzLCBkZWZlckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgc2V0SHR0cFByb3h5OiBmdW5jdGlvbihob3N0LCBwb3J0LCBhdXRvQnlwYXNzUmVnZXhMaXMsIGRlZmVyQ2FsbGJhY2spIHtcbiAgICB2YXIgY2ZnO1xuICAgIGlmIChhdXRvQnlwYXNzUmVnZXhMaXMgPT0gbnVsbCkge1xuICAgICAgYXV0b0J5cGFzc1JlZ2V4TGlzID0gW1wiKlwiXTtcbiAgICB9XG4gICAgaWYgKGRlZmVyQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgY2ZnID0ge1xuICAgICAgcGFjU2NyaXB0OiB7XG4gICAgICAgIGRhdGE6IGJhc2UuZ2VuUGFjU2NyaXB0KGhvc3QsIHBvcnQsIGF1dG9CeXBhc3NSZWdleExpcywgXCJQUk9YWVwiKVxuICAgICAgfSxcbiAgICAgIG1vZGU6IFwicGFjX3NjcmlwdFwiXG4gICAgfTtcbiAgICByZXR1cm4gY2hyb21lLnByb3h5LnNldHRpbmdzLnNldCh7XG4gICAgICB2YWx1ZTogY2ZnLFxuICAgICAgc2NvcGU6IFwicmVndWxhclwiXG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmZXJDYWxsYmFjaygpO1xuICAgIH0pO1xuICB9LFxuICBzZXRTcGR5UHJveHk6IGZ1bmN0aW9uKGhvc3QsIHBvcnQsIGF1dG9CeXBhc3NSZWdleExpcywgZGVmZXJDYWxsYmFjaykge1xuICAgIHZhciBjZmc7XG4gICAgaWYgKGF1dG9CeXBhc3NSZWdleExpcyA9PSBudWxsKSB7XG4gICAgICBhdXRvQnlwYXNzUmVnZXhMaXMgPSBbXCIqXCJdO1xuICAgIH1cbiAgICBpZiAoZGVmZXJDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlckNhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBjZmcgPSB7XG4gICAgICBwYWNTY3JpcHQ6IHtcbiAgICAgICAgZGF0YTogYmFzZS5nZW5QYWNTY3JpcHQoaG9zdCwgcG9ydCwgYXV0b0J5cGFzc1JlZ2V4TGlzKVxuICAgICAgfSxcbiAgICAgIG1vZGU6IFwicGFjX3NjcmlwdFwiXG4gICAgfTtcbiAgICByZXR1cm4gY2hyb21lLnByb3h5LnNldHRpbmdzLnNldCh7XG4gICAgICB2YWx1ZTogY2ZnLFxuICAgICAgc2NvcGU6IFwicmVndWxhclwiXG4gICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmZXJDYWxsYmFjaygpO1xuICAgIH0pO1xuICB9LFxuICBnZW5QYWNTY3JpcHQ6IGZ1bmN0aW9uKGhvc3QsIHBvcnQsIGF1dG9CeXBhc3NSZWdleExpcywgdHlwZSkge1xuICAgIHZhciBhdXRvQnlwYXNzVXJsLCBieXBhc3NTdHIsIHNjcmlwdCwgX2ksIF9sZW47XG4gICAgaWYgKGF1dG9CeXBhc3NSZWdleExpcyA9PSBudWxsKSB7XG4gICAgICBhdXRvQnlwYXNzUmVnZXhMaXMgPSBbXTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT0gbnVsbCkge1xuICAgICAgdHlwZSA9IFwiSFRUUFNcIjtcbiAgICB9XG4gICAgYnlwYXNzU3RyID0gXCJcIjtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGF1dG9CeXBhc3NSZWdleExpcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgYXV0b0J5cGFzc1VybCA9IGF1dG9CeXBhc3NSZWdleExpc1tfaV07XG4gICAgICBieXBhc3NTdHIgKz0gXCJpZiAoc2hFeHBNYXRjaCh1cmwsIFxcXCJcIiArIGF1dG9CeXBhc3NVcmwgKyBcIlxcXCIpKSByZXR1cm4gXFxcIlwiICsgdHlwZSArIFwiIFwiICsgaG9zdCArIFwiOlwiICsgcG9ydCArIFwiXFxcIjtcIjtcbiAgICB9XG4gICAgc2NyaXB0ID0gXCJmdW5jdGlvbiBGaW5kUHJveHlGb3JVUkwodXJsLCBob3N0KSB7XFxuXFxuICAgIGlmIChpc1BsYWluSG9zdE5hbWUoaG9zdCkgfHxcXG4gICAgICAgIHNoRXhwTWF0Y2goaG9zdCwgXFxcIioubG9jYWxcXFwiKSB8fFxcbiAgICAgICAgaXNJbk5ldChkbnNSZXNvbHZlKGhvc3QpLCBcXFwiMTAuMC4wLjBcXFwiLCBcXFwiMjU1LjAuMC4wXFxcIikgfHxcXG4gICAgICAgIGlzSW5OZXQoZG5zUmVzb2x2ZShob3N0KSwgXFxcIjE3Mi4xNi4wLjBcXFwiLCBcXFwiMjU1LjI0MC4wLjBcXFwiKSB8fFxcbiAgICAgICAgaXNJbk5ldChkbnNSZXNvbHZlKGhvc3QpLCBcXFwiMTkyLjE2OC4wLjBcXFwiLCBcXFwiMjU1LjI1NS4wLjBcXFwiKSB8fFxcbiAgICAgICAgaXNJbk5ldChkbnNSZXNvbHZlKGhvc3QpLCBcXFwiMTI3LjAuMC4wXFxcIiwgXFxcIjI1NS4yNTUuMjU1LjBcXFwiKSlcXG4gICAgICAgIHJldHVybiBcXFwiRElSRUNUXFxcIjtcXG5cXG4gICAgXCIgKyBieXBhc3NTdHIgKyBcIlxcblxcbiAgICByZXR1cm4gXFxcIkRJUkVDVFxcXCI7XFxufVwiO1xuICAgIHJldHVybiBzY3JpcHQ7XG4gIH0sXG4gIHJlc2V0RGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cbiAgICAvKiBkb2VzIHRoZSBwcm94eSBkZWFjdGl2YXRpb24gcmVzZXQgcm91dGluZSAqL1xuICAgIGJhc2UuY2xlYXJTcGR5UHJveHkoKTtcbiAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuUEFTU0lWRSk7XG4gICAgYmFzZS5hY3RpdmF0ZUJyb3dzZXJJY29uKGZhbHNlKTtcbiAgICByZXR1cm4gYmFzZS51cGRhdGVCcm93c2VySWNvblBvcHVwKCk7XG4gIH0sXG4gIHJlc2V0OiBmdW5jdGlvbihkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGlzUmVzZXR0aW5nLCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qIHJlc2V0IHJvdXRpbmcgZXZlcnl0aW1lIHRoZSBicm93c2VyL2V4dGVuc2lvbiByZXN0YXJ0cyAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLklTX1JFU0VUVElORywgZmFsc2UsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaXNSZXNldHRpbmcgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA3ODhcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGlzUmVzZXR0aW5nKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5JU19SRVNFVFRJTkcsIHRydWUsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgbGluZW5vOiA3OTJcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICBiYXNlLnJlc2V0RGVhY3RpdmF0ZSgpO1xuICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJhc2UuZmV0Y2hBbmRTYXZlU3BkeVByb3h5KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBsaW5lbm86IDc5NFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJhc2Uuc3luYyhfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICBsaW5lbm86IDc5NVxuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKCk7XG4gICAgICAgICAgICAgIGJhc2UudG9nZ2xlU3BkeVByb3h5QWN0aXZhdGlvbihmYWxzZSk7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuSVNfUkVTRVRUSU5HLCBmYWxzZSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgbGluZW5vOiA3OThcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgdXBkYXRlQnJvd3Nlckljb25Qb3B1cDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByb3h5U3RhdGUsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuXG4gICAgLyogdXBkYXRlcyB0aGUgcG9wdXAgd2hlbiB5b3UgY2xpY2sgdGhlIGJyb3dzZXIgaWNvbiBnaXZlbiB0aGUgY3VycmVudCBjaXJjdW1zdGFuY2UgKi9cbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFURSwgcHJveHlfc3RhdGVzLlBBU1NJVkUsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcHJveHlTdGF0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDgwMlxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocHJveHlTdGF0ZSA9PT0gcHJveHlfc3RhdGVzLkFDVElWRSkge1xuICAgICAgICAgIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFBvcHVwKHtcbiAgICAgICAgICAgIFwicG9wdXBcIjogcGFnZXMuUE9QVVAuRElTQ09OTkVDVFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRUaXRsZSh7XG4gICAgICAgICAgICBcInRpdGxlXCI6IGVuX21lc3NhZ2VzLkRJU0NPTk5FQ1RfR09NXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJveHlTdGF0ZSA9PT0gcHJveHlfc3RhdGVzLlBBU1NJVkUpIHtcbiAgICAgICAgICBjaHJvbWUuYnJvd3NlckFjdGlvbi5zZXRQb3B1cCh7XG4gICAgICAgICAgICBcInBvcHVwXCI6IHBhZ2VzLlBPUFVQLkFDVElWQVRJT05cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0VGl0bGUoe1xuICAgICAgICAgICAgXCJ0aXRsZVwiOiBlbl9tZXNzYWdlcy5BQ1RJVkFURV9HT01cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGU6IGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgZW5jLCBpdiwga2V5O1xuICAgIGtleSA9IENyeXB0b0pTLmVuYy5IZXgucGFyc2UoY29uc3RhbnRzLkNSWVBUT0pTX0tFWSk7XG4gICAgaXYgPSBDcnlwdG9KUy5lbmMuSGV4LnBhcnNlKGNvbnN0YW50cy5DUllQVE9KU19JVik7XG4gICAgZW5jID0gQ3J5cHRvSlMuQUVTLmVuY3J5cHQobSwga2V5LCB7XG4gICAgICBpdjogaXYsXG4gICAgICBtb2RlOiBDcnlwdG9KUy5tb2RlLkNCQyxcbiAgICAgIHBhZGRpbmc6IENyeXB0b0pTLnBhZC5Qa2NzN1xuICAgIH0pO1xuICAgIHJldHVybiBlbmMudG9TdHJpbmcoKTtcbiAgfSxcbiAgZDogZnVuY3Rpb24oZW0pIHtcbiAgICB2YXIgYywgaXYsIGtleTtcbiAgICBrZXkgPSBDcnlwdG9KUy5lbmMuSGV4LnBhcnNlKGNvbnN0YW50cy5DUllQVE9KU19LRVkpO1xuICAgIGl2ID0gQ3J5cHRvSlMuZW5jLkhleC5wYXJzZShjb25zdGFudHMuQ1JZUFRPSlNfSVYpO1xuICAgIGMgPSBDcnlwdG9KUy5BRVMuZGVjcnlwdChlbSwga2V5LCB7XG4gICAgICBpdjogaXYsXG4gICAgICBtb2RlOiBDcnlwdG9KUy5tb2RlLkNCQyxcbiAgICAgIHBhZGRpbmc6IENyeXB0b0pTLnBhZC5Qa2NzN1xuICAgIH0pO1xuICAgIHJldHVybiBjLnRvU3RyaW5nKENyeXB0b0pTLmVuYy5VdGY4KTtcbiAgfSxcbiAgZ2VuVXVpZDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwieHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4XCIucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICB2YXIgciwgdjtcbiAgICAgIHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwO1xuICAgICAgdiA9IChjID09PSBcInhcIiA/IHIgOiByICYgMHgzIHwgMHg4KTtcbiAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0V2Vic2l0ZTogZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFjb25maWcuUFJPRFVDVElPTikge1xuICAgICAgcmV0dXJuIGNvbmZpZy5ERVZfV0VCU0lURTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZy5HT01fV0VCU0lURTtcbiAgfSxcbiAgZ2V0QXBpSG9zdDogZnVuY3Rpb24oZGVmZXJyZWRDYWxsYmFjaykge1xuICAgIHZhciBlbmNyeXB0ZWRfaG9zdCwgcGluZ19yZXN1bHRzLCBwaW5nX3N1Y2Nlc3MsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmICghY29uZmlnLlBST0RVQ1RJT04pIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2soY29uZmlnLkRFVl9BUElfSE9TVCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkFQSV9IT1NUX1BJTkdfUkVTVUxUUywge30sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGluZ19yZXN1bHRzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogODU5XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAoZW5jcnlwdGVkX2hvc3QgaW4gcGluZ19yZXN1bHRzKSB7XG4gICAgICAgICAgcGluZ19zdWNjZXNzID0gcGluZ19yZXN1bHRzW2VuY3J5cHRlZF9ob3N0XTtcbiAgICAgICAgICBpZiAocGluZ19zdWNjZXNzKSB7XG4gICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGJhc2UuZChlbmNyeXB0ZWRfaG9zdCkpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayhiYXNlLmQoY29uZmlnLkFQSV9IT1NUU1swXSkpO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHRvdWNoOiBmdW5jdGlvbihkZXZpY2VfaWQsIGRlZmVyX2NiKSB7XG4gICAgdmFyIGVuZHBvaW50LCBob3N0LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJfY2IgPT0gbnVsbCkge1xuICAgICAgZGVmZXJfY2IgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIGVuZHBvaW50ID0gXCJcIiArIGNvbmZpZy5BUElfU1VGRklYICsgXCIvdXNlcnMvdG91Y2hcIjtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRBcGlIb3N0KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaG9zdCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkoKSxcbiAgICAgICAgICBsaW5lbm86IDg3MFxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgICB0aW1lb3V0OiBjb25zdGFudHMuRkFTVF9BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICB1cmw6IFwiXCIgKyBob3N0ICsgZW5kcG9pbnQsXG4gICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgZGV2aWNlX2lkOiBkZXZpY2VfaWRcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFsdDogXCJqc29uXCIsXG4gICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5IQVNfVE9VQ0hFRF9ERVZJQ0VfSUQsIHRydWUpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVyX2NiKHRydWUpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVyX2NiKGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHBpbmdBbGxBcGlIb3N0czogZnVuY3Rpb24oZGVmZXJfY2IpIHtcbiAgICB2YXIgZnVsbF9ob3N0LCBoLCBob3N0LCBpcCwgcGluZ0hvc3QsIHBpbmdfcmVzdWx0cywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVyX2NiID09IG51bGwpIHtcbiAgICAgIGRlZmVyX2NiID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkFQSV9IT1NUX1BJTkdfUkVTVUxUUywge30pO1xuICAgIHBpbmdIb3N0ID0gZnVuY3Rpb24oaG9zdCwgZG9uZV9jYikge1xuICAgICAgaWYgKGRvbmVfY2IgPT0gbnVsbCkge1xuICAgICAgICBkb25lX2NiID0gKGZ1bmN0aW9uKCkge30pO1xuICAgICAgfVxuICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgIHVybDogXCJcIiArIGhvc3QgKyBcIi9nb200L3Rlc3Q/XCIgKyAoYmFzZS5nZW5VdWlkKCkpLFxuICAgICAgICBhbHQ6IFwianNvblwiLFxuICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgdmFyIHBpbmdfcmVzdWx0cywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwxLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICAgICAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgICAgICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwxID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICAgICAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwxLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQVBJX0hPU1RfUElOR19SRVNVTFRTLCB7fSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwaW5nX3Jlc3VsdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgbGluZW5vOiA4OThcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcGluZ19yZXN1bHRzW2Jhc2UuZShob3N0KV0gPSB0cnVlO1xuICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLkFQSV9IT1NUX1BJTkdfUkVTVUxUUywgcGluZ19yZXN1bHRzKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGRvbmVfY2IodHJ1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBwaW5nX3Jlc3VsdHMsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsMSwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgICAgICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgICAgICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsMSA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsMSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLkFQSV9IT1NUX1BJTkdfUkVTVUxUUywge30sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGluZ19yZXN1bHRzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgIGxpbmVubzogOTAzXG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHBpbmdfcmVzdWx0c1tiYXNlLmUoaG9zdCldID0gZmFsc2U7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQVBJX0hPU1RfUElOR19SRVNVTFRTLCBwaW5nX3Jlc3VsdHMpO1xuICAgICAgICAgICAgICByZXR1cm4gZG9uZV9jYihmYWxzZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKHRoaXMpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cywgX3doaWxlO1xuICAgICAgICBfcmVmID0gY29uZmlnLkFQSV9IT1NUUztcbiAgICAgICAgX2xlbiA9IF9yZWYubGVuZ3RoO1xuICAgICAgICBfaSA9IDA7XG4gICAgICAgIF93aGlsZSA9IGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgdmFyIF9icmVhaywgX2NvbnRpbnVlLCBfbmV4dDtcbiAgICAgICAgICBfYnJlYWsgPSBfX2ljZWRfaztcbiAgICAgICAgICBfY29udGludWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpY2VkLnRyYW1wb2xpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICsrX2k7XG4gICAgICAgICAgICAgIHJldHVybiBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBfbmV4dCA9IF9jb250aW51ZTtcbiAgICAgICAgICBpZiAoIShfaSA8IF9sZW4pKSB7XG4gICAgICAgICAgICByZXR1cm4gX2JyZWFrKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGggPSBfcmVmW19pXTtcbiAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBwaW5nSG9zdChiYXNlLmQoaCksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgIGxpbmVubzogOTA5XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgfSkoX25leHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgX3doaWxlKF9faWNlZF9rKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICB2YXIgX2ksIF9sZW4sIF9yZWYsIF9yZXN1bHRzLCBfd2hpbGU7XG4gICAgICAgICAgX3JlZiA9IGNvbmZpZy5NSVJST1JfSE9TVFM7XG4gICAgICAgICAgX2xlbiA9IF9yZWYubGVuZ3RoO1xuICAgICAgICAgIF9pID0gMDtcbiAgICAgICAgICBfd2hpbGUgPSBmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgdmFyIF9icmVhaywgX2NvbnRpbnVlLCBfbmV4dDtcbiAgICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgICAgX2NvbnRpbnVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpY2VkLnRyYW1wb2xpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgKytfaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX25leHQgPSBfY29udGludWU7XG4gICAgICAgICAgICBpZiAoIShfaSA8IF9sZW4pKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfYnJlYWsoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGggPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgaG9zdCA9IGJhc2UuZChoKTtcbiAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBiYXNlLnJlc29sdmUoaG9zdCwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpcCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDkxM1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGZ1bGxfaG9zdCA9IFwiaHR0cDovL1wiICsgaXA7XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgcGluZ0hvc3QoZnVsbF9ob3N0LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgbGluZW5vOiA5MTVcbiAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICB9KShfbmV4dCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5BUElfSE9TVF9QSU5HX1JFU1VMVFMsIHt9LCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHBpbmdfcmVzdWx0cyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICBsaW5lbm86IDkxN1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVyX2NiKHBpbmdfcmVzdWx0cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIGdldExvY2FsRGF0YTogZnVuY3Rpb24oa2V5LCBkZWZhdWx0X3ZhbHVlLCBkZWZlcl9jYikge1xuICAgIHZhciBpdGVtcywgcG90ZW50aWFsX3JlcywgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLmdldChrZXksIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gaXRlbXMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiA5MjFcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGtleSBpbiBpdGVtcyAmJiAoaXRlbXNba2V5XSAhPSBudWxsKSkge1xuICAgICAgICAgIGRlZmVyX2NiKGl0ZW1zW2tleV0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBwb3RlbnRpYWxfcmVzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbiAgICAgICAgaWYgKHBvdGVudGlhbF9yZXMgIT0gbnVsbCkge1xuICAgICAgICAgIGRlZmVyX2NiKHBvdGVudGlhbF9yZXMpO1xuICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7XG4gICAgICAgICAgICBrZXk6IHBvdGVudGlhbF9yZXNcbiAgICAgICAgICB9LCAoZnVuY3Rpb24oKSB7fSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmZXJfY2IoZGVmYXVsdF92YWx1ZSk7XG4gICAgICB9O1xuICAgIH0pKHRoaXMpKTtcbiAgfSxcbiAgc2V0TG9jYWxEYXRhOiBmdW5jdGlvbihkaWNfa2V5LCB2YWwsIGRlZmVyX2NiKSB7XG4gICAgdmFyIGRpYztcbiAgICBpZiAoZGVmZXJfY2IgPT0gbnVsbCkge1xuICAgICAgZGVmZXJfY2IgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIGRpYyA9IHt9O1xuICAgIGRpY1tkaWNfa2V5XSA9IHZhbDtcbiAgICByZXR1cm4gY2hyb21lLnN0b3JhZ2UubG9jYWwuc2V0KGRpYywgKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRlZmVyX2NiKCk7XG4gICAgfSkpO1xuICB9LFxuICBnZXRQZXJzaXN0ZW50RGF0YTogZnVuY3Rpb24oa2V5LCBkZWZhdWx0X3ZhbHVlLCBkZWZlcl9jYikge1xuICAgIHJldHVybiBjaHJvbWUuY29va2llcy5nZXQoe1xuICAgICAgdXJsOiBjb25maWcuR09NX1dFQlNJVEUsXG4gICAgICBuYW1lOiBrZXlcbiAgICB9LCBmdW5jdGlvbihjb29raWUpIHtcbiAgICAgIGlmIChjb29raWUgPT0gbnVsbCkge1xuICAgICAgICBkZWZlcl9jYihkZWZhdWx0X3ZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRlZmVyX2NiKGNvb2tpZS52YWx1ZSk7XG4gICAgfSk7XG4gIH0sXG4gIHNldFBlcnNpc3RlbnREYXRhOiBmdW5jdGlvbihrZXksIHZhbCwgZGVmZXJfY2IpIHtcbiAgICB2YXIgZml2ZV95ZWFyc19mcm9tX25vdywgbm93O1xuICAgIGlmIChkZWZlcl9jYiA9PSBudWxsKSB7XG4gICAgICBkZWZlcl9jYiA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgbm93ID0gTWF0aC5yb3VuZChuZXcgRGF0ZSgpLmdldFRpbWUoKSAvIDEwMDApO1xuICAgIGZpdmVfeWVhcnNfZnJvbV9ub3cgPSBub3cgKyAoMzY1ICogNSAqIDI0ICogNjAgKiA2MCk7XG4gICAgcmV0dXJuIGNocm9tZS5jb29raWVzLnNldCh7XG4gICAgICB1cmw6IGNvbmZpZy5HT01fV0VCU0lURSxcbiAgICAgIG5hbWU6IGtleSxcbiAgICAgIHZhbHVlOiB2YWwsXG4gICAgICBleHBpcmF0aW9uRGF0ZTogZml2ZV95ZWFyc19mcm9tX25vd1xuICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGRlZmVyX2NiKCk7XG4gICAgfSk7XG4gIH0sXG4gIHNldEJyb3dzZXJBY3Rpb25Qb3B1cDogZnVuY3Rpb24ocG9wdXBfcGFnZSwgbXNnKSB7XG4gICAgY2hyb21lLmJyb3dzZXJBY3Rpb24uc2V0UG9wdXAoe1xuICAgICAgXCJwb3B1cFwiOiBwb3B1cF9wYWdlXG4gICAgfSk7XG4gICAgcmV0dXJuIGNocm9tZS5icm93c2VyQWN0aW9uLnNldFRpdGxlKHtcbiAgICAgIFwidGl0bGVcIjogbXNnXG4gICAgfSk7XG4gIH0sXG4gIHNob3dSaWNoTm90aWZpY2F0aW9uOiBmdW5jdGlvbih0aXRsZSwgYm9keSwgYnRucywgaWNvblVybCkge1xuICAgIHZhciBiLCBiaW5kQnV0dG9uQ2xpY2tFdmVudCwgYnRuTGlzLCBpLCB0aGlzSWQsIF9pLCBfbGVuO1xuICAgIGlmIChidG5zID09IG51bGwpIHtcbiAgICAgIGJ0bnMgPSBbXTtcbiAgICB9XG4gICAgaWYgKGljb25VcmwgPT0gbnVsbCkge1xuICAgICAgaWNvblVybCA9IFwiL2Fzc2V0cy9pbWFnZXMvZ29tX2JpZ19pY29uLnBuZ1wiO1xuICAgIH1cblxuICAgIC8qXG4gICAgVXNlcyB0aGUgbmV3IENocm9tZSAocmljaCkgbm90aWZpY2F0aW9ucyBBUElcbiAgICBcbiAgICBgYnV0dG9uc2AgLS0gaXMgYSBsaXN0IG9mIGRpY3RzIHdpdGggMyB2YWx1ZXMuXG4gICAgXG4gICAgZXhhbXBsZTpcbiAgICAgICAgW3tcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJUaXRsZSBvZiB0aGUgYnV0dG9uXCIsXG4gICAgICAgICAgICBcImljb25cIjogXCJpbWFnZXMvcmFiYml0LnBuZ1wiLFxuICAgICAgICAgICAgXCJuZXh0XCI6IGZ1bmN0aW9uKCkgey4ufVxuICAgICAgICB9XVxuICAgICAqL1xuICAgIHRoaXNJZCA9IGJhc2UuZ2VuVXVpZCgpO1xuICAgIGJpbmRCdXR0b25DbGlja0V2ZW50ID0gZnVuY3Rpb24oYnRuLCBpZHgsIGlkKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKGJ0bikge1xuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKGlkeCkge1xuICAgICAgICAgIHJldHVybiAoZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNocm9tZS5ub3RpZmljYXRpb25zLm9uQnV0dG9uQ2xpY2tlZC5yZW1vdmVMaXN0ZW5lcigpO1xuICAgICAgICAgICAgcmV0dXJuIGNocm9tZS5ub3RpZmljYXRpb25zLm9uQnV0dG9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbihub3RpZmljYXRpb25faWQsIGJ0bl9pZHgpIHtcbiAgICAgICAgICAgICAgaWYgKG5vdGlmaWNhdGlvbl9pZCA9PT0gaWQgJiYgYnRuX2lkeCA9PT0gaWR4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ0bi5uZXh0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pKGlkKTtcbiAgICAgICAgfSkoaWR4KTtcbiAgICAgIH0pKGJ0bik7XG4gICAgfTtcbiAgICBidG5MaXMgPSBbXTtcbiAgICBpID0gMDtcbiAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGJ0bnMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgIGIgPSBidG5zW19pXTtcbiAgICAgIGJ0bkxpcy5wdXNoKHtcbiAgICAgICAgdGl0bGU6IGIudGl0bGUsXG4gICAgICAgIGljb25Vcmw6IGIuaWNvblxuICAgICAgfSk7XG4gICAgICBiaW5kQnV0dG9uQ2xpY2tFdmVudChiLCBpLCB0aGlzSWQpO1xuICAgICAgaSArPSAxO1xuICAgIH1cbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jbGVhcih0aXRsZSwgKGZ1bmN0aW9uKCkge30pKTtcbiAgICByZXR1cm4gY2hyb21lLm5vdGlmaWNhdGlvbnMuY3JlYXRlKHRoaXNJZCwge1xuICAgICAgdHlwZTogXCJiYXNpY1wiLFxuICAgICAgdGl0bGU6IHRpdGxlLFxuICAgICAgbWVzc2FnZTogYm9keSxcbiAgICAgIGljb25Vcmw6IGljb25VcmwsXG4gICAgICBidXR0b25zOiBidG5MaXNcbiAgICB9LCAoZnVuY3Rpb24oKSB7fSkpO1xuICB9LFxuICBtYWtlVG9hc3Q6IGZ1bmN0aW9uKG1zZywgZHVyYXRpb25Ncykge1xuICAgIGlmIChkdXJhdGlvbk1zID09IG51bGwpIHtcbiAgICAgIGR1cmF0aW9uTXMgPSA0MDAwO1xuICAgIH1cbiAgICBpZiAobXNnID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuICQuc25hY2tiYXIoe1xuICAgICAgY29udGVudDogbXNnLFxuICAgICAgc3R5bGU6IFwidG9hc3RcIixcbiAgICAgIHRpbWVvdXQ6IGR1cmF0aW9uTXNcbiAgICB9KTtcbiAgfSxcbiAgZmV0Y2hQYXltZW50VXJsOiBmdW5jdGlvbihwbGFuLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgdmFyIGFwaUhvc3QsIGNvdW50cnksIHNlcnZpY2VUb2tlbiwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKHBsYW4gPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayhudWxsLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgfSk7XG4gICAgICAgIGJhc2UuZ2V0TG9jYWxEYXRhKGtleXMuQ09VTlRSWSwgY29uc3RhbnRzLkRFRkFVTFRfQ09VTlRSWV9DT0RFLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvdW50cnkgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxMDI0XG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDEwMjVcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMTAyNlxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgICAgICAgIHRpbWVvdXQ6IGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsXG4gICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgIHVybDogXCJcIiArIGFwaUhvc3QgKyBjb25maWcuQVBJX1NVRkZJWCArIFwiL3BheW1lbnRzL3VybFwiLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgc2VydmljZV90b2tlbjogc2VydmljZVRva2VuLFxuICAgICAgICAgICAgICAgIHBsYW46IHBsYW4sXG4gICAgICAgICAgICAgICAgY291bnRyeTogY291bnRyeVxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soZGF0YS51cmwsIGRhdGEuc2Fhc3lfdXJsLCBkYXRhLnByaWNlLnJhdywgZGF0YS5wcmljZS5mZWUsIGRhdGEucHJpY2UudG90YWwpO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZGVmZXJyZWRDYWxsYmFjayhudWxsLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZS5waW5nQWxsQXBpSG9zdHMoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHJlcGFpcjogZnVuY3Rpb24ocHJvZ3Jlc3NDYWxsYmFjaykge1xuICAgIHZhciBhcGlIb3N0LCBjdXJyZW50SG9zdCwgaSwgaiwgbmV3UHJveHlPYmosIHBvcnRPYmosIHByb3h5T2JqLCBzdWNjZXNzLCBzdWNjZXNzZnVsUG9ydFR5cGUsIHVybCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKHByb2dyZXNzQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgcHJvZ3Jlc3NDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgYmFzZS50b2dnbGVTcGR5UHJveHlBY3RpdmF0aW9uKGZhbHNlKTtcbiAgICAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICB9KTtcbiAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUFJPWFlfT0JKLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHByb3h5T2JqID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSgpLFxuICAgICAgICAgIGxpbmVubzogMTA0NVxuICAgICAgICB9KSk7XG4gICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgIH0pO1xuICAgIH0pKHRoaXMpKChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodHlwZW9mIHByb3h5T2JqID09PSBcInVuZGVmaW5lZFwiIHx8IHByb3h5T2JqID09PSBudWxsKSB7XG4gICAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjaygxMDApO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50SG9zdCA9IHByb3h5T2JqLmhvc3Q7XG4gICAgICAgIGkgPSAwO1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICB2YXIgX2JlZ2luLCBfZW5kLCBfaSwgX3Bvc2l0aXZlLCBfcmVzdWx0cywgX3N0ZXAsIF93aGlsZTtcbiAgICAgICAgICBqID0gaTtcbiAgICAgICAgICBfYmVnaW4gPSBpO1xuICAgICAgICAgIF9lbmQgPSBjb25zdGFudHMuTUFYX1RSSUVTX0ZPUl9JUF9DSEFOR0U7XG4gICAgICAgICAgaWYgKF9lbmQgPiBfYmVnaW4pIHtcbiAgICAgICAgICAgIF9zdGVwID0gMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgX3N0ZXAgPSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgX3Bvc2l0aXZlID0gX2VuZCA+IF9iZWdpbjtcbiAgICAgICAgICBfd2hpbGUgPSBmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgdmFyIF9icmVhaywgX2NvbnRpbnVlLCBfbmV4dDtcbiAgICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgICAgX2NvbnRpbnVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpY2VkLnRyYW1wb2xpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaiArPSBfc3RlcDtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX25leHQgPSBfY29udGludWU7XG4gICAgICAgICAgICBpZiAoISEoKF9wb3NpdGl2ZSA9PT0gdHJ1ZSAmJiBqID4gY29uc3RhbnRzLk1BWF9UUklFU19GT1JfSVBfQ0hBTkdFKSB8fCAoX3Bvc2l0aXZlID09PSBmYWxzZSAmJiBqIDwgY29uc3RhbnRzLk1BWF9UUklFU19GT1JfSVBfQ0hBTkdFKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF9icmVhaygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UuZmV0Y2hBbmRTYXZlU3BkeVByb3h5KF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMDU1XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5DQUNIRURfUFJPWFlfT0JKLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld1Byb3h5T2JqID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgIGxpbmVubzogMTA1NlxuICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXdQcm94eU9iai5ob3N0ICE9PSBjdXJyZW50SG9zdCkge1xuICAgICAgICAgICAgICAgICAgICAgIHByb3h5T2JqID0gbmV3UHJveHlPYmo7XG4gICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG5fYnJlYWsoKVxuICAgICAgICAgICAgICAgICAgICAgIH0pKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfbmV4dChwcm9ncmVzc0NhbGxiYWNrKGkpKTtcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIF93aGlsZShfX2ljZWRfayk7XG4gICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGkgPSBjb25zdGFudHMuTUFYX1RSSUVTX0ZPUl9JUF9DSEFOR0U7XG4gICAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjayhpKTtcbiAgICAgICAgICBzdWNjZXNzZnVsUG9ydFR5cGUgPSBbXTtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBiYXNlLmdldEFwaUhvc3QoX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBhcGlIb3N0ID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMTA2NlxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgIHZhciBfaSwgX2xlbiwgX3JlZiwgX3Jlc3VsdHMsIF93aGlsZTtcbiAgICAgICAgICAgICAgX3JlZiA9IHByb3h5T2JqLnBvcnRzO1xuICAgICAgICAgICAgICBfbGVuID0gX3JlZi5sZW5ndGg7XG4gICAgICAgICAgICAgIF9pID0gMDtcbiAgICAgICAgICAgICAgX3doaWxlID0gZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICB2YXIgX2JyZWFrLCBfY29udGludWUsIF9uZXh0O1xuICAgICAgICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgICAgICAgIF9jb250aW51ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGljZWQudHJhbXBvbGluZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgKytfaTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF93aGlsZShfX2ljZWRfayk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIF9uZXh0ID0gX2NvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGlmICghKF9pIDwgX2xlbikpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBfYnJlYWsoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcG9ydE9iaiA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwb3J0T2JqLnR5cGUgPT09IFwiaHR0cFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFzZS5zZXRIdHRwUHJveHkocHJveHlPYmouaG9zdCwgXCIxMjM0XCIsIFsnKiddLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMDY5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0U3BkeVByb3h5KHByb3h5T2JqLmhvc3QsIHBvcnRPYmoubnVtYmVyLCBbJyonXSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVubzogMTA3MFxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCA9IFwiaHR0cHM6Ly9hcGkuZ29tY29tbS5jb20vZ29tNC90ZXN0P1wiICsgKGJhc2UuZ2VuVXVpZCgpKTtcbiAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICBiYXNlLnBpbmdFbmRwb2ludCh1cmwsIGNvbnN0YW50cy5BSkFYX1RJTUVPVVRfTVMsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2VzcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lbm86IDEwNzJcbiAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc2Z1bFBvcnRUeXBlLnB1c2gocG9ydE9iai50eXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgaSArPSAzMDtcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX25leHQocHJvZ3Jlc3NDYWxsYmFjayhpKSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuUE9SVF9QUkVGRVJFTkNFX0xJU1QsIHN1Y2Nlc3NmdWxQb3J0VHlwZSk7XG4gICAgICAgICAgICAgIHByb2dyZXNzQ2FsbGJhY2soMTAwKTtcbiAgICAgICAgICAgICAgYmFzZS50b2dnbGVTcGR5UHJveHlBY3RpdmF0aW9uKGZhbHNlKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGJhc2Uuc3luYygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHBpbmdFbmRwb2ludDogZnVuY3Rpb24oZW5kcG9pbnQsIHRpbWVvdXQsIGRlZmVycmVkQ2FsbGJhY2spIHtcbiAgICBpZiAodGltZW91dCA9PSBudWxsKSB7XG4gICAgICB0aW1lb3V0ID0gY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUztcbiAgICB9XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICB0aW1lb3V0OiB0aW1lb3V0LFxuICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgIHVybDogXCJcIiArIGVuZHBvaW50ICsgXCIvP1wiICsgKGJhc2UuZ2VuVXVpZCgpKSxcbiAgICAgIGNyb3NzRG9tYWluOiB0cnVlLFxuICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjayh0cnVlKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgdGVzdEh0dHBQcm94eUVuZHBvaW50VmFsaWRpdHk6IGZ1bmN0aW9uKGhvc3QsIHBvcnQsIHVybExpcywgZGVmZXJyZWRDYWxsYmFjaywgcHJvZ3Jlc3NDYWxsYmFjaykge1xuICAgIHZhciBpLCBwaW5nU3VjY2Vzcywgc3VjY2Vzc2Z1bEVuZHBvaW50cywgdXJsLCB4LCBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCwgX19pY2VkX2RlZmVycmFscywgX19pY2VkX2s7XG4gICAgX19pY2VkX2sgPSBfX2ljZWRfa19ub29wO1xuICAgIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgICBpZiAoZGVmZXJyZWRDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBkZWZlcnJlZENhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cbiAgICBpZiAocHJvZ3Jlc3NDYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICBwcm9ncmVzc0NhbGxiYWNrID0gKGZ1bmN0aW9uKCkge30pO1xuICAgIH1cblxuICAgIC8qXG4gICAgY2hlY2tzIGlmIGEgYGh0dHBgIHByb3h5IGlzIHZhbGlkIGJ5IHJ1bm5pbmcgaXQgdGhyb3VnaCBhIHNlcmllcyBvZiBlbmRwb2ludHM7ICMgZGVmZXJfY2IobGlzKTogYSBsaXN0IG9mIGVuZHBvaW50cyB3LyBzdGF0dXMgY29kZSBvZiAyMDAgIyBwcm9ncmVzc19jYihwcm9ncmVzc19wZXJjZW50YWdlKVxuICAgICAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLnNldEh0dHBQcm94eShob3N0LCBwb3J0LCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gdXJsTGlzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICB4ID0gdXJsTGlzW19pXTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goXCIqXCIgKyAoYmFzZS5kKHgpKSArIFwiKlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICB9KSgpLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBsaW5lbm86IDEwOTdcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3VjY2Vzc2Z1bEVuZHBvaW50cyA9IFtdO1xuICAgICAgICBpID0gMDtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cywgX3doaWxlO1xuICAgICAgICAgIF9yZWYgPSB1cmxMaXM7XG4gICAgICAgICAgX2xlbiA9IF9yZWYubGVuZ3RoO1xuICAgICAgICAgIF9pID0gMDtcbiAgICAgICAgICBfd2hpbGUgPSBmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgdmFyIF9icmVhaywgX2NvbnRpbnVlLCBfbmV4dDtcbiAgICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgICAgX2NvbnRpbnVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpY2VkLnRyYW1wb2xpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgKytfaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX25leHQgPSBfY29udGludWU7XG4gICAgICAgICAgICBpZiAoIShfaSA8IF9sZW4pKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfYnJlYWsoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHVybCA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UucGluZ0VuZHBvaW50KFwiaHR0cDovL1wiICsgKGJhc2UuZCh1cmwpKSwgY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUywgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwaW5nU3VjY2VzcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDExMDFcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAocGluZ1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWxFbmRwb2ludHMucHVzaChiYXNlLmQodXJsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkgKz0gMTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX25leHQocHJvZ3Jlc3NDYWxsYmFjayhwYXJzZUludChpIC8gdXJsTGlzLmxlbmd0aCAqIDEwMCkpKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgICBfd2hpbGUoX19pY2VkX2spO1xuICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrKDEwMCk7XG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2soc3VjY2Vzc2Z1bEVuZHBvaW50cyk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKSk7XG4gIH0sXG4gIHRlc3RTcGR5UHJveHlFbmRwb2ludFZhbGlkaXR5OiBmdW5jdGlvbihob3N0LCBwb3J0LCB1cmxMaXMsIGRlZmVycmVkQ2FsbGJhY2ssIHByb2dyZXNzQ2FsbGJhY2spIHtcbiAgICB2YXIgaSwgcGluZ1N1Y2Nlc3MsIHN1Y2Nlc3NmdWxFbmRwb2ludHMsIHVybCwgeCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICAgIF9faWNlZF9rID0gX19pY2VkX2tfbm9vcDtcbiAgICBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCA9IGljZWQuZmluZERlZmVycmFsKGFyZ3VtZW50cyk7XG4gICAgaWYgKGRlZmVycmVkQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgZGVmZXJyZWRDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgaWYgKHByb2dyZXNzQ2FsbGJhY2sgPT0gbnVsbCkge1xuICAgICAgcHJvZ3Jlc3NDYWxsYmFjayA9IChmdW5jdGlvbigpIHt9KTtcbiAgICB9XG4gICAgXCJjaGVja3MgaWYgYSBgc3BkeWAgcHJveHkgaXMgdmFsaWQgYnkgcnVubmluZyBpdCB0aHJvdWdoIGEgc2VyaWVzIG9mIGVuZHBvaW50czsgIyBjYWxsYmFjayByZXR1cm46IGEgbGlzdCBvZiBlbmRwb2ludHMgdy8gc3RhdHVzIGNvZGUgb2YgMjAwICMgZGVmZXJfY2IobGlzKTogYSBsaXN0IG9mIGVuZHBvaW50cyB3LyBzdGF0dXMgY29kZSBvZiAyMDAgIyBwcm9ncmVzc19jYihwcm9ncmVzc19wZXJjZW50YWdlKVwiO1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLnNldFNwZHlQcm94eShob3N0LCBwb3J0LCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gdXJsTGlzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgICAgICB4ID0gdXJsTGlzW19pXTtcbiAgICAgICAgICAgIF9yZXN1bHRzLnB1c2goXCIqXCIgKyAoYmFzZS5kKHgpKSArIFwiKlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgICB9KSgpLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBsaW5lbm86IDExMTNcbiAgICAgICAgfSkpO1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICB9KTtcbiAgICB9KSh0aGlzKSgoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3VjY2Vzc2Z1bEVuZHBvaW50cyA9IFtdO1xuICAgICAgICBpID0gMDtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cywgX3doaWxlO1xuICAgICAgICAgIF9yZWYgPSB1cmxMaXM7XG4gICAgICAgICAgX2xlbiA9IF9yZWYubGVuZ3RoO1xuICAgICAgICAgIF9pID0gMDtcbiAgICAgICAgICBfd2hpbGUgPSBmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgdmFyIF9icmVhaywgX2NvbnRpbnVlLCBfbmV4dDtcbiAgICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgICAgX2NvbnRpbnVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpY2VkLnRyYW1wb2xpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgKytfaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX25leHQgPSBfY29udGludWU7XG4gICAgICAgICAgICBpZiAoIShfaSA8IF9sZW4pKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfYnJlYWsoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHVybCA9IF9yZWZbX2ldO1xuICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGJhc2UucGluZ0VuZHBvaW50KFwiaHR0cDovL1wiICsgKGJhc2UuZCh1cmwpKSwgY29uc3RhbnRzLkFKQVhfVElNRU9VVF9NUywgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwaW5nU3VjY2VzcyA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICBsaW5lbm86IDExMTdcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAocGluZ1N1Y2Nlc3MpIHtcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3NmdWxFbmRwb2ludHMucHVzaCh1cmwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpICs9IDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9uZXh0KHByb2dyZXNzQ2FsbGJhY2socGFyc2VJbnQoaSAvIHVybExpcy5sZW5ndGggKiAxMDApKSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjaygxMDApO1xuICAgICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKHN1Y2Nlc3NmdWxFbmRwb2ludHMpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICBmZXRjaFBvcnRQcmlvcml0eTogZnVuY3Rpb24ocHJveHlPYmosIGRlZmVycmVkQ2FsbGJhY2ssIHByb2dyZXNzQ2FsbGJhY2spIHtcbiAgICB2YXIgY3VycmVudFByb2dyZXNzLCBob3N0LCBpLCBpc0h0dHAsIHAsIHBvcnQsIHBvcnRBcnJheSwgcG9ydE5vLCBwb3J0UHJlZiwgcG9ydFRlc3RSZXN1bHQsIHByb3h5U3RhdGUsIHNvcnRlZEFyciwgdGVzdFJlc3VsdHMsIHVzZVNwZHlBc0RlZmF1bHQsIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLCBfX2ljZWRfZGVmZXJyYWxzLCBfX2ljZWRfaztcbiAgICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gICAgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwgPSBpY2VkLmZpbmREZWZlcnJhbChhcmd1bWVudHMpO1xuICAgIGlmIChkZWZlcnJlZENhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuICAgIGlmIChwcm9ncmVzc0NhbGxiYWNrID09IG51bGwpIHtcbiAgICAgIHByb2dyZXNzQ2FsbGJhY2sgPSAoZnVuY3Rpb24oKSB7fSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgcmVxdWlyZXMgS0VZUy5QUk9YWV9TVEFURSB0byBiZSBBQ1RJVkFUSU9OX01PREVTLlBBU1NJVkUgKGJlY2F1c2UgaXQgYXNzaWducyByYW5kb20gcHJveGllcykgIyBmaWd1cmVzIG91ciB3aGljaCBwb3J0cyBmcm9tIHByb3h5X29iaiBhcmUgYmV0dGVyXG4gICAgIChmb3IgZXhhbXBsZSwgbm9uLXNwZHkgcG9ydHMgc2VydmUgdmlkZW9zIGZhc3RlcikgIyBjYWxsYmFjayByZXR1cm46IGRlZmVyX2NiKHN1Y2Nlc3NmdWxseV9vcHRpbWl6ZWQsIHBvcnRfdHlwZV9saXMpICMgY2FsbGJhY2sgcmV0dXJuOiBwcm9ncmVzc19jYihwcm9ncmVzc19wZXJjZW50YWdlKVxuICAgICAqL1xuICAgIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgIH0pO1xuICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlVTRV9TUERZX0RFRkFVTFQsIGZhbHNlLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHVzZVNwZHlBc0RlZmF1bHQgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pKCksXG4gICAgICAgICAgbGluZW5vOiAxMTMwXG4gICAgICAgIH0pKTtcbiAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgfSk7XG4gICAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGhvc3QgPSBwcm94eU9iai5ob3N0O1xuICAgICAgICBwb3J0QXJyYXkgPSBwcm94eU9ialtcInBvcnRzXCJdO1xuICAgICAgICBwb3J0VGVzdFJlc3VsdCA9IFtdO1xuICAgICAgICBpID0gMDtcbiAgICAgICAgY3VycmVudFByb2dyZXNzID0gMDtcbiAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVmLCBfcmVzdWx0cywgX3doaWxlO1xuICAgICAgICAgIF9yZWYgPSBwb3J0QXJyYXk7XG4gICAgICAgICAgX2xlbiA9IF9yZWYubGVuZ3RoO1xuICAgICAgICAgIF9pID0gMDtcbiAgICAgICAgICBfd2hpbGUgPSBmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgdmFyIF9icmVhaywgX2NvbnRpbnVlLCBfbmV4dDtcbiAgICAgICAgICAgIF9icmVhayA9IF9faWNlZF9rO1xuICAgICAgICAgICAgX2NvbnRpbnVlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpY2VkLnRyYW1wb2xpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgKytfaTtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgX25leHQgPSBfY29udGludWU7XG4gICAgICAgICAgICBpZiAoIShfaSA8IF9sZW4pKSB7XG4gICAgICAgICAgICAgIHJldHVybiBfYnJlYWsoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBvcnQgPSBfcmVmW19pXTtcbiAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuUEFTU0lWRSwgX19pY2VkX2RlZmVycmFscy5kZWZlcih7XG4gICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm94eVN0YXRlID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgIGxpbmVubzogMTEzOVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChwcm94eVN0YXRlID09PSBwcm94eV9zdGF0ZXMuQUNUSVZFKSB7XG4gICAgICAgICAgICAgICAgICBkZWZlcnJlZENhbGxiYWNrKGZhbHNlLCBbXSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlzSHR0cCA9IHBvcnRbXCJ0eXBlXCJdID09PSBcImh0dHBcIjtcbiAgICAgICAgICAgICAgICBwb3J0Tm8gPSBwb3J0W1wibnVtYmVyXCJdO1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgaWYgKHVzZVNwZHlBc0RlZmF1bHQgJiYgaXNIdHRwKSB7XG4gICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuX2NvbnRpbnVlKClcbiAgICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9faWNlZF9rKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzSHR0cCkge1xuICAgICAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9iYXNlLmNvZmZlZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhc2UudGVzdEh0dHBQcm94eUVuZHBvaW50VmFsaWRpdHkoaG9zdCwgcG9ydE5vLCBjb25zdGFudHMuRU5EUE9JTlRTX1RPX1RFU1QsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGVzdFJlc3VsdHMgPSBhcmd1bWVudHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbGluZW5vOiAxMTQ5XG4gICAgICAgICAgICAgICAgICAgICAgICB9KSwgZnVuY3Rpb24ocHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHByb2dyZXNzQ2FsbGJhY2socGFyc2VJbnQoY3VycmVudFByb2dyZXNzICsgKHByb2dyZXNzIC8gcG9ydEFycmF5Lmxlbmd0aCkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgICAgIH0pKF9faWNlZF9rKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvYmFzZS5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYXNlLnRlc3RTcGR5UHJveHlFbmRwb2ludFZhbGlkaXR5KGhvc3QsIHBvcnRObywgY29uc3RhbnRzLkVORFBPSU5UU19UT19URVNULCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRlc3RSZXN1bHRzID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVubzogMTE1MlxuICAgICAgICAgICAgICAgICAgICAgICAgfSksIGZ1bmN0aW9uKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcm9ncmVzc0NhbGxiYWNrKHBhcnNlSW50KGN1cnJlbnRQcm9ncmVzcyArIChwcm9ncmVzcyAvIHBvcnRBcnJheS5sZW5ndGgpKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgICB9KShfX2ljZWRfayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGVzdFJlc3VsdHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgIHBvcnRUZXN0UmVzdWx0LnB1c2goW3BvcnQsIHRlc3RSZXN1bHRzXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaSArPSAxO1xuICAgICAgICAgICAgICAgICAgICBwcm9ncmVzc0NhbGxiYWNrKHBhcnNlSW50KGkgLyBwb3J0QXJyYXkubGVuZ3RoICogMTAwKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfbmV4dChjdXJyZW50UHJvZ3Jlc3MgPSBwYXJzZUludChpIC8gcG9ydEFycmF5Lmxlbmd0aCAqIDEwMCkpO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgICAgX3doaWxlKF9faWNlZF9rKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgIHBhcmVudDogX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsXG4gICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL2Jhc2UuY29mZmVlXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5nZXRMb2NhbERhdGEoa2V5cy5QUk9YWV9TVEFURSwgcHJveHlfc3RhdGVzLlBBU1NJVkUsIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gcHJveHlTdGF0ZSA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICBsaW5lbm86IDExNjFcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChwcm94eVN0YXRlID09PSBwcm94eV9zdGF0ZXMuQUNUSVZFKSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkQ2FsbGJhY2soZmFsc2UsIFtdKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc29ydGVkQXJyID0gcG9ydFRlc3RSZXN1bHQuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgIHZhciBhSHR0cEJvbnVzLCBiSHR0cEJvbnVzO1xuICAgICAgICAgICAgICBhSHR0cEJvbnVzID0gYVswXVtcInR5cGVcIl0gPT09IFwiaHR0cFwiID8gMSA6IDA7XG4gICAgICAgICAgICAgIGJIdHRwQm9udXMgPSBiWzBdW1widHlwZVwiXSA9PT0gXCJodHRwXCIgPyAxIDogMDtcbiAgICAgICAgICAgICAgcmV0dXJuIChhSHR0cEJvbnVzICsgYVsxXS5sZW5ndGgpIC0gKGJIdHRwQm9udXMgKyBiWzFdLmxlbmd0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvcnRlZEFyciA9IHNvcnRlZEFyci5yZXZlcnNlKCk7XG4gICAgICAgICAgICBwb3J0UHJlZiA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyIF9pLCBfbGVuLCBfcmVzdWx0cztcbiAgICAgICAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBzb3J0ZWRBcnIubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgICAgICAgICBwID0gc29ydGVkQXJyW19pXTtcbiAgICAgICAgICAgICAgICBfcmVzdWx0cy5wdXNoKHBbMF1bXCJ0eXBlXCJdKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkQ2FsbGJhY2sodHJ1ZSwgcG9ydFByZWYpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSkodGhpcykpO1xuICB9LFxuICByZXNvbHZlOiBmdW5jdGlvbihuYW1lLCBkZWZlcnJlZENhbGxiYWNrKSB7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICB1cmw6IFwiaHR0cHM6Ly9kbnMuZ29vZ2xlLmNvbS9yZXNvbHZlP25hbWU9XCIgKyBuYW1lLFxuICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgdGltZW91dDogZmluYWwuU0hPUlRfTVMsXG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBfcmVmO1xuICAgICAgICByZXR1cm4gZGVmZXJyZWRDYWxsYmFjaygoX3JlZiA9IGRhdGEuQW5zd2VyKSAhPSBudWxsID8gX3JlZlswXS5kYXRhIDogdm9pZCAwKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBkZWZlcnJlZENhbGxiYWNrKG51bGwpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2U7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvYmFzZS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBjb25maWc7XG5cbmNvbmZpZyA9IHtcbiAgR09NX0NIUk9NRV9TVE9SRV9MSU5LOiBcImh0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUvZGV0YWlsL2NraWFoYmNtbG1rcGZpaWplY2JwZmxmYWhvaW1rbGtlL3Jldmlld3NcIixcbiAgR09NX1NHX0NIUk9NRV9TVE9SRV9MSU5LOiBcImh0dHBzOi8vY2hyb21lLmdvb2dsZS5jb20vd2Vic3RvcmUvZGV0YWlsL2xsZWRwZmxmbmFuYW1rb2dvY2xrZ2FnZ2ZkZ29hbG9rL3Jldmlld3NcIixcbiAgR09NX1dFQlNJVEU6IFwiaHR0cHM6Ly9nZXRnb20uY29tXCIsXG4gIEFQSV9TVUZGSVg6IFwiL2FwaS92N1wiLFxuICBBUElfSE9TVFM6IFtcImNBVzBkV01KbzdLM1FRUCswcCtxMk81dWVKcERtakprcWVzZFZIcERiOWc9XCIsIFwiaERXSldweDlyYlpVL2pVSVpGQnE4bm1LckJQc0VsWFhxRkJQeUxXV2FzL2xDMXJIb3MyRUMxaGw2NU93NE4yVFwiXSxcbiAgTUlSUk9SX0hPU1RTOiBbXCIvZERiZzdrV0NZNUk0c1VTQ3pHazMzdUNxa1FXa051dUNUdkluNGJ0aHRVPVwiXSxcbiAgQVBJX0hPU1RTX1dJTERDQVJEOiBbXCIzRHp4bjF2Nys1OHlUbnhSWUpUMjFpYU96VnBJa3F0NUNLcXNySGlZaHg4PVwiLCBcIkFiZEVOVmVncXFOeStVeU8zbzBTSXpVNlFvU2ttaVNTVVFOVk9CWEVsUFE9XCIsIFwiakdtSi95N1p4S0h4ODlsZmlseDZxYTRzSVBjWm5YeVRGcm5EeU04YzhGbThvRHlkd1VpNXc5eS9CbWRxOVRRUVwiXSxcbiAgREVWX0FQSV9IT1NUOiBcImh0dHA6Ly9hcGktc3RhZ2luZy5nb21jb21tLmNvbVwiLFxuICBERVZfV0VCU0lURTogJ2h0dHBzOi8vc3RhZ2luZy5nZXRnb20uY29tJyxcbiAgUFJPRFVDVElPTjogdHJ1ZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25maWc7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29uZmlnLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGNvbnN0YW50cztcblxuY29uc3RhbnRzID0ge1xuICBDUllQVE9KU19LRVk6ICczNmViZTIwNWJjZGZjNDk5YTI1ZTY5MjNmNDQ1MGZhOCcsXG4gIENSWVBUT0pTX0lWOiAnYmU0MTBmZWE0MWRmNzE2MmE2Nzk4NzVlYzEzMWNmMmMnLFxuICBBSkFYX1RJTUVPVVRfTVM6IDE1MDAwLFxuICBGQVNUX0FKQVhfVElNRU9VVF9NUzogNTAwMCxcbiAgU0VDU19GT1JfUFJPWFlfVE9fRVhQSVJFOiA4NjQwMCxcbiAgUFJPWFlfVFlQRTogJ3NwZHknLFxuICBBUElfU1VGRklYOiAnL2FwaS92NycsXG4gIFNFQ1NfUEVSX1NQRUVEX0JPT1NURVJfTkFHOiAxMjAwLFxuICBTRUNTX1RJTExfRklSU1RfU1BFRURfQk9PU1RFUl9OQUc6IDMwLFxuICBERVZJQ0VfUExBVEZPUk06ICdjaHJvbWUnLFxuICBERUZBVUxUX0NPVU5UUllfQ09ERTogJ3VzJyxcbiAgREVGQVVMVF9QUklDRVM6IHtcbiAgICBwcmljZXM6IHtcbiAgICAgIFwicHJvXCI6IDQuOTksXG4gICAgICBcImxpZmVcIjogMTk5LFxuICAgICAgXCJzdXByZW1lXCI6IDMuMzMsXG4gICAgICBcImdvbGRcIjogMTkuOTlcbiAgICB9LFxuICAgIHN5bWJvbDogXCIkXCJcbiAgfSxcbiAgUFJJQ0lOR19QTEFOUzoge1xuICAgIFBSTzogXCJwcm9cIixcbiAgICBTVVBSRU1FOiBcInN1cHJlbWVcIixcbiAgICBMSUZFOiBcImxpZmVcIixcbiAgICBHT0xEOiBcImdvbGRcIlxuICB9LFxuICBQUklDSU5HX1BMQU5fRFVSQVRJT046IHtcbiAgICAncHJvJzogXCJNb250aGx5XCIsXG4gICAgJ3N1cHJlbWUnOiBcIjEwIG1vbnRocyB0ZXJtXCIsXG4gICAgJ2xpZmUnOiBcIkxpZmV0aW1lXCJcbiAgfSxcbiAgTUFYX1RSSUVTX0ZPUl9JUF9DSEFOR0U6IDUsXG4gIEVORFBPSU5UU19UT19URVNUOiBbXCJ1MHQ0aDIvVlVuVnMxSWxOYUNQWDVnPT1cIiwgXCJYTWRYcVZxa3NmZ3d2TFFCRzZHVmRRPT1cIiwgXCJ1ZkNNaE1iN01BK25DYkp3MzViV0FnPT1cIiwgXCJHMGw5RkNZMUhObmRXYVlKR2h2Y2p3PT1cIiwgXCJGbGtXZFRLVDdJTWlORVV3YW5vaVp3PT1cIiwgXCJ2NmJBc0lJSW1SWk9sQTBpaEZjTVBBPT1cIiwgXCI2NXZaaDJxTXdiZTRMa2hXRFpubitnPT1cIiwgXCI2Z24vVDVxTnR0aXlJb01DYWlsdHlBPT1cIiwgXCIyUU5ZRGQrellaQWNaSXZ0UDRZc29RPT1cIl0sXG4gIERFRkFVTFRfSU5TVEFMTEVEX0FERE9OUzogW1xuICAgIHtcbiAgICAgIGJ5cGFzc19lbnRpdHk6IFwiR29tIFZQTidzIFdlYnNpdGVcIixcbiAgICAgIHRpdGxlOiBcIkdldEdvbS5jb21cIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkJ5cGFzc2VzIGdldGdvbS5jb20gYXV0b21hdGljYWxseSBpZiBnZXRnb20uY29tIGlzIGJsb2NrZWRcIixcbiAgICAgIG9yaWdfd2lsZGNhcmRfZG9tYWluczogW1wiZ2V0Z29tLmNvbSpcIl0sXG4gICAgICB1cmxfZG9tYWluczogW1wiZ2V0Z29tLmNvbS4qXCJdLFxuICAgICAgaWQ6IFwiZ2V0Z29tLmNvbVwiXG4gICAgfVxuICBdLFxuICBERUZBVUxUX1NVR0dFU1RFRF9BRERPTlM6IFtcbiAgICB7XG4gICAgICBieXBhc3NfZW50aXR5OiBcIk5ldGZsaXggLSBCeXBhc3MgYSBVUy1vbmx5IG1vdmllIHN0cmVhbWluZyBzZXJ2aWNlXCIsXG4gICAgICB0aXRsZTogXCJOZXRmbGl4LU5pbmphXCIsXG4gICAgICBkZXNjcmlwdGlvbjogXCJCeXBhc3NlcyBOZXRmbGl4XCIsXG4gICAgICBvcmlnX3dpbGRjYXJkX2RvbWFpbnM6IFtcIipuZXRmbGl4LmNvbSpcIl0sXG4gICAgICB1cmxfZG9tYWluczogW1wiLipuZXRmbGl4LmNvbS4qXCJdLFxuICAgICAgaWQ6IFwibmV0ZmxpeC5jb21cIlxuICAgIH0sIHtcbiAgICAgIGJ5cGFzc19lbnRpdHk6IFwiUGFuZG9yYSAtIEJ5cGFzcyBhIFVTLW9ubHkgZnJlZSBtdXNpYyByYWRpbyBzdHJlYW1pbmcgc2VydmljZVwiLFxuICAgICAgdGl0bGU6IFwiUGFuZG9yYS1QYW5kYVwiLFxuICAgICAgZGVzY3JpcHRpb246IFwiQnlwYXNzZXMgUGFuZG9yYVwiLFxuICAgICAgb3JpZ193aWxkY2FyZF9kb21haW5zOiBbXCIqcGFuZG9yYS5jb20qXCJdLFxuICAgICAgdXJsX2RvbWFpbnM6IFtcIi4qcGFuZG9yYS5jb20uKlwiXSxcbiAgICAgIGlkOiBcInBhbmRvcmEuY29tXCJcbiAgICB9XG4gIF0sXG4gIEdPTV9TR19OQU1FOiBcIkdvIGF3YXkgTURBIC0gQnlwYXNzIE1EQSBibG9ja2VkIHNpdGVzXCIsXG4gIEVNQUlMX0FETUlOX1VSTDogXCJtYWlsdG86Z29AZ2V0Z29tLmNvbT9zdWJqZWN0PVNlcnZlcitpc3N1ZVwiLFxuICBERUZBVUxUX0ZSRUVfVElFUl9NSU5TOiAxNSxcbiAgRlJFRV9USUVSX1JFQ0hBUkdFX01JTlM6IDAuNSxcbiAgREVGQVVMVF9DVU1VTEFUSVZFX1VTQUdFOiB7XG4gICAgc2Vjb25kczogMCxcbiAgICBsYXN0VGljazogbmV3IERhdGUoKS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgIHdhaXRlZFNlY29uZHM6IDBcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudHM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29uc3RhbnRzLmpzXCIsXCIvXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGZpbmFsO1xuXG5maW5hbCA9IHtcbiAgTE9OR19NUzogMTAwMDAsXG4gIFNIT1JUX01TOiA3MDAwXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpbmFsO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2VudW0vZmluYWwuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGtleXM7XG5cbmtleXMgPSB7XG4gIEhBU19UT1VDSEVEX0RFVklDRV9JRDogJ2hhc190b3VjaGVkX2RldmljZV9pZCcsXG4gIFVTRV9TUERZX0RFRkFVTFQ6IFwicHJveGllc191c2Vfc3BkeV9kZWZhdWx0XCIsXG4gIFBPUlRfUFJFRkVSRU5DRV9MSVNUOiBcInBvcnRfcHJlZmVyZW5jZV9saXN0XCIsXG4gIE5FRURTX1ZFUklGSUNBVElPTjogXCJuZWVkc192ZXJpZmljYXRpb25cIixcbiAgU0lHTl9JTl9DQUNIRURfRU1BSUw6IFwic2lnbl9pbl9jYWNoZWRfZW1haWxcIixcbiAgSU5TVEFOVF9UUklBTF9FWFBJUllfRVBPQ0g6IFwiaW5zdGFudF90cmlhbF9leHBpcnlfZXBvY2hcIixcbiAgSU5TVEFOVF9UUklBTF9TVEFSVEVEX0VQT0NIOiBcImluc3RhbnRfdHJpYWxfc3RhcnRlZF9lcG9jaFwiLFxuICBBUElfSE9TVF9QSU5HX1JFU1VMVFM6IFwiYXBpX2hvc3RfcGluZ19yZXN1bHRzXCIsXG4gIFNIT1dfVVBHUkFERV9XSU5ET1dfSU5fT1BUSU9OUzogXCJzaG93X3VwZ3JhZGVfb3B0aW9uc1wiLFxuICBIQVNfU0hPV05fQU5YSUVUWV9OT1RJRklDQVRJT05fMzBNSU46IFwiaGFzX3Nob3duX2FueGlldHlfbm90aWZpY2F0aW9uXzMwbWluXCIsXG4gIEhBU19TSE9XTl9BTlhJRVRZX05PVElGSUNBVElPTl8zME1JTjogXCJoYXNfc2hvd25fYW54aWV0eV9ub3RpZmljYXRpb25fMzBtaW5cIixcbiAgSEFTX1NIT1dOX0FOWElFVFlfTk9USUZJQ0FUSU9OXzVNSU46IFwiaGFzX3Nob3duX2FueGlldHlfbm90aWZpY2F0aW9uXzVtaW5cIixcbiAgSEFTX1NIT1dOX0FOWElFVFlfTk9USUZJQ0FUSU9OXzFNSU46IFwiaGFzX3Nob3duX2FueGlldHlfbm90aWZpY2F0aW9uXzFtaW5cIixcbiAgTEFTVF9BQ1RJVkFUSU9OX1RJTUVTVEFNUDogXCJsYXN0X2FjdGl2YXRpb25fdGltZXN0YW1wXCIsXG4gIEFDVElWQVRJT05fVElNRVNUQU1QX0xPR1M6IFwiYWN0aXZhdGlvbl90aW1lc3RhbXBfbG9nc1wiLFxuICBEQUlMWV9IT1VSTFlfTElNSVQ6IFwiZGFpbHlfaG91cmx5X2xpbWl0XCIsXG4gIERBSUxZX01JTlVURV9MSU1JVDogXCJkYWlseV9taW51dGVfbGltaXRcIixcbiAgSEFTX0NIT1NFTl9QTEFOOiBcImhhc19jaG9zZW5fcGxhblwiLFxuICBTUERZX0FVVEhfQ1JFRFM6IFwic3BkeV9hdXRoX2NyZWRzXCIsXG4gIElTX01BS0lOR19QQVlNRU5UOiBcImlzX21ha2luZ19wYXltZW50XCIsXG4gIFBSSUNJTkc6IFwicHJpY2luZ1wiLFxuICBDT1VOVFJZOiBcImNvdW50cnlcIixcbiAgUFJPWFlfRFVSQVRJT046IFwicHJveHlfZHVyYXRpb25cIixcbiAgR09NX0JVVFRPTl9QUkVTU19DT1VOVDogXCJnb21fYnV0dG9uX3ByZXNzX2NvdW50XCIsXG4gIEhBU19BQ0NPVU5UX0lTU1VFUzogXCJoYXNfYWNjb3VudF9pc3N1ZXNcIixcbiAgU1VHR0VTVEVEX0FERE9OUzogXCJzdWdnZXN0ZWRfYWRkb25zXCIsXG4gIEFERE9OUzogXCJpbnN0YWxsZWRfYWRkb25zXCIsXG4gIElTX0hPV19UT19VU0VfT1BUSU9OX1RPT0xUSVBfSElEREVOOiBcImlzX2hvd190b191c2Vfb3B0aW9uX3Rvb2x0aXBfaGlkZGVuXCIsXG4gIENPVU5UUlk6IFwiY291bnRyeVwiLFxuICBISURFX0lOQ09HX1RPT0xUSVA6IFwiaGlkZV9pbmNvZ190b29sdGlwXCIsXG4gIEhBU19SQVRFRF9HT006IFwiaGFzX3JhdGVkX2dvbVwiLFxuICBDQUNIRURfQUNDT1VOVF9JTkZPOiBcImNhY2hlZF9hY2NvdW50X2luZm9cIixcbiAgQ0FDSEVEX1BBWU1FTlRfUExBTjogXCJjYWNoZWRfcGF5bWVudF9wbGFuXCIsXG4gIENBQ0hFRF9QQVlNRU5UX0NSRURJVDogXCJjYWNoZWRfcGF5bWVudF9jcmVkaXRcIixcbiAgQ0FDSEVEX0dPTEQ6IFwiY2FjaGVkX2dvbGRfaW5mb1wiLFxuICBDQUNIRURfUFJPWFlfT0JKOiBcImNhY2hlZF9wcm94eV9vYmpcIixcbiAgUEFZTUVOVF9VUkw6IFwicGF5bWVudF91cmxcIixcbiAgU0FBU1lfUEFZTUVOVF9VUkw6IFwic2Fhc3lfcGF5bWVudF91cmxcIixcbiAgRU1BSUw6IFwiZ29tNF9lbWFpbFwiLFxuICBQQVNTV09SRDogXCJnb200X3Bhc3N3ZFwiLFxuICBBQ0NFU1NfVE9LRU46IFwiZ29tNF9hY2Nlc3NfdG9rZW5cIixcbiAgQ0FDSEVEX1RPS0VOOiBcImNhY2hlZF90b2tlblwiLFxuICBDQUNIRURfRU1BSUw6IFwiY2FjaGVkX2VtYWlsXCIsXG4gIFVTRVJfSUQ6IFwidXNlcl9pZFwiLFxuICBERVZJQ0VfSUQ6IFwiZGV2aWNlX2lkXCIsXG4gIFNFUlZJQ0VfVE9LRU46IFwic2VydmljZV90b2tlblwiLFxuICBIQVNfU0hPV05fVElQUzogXCJoYXNfc2hvd25fdGlwc1wiLFxuICBQUk9YWV9TVEFURTogXCJwcm94eV9zdGF0ZVwiLFxuICBMT0FEX1BST1hZX1NUQVRFOiBcInByb3h5X2xvYWRpbmdfc3RhdGVcIixcbiAgUFJPWFlfU1RBUlRFRF9VTklYX1RJTUVTVEFNUDogXCJwcm94eV9zdGFydGVkX3VuaXhfdGltZXN0YW1wXCIsXG4gIFBSSUNJTkdfRkVFOiBcInByaWNpbmdfZmVlXCIsXG4gIFBSSUNJTkdfUkFXOiBcInByaWNpbmdfcmF3XCIsXG4gIFBSSUNJTkdfVE9UQUw6IFwicHJpY2luZ190b3RhbFwiLFxuICBQUklDSU5HX1BMQU46IFwicHJpY2luZ19wbGFuXCIsXG4gIExBU1RfRlJFRV9QTEFOX05BR19USU1FU1RBTVA6IFwibGFzdF9zcGVlZF9ib29zdGVyX25hZ190aW1lc3RhbXBcIixcbiAgUFJPWFlfRkVUQ0hfVElNRVNUQU1QOiBcInByb3h5X2ZldGNoX3RpbWVzdGFtcFwiLFxuICBJU19SRVNFVFRJTkc6IFwiaXNfcmVzZXR0aW5nXCIsXG4gIFJFTE9BRF9DT1VOVDogXCJyZWxvYWRfY291bnRcIixcbiAgRlJFRV9USUVSX01JTlM6IFwiZnJlZV90aWVyX21pbnNcIixcbiAgRlJFRV9USUVSX1JFQ0hBUkdFX01JTlM6IFwiZnJlZV90aWVyX3JlY2hhcmdlX21pbnNcIixcbiAgSEFTX0FMUkVBRFlfSU5WSVRFRF9VU0VSUzogXCJoYXNfaW52aXRlZF91c2Vyc1wiLFxuICBBQ1RJVkFUSU9OX1VTQUdFOiAnYWN0aXZhdGlvbl91c2FnZSdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtL2tleXMuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHBhZ2VzO1xuXG5wYWdlcyA9IHtcbiAgUE9QVVA6IHtcbiAgICBTSUdOX0lOOiAnL3BhZ2VzL3BvcHVwcy9zaWduX2luLmh0bWwnLFxuICAgIENPVU5URE9XTjogJy9wYWdlcy9wb3B1cHMvZnJlZV90aWVyX2NvdW50ZG93bi5odG1sJyxcbiAgICBBQ1RJVkFUSU9OOiAnL3BhZ2VzL3BvcHVwcy9hY3RpdmF0aW9uLmh0bWwnLFxuICAgIERJU0NPTk5FQ1Q6ICcvcGFnZXMvcG9wdXBzL2Rpc2Nvbm5lY3QuaHRtbCcsXG4gICAgVkVSSUZZX0VNQUlMOiAnL3BhZ2VzL3BvcHVwcy92ZXJpZnlfZW1haWwuaHRtbCcsXG4gICAgRE9ORV9XSVRIX1BBWU1FTlQ6ICcvcGFnZXMvcG9wdXBzL2RvbmVfd2l0aF9wYXltZW50Lmh0bWwnXG4gIH0sXG4gIE9QVElPTlM6ICcvcGFnZXMvb3B0aW9ucy5odG1sJyxcbiAgU0lHTl9JTjogJy9wYWdlcy9zaWduX2luLmh0bWwnLFxuICBQUklDSU5HOiAnL3BhZ2VzL3ByaWNpbmcuaHRtbCcsXG4gIFJFR0lTVFJBVElPTl9QQVNTV09SRDogJy9wYWdlcy9yZWdpc3Rlci5odG1sJyxcbiAgUkVQQUlSOiAnL3BhZ2VzL3JlcGFpci5odG1sJyxcbiAgUkVHSVNUUkFUSU9OX1NJR05fSU5fUEFTU1dEOiAnL3BhZ2VzL3NpZ25faW5fd19wYXNzd29yZC5odG1sJyxcbiAgSE9XX1RPX1VTRTogJy9wYWdlcy9iZWdpbl91c2luZy5odG1sJyxcbiAgVElQOiAnL3BhZ2VzL3RpcC5odG1sJyxcbiAgUVVPVEFUSU9OOiAnL3BhZ2VzL3F1b3RhdGlvbi5odG1sJyxcbiAgSU5WSVRFOiAnL3BhZ2VzL2ludml0ZS5odG1sJyxcbiAgSU5WSVRFX1NVQ0NFU1M6ICcvcGFnZXMvc3VjY2Vzc2Z1bGx5X2ludml0ZWQuaHRtbCcsXG4gIEdPTERfUFJPTU9USU9OOiAnL3BhZ2VzL2dvbGQuaHRtbCdcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcGFnZXM7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwicEJHdkFwXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvZW51bS9wYWdlcy5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgZXJyb3JzO1xuXG5lcnJvcnMgPSB7XG4gIENPTkZMSUNUSU5HX0VYVEVOU0lPTjogXCJjb25mbGljaXRuZ19leHRlbnNpb25cIixcbiAgUkVRVUlSRV9FTUFJTF9WRVJJRklDQVRJT046IFwicmVxdWlyZV9lbWFpbF92ZXJpZmljYXRpb25cIixcbiAgTkVUV09SS19FUlJPUjogXCJuZXR3b3JrX2Vycm9yXCJcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZXJyb3JzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2VudW0vcHJveHlfYWN0aXZhdGlvbl9lcnJvcnMuanNcIixcIi9lbnVtXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHByb3h5X2xvYWRpbmdfc3RhdGU7XG5cbnByb3h5X2xvYWRpbmdfc3RhdGUgPSB7XG4gIExPQURJTkc6ICdsb2FkaW5nJyxcbiAgU1VDQ0VTUzogJ3N1Y2Nlc3MnLFxuICBORVRXT1JLX0VSUk9SOiAnbmV0d29ya19lcnJvcidcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gcHJveHlfbG9hZGluZ19zdGF0ZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtL3Byb3h5X2xvYWRpbmdfc3RhdGVzLmpzXCIsXCIvZW51bVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBwcm94eV9zdGF0ZTtcblxucHJveHlfc3RhdGUgPSB7XG4gIEFDVElWRTogJ2FjdGl2ZScsXG4gIFBBU1NJVkU6ICdwYXNzaXZlJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwcm94eV9zdGF0ZTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJwQkd2QXBcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9lbnVtL3Byb3h5X3N0YXRlcy5qc1wiLFwiL2VudW1cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgYmFzZSwgZG9DcmVhdGVBY2NvdW50U3VibWl0LCBlbl9tZXNzYWdlcywgaWNlZCwgaW5pdFZpZXcsIGtleXMsIHBhZ2VzLCBwcm94eV9sb2FkaW5nX3N0YXRlcywgcHJveHlfc3RhdGVzLCBfX2ljZWRfaywgX19pY2VkX2tfbm9vcCxcbiAgX19zbGljZSA9IFtdLnNsaWNlO1xuXG5pY2VkID0ge1xuICBEZWZlcnJhbHM6IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfQ2xhc3MoX2FyZykge1xuICAgICAgdGhpcy5jb250aW51YXRpb24gPSBfYXJnO1xuICAgICAgdGhpcy5jb3VudCA9IDE7XG4gICAgICB0aGlzLnJldCA9IG51bGw7XG4gICAgfVxuXG4gICAgX0NsYXNzLnByb3RvdHlwZS5fZnVsZmlsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEtLXRoaXMuY291bnQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGludWF0aW9uKHRoaXMucmV0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgX0NsYXNzLnByb3RvdHlwZS5kZWZlciA9IGZ1bmN0aW9uKGRlZmVyX3BhcmFtcykge1xuICAgICAgKyt0aGlzLmNvdW50O1xuICAgICAgcmV0dXJuIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGlubmVyX3BhcmFtcywgX3JlZjtcbiAgICAgICAgICBpbm5lcl9wYXJhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBfX3NsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgICAgICAgIGlmIChkZWZlcl9wYXJhbXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgaWYgKChfcmVmID0gZGVmZXJfcGFyYW1zLmFzc2lnbl9mbikgIT0gbnVsbCkge1xuICAgICAgICAgICAgICBfcmVmLmFwcGx5KG51bGwsIGlubmVyX3BhcmFtcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBfdGhpcy5fZnVsZmlsbCgpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgfTtcblxuICAgIHJldHVybiBfQ2xhc3M7XG5cbiAgfSkoKSxcbiAgZmluZERlZmVycmFsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcbiAgdHJhbXBvbGluZTogZnVuY3Rpb24oX2ZuKSB7XG4gICAgcmV0dXJuIF9mbigpO1xuICB9XG59O1xuX19pY2VkX2sgPSBfX2ljZWRfa19ub29wID0gZnVuY3Rpb24oKSB7fTtcblxuZW5fbWVzc2FnZXMgPSByZXF1aXJlKCcuL21lc3NhZ2VzL2VuJyk7XG5cbmJhc2UgPSByZXF1aXJlKCcuL2Jhc2UnKTtcblxua2V5cyA9IHJlcXVpcmUoJy4vZW51bS9rZXlzJyk7XG5cbnBhZ2VzID0gcmVxdWlyZSgnLi9lbnVtL3BhZ2VzJyk7XG5cbnByb3h5X3N0YXRlcyA9IHJlcXVpcmUoJy4vZW51bS9wcm94eV9zdGF0ZXMnKTtcblxucHJveHlfbG9hZGluZ19zdGF0ZXMgPSByZXF1aXJlKCcuL2VudW0vcHJveHlfbG9hZGluZ19zdGF0ZXMnKTtcblxuZG9DcmVhdGVBY2NvdW50U3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBjb29raWUsIGVtYWlsQWRkciwgaXNQYXltZW50TmVlZGVkLCBsYWRkYUJ0biwgcGFzc3dkLCBzZXJ2aWNlVG9rZW4sIHN1Y2Nlc3NmdWxseVN5bmNlZCwgX19faWNlZF9wYXNzZWRfZGVmZXJyYWwsIF9faWNlZF9kZWZlcnJhbHMsIF9faWNlZF9rO1xuICBfX2ljZWRfayA9IF9faWNlZF9rX25vb3A7XG4gIF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsID0gaWNlZC5maW5kRGVmZXJyYWwoYXJndW1lbnRzKTtcbiAgbGFkZGFCdG4gPSBMYWRkYS5jcmVhdGUoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI25ldy1hY2NvdW50LXBhc3N3b3JkLWxhZGRhLWJ0bicpKTtcbiAgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9wYWdlcy9qcy9yZWdpc3Rlci5jb2ZmZWVcIlxuICAgICAgfSk7XG4gICAgICBiYXNlLmdldExvY2FsRGF0YShrZXlzLlNJR05fSU5fQ0FDSEVEX0VNQUlMLCBudWxsLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGVtYWlsQWRkciA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KSgpLFxuICAgICAgICBsaW5lbm86IDlcbiAgICAgIH0pKTtcbiAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICB9KTtcbiAgfSkodGhpcykoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHR5cGVvZiBlbWFpbEFkZHIgPT09IFwidW5kZWZpbmVkXCIgfHwgZW1haWxBZGRyID09PSBudWxsKSB7XG4gICAgICAgIHJlZGlyZWN0KHBhZ2VzLlNJR05fSU4pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoJChcIiNuZXctYWNjb3VudC1mb3JtXCIpLnBhcnNsZXkoKS52YWxpZGF0ZSgpKSB7XG4gICAgICAgIGxhZGRhQnRuLnN0YXJ0KCk7XG4gICAgICAgIHBhc3N3ZCA9ICQoXCIjcGFzc3dkXCIpLnZhbCgpO1xuICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvcGFnZXMvanMvcmVnaXN0ZXIuY29mZmVlXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBiYXNlLnJlZ2lzdGVyKGVtYWlsQWRkciwgcGFzc3dkLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcnZpY2VUb2tlbiA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICBsaW5lbm86IDE3XG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzZXJ2aWNlVG9rZW4gPT09IFwidW5kZWZpbmVkXCIgfHwgc2VydmljZVRva2VuID09PSBudWxsKSB7XG4gICAgICAgICAgICBsYWRkYUJ0bi5zdG9wKCk7XG4gICAgICAgICAgICBiYXNlLm1ha2VUb2FzdChlbl9tZXNzYWdlcy5SRUdJU1RSQVRJT05fRVJST1IsIDEwMDAwKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgYmFzZS5zZXRMb2NhbERhdGEoa2V5cy5TRVJWSUNFX1RPS0VOLCBzZXJ2aWNlVG9rZW4pO1xuICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuQ0FDSEVEX0VNQUlMLCBlbWFpbEFkZHIpO1xuICAgICAgICAgIGJhc2UubWFrZVRvYXN0KGVuX21lc3NhZ2VzLlNZTkNJTkdfQUNDT1VOVF9JTkZPKTtcbiAgICAgICAgICAoZnVuY3Rpb24oX19pY2VkX2spIHtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgZmlsZW5hbWU6IFwiL1VzZXJzL251YmVsYS9Xb3Jrc3BhY2UvZ29tLWNocm9tZS9zcmMvcGFnZXMvanMvcmVnaXN0ZXIuY29mZmVlXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYmFzZS5zeW5jKF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICBhc3NpZ25fZm46IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gc3VjY2Vzc2Z1bGx5U3luY2VkID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICAgIGxpbmVubzogMjlcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMuX2Z1bGZpbGwoKTtcbiAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICghc3VjY2Vzc2Z1bGx5U3luY2VkKSB7XG4gICAgICAgICAgICAgIGxhZGRhQnRuLnN0b3AoKTtcbiAgICAgICAgICAgICAgYmFzZS5tYWtlVG9hc3QoU0VSVkVSX0VSUk9SKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgIF9faWNlZF9kZWZlcnJhbHMgPSBuZXcgaWNlZC5EZWZlcnJhbHMoX19pY2VkX2ssIHtcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBcIi9Vc2Vycy9udWJlbGEvV29ya3NwYWNlL2dvbS1jaHJvbWUvc3JjL3BhZ2VzL2pzL3JlZ2lzdGVyLmNvZmZlZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjaHJvbWUuY29va2llcy5nZXQoe1xuICAgICAgICAgICAgICAgIHVybDogYmFzZS5nZXRXZWJzaXRlKCksXG4gICAgICAgICAgICAgICAgbmFtZTogJ3QnXG4gICAgICAgICAgICAgIH0sIF9faWNlZF9kZWZlcnJhbHMuZGVmZXIoe1xuICAgICAgICAgICAgICAgIGFzc2lnbl9mbjogKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY29va2llID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgIGxpbmVubzogMzlcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICB9KShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgKGZ1bmN0aW9uKF9faWNlZF9rKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb29raWUgIT09IFwidW5kZWZpbmVkXCIgJiYgY29va2llICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICBiYXNlLm1ha2VUb2FzdChlbl9tZXNzYWdlcy5BQ0NFUFRJTkdfSU5WSVRFKTtcbiAgICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzID0gbmV3IGljZWQuRGVmZXJyYWxzKF9faWNlZF9rLCB7XG4gICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBfX19pY2VkX3Bhc3NlZF9kZWZlcnJhbCxcbiAgICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9wYWdlcy9qcy9yZWdpc3Rlci5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZS5hY2NlcHRJbnZpdGUoY29va2llLnZhbHVlLCBfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgICBsaW5lbm86IDQyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscy5fZnVsZmlsbCgpO1xuICAgICAgICAgICAgICAgICAgfSkoX19pY2VkX2spO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIChmdW5jdGlvbihfX2ljZWRfaykge1xuICAgICAgICAgICAgICAgICAgX19pY2VkX2RlZmVycmFscyA9IG5ldyBpY2VkLkRlZmVycmFscyhfX2ljZWRfaywge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQ6IF9fX2ljZWRfcGFzc2VkX2RlZmVycmFsLFxuICAgICAgICAgICAgICAgICAgICBmaWxlbmFtZTogXCIvVXNlcnMvbnViZWxhL1dvcmtzcGFjZS9nb20tY2hyb21lL3NyYy9wYWdlcy9qcy9yZWdpc3Rlci5jb2ZmZWVcIlxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICBiYXNlLmlzUGF5bWVudE5lZWRlZChfX2ljZWRfZGVmZXJyYWxzLmRlZmVyKHtcbiAgICAgICAgICAgICAgICAgICAgYXNzaWduX2ZuOiAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzUGF5bWVudE5lZWRlZCA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgICAgICAgICBsaW5lbm86IDQ0XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICBfX2ljZWRfZGVmZXJyYWxzLl9mdWxmaWxsKCk7XG4gICAgICAgICAgICAgICAgfSkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNQYXltZW50TmVlZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGJhc2UucmVkaXJlY3QocGFnZXMuT1BUSU9OUyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGJhc2Uuc2V0TG9jYWxEYXRhKGtleXMuTE9BRF9QUk9YWV9TVEFURSwgcHJveHlfbG9hZGluZ19zdGF0ZXMuTE9BRElORyk7XG4gICAgICAgICAgICAgICAgICBiYXNlLnNldExvY2FsRGF0YShrZXlzLlBST1hZX1NUQVRFLCBwcm94eV9zdGF0ZXMuUEFTU0lWRSk7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gX19pY2VkX2soYmFzZS5yZWRpcmVjdChwYWdlcy5PUFRJT05TKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF9faWNlZF9rKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkodGhpcykpO1xufTtcblxuaW5pdFZpZXcgPSBmdW5jdGlvbigpIHtcbiAgJChcIiNuZXctYWNjb3VudC1mb3JtXCIpLm9uKFwic3VibWl0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZG9DcmVhdGVBY2NvdW50U3VibWl0KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbiAgcmV0dXJuICQoXCIjbmV3LWFjY291bnQtcGFzc3dvcmQtYnRuXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgZG9DcmVhdGVBY2NvdW50U3VibWl0KCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn07XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICByZXR1cm4gaW5pdFZpZXcoKTtcbn0pO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfN2IyYWE4ZDAuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgbWVzc2FnZXM7XG5cbm1lc3NhZ2VzID0ge1xuICBUUllJTkdfR09NOiBcIllvdSBhcmUgY3VycmVudGx5IHRyeWluZyBHb21cIixcbiAgVFJJQUxfV0lMTF9FWFBJUkU6IFwiWW91ciB0cmlhbCB3aWxsIGV4cGlyZSBpbiAle2R1cmF0aW9ufVwiLFxuICBTSUdOX0lOX0ZPUl9GVUxMX0dPTTogXCJTaWduIGluIGZvciB0aGUgZnVsbCBHb20gZXhwZXJpZW5jZVwiLFxuICBTSUdOSU5HX1lPVV9JTjogXCJTaWduaW5nIHlvdSBpbi4uXCIsXG4gIFNZTkNJTkdfQUNDT1VOVF9JTkZPOiBcIlN5bmNpbmcgYWNjb3VudCBpbmZvLi5cIixcbiAgQU5YSUVUWV9CT0RZX0NUQTogXCJHZXQgbW9yZSB0aW1lXCIsXG4gIEFOWElFVFlfVElUTEVfMzBNSU5TOiBcIjMwIG1pbnV0ZXMgbGVmdFwiLFxuICBBTlhJRVRZX0JPRFk6IFwiWW91IGNhbiBjdXJyZW50bHkgb24gdGhlIEZyZWUgcGxhbi4gWW91IGNhbiB1c2UgR29tIGZvciAle2hvdXJ9IGhvdXIocykgLyBkYXkuXCIsXG4gIEFOWElFVFlfVElUTEVfNU1JTlM6IFwiNSBtaW51dGVzIGxlZnRcIixcbiAgQU5YSUVUWV9USVRMRV8xTUlOOiBcIjEgbWludXRlIGxlZnRcIixcbiAgQU5YSUVUWV9USVRMRV9FWFBJUkU6IFwiR29tIGlzIHBhdXNlZFwiLFxuICBBTlhJRVRZX0JPRFlfRVhQSVJFOiBcIllvdSBoYXZlIGZpbmlzaGVkIHlvdXIgZGFpbHkgZnJlZSBsaW1pdCBvZiBHb21cIixcbiAgR09NX1BSRVZJRVdfRVhQSVJFRDogXCJTaWduIGluIHRvIGJlZ2luXCIsXG4gIFNJR05fSU5fVE9fQ09OVElOVUVfR09NOiBcIkltbWVkaWF0ZWx5IGJ5cGFzcyBibG9ja2VkIHNpdGVzXCIsXG4gIFZJRVdfQURET05TOiBcIlNlZSBhbGwgaW5zdGFsbGVkIGFkZG9uc1wiLFxuICBTTUFSVF9WUE5fRU5BQkxFRDogXCJHb20gZW5hYmxlZFwiLFxuICBTVUNDRVNTX01TRzogXCJFbnRlciB5b3VyIGZhdm91cml0ZSBibG9ja2VkIHNpdGUncyBVUkwgYW5kIGVuam95IGFic29sdXRlIGZyZWVkb20hXCIsXG4gIEVSUk9SX0NPTlRBQ1RJTkdfU0VSVkVSOiBcIlRoZXJlIGlzIGFuIGVycm9yIHRyeWluZyB0byBjb250YWN0IHRoZSBzZXJ2ZXIuIFBsZWFzZSB0cnkgYWdhaW4gbGF0ZXIhXCIsXG4gIFNIT1dfQUxMX0VYVFM6IFwiU2hvdyBhbGwgZXh0ZW5zaW9uc1wiLFxuICBESVNBQkxFX09USEVSX0VYVEVOU0lPTlM6IFwiUGxlYXNlIGRpc2FibGUgb3RoZXIgZXh0ZW5zaW9ucyB0byB1c2UgR29tXCIsXG4gIE9USEVSX0VYVEVOU0lPTlNfVVNJTkc6IFwiT3RoZXIgZXh0ZW5zaW9ucyBhcmUgcHJldmVudGluZyBHb20gZnJvbSBiZWluZyBlbmFibGVkXCIsXG4gIFJBVEVfNV9TVEFSUzogXCJEbyB5b3UgZmluZCBHb20gdXNlZnVsPyBIZWxwIHJhdGUgR29tIDUgc3RhcnMgOilcIixcbiAgRVJST1JfRU5BQkxJTkdfR09NOiBcIkVycm9yIGFjdGl2YXRpbmcgR29tXCIsXG4gIElTU1VFUzogXCJUaGVyZSBhcmUgaXNzdWVzIHdpdGggeW91ciBhY2NvdW50XCIsXG4gIEVNQUlMX0FETUlOOiBcIkVtYWlsIGFkbWluXCIsXG4gIE9PUFM6IFwiT29wc1wiLFxuICBBTExPV19JTkNPR05JVE86IFwiRW5hYmxlIEdvbSB0byBiZSB1c2VkIGluIEluY29nbml0byBtb2RlXCIsXG4gIFJFSU5TVEFMTF9HT006IFwiT29wcywgdGhlcmUgc2VlbXMgdG8gYmUgYW4gaXNzdWUgd2l0aCBHb20uIFBsZWFzZSByZWluc3RhbGwgR29tIGF0IGh0dHA6Ly9nZXRnb20uY29tXCIsXG4gIE5PX01PUkVfSU5TVEFOVF9UUklBTDogXCJJbnN0YW50IHRyaWFsIGlzIG5vdCBhdmFpbGFibGUgZm9yIHRoaXMgZGV2aWNlLiBQbGVhc2Ugc2lnbiBpbiB0byBjb250aW51ZSB1c2luZyBHb20uXCIsXG4gIEFDVElWQVRFX0dPTTogXCJBY3RpdmF0ZSBHb20gVlBOXCIsXG4gIERJU0NPTk5FQ1RfR09NOiBcIkRpc2Nvbm5lY3QgR29tXCIsXG4gIEdFVFRJTkdfUEVSTUlTU0lPTjogXCJHZXR0aW5nIHBlcm1pc3Npb24gdG8gbG9nIHlvdSBpbi4uXCIsXG4gIFNJR05JTl9FUlJPUjogXCJUaGVyZSBpcyBhbiBlcnJvciBzaWduaW5nIHlvdSBpbi4gRWl0aGVyIHlvdXIgZW1haWwgb3IgeW91ciBwYXNzd29yZCBpcyBpbmNvcnJlY3QuXCIsXG4gIFNFQU1MRVNTX1NJR05fSU5fRVJST1I6IFwiVGhlcmUgYXJlIGlzc3VlcyBzaWduaW5nIHlvdSBpbi5cXG5cXG5cXG5DbGljayBvbiBTaWduIEluLCBvZiB3aGljaCB0aGVyZSBzaG91bGQgYmUgYSBwb3B1cCBhc2tpbmcgeW91IHRvIGF1dGhvcml6ZSBHb29nbGUgdG8gc2lnbiB5b3UgaW50byBHT00uIFlvdSBtdXN0IGNsaWNrIE9LLlxcblxcblxcblxcbklmIHlvdXIgQ2hyb21lIGlzIG5vdCBzeW5jZWQgd2l0aCBhIEdtYWlsIGFjY291bnQsIGl0IHdpbGwgb3BlbiBhIG5ldyB3aW5kb3cgYXNraW5nIHlvdSB0byBzaWduIGludG8geW91ciBHbWFpbCBhY2NvdW50LiBPZiB3aGljaCB5b3Ugc2hvdWxkIGRvIHRoYXQsIGFuZCB0aGVuIHlvdSB3aWxsIGJlIGxvZ2dlZCBpbnRvIEdPTS5cIixcbiAgU0VSVkVSX0VSUk9SOiBcIlRoZXJlIHNlZW1zIHRvIGJlIGFuIGVycm9yIGNvbW11bmljYXRpbmcgd2l0aCB0aGUgc2VydmVyLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyLlwiLFxuICBSRUdJU1RSQVRJT05fRVJST1I6IFwiT29wcywgdGhlcmUgaXMgYW4gZXJyb3IgcmVnaXN0ZXJpbmcgeW91ciBhY2NvdW50LiBJdCBjb3VsZCBlaXRoZXIgYmUgdGhhdCB0aGUgYWNjb3VudCBhbHJlYWR5IGV4aXN0cywgb3IgdGhhdCB3ZSBjYW5ub3QgY29udGFjdCB0aGUgc2VydmVyLiBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyIVwiLFxuICBTVFJFQU1fTVVTSUNfQU5EX0ZBU1RFUl9GQVNURVI6IFwiU3RyZWFtIG11c2ljIGFuZCB2aWRlb3MgZmFzdGVyXCIsXG4gIEdPTV9WUE5fVVBHUkFERUQ6IFwiR29tIFZQTiBpcyBub3cgdXBncmFkZWQgdG8gc3VwZXItZmFzdCAxMDAwZ2JpdCBzcGVlZHNcIixcbiAgU0lHTl9JTl9GT1JfVU5JTlRFUlJVUFRFRF9BQ0NFU1M6IFwiU2lnbiBpbiBmb3IgdW5pbnRlcnJ1cHRlZCBhY2Nlc3NcIixcbiAgTk9UX1NJR05FRF9JTjogXCJZb3UgYXJlIGN1cnJlbnRseSBub3Qgc2lnbmVkIGluXCIsXG4gIE9OX0ZSRUVfUExBTjogXCJZb3UgYXJlIG9uIEdvbSdzIGZyZWUgcGxhblwiLFxuICBHT19QUk9fRk9SX1VOSU5URVJSVVBURURfQUNDRVNTOiBcIlVwZ3JhZGUgdG8gUHJvIGZvciB1bmludGVycnVwdGVkIGFjY2Vzc1wiLFxuICBHT01fVFVSTkVEX09GRjogXCJHb20gaXMgbm93IHR1cm5lZCBvZmZcIixcbiAgVVNFRF9CRVlPTkRfRlJFRV9USUVSOiBcIllvdSBoYXZlIGp1c3QgdXNlZCB7e2ZyZWVfdGllcl9taW5zfX0gbWludXRlcyBvZiBHb20sIGFuZCB3aWxsIGhhdmUgdG8gd2FpdCB7e3JlY2hhcmdlX21pbnN9fSBtaW51dGVzIGJlZm9yZSB5b3UgY2FuIHVzZSBHb20gYWdhaW5cIixcbiAgQUNRVUlSSU5HX0NPTlRBQ1RTOiBcIkdldHRpbmcgcGVybWlzc2lvbnMgdG8gZmV0Y2ggeW91ciBjb250YWN0cy4uLlwiLFxuICBBQ1FVSVJFX0NPTlRBQ1RTX1NDT1BFX0VSUk9SOiBcIlRoZXJlIHdhcyBhbiBpc3N1ZSByZXRyaXZpbmcgeW91ciBjb250YWN0cy4gUGxlYXNlIHJlZnJlc2ggdGhlIHBhZ2UgYW5kIGNsaWNrIE9LIHdoZW4gYXNrZWQgdG8gYXV0aG9yaXplIEdvbSBpbiBvcmRlciB0byBwcm9jZWVkLlwiLFxuICBJTlZJVEVfQ09OVEFDVFNfU1VDQ0VTUzogXCJTdWNjZXNzZnVsbHkgaW52aXRlZCB5b3VyIGNvbnRhY3RzIHRvIEdvbS4gWW91IHdpbGwgcmVjZWl2ZSBQcm8gY3JlZGl0cyB3aGVuIHlvdXIgZnJpZW5kcyBhY2NlcHQgeW91ciBpbnZpdGVcIixcbiAgQUNDRVBUSU5HX0lOVklURTogXCJFeHRlbmRpbmcgeW91ciBmcmVlIHRyaWFsIGJlY2F1c2UgeW91IGFjY2VwdGVkIGFuIGludml0ZVwiLFxuICBFTkNSWVBUSU9OX1RVUk5fT0ZGOiBcIihUdXJuIG9mZiBmb3IgbW9yZSBzcGVlZClcIixcbiAgRU5DUllQVElPTl9UVVJOX09OOiBcIihUdXJuIG9uIGZvciBtb3JlIHNlY3VyaXR5KVwiXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lc3NhZ2VzO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInBCR3ZBcFwiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL21lc3NhZ2VzL2VuLmpzXCIsXCIvbWVzc2FnZXNcIikiXX0=
