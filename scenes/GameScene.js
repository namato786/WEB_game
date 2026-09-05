import { createPlayer, updatePlayer } from "../player/player.js";
import { spawnEnemies } from "../enemy/enemy.js";
import { handleCombat, setupCombat } from "../systems/combat.js";
import { handlePlayerSkills } from "../player/playerskill.js";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.image('player_walk_1', '../assets/player/Run (1).png');
        this.load.image('player_walk_2', '../assets/player/Run (4).png');
        this.load.image('player_walk_3', '../assets/player/Walk3.png');

        this.load.image('sword', '../assets/weapons/Sword.png');

        this.load.image('enemy', '../assets/enemy/enemy_idle.png');
        this.load.image('enemy_attack', '../assets/enemy/enemy_attack.png');

        this.load.image('background', '../assets/bg/sky2.jpeg');

        this.load.image('projectile', '../assets/effect/fireball.png');
    }

    create() {

        // ---------- STATE ----------
        this.score = 0;
        this.health = 100;
        this.isAttacking = false;
        this.gameOverState = false;

        this.activeFireballs = 0;
        this.lastFire = 0;
        this.lastHeal = 0;

        // ---------- WORLD ----------
        const width = 1600;
        const height = 722;

        this.physics.world.setBounds(0, 0, width, height);
        this.cameras.main.setBounds(0, 0, width, height);

        // ---------- BG ----------
        const bg = this.add.image(width / 2, height / 2, 'background');

        bg.setDisplaySize(width, height);

        // ---------- PLAYER ----------
        this.player = createPlayer(this);

        // ---------- CAMERA ----------
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setDeadzone(200, 120);

        // ---------- INPUT ----------
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.healKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);

        // ---------- SWORD ----------
        this.sword = this.physics.add.sprite(this.player.x, this.player.y, 'sword');
        this.sword.setScale(0.2);
        this.sword.setActive(false).setVisible(false);

        // ---------- PROJECTILE GROUPS (ONLY THESE TWO) ----------
        this.playerProjectiles = this.physics.add.group();
        this.enemyProjectiles = this.physics.add.group();

        // ---------- UI ----------
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        }).setScrollFactor(0);

        this.healthText = this.add.text(20, 60, 'Health: 100', {
            fontSize: '24px',
            fill: '#fff'
        }).setScrollFactor(0);

        this.winText = this.add.text(600, 300, 'YOU WIN', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setAlpha(0).setScrollFactor(0);

        this.gameOverText = this.add.text(600, 350, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000'
        }).setAlpha(0).setScrollFactor(0);
        this.skillText = this.add.text(20, 100, '', {
            fontSize: '20px',
            fill: '#000',
            backgroundColor: '#ffffffaa', // 👈 semi white bg
            padding: { x: 8, y: 5 },
            stroke: '#fff',
            strokeThickness: 2
        }).setScrollFactor(0);

        // ---------- ENEMIES ----------
        spawnEnemies(this);

        // ---------- BASE COMBAT ----------
        setupCombat(this);

        // ---------- PLAYER FIREBALL → ENEMY ----------
        this.physics.add.overlap(
            this.playerProjectiles,
            this.enemies,
            (fireball, enemy) => {

                if (!fireball.active || !enemy.active) return;

                fireball.destroy();
                this.activeFireballs--;

                enemy.disableBody(true, true);

                this.score++;
                this.scoreText.setText(`Score: ${this.score}`);

                // respawn
                this.time.delayedCall(1000, () => {
                    if (!enemy) return;

                    enemy.enableBody(
                        true,
                        Phaser.Math.Between(100, 1400),
                        Phaser.Math.Between(100, 600),
                        true,
                        true
                    );

                    enemy.setVelocity(
                        Phaser.Math.Between(-150, 150),
                        Phaser.Math.Between(-150, 150)
                    );

                    enemy.isCharging = false;
                });
            }
        );

        // ---------- ENEMY FIREBALL → PLAYER ----------
        this.physics.add.overlap(
            this.player,
            this.enemyProjectiles,
            (player, projectile) => {

                if (!projectile.active) return;

                projectile.destroy();

                this.health -= 10;
                this.healthText.setText(`Health: ${this.health}`);
            }
        );
    }

    update(time) {

        if (this.gameOverState) return;

        updatePlayer(this, time);
        handlePlayerSkills(this, time);
        handleCombat(this);

        // 🔥 SKILL UI UPDATE (YAHI DAALO)
        let fireReady = (this.time.now > this.lastFire + 800) ? "Ready" : "CD";
        let healReady = (this.time.now > this.lastHeal + 5000) ? "Ready" : "CD";

        this.skillText.setText(
            `🔥 Fireball (F): ${fireReady} | Active: ${this.activeFireballs}/5\n` +
            `❤️ Heal (H): ${healReady}\n` +
            `⚡ Dash (SHIFT): Ready`
        );
    }
}