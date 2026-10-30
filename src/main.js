import {Game} from './core/Game.js';
const game=new Game();
// Acesso opcional para testes e depuração, sem expor mecanismos pedagógicos.
window.__tesouroGame=game;
game.boot();
