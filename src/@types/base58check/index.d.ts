declare module 'bs58check' {
  function encode(buffer: Buffer): string
  function decode(string: string): Buffer
  function decodeUnsafe(string: string): Buffer | undefined
}
