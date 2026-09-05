// -------- CREATE PLAYER --------
export function createPlayer(scene) {

    let player = scene.physics.add.sprite(600, 500, 'player_walk_1');

    player.setScale(0.2);
    player.setCollideWorldBounds(true);

    // smooth movement ke liye
    player.setDrag(800);
    player.setMaxVelocity(300);

    return player;
}


// -------- UPDATE PLAYER --------
export function updatePlayer(scene, time) {

    let player = scene.player;
    let cursors = scene.cursors;
    let sword = scene.sword;

    if (scene.gameOverState) return;

    // -------- MOVEMENT --------
    if (cursors.left.isDown) {
        player.setAccelerationX(-600);
    } else if (cursors.right.isDown) {
        player.setAccelerationX(600);
    } else {
        player.setAccelerationX(0);
    }

    if (cursors.up.isDown) {
        player.setAccelerationY(-600);
    } else if (cursors.down.isDown) {
        player.setAccelerationY(600);
    } else {
        player.setAccelerationY(0);
    }

    // Normalize speed
    if (player.body.velocity.length() > 0) {
        player.body.velocity.normalize().scale(200);
    }

    // -------- ANIMATION --------
    if (player.body.velocity.x > 0) {
        player.setFlipX(false);
        player.setTexture('player_walk_2');
    } else if (player.body.velocity.x < 0) {
        player.setFlipX(true);
        player.setTexture('player_walk_3');
    } else {
        player.setTexture('player_walk_1');
    }

    // -------- ATTACK --------
    if (Phaser.Input.Keyboard.JustDown(scene.spacebar) && !scene.isAttacking) {

        scene.isAttacking = true;
        player.setVisible(false);

        sword.setFlipX(player.flipX);
        sword.setActive(true).setVisible(true);

        sword.x = player.x + (sword.flipX ? -40 : 40);
        sword.y = player.y;

        scene.time.delayedCall(300, () => {
            sword.setActive(false).setVisible(false);
            player.setVisible(true);
            scene.isAttacking = false;
        });
    }

    // Keep sword aligned
    if (scene.isAttacking) {
        sword.x = player.x + (sword.flipX ? -40 : 40);
        sword.y = player.y;
    }
}