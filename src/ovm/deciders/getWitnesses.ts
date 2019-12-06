import { Bytes } from '../../types/Codables'
import { KeyValueStore, RangeDb } from '../../db'

/**
 * get witnesses from witness db using hint.
 * witness can be quantified by bucket name and single key or range.
 * bucket must be specified by bucket name. when bucket must be chained,
 * connect bucket name with dot s.t. bucket1.bucket2.bucket3
 * when using key, hint must be in following format
 * 'bucket,KEY,key'
 * when using range, hint must be in following format
 * 'bucket,RANGE,(start,end)'
 * @param witnessDb key value store
 * @param hint hint string
 */
export default async function getWitnesses(
  witnessDb: KeyValueStore,
  hint: string
): Promise<Bytes[]> {
  const [bucket, type, param] = hint.split(',')
  const bucketNames = bucket.split('.')
  let db
  if (type === 'KEY') {
    db = witnessDb
    for (const b of bucketNames) {
      db = await db.bucket(Bytes.fromString(b))
    }
    const result = await db.get(Bytes.fromString(param))
    return result === null ? [] : [result]
  } else if (type === 'RANGE') {
    db = new RangeDb(witnessDb)
    for await (const b of bucketNames) {
      db = await db.bucket(Bytes.fromString(b))
    }
    const [start, end] = param
      .substring(1, param.length - 1)
      .split(' ')
      .map(Number)
      .map(BigInt)
    const result = await db.get(start, end)
    return result.map(r => r.value)
  } else {
    return []
  }
}

// check if b is hint string
export function isHint(b: Bytes): boolean {
  return b.intoString().split(',').length === 3
}
