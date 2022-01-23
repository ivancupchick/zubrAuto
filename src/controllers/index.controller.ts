import { Request, Response } from 'express'

export function indexWelcome(req: Request, res: Response): void {
   res.sendFile(process.cwd()+"/build/ui/zubr-auto/index.html")
}
