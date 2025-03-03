import { Layer } from 'effect';
import { ApiController } from '../http/ApiController.ts';
import { WebTransformer } from '../http/WebTransformer.ts';

export const ControllerLayer = ApiController.Live.pipe(
  Layer.provide(WebTransformer.Live),
);
