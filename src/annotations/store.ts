import { useJsonFile } from '@/lib/json-file'
import type { Pin } from './types'

export { canEdit } from '@/lib/json-file'
export const usePins = () => useJsonFile<Pin[]>('annotations.json', [])
