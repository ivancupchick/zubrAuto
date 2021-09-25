import { Request, Response } from 'express'

export function indexWelcome(req: Request, res: Response): void {
   res.sendFile(process.cwd()+"/dist/zubr-auto/index.html") // check path
}
