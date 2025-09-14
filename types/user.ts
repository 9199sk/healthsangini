import { DefaultUser } from "next-auth"

interface User extends DefaultUser {
  id: string
  
  email: string
  name: string
  image?: string
  createdAt?: Date
  updatedAt?: Date
}

export type { User }