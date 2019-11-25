export function numberToBuffer(start: number): Buffer {
  const b = Buffer.alloc(4)
  b.writeUInt32LE(start, 0)
  return b
}

export function bufferToNumber(buf: Buffer): number {
  return buf.readUInt32LE(0)
}
