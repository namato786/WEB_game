export function handlePlayerSkills(scene, time) {

    if (scene.lastFire === undefined) scene.lastFire = 0;
    if (scene.lastHeal === undefined) scene.lastHeal = 0;
    if (scene.activeFireballs === undefined) scene.activeFireballs = 0;
    if (!scene.mana) scene.mana = 100;

    // ================= FIREBALL =================
    if (
        Phaser.Input.Keyboard.JustDown(scene.fireKey) &&
        time > scene.lastFire + 800 &&
        scene.activeFireballs < 5 &&
        scene.mana >= 10
    ) {
        scene.lastFire = time;
        scene.activeFireballs++;
        scene.mana -= 10;

        let player = scene.player;

        let fireball = scene.playerProjectiles.create(
            player.x,
            player.y,
            'projectile'
        );

        if (!fireball) return;

        fireball.setScale(0.7);
        fireball.body.setAllowGravity(false);

        let dir = player.flipX ? -1 : 1;
        fireball.setVelocityX(500 * dir);

        fireball.setTint(0xff6600);
        fireball.setAngularVelocity(300);

        scene.time.delayedCall(2000, () => {
            if (fireball.active) {
                fireball.destroy();
                scene.activeFireballs--;
            }
        });
    }

    // ================= HEAL =================
    if (
        Phaser.Input.Keyboard.JustDown(scene.healKey) &&
        time > scene.lastHeal + 5000 &&
        scene.mana >= 20
    ) {
        scene.lastHeal = time;
        scene.mana -= 20;

        let healAmount = Math.min(30, 100 - scene.health);
        scene.health += healAmount;

        scene.player.setTint(0x00ff00);

        scene.time.delayedCall(300, () => {
            if (scene.player.active) scene.player.clearTint();
        });
    }

    // ================= DASH =================
    if (Phaser.Input.Keyboard.JustDown(scene.shiftKey)) {
        let dir = scene.player.flipX ? -1 : 1;
        scene.player.setVelocityX(600 * dir);
    }

    // ================= MANA REGEN =================
    if (scene.mana < 100) {
        scene.mana += 0.02;
    }
}