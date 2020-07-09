import shipmentRouter from './shipments';

const API_VERSION = 1
const API_PREFIX = '/v'+API_VERSION

const setupRoutes = app => {
    app.use(`${API_PREFIX}/shipments`, shipmentRouter);
}

export default setupRoutes;