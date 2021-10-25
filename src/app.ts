import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Routes
import IndexRoutes from './routes/index.routes'
import CarRoutes from './routes/car.routes'
import FieldRoutes from './routes/field.routes'
import ClientRoutes from './routes/client.routes'
import AuthRoutes from './routes/auth.routes'
import { errorMiddleware } from './middlewares/error.middleware';
import { setHeaders } from './middlewares/set-headers.middleware';

export class App {
  app: Application;

  constructor(
    private port?: number | string
  ) {
    this.app = express();
    this.settings();
    this.middlewares(this.routes);
  }

  private settings() {
    this.app.set('port', this.port || process.env.PORT || 3000);
  }

  private middlewares(routesHandler: () => void) {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(cors({
      credentials: true,
      origin: 'localhost:3080' // delete in dev and nice to have if client and server have dirent adreses
    }));
    // this.app.use(setHeaders);

    routesHandler();

    this.app.use(errorMiddleware);
  }

  private routes() {
    this.app.use(express.static(process.cwd()+"/ui/dist/zubr-auto/"));
    this.app.use(IndexRoutes);
    this.app.use('/cars', CarRoutes);
    this.app.use('/fields', FieldRoutes);
    this.app.use('/clients', ClientRoutes);
    this.app.use('/auth', AuthRoutes);
  }

  async listen(): Promise<void> {
    await this.app.listen(this.app.get('port'));
    console.log('Server on port', this.app.get('port'));
  }
}
