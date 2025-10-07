import * as userService from '../services/user.service'
import { Request, Response } from 'express'

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers()
    res.json(users)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const getUserRoles = async (req: Request, res: Response) => {
  try {
    const roles = await userService.getUserRoles()
    res.json(roles)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const selectUserById = async (req: Request, res: Response) => {
  const { id } = req.params

  // Validar que el id sea un número válido
  const userId = Number(id)
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'ID inválido' })
  }

  try {
    const user = await userService.selectUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    res.json(user)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.create(req.body)
    res.json({ message: 'Usuario creado', user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const createRole = async (req: Request, res: Response) => {
  try {
    const role = await userService.createRole(req.body)
    res.json({ message: 'Rol creado', role })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}



export const removeUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' })
  try {
    await userService.remove(id)
    res.json({ message: 'Usuario eliminado' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const changeUserPassword = async (req: Request, res: Response) => {
  const { id, password } = req.body
  try {
    const user = await userService.UserChangePassword(id, password)
    res.json({ user })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}


export const resetUserPassword = async (req: Request, res: Response) => {
  const { id} = req.body
  try {
    const user = await userService.resetUserPassword(id)
    res.json({ user })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}


export const suspensionUser = async (req: Request, res: Response) => {
  const { id} = req.body
  try {
    const user = await userService.suspensionUser(id)
    res.json({ user })
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}




