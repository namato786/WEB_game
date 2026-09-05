export function spawnEnemies(scene) {

    // ✅ ALWAYS ensure valid group
    if (!scene.enemies || !scene.enemies.children) {
        scene.enemies = scene.physics.add.group();
    }

    // ❌ DON'T USE clear(true,true) blindly → crash hota hai
    scene.enemies.getChildren().forEach(e => {
        if (e) e.destroy();
    });

    // ✅ spawn fresh
    for (let i = 0; i < 5; i++) {
        let enemy = scene.enemies.create(
            Phaser.Math.Between(100, 1400),
            Phaser.Math.Between(100, 600),
            'enemy'
        );

        enemy.setScale(1.5);
        enemy.setCollideWorldBounds(true);
        enemy.body.setAllowGravity(false);
        enemy.isCharging = false;

        setRandomVelocity(enemy);
    }

    // ✅ ONLY ONE LOOP
    if (!scene.enemyLoop) {
        scene.enemyLoop = scene.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {

                if (!scene.enemies || !scene.enemies.children) return;

                scene.enemies.children.each(enemy => {
                    if (!enemy || !enemy.active) return;

                    if (!enemy.isCharging) {
                        setRandomVelocity(enemy);
                    }

                    if (Phaser.Math.Between(0, 1)) {
                        throwProjectile(scene, enemy);
                    }

                    if (Phaser.Math.Between(0, 10) === 0) {
                        chargeEnemy(scene, enemy);
                    }
                });
            }
        });
    }

    return scene.enemies;
}

// -------- HELPERS --------

export function setRandomVelocity(enemy) {
    enemy.setVelocity(
        Phaser.Math.Between(-150, 150),
        Phaser.Math.Between(-150, 150)
    );
}

function chargeEnemy(scene, enemy) {
    enemy.isCharging = true;
    enemy.setTint(0xff0000);

    let angle = Phaser.Math.Angle.Between(
        enemy.x, enemy.y,
        scene.player.x, scene.player.y
    );

    enemy.setVelocity(
        Math.cos(angle) * 300,
        Math.sin(angle) * 300
    );

    scene.time.delayedCall(1000, () => {
        if (!enemy.active) return;
        enemy.isCharging = false;
        enemy.clearTint();
        setRandomVelocity(enemy);
    });
}


export function throwProjectile(scene, enemy) {

    if (!enemy.active) return;
    if (!scene.player || !scene.player.active) return;

    let projectile = scene.enemyProjectiles.create(
        enemy.x,
        enemy.y,
        'projectile'
    );

    if (!projectile) return;

    projectile.setScale(0.5);
    projectile.body.setAllowGravity(false);

    scene.physics.moveToObject(projectile, scene.player, 300);

    enemy.setTexture('enemy_attack');

    scene.time.delayedCall(300, () => {
        if (enemy.active) enemy.setTexture('enemy');
    });

    scene.time.delayedCall(3000, () => {
        if (projectile.active) projectile.destroy();
    });

    return projectile;
}