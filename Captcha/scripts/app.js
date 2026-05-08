/**
 * ============================================================
 * APP - Inicialización Flappy CAPTCHA v3
 * Con debugging y lógica corregida
 * ============================================================
 */
(function() {
    'use strict';
    
    console.log('🚀 INICIANDO FLAPPY CAPTCHA...');
    
    // Elementos del DOM
    const elements = {
        widget: document.getElementById('captchaWidget'),
        checkbox: document.getElementById('checkbox'),
        overlay: document.getElementById('modalOverlay'),
        scoreDisplay: document.getElementById('scoreDisplay'),
        verifyBtn: document.getElementById('verifyBtn'),
        statusText: document.getElementById('statusText'),
        gameStartScreen: document.getElementById('gameStartScreen'),
        successOverlay: document.getElementById('successOverlay'),
        gameCanvas: document.getElementById('gameCanvas')
    };
    
    // Verificar que todos los elementos existan
    console.log('📋 Verificando elementos...');
    for (let key in elements) {
        if (!elements[key]) {
            console.error('❌ Elemento no encontrado:', key);
            return;
        }
    }
    console.log('✅ Todos los elementos encontrados');
    
    // Variables de estado
    let isLoading = false;
    let isVerified = false;
    let gameStarted = false;
    let game = null;
    
    // ============================================================
    // INICIALIZACIÓN DEL JUEGO
    // ============================================================
    console.log('🎮 Creando GameEngine...');
    game = new GameEngine(elements.gameCanvas);
    console.log('✅ GameEngine creado');
    
    // Configurar callbacks del juego
    game.on('onScore', function(score) {
        console.log('📊 Puntuación:', score);
        updateScoreDisplay(score);
    });
    
    game.on('onVictory', function() {
        console.log('🎉 VICTORIA!');
        onVictory();
    });
    
    game.on('onGameOver', function() {
        console.log('💀 GAME OVER');
        onGameOver();
    });
    
    console.log('✅ Callbacks configurados');
    
    // ============================================================
    // EVENT LISTENERS - CON DEBUGGING
    // ============================================================
    console.log('🔧 Configurando event listeners...');
    
    // 1. Click en widget principal
    elements.widget.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ CLICK: Widget');
        
        if (!isLoading && !isVerified) {
            startLoading();
        }
    });
    console.log('   ✅ Widget click');
    
    // 2. Click en canvas
    elements.gameCanvas.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ CLICK: Canvas');
        handleGameInput();
    });
    console.log('   ✅ Canvas click');
    
    // 3. Click en pantalla de inicio
    elements.gameStartScreen.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ CLICK: Start Screen');
        handleGameInput();
    });
    console.log('   ✅ Start screen click');
    
    // 4. Tecla espacio
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            console.log('⌨️ ESPACIO presionado');
            if (gameStarted) {
                handleGameInput();
            }
        }
    });
    console.log('   ✅ Keyboard (espacio)');
    
    // 5. Touch en móviles
    elements.gameCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        console.log('👆 TOUCH en canvas');
        if (gameStarted) {
            handleGameInput();
        }
    }, { passive: false });
    console.log('   ✅ Touch events');
    
    // 6. Botón verificar
    elements.verifyBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('🖱️ CLICK: Verificar');
        
        if (!elements.verifyBtn.disabled) {
            verifySuccess();
        }
    });
    console.log('   ✅ Verificar button');
    
    // 7. Click en overlay del modal
    elements.overlay.addEventListener('click', function(e) {
        if (e.target === elements.overlay) {
            console.log('🖱️ CLICK: Overlay (cerrar)');
            closeModal();
        }
    });
    console.log('   ✅ Overlay click');
    
    // 8. Tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && elements.overlay.classList.contains('active')) {
            console.log('⌨️ ESCAPE');
            closeModal();
        }
    });
    console.log('   ✅ Escape key');
    
    console.log('🔧 Todos los eventos configurados');
    
    // Render inicial
    console.log('🎨 Render inicial...');
    game.renderStatic();
    console.log('✅ Render completo');
    
    console.log('🚀 FLAPPY CAPTCHA LISTO PARA USAR');
    
    // ============================================================
    // FUNCIONES DEL JUEGO
    // ============================================================
    
    function handleGameInput() {
        console.log('🎮 handleGameInput() llamado');
        
        if (!gameStarted) {
            console.log('▶️ INICIANDO JUEGO...');
            startGame();
        } else {
            console.log('⬆️ SALTANDO');
            game.jump();
        }
    }
    
    function startGame() {
        console.log('🚀 startGame() - Iniciando');
        
        gameStarted = true;
        elements.gameStartScreen.classList.add('hidden');
        elements.statusText.textContent = 'Jugando...';
        
        console.log('   game.start() llamado');
        game.start();
        
        console.log('   ✅ Juego iniciado');
    }
    
    function updateScoreDisplay(score) {
        elements.scoreDisplay.textContent = score + ' / 10';
        
        if (score >= 10) {
            elements.scoreDisplay.style.color = '#fff';
        }
    }
    
    // ============================================================
    // UI - Loading
    // ============================================================
    function startLoading() {
        console.log('📱 startLoading()');
        isLoading = true;
        elements.widget.classList.add('loading');
        
        setTimeout(function() {
            console.log('⏰ Timer completado - Abriendo modal');
            openModal();
        }, 1500);
    }
    
    // ============================================================
    // UI - Modal
    // ============================================================
    function openModal() {
        console.log('📦 openModal()');
        
        elements.overlay.classList.add('active');
        elements.statusText.textContent = 'Haz clic para comenzar';
        elements.verifyBtn.disabled = true;
        elements.scoreDisplay.textContent = '0 / 10';
        elements.scoreDisplay.style.color = '#fff';
        
        // Resetear estado del juego
        gameStarted = false;
        game.reset();
        elements.gameStartScreen.classList.remove('hidden');
        
        // Render
        game.renderStatic();
        
        console.log('✅ Modal abierto');
    }
    
    function closeModal() {
        console.log('❌ closeModal()');
        
        elements.overlay.classList.remove('active');
        isLoading = false;
        elements.widget.classList.remove('loading');
        
        if (game) {
            game.state.isPlaying = false;
            game.renderStatic();
        }
        
        console.log('✅ Modal cerrado');
    }
    
    // ============================================================
    // UI - Victoria
    // ============================================================
    function onVictory() {
        console.log('🎉 onVictory()');
        
        elements.statusText.textContent = '¡Completado!';
        elements.verifyBtn.disabled = false;
        
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
    
    function onGameOver() {
        console.log('💀 onGameOver()');
        
        elements.statusText.textContent = 'Intenta de nuevo';
        
        // Reiniciar después de 1.5 segundos
        setTimeout(function() {
            console.log('🔄 Reiniciando juego...');
            gameStarted = false;
            elements.gameStartScreen.classList.remove('hidden');
            game.reset();
            game.renderStatic();
            elements.statusText.textContent = 'Haz clic para comenzar';
        }, 1500);
    }
    
    // ============================================================
    // UI - Verificación exitosa
    // ============================================================
    function verifySuccess() {
        console.log('✅ verifySuccess()');
        
        // Cerrar modal
        closeModal();
        
        // Mostrar success
        elements.successOverlay.classList.add('active');
        
        if (navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
        
        // Marcar como verificado
        setTimeout(function() {
            elements.successOverlay.classList.remove('active');
            elements.checkbox.classList.add('checked');
            elements.widget.classList.add('verified');
            isVerified = true;
            
            // Guardar en localStorage
            try {
                localStorage.setItem('flappy_captcha_verified', JSON.stringify({
                    expires: Date.now() + 7200000
                }));
            } catch (e) {}
            
            console.log('✅ VERIFICACIÓN COMPLETA');
        }, 2000);
    }
    
    // ============================================================
    // INICIAR
    // ============================================================
    console.log('✅ APP INITIALIZATION COMPLETE');
    
})();