/**
 * ============================================================
 * GAME ENGINE - Flappy CAPTCHA con Flappy.png sprite
 * Física corregida, visual premium, loop funcionando
 * ============================================================
 */
class GameEngine {
    constructor(canvas) {
        console.log('🎮 GameEngine: Constructor iniciado');
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('❌ Canvas context no disponible');
            return;
        }
        
        console.log('✅ Canvas:', this.canvas.width, 'x', this.canvas.height);
        
        // Cargar sprite Flappy.png
        this.flappySprite = new Image();
        this.flappySpriteLoaded = false;
        
        this.flappySprite.onload = () => {
            console.log('✅ Flappy.png cargado:', this.flappySprite.width, 'x', this.flappySprite.height);
            this.flappySpriteLoaded = true;
        };
        
        this.flappySprite.onerror = () => {
            console.error('❌ Error cargando Flappy.png');
        };
        
        this.flappySprite.src = 'src/Flappy.png';
        
        // Estado del juego
        this.isPlaying = false;
        this.isGameOver = false;
        this.score = 0;
        
        // Jugador
        this.player = {
            x: 60,
            y: this.canvas.height / 2,
            width: 34,
            height: 34,
            vy: 0,
            rotation: 0
        };
        
        // Física CORREGIDA - Más suave y controlable
        this.gravity = 0.28;
        this.jumpForce = -5.2;
        this.maxFallSpeed = 7;
        this.tubeSpeed = 2.4;
        this.tubeSpacing = 200;
        this.tubeGap = 120;
        
        // Obstáculos
        this.tubes = [];
        
        // Partículas al saltar
        this.particles = [];
        
        // Detector humano
        this.detector = new HumanDetector();
        
        // Callbacks
        this.onScore = null;
        this.onVictory = null;
        this.onGameOver = null;
        
        // Bind
        this.gameLoop = this.gameLoop.bind(this);
        
        // Primer tubo
        this.addTube();
        
        console.log('🎮 GameEngine: Listo');
    }

    /**
     * Añadir tubo obstáculos
     */
    addTube() {
        const minY = 50;
        const maxY = this.canvas.height - 50 - this.tubeGap;
        const gapY = Math.random() * (maxY - minY) + minY;
        
        this.tubes.push({
            x: this.canvas.width,
            topHeight: gapY,
            bottomY: gapY + this.tubeGap,
            width: 55,
            passed: false
        });
    }

    /**
     * Saltar
     */
    jump() {
        console.log('⬆️ Jump');
        
        // Partículas al saltar
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.player.x - 10,
                y: this.player.y,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 2,
                life: 20,
                size: Math.random() * 3 + 1
            });
        }
        
        this.player.vy = this.jumpForce;
    }

    /**
     * Iniciar juego
     */
    start() {
        console.log('🚀 START - Iniciando juego');
        
        this.isPlaying = true;
        this.isGameOver = false;
        this.score = 0;
        this.player.y = this.canvas.height / 2;
        this.player.vy = 0;
        this.player.rotation = 0;
        this.tubes = [];
        this.particles = [];
        this.addTube();
        
        console.log('   Jugador resetado');
        
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Loop principal
     */
    gameLoop(timestamp) {
        if (!this.isPlaying) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Actualizar lógica
     */
    update() {
        // Gravedad suave
        this.player.vy += this.gravity;
        
        // Limitar velocidad
        if (this.player.vy > this.maxFallSpeed) {
            this.player.vy = this.maxFallSpeed;
        }
        
        // Posición
        this.player.y += this.player.vy;
        
        // Rotación basada en velocidad
        const targetRotation = this.player.vy * 3;
        this.player.rotation += (targetRotation - this.player.rotation) * 0.1;
        this.player.rotation = Math.max(-30, Math.min(90, this.player.rotation));
        
        // Colisión suelo/techo
        if (this.player.y + this.player.height / 2 > this.canvas.height - 25) {
            console.log('💀 Suelo');
            this.gameOver();
            return;
        }
        
        if (this.player.y - this.player.height / 2 < 0) {
            this.player.y = this.player.height / 2;
            this.player.vy = 0;
        }
        
        // Colisión tubos
        const playerLeft = this.player.x - this.player.width / 2 + 5;
        const playerRight = this.player.x + this.player.width / 2 - 5;
        const playerTop = this.player.y - this.player.height / 2 + 5;
        const playerBottom = this.player.y + this.player.height / 2 - 5;
        
        this.tubes.forEach(tube => {
            // Mover tubo
            tube.x -= this.tubeSpeed;
            
            // Verificar puntuación
            if (!tube.passed && this.player.x > tube.x + tube.width) {
                tube.passed = true;
                this.score++;
                console.log('✅ Punto!', this.score);
                
                if (this.onScore) this.onScore(this.score);
                
                if (this.score >= 10) {
                    console.log('🎉 VICTORIA!');
                    this.victory();
                }
            }
            
            // Colisión
            if (playerRight > tube.x && playerLeft < tube.x + tube.width) {
                if (playerTop < tube.topHeight || playerBottom > tube.bottomY) {
                    console.log('💀 Tubo');
                    this.gameOver();
                }
            }
        });
        
        // Actualizar partículas
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });
        
        // Eliminar tubos fuera de pantalla
        this.tubes = this.tubes.filter(t => t.x + t.width > -50);
        
        // Añadir nuevos tubos
        if (this.tubes.length === 0 || 
            this.canvas.width - this.tubes[this.tubes.length - 1].x > this.tubeSpacing) {
            this.addTube();
        }
    }

    /**
     * Renderizar
     */
    render() {
        const ctx = this.ctx;
        
        // Limpiar
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fondo gradiente cielo
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#B3E5FC');
        gradient.addColorStop(1, '#E1F5FE');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Nubes decorativas
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.beginPath();
        ctx.arc(50, 40, 25, 0, Math.PI * 2);
        ctx.arc(80, 35, 30, 0, Math.PI * 2);
        ctx.arc(65, 50, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(250, 60, 20, 0, Math.PI * 2);
        ctx.arc(280, 55, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Tubos con estilo moderno
        ctx.fillStyle = '#66BB6A';
        ctx.strokeStyle = '#43A047';
        ctx.lineWidth = 2;
        
        this.tubes.forEach(tube => {
            // Tubo superior
            this.drawRoundedRect(tube.x, 0, tube.width, tube.topHeight, 8);
            ctx.fill();
            ctx.stroke();
            
            // Detalle tubo superior
            ctx.fillStyle = '#81C784';
            ctx.fillRect(tube.x + 8, 0, tube.width - 16, tube.topHeight - 10);
            ctx.fillStyle = '#66BB6A';
            
            // Tubo inferior
            this.drawRoundedRect(tube.x, tube.bottomY, tube.width, this.canvas.height - tube.bottomY, 8);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = '#81C784';
            ctx.fillRect(tube.x + 8, tube.bottomY + 10, tube.width - 16, this.canvas.height - tube.bottomY - 10);
            ctx.fillStyle = '#66BB6A';
        });
        
        // Partículas
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / 20;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Jugador con sprite Flappy.png
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.rotate(this.player.rotation * Math.PI / 180);
        
        if (this.flappySpriteLoaded) {
            // Usar sprite Flappy.png
            const scale = this.player.width / this.flappySprite.width;
            ctx.scale(scale, scale);
            ctx.drawImage(
                this.flappySprite, 
                -this.flappySprite.width / 2, 
                -this.flappySprite.height / 2
            );
        } else {
            // Fallback si no carga
            const gradient = ctx.createRadialGradient(0, -5, 0, 0, 0, this.player.width / 2);
            gradient.addColorStop(0, '#FF9800');
            gradient.addColorStop(1, '#F57C00');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.player.width / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Ojo
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(5, -3, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(7, -3, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
        
        // Suelo
        ctx.fillStyle = '#8BC34A';
        ctx.fillRect(0, this.canvas.height - 25, this.canvas.width, 25);
        
        ctx.fillStyle = '#7CB342';
        ctx.fillRect(0, this.canvas.height - 25, this.canvas.width, 4);
        
        // Césped detalle
        ctx.fillStyle = '#689F38';
        for (let i = 0; i < this.canvas.width; i += 15) {
            ctx.fillRect(i, this.canvas.height - 25, 3, 6);
        }
    }

    /**
     * Dibujar rectángulo redondeado
     */
    drawRoundedRect(x, y, w, h, r) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.lineTo(x + w - r, y);
        this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        this.ctx.lineTo(x + w, y + h - r);
        this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.ctx.lineTo(x + r, y + h);
        this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        this.ctx.lineTo(x, y + r);
        this.ctx.quadraticCurveTo(x, y, x + r, y);
        this.ctx.closePath();
    }

    /**
     * Fin del juego
     */
    gameOver() {
        this.isPlaying = false;
        this.isGameOver = true;
        if (this.onGameOver) this.onGameOver();
    }

    /**
     * Victoria
     */
    victory() {
        this.isPlaying = false;
        if (this.onVictory) this.onVictory();
    }

    /**
     * Callbacks
     */
    on(event, callback) {
        if (event === 'onScore') this.onScore = callback;
        else if (event === 'onVictory') this.onVictory = callback;
        else if (event === 'onGameOver') this.onGameOver = callback;
    }

    /**
     * Reset
     */
    reset() {
        this.player.y = this.canvas.height / 2;
        this.player.vy = 0;
        this.player.rotation = 0;
        this.tubes = [];
        this.particles = [];
        this.score = 0;
        this.addTube();
    }

    /**
     * Render estático
     */
    renderStatic() {
        this.reset();
        this.render();
    }
}

window.GameEngine = GameEngine;