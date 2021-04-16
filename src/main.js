import Phaser from 'phaser'
import './game/Game';
import SceneBoot from './scenes/SceneBoot';
import SceneGame from './scenes/SceneGame';


const config = {
	type: Phaser.AUTO,
	parent: 'content',
	width: 1024,
	height: 768,
	pixelArt: true,
	backgroundColor: '#2d2d2d',
	physics: {
		default: 'arcade',
		useTree: false,
		arcade: {
			fps: 60,
			debug: true,
			tileBias: 4,
			overlapBias: 4,
			gravity: { y: 0 }
		}
	},
	scale: {
		mode: Phaser.Scale.FIT,
		width: window.innerWidth,
		height: window.innerHeight,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	scene: [
		SceneBoot, SceneGame
	]
};

export default new Phaser.Game(config);
