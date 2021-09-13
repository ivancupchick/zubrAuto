import { Request, Response } from 'express'

export function indexWelcome(req: Request, res: Response): void {
   res.sendFile(process.cwd()+"/ui/dist/zubr-auto/index.html") // check path
}