import { users } from '../users.json'
interface User {
  name: string
  prime: number
  placement: number
}

const u = (name: string, prime: number, placement: number): User => ({
  name,
  prime,
  placement,
})

export const db: Record<string, User> = Object.fromEntries(
  users.map((v, i) => [v[0], u(v[0] as string, v[1] as number, i)])
)

export const getUser = (name: string) => db[name]
