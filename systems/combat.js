import { spawnEnemies, setRandomVelocity } from "../enemy/enemy.js";

function attackEnemy(scene, sword, enemy) {

    if (!scene.isAttacking) return;
    if (!enemy.active) return;
    if (enemy.isCharging) return;

    // ✅ safe disable
    enemy.disableBody(true, true);

    scene.score++;
    scene.scoreText.setText(`Score: ${scene.score}`);

    // ✅ respawn SAME enemy safely
    scene.time.delayedCall(1000, () => {

        if (!enemy || !scene.scene.isActive()) return;

        enemy.enableBody(
            true,
            Phaser.Math.Between(100, 1400),
            Phaser.Math.Between(100, 600),
            true,
            true
        );

        enemy.setActive(true);
        enemy.setVisible(true);
        enemy.body.enable = true;
        enemy.isCharging = false;

        setRandomVelocity(enemy);
    });
}

// -------- SETUP COMBAT --------
export function setupCombat(scene) {

    if (!scene.enemyCollider) {
        scene.enemyCollider = scene.physics.add.overlap(
            scene.sword,
            scene.enemies,
            (sword, enemy) => attackEnemy(scene, sword, enemy),
            null,
            scene
        );
    }

    if (!scene.playerHitCollider) {
        scene.playerHitCollider = scene.physics.add.overlap(
            scene.player,
            scene.projectiles,
            (player, projectile) => {
                if (!projectile.active) return;
                projectile.destroy();
                scene.health -= 10;
            },
            null,
            scene
        );
    }
}


// -------- UPDATE --------
export function handleCombat(scene) {

    scene.healthText.setText(`Health: ${scene.health}`);

    if (scene.score >= 30) {
        winGame(scene);
    }

    if (scene.health <= 0) {
        gameOver(scene);
    }

    scene.playerProjectiles.children.each(p => {
        if (!p) return;
        if (p.x < 0 || p.x > 1600 || p.y < 0 || p.y > 722) {
            p.destroy();
        }
    });
}


// -------- WIN --------
function winGame(scene) {
    if (scene.gameOverState) return;

    scene.gameOverState = true;
    scene.winText.setAlpha(1);

    // 🧹 CLEAN EVERYTHING
    scene.time.removeAllEvents();

    if (scene.enemyLoop) {
        scene.enemyLoop.remove(false);
        scene.enemyLoop = null;
    }

    scene.time.delayedCall(1500, () => {
        scene.scene.restart();
    });
}


// -------- GAME OVER --------
function gameOver(scene) {

    if (scene.gameOverState) return;

    scene.gameOverState = true;

    scene.player.setVelocity(0);

    scene.add.rectangle(800, 360, 1600, 722, 0x000000, 0.7).setDepth(999);

    scene.gameOverText.setAlpha(1).setDepth(1000);

    scene.add.text(600, 420, `Final Score: ${scene.score}`, {
        fontSize: '32px',
        fill: '#fff'
    }).setDepth(1000);

    let btn = scene.add.text(650, 500, 'RESTART', {
        fontSize: '36px',
        fill: '#00ff00',
        backgroundColor: '#000'
    })
        .setPadding(10)
        .setInteractive({ useHandCursor: true })
        .setDepth(1000);

    btn.on('pointerdown', () => {

        scene.time.removeAllEvents();

        if (scene.enemyLoop) {
            scene.enemyLoop.remove(false);
            scene.enemyLoop = null;
        }

        if (scene.enemyCollider) {
            scene.enemyCollider.destroy();
            scene.enemyCollider = null;
        }

        if (scene.playerHitCollider) {
            scene.playerHitCollider.destroy();
            scene.playerHitCollider = null;
        }

        scene.scene.restart();
    });
}