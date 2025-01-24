import { serialize } from 'superjson'

export function json(data: any) {
  return serialize(data).json
}