import * as CONST from './const';
import { Injector, Injectable } from '../di';
import { SceneManager, AudioManager, PlatformManager, ResourceManager } from './managers';

export class App extends Injectable {
  private _app: PIXI.Application;
  get app() { return this._app; }
  get renderer() { return this.app.renderer; }
  get stage() { return this.app.stage; }

  constructor(baseInjector: Injector) {
    super(baseInjector);
    this.injector.provide(App, this);

    this._app = new PIXI.Application(800, 600, {
      backgroundColor : CONST.BACKGROUND_COLOR,
      resolution: CONST.RESOLUTION,
      view: <HTMLCanvasElement> document.getElementById('canvas_main')
    });

    this.injector.selfProvide(ResourceManager);
    this.injector.selfProvide(AudioManager);
    this.injector.selfProvide(PlatformManager);
    this.injector.selfProvide(SceneManager);
  }

  public game(Game: any) {
    this.injector.create(Game);
  }
}
