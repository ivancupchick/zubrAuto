import { Request, Response } from 'express';


export function indexWelcome(req: Request, res: Response): void {
  const string = process.env.NODE_ENV !== 'production' ? "/build" : "";
  res.sendFile(process.cwd()+string+"/ui/zubr-auto/index.html");
}
