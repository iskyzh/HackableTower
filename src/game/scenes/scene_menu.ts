import { Scene, SceneManager, RESOURCE_HELPER as RES } from '../../app';
import { Window_Command } from '../sprite';
import { Command } from '../models';

export class Scene_Menu extends Scene {
  constructor() {
    super();
  }

  private get bgSprite() {
    let bg = PIXI.Sprite.fromImage(RES.Background('menu.jpg'));
    bg.anchor.set(0, 0);
    this.resize$.subscribe(() => {
      bg.width = this.viewport.width;
      bg.height = this.viewport.height;
    });
    return bg;
  }

  private get menuWindow() {
    const window = new Window_Command([
      <Command> { name: '新存档' },
      <Command> { name: '加载游戏' },
      <Command> { name: '关于', cb: () => { SceneManager.pop(); }}
    ]);
    this.resize$.subscribe(() => {
      window.width = 300;
      window.y = this.viewport.height - 100 - window.height;
      window.x = (this.viewport.width - window.width) / 2;
    });
    
    return window;
  }

  onInit() {
    super.onInit();

    this.stage.addChild(this.bgSprite);
    this.spriteManager.add(this.menuWindow);
  }

  onStart() {
    super.onStart();
  }
}
