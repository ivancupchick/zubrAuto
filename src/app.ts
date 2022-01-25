import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Routes
import IndexRoutes from './routes/index.routes'
import CarRoutes from './routes/car.routes'
import FieldRoutes from './routes/field.routes'
import ClientRoutes from './routes/client.routes'
import RoleRoutes from './routes/role.routes'
import UserRoutes from './routes/user.routes'


import AuthRoutes from './routes/auth.routes'
import { errorMiddleware } from './middlewares/error.middleware';
import { setHeaders } from './middlewares/set-headers.middleware';
import fileUpload from 'express-fileupload';


export class App {
  app: Application;

  constructor(
    private port?: number | string
  ) {
    this.app = express();
    this.settings();
    this.middlewares(this.routes);

    process.setMaxListeners(Infinity);
  }

  private settings() {
    this.app.set('port', this.port || process.env.PORT || 3080);
  }

  private middlewares(routesHandler: () => void) {
    this.app.use(fileUpload({}))
    this.app.use(express.json());
    this.app.use(cookieParser());
    if (process.env.NODE_ENV !== 'production') {
      this.app.use(cors({
        credentials: true,
        origin: 'http://localhost:4200' // delete in dev and nice to have if client and server have dirent adreses
      }));
      // this.app.use(setHeaders);
    }


    routesHandler();

    this.app.use(errorMiddleware);
  }

  private routes = () => {
    const string = process.env.NODE_ENV !== 'production' ? "/build" : ""

    this.app.use(express.static(process.cwd()+string+"/ui/zubr-auto/"));
    this.app.use('/uploads/', express.static(process.cwd()+string+"/uploads/"));
    this.app.use(IndexRoutes);
    this.app.use('/cars', CarRoutes);
    this.app.use('/fields', FieldRoutes);
    this.app.use('/clients', ClientRoutes);
    this.app.use('/auth', AuthRoutes);
    this.app.use('/roles', RoleRoutes);
    this.app.use('/users', UserRoutes);
  }

  async listen(): Promise<void> {
    await this.app.listen(this.app.get('port'));
    console.log('Server on port', this.app.get('port'));
  }
}
