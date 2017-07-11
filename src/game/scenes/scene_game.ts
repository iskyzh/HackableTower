import * as _ from 'lodash';
import { Scene, SceneManager, ResourceManager, AudioManager, PRELOAD_RESOURCE, PRELOAD_DEPENDENCY } from '../../app';
import { Injector, Injectable } from '../../di';
import { Map, Character_Actor, CHARACTER_DIRECTION, CHARACTER_STATUS, MapStatus, MapPosition } from '../sprite';
import { MAP_DATA } from '../../data';
import { MAP_RESOURCE } from '../resources';
import { GameStorage } from '../../store';

@PRELOAD_RESOURCE({
  sound: ['POL-blooming-short.wav', 'walking.wav']
})
@PRELOAD_DEPENDENCY([Map, Character_Actor, MAP_RESOURCE])
export class Scene_Game extends Scene {
  protected resourceManager: ResourceManager;
  protected sceneManager: SceneManager;
  protected audioManager: AudioManager;
  protected GAME_STORAGE: GameStorage;

  private _map: Map;
  private _actor: Character_Actor;

  private _lock_walk: boolean;
  
  constructor(baseInjector: Injector) {
    super(baseInjector);

    this.resourceManager = this.injector.resolve(ResourceManager);
    this.sceneManager = this.injector.resolve(SceneManager);
    this.audioManager = this.injector.resolve(AudioManager);
    this.GAME_STORAGE = this.injector.resolve(GameStorage);
  }

  public onInit() {
    super.onInit();
    this.audioManager.playBGM(this.resourceManager.Sound('POL-blooming-short.wav'));
    this.addMap();
    this._lock_walk = false;
    this.bindEvents();
  }

  public addMap() {
    this._map = this.injector.init(Map)(_.clone(MAP_DATA.MAP_0), this.injector.create(Character_Actor));
    this._map.actorStat = { x: this.GAME_STORAGE.Actor.x, y: this.GAME_STORAGE.Actor.y, direction: this.GAME_STORAGE.Actor.direction };
    this.spriteManager.add(this._map);
  }

  private _connection: boolean[][];

  public update_connection() {
    this._connection = this._map.walkable;
    _.forEach(this._map.map.events, e => {
      this._connection[e.x][e.y] = false;
    });
  }

  public bindEvents() {
    this.stage.interactive = true;
    this.update_connection();
    this._map.mapClick$.subscribe((pos) => {
      if (!this._lock_walk) this._lock_walk = true; else return;
      this.audioManager.playME(this.resourceManager.Sound('walking.wav'));
      this._map.walkTo(pos, this._connection).subscribe(() => {
        this._lock_walk = false;
        this.audioManager.stopME();
        let _status = this._map.actorStat;
        [this.GAME_STORAGE.Actor.x, this.GAME_STORAGE.Actor.y, this.GAME_STORAGE.Actor.direction] = [_status.x, _status.y, _status.direction];
        
        if (Math.abs(_status.x - pos.x) + Math.abs(_status.y - pos.y) <= 2) {
          this._lock_walk = true;
          this._map.interact(pos).subscribe((id: string) => {
            console.log(id);
          }, () => null, () => this._lock_walk = false);
        }
      });
    });
    
    this.resize$.subscribe(() => {
      this._map.x = (this.viewport.width - this._map.width) / 2 + 200;
      this._map.y = (this.viewport.height - this._map.height) / 2;
    });
  }

  public onEnd() {
    super.onEnd();
    this.audioManager.stopBGM();
    this.stage.interactive = false;
  }
}
