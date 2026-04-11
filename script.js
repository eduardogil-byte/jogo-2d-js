const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Controles
const teclas = {
  esquerda: false,
  direita: false,
  cima: false,
  baixo: false,
  tiro: false,
  dash: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft" || e.key === "a") teclas.esquerda = true;
  if (e.code === "ArrowRight" || e.key === "d") teclas.direita = true;
  if (e.code === "ArrowUp" || e.key === "w") teclas.cima = true;
  if (e.code === "ArrowDown" || e.key === "s" || e.key === "S")
    teclas.baixo = true;

  if (e.code === "Space") teclas.tiro = true;
  if (e.key === "Shift") teclas.dash = true;

  if (e.key === "1") jogador.armaAtual = 1;
  if (e.key === "2") jogador.armaAtual = 2;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.key === "a") teclas.esquerda = false;
  if (e.code === "ArrowRight" || e.key === "d") teclas.direita = false;
  if (e.code === "ArrowUp" || e.key === "w") teclas.cima = false;
  if (e.code === "ArrowDown" || e.key === "s" || e.key === "S")
    teclas.baixo = false;
  if (e.code === "Space") teclas.tiro = false;
  if (e.key === "Shift") teclas.dash = false;
});

const foguetesChefao = [];

// O Jogador (Quadrado Azul)
const jogador = {
  x: 50,
  y: 300,
  largura: 30,
  altura: 30,
  velocidadeX: 0,
  velocidadeY: 0,
  velocidadeMaxima: 5,
  puloForca: -12,
  noChao: false,
  cor: "#2980b9",
  hp: 100,
  maxHp: 100,
  direcao: 1,
  cooldownTiro: 0,
  armaAtual: 1,
  tempoEspada: 0,
  hitboxEspada: null,
  direcaoAtaque: null,
  ladoAtaque: 1,
  tempoInvulneravel: 0,
  tempoDash: 0,
  cooldownDash: 0,
};

const tiros = [];

// O Chefão (Quadrado Vermelho no meio)
const chefao = {
  x: 340,
  y: 270,
  largura: 120,
  altura: 180,
  hp: 200,
  maxHp: 200,
  cor: "#c0392b",
  timerAtaque: 0,
  modoAtaque: 1, // 1 = Foguetes, 2 = Investida com Espada
  estado: "parado", // "parado", "investida", "atacando", "voltando"
  velocidadeX: 0,
  velocidadeY: 0,
  alvoX: 0,
  alvoY: 0,
  startX: 340, // Posição original para ele voltar
  startY: 270,
  tempoEspada: 0,
  hitboxEspada: null,
};

// Plataformas (Chão principal e algumas no ar)
const plataformas = [
  { x: 0, y: 450, largura: 800, altura: 50, atravessavel: false }, // Chão

  { x: 80, y: 340, largura: 120, altura: 20, atravessavel: true }, // Plataforma esquerda
  { x: 0, y: 245, largura: 120, altura: 20, atravessavel: true }, // Plataforma esquerda
  { x: 80, y: 150, largura: 120, altura: 20, atravessavel: true }, // Plataforma esquerda cima

  { x: 620, y: 340, largura: 120, altura: 20, atravessavel: true }, // Plataforma direita
  { x: 680, y: 245, largura: 120, altura: 20, atravessavel: true }, // Plataforma direita
  { x: 620, y: 150, largura: 120, altura: 20, atravessavel: true }, // Plataforma direita cima

  // { x: 300, y: 250, largura: 200, altura: 20 }  // Plataforma do Chefão
];

const gravidade = 0.6;

function atirar() {
  let velX = 0;
  let velY = 0;
  let larguraTiro = 15;
  let alturaTiro = 5;
  let startX = jogador.x + jogador.largura / 2;
  let startY = jogador.y + 10;

  if (teclas.cima) {
    velX = 0;
    velY = -12;
    larguraTiro = 5;
    alturaTiro = 15;
    startX = jogador.x + 12;
    startY = jogador.y - 10;
  } else if (teclas.baixo) {
    velX = 0;
    velY = 12;
    larguraTiro = 5;
    alturaTiro = 15;
    startX = jogador.x + 12;
    startY = jogador.y + jogador.altura;
  } else {
    velX = 12 * jogador.direcao;
    velY = 0;
  }

  tiros.push({
    x: startX,
    y: startY,
    largura: larguraTiro,
    altura: alturaTiro,
    velocidadeX: velX,
    velocidadeY: velY,
    cor: "#f1c40f",
  });
}

function baterComEspada() {
  jogador.tempoEspada = 10;
  let alcance = 40;
  let espessura = 10;

  let ataqueX =
    jogador.direcao === 1 ? jogador.x + jogador.largura : jogador.x - alcance;
  let ataqueY = jogador.y + 10;
  let ataqueLargura = alcance;
  let ataqueAltura = espessura;

  if (teclas.cima) {
    ataqueX = jogador.x + 10;
    ataqueY = jogador.y - alcance;
    ataqueLargura = espessura;
    ataqueAltura = alcance;
  } else if (teclas.baixo) {
    ataqueX = jogador.x + 10;
    ataqueY = jogador.y + jogador.altura;
    ataqueLargura = espessura;
    ataqueAltura = alcance;
  }

  jogador.hitboxEspada = {
    x: ataqueX,
    y: ataqueY,
    largura: ataqueLargura,
    altura: ataqueAltura,
  };

  if (
    chefao.hp > 0 &&
    ataqueX < chefao.x + chefao.largura &&
    ataqueX + ataqueLargura > chefao.x &&
    ataqueY < chefao.y + chefao.altura &&
    ataqueY + ataqueAltura > chefao.y
  ) {
    chefao.hp -= 20;
  }
}

function lancarFogueteChefao() {
  let startX = chefao.x + chefao.largura / 2;
  let startY = chefao.y + chefao.altura / 2;

  let targetX = jogador.x + jogador.largura / 2;
  let targetY = jogador.y + jogador.altura / 2;

  let cpX = (startX + targetX) / 2;
  let cpY = null;
  if (jogador.y > canvas.height / 2) {
    cpY = Math.min(startX, targetY) + 150;
  } else {
    cpY = Math.min(startX, targetY) - 150;
  }

  foguetesChefao.push({
    startX: startX,
    startY: startY,
    targetX: targetX,
    targetY: targetY,
    cpX: cpX,
    cpY: cpY,
    x: startX,
    y: startY,
    largura: 15,
    altura: 15,
    progresso: 0,
    cor: "orange",
  });
}

function atualizar() {
  // ==========================================
  // 1. LÓGICA DE ATAQUE DO CHEFÃO
  // ==========================================
  if (chefao.hp > 0) {
    chefao.timerAtaque++;

    // --- MODO 1: FOGUETES ---
    if (chefao.modoAtaque === 1) {
      if (chefao.timerAtaque === 100) {
        lancarFogueteChefao();
      } else if (chefao.timerAtaque === 110) {
        lancarFogueteChefao();
      } else if (chefao.timerAtaque >= 120) {
        lancarFogueteChefao();
        chefao.timerAtaque = 0;
        chefao.modoAtaque = 2; // Troca para o modo Espada na próxima
      }
    }
    // --- MODO 2: INVESTIDA E ESPADA ---
    else if (chefao.modoAtaque === 2) {
      // A) Prepara e mira no jogador
      if (chefao.estado === "parado" && chefao.timerAtaque === 60) {
        chefao.alvoX = jogador.x + jogador.largura / 2 - chefao.largura / 2;
        chefao.alvoY = jogador.y + jogador.altura / 2 - chefao.altura / 2;
        chefao.velocidadeX = (chefao.alvoX - chefao.x) / 60; // Chega em 30 frames (0.5s)
        chefao.velocidadeY = (chefao.alvoY - chefao.y) / 60;
        chefao.estado = "investida";
      }

      // B) Voa na direção do jogador
      if (chefao.estado === "investida") {
        chefao.x += chefao.velocidadeX;
        chefao.y += chefao.velocidadeY;

        // Se chegou perto do alvo, ataca!
        if (
          Math.abs(chefao.x - chefao.alvoX) < 60 &&
          Math.abs(chefao.y - chefao.alvoY) < 60
        ) {
          chefao.estado = "atacando";
          chefao.tempoEspada = 120; // Espada dura 40 frames
        }
      }

      // C) Dá o golpe de espada
      if (chefao.estado === "atacando") {
        chefao.tempoEspada--;
        if (chefao.tempoEspada > 0) {
          let margem = 20;
          // Cria uma hitbox grande ao redor do chefão
          chefao.hitboxEspada = {
            x: chefao.x - margem,
            y: chefao.y - margem,
            largura: chefao.largura + margem * 2,
            altura: chefao.altura + margem * 2,
          };
        } else {
          chefao.hitboxEspada = null;
          chefao.estado = "voltando";
          // Calcula a rota de volta para o meio
          chefao.velocidadeX = (chefao.startX - chefao.x) / 60;
          chefao.velocidadeY = (chefao.startY - chefao.y) / 60;
        }
      }

      // D) Volta para o centro tranquilamente
      if (chefao.estado === "voltando") {
        chefao.x += chefao.velocidadeX;
        chefao.y += chefao.velocidadeY;

        // Se chegou no centro, reseta para os foguetes
        if (
          Math.abs(chefao.x - chefao.startX) < 5 &&
          Math.abs(chefao.y - chefao.startY) < 5
        ) {
          chefao.x = chefao.startX;
          chefao.y = chefao.startY;
          chefao.estado = "parado";
          chefao.timerAtaque = 0;
          chefao.modoAtaque = 1; // Volta para foguetes!
        }
      }
    }
  }

  // ==========================================
  // 2. ATUALIZAR FOGUETES (Matemática Bézier)
  // ==========================================
  for (let i = foguetesChefao.length - 1; i >= 0; i--) {
    let f = foguetesChefao[i];
    f.progresso += 0.015;

    let t = f.progresso;
    let umMenosT = 1 - t;

    f.x =
      umMenosT * umMenosT * f.startX +
      2 * umMenosT * t * f.cpX +
      t * t * f.targetX;
    f.y =
      umMenosT * umMenosT * f.startY +
      2 * umMenosT * t * f.cpY +
      t * t * f.targetY;

    // Colisão do foguete com o jogador
    if (
      jogador.tempoInvulneravel <= 0 &&
      f.x < jogador.x + jogador.largura &&
      f.x + f.largura > jogador.x &&
      f.y < jogador.y + jogador.altura &&
      f.y + f.altura > jogador.y
    ) {
      jogador.hp -= 15;
      jogador.tempoInvulneravel = 60;
      foguetesChefao.splice(i, 1);
      continue;
    }

    if (f.progresso >= 1) {
      foguetesChefao.splice(i, 1);
    }
  }

  // ==========================================
  // 3. CRONÔMETROS DO JOGADOR E COLISÃO COM BOSS
  // ==========================================
  if (jogador.cooldownTiro > 0) jogador.cooldownTiro--;
  if (jogador.tempoEspada > 0) jogador.tempoEspada--;
  if (jogador.tempoInvulneravel > 0) jogador.tempoInvulneravel--;

  // Verifica se o jogador encostou no corpo do boss OU na espada do boss
  let tocouBoss = false;
  if (chefao.hp > 0) {
    // Tocou no corpo?
    if (
      jogador.x < chefao.x + chefao.largura &&
      jogador.x + jogador.largura > chefao.x &&
      jogador.y < chefao.y + chefao.altura &&
      jogador.y + jogador.altura > chefao.y
    )
      tocouBoss = true;

    // Tocou na espada do boss?
    if (chefao.hitboxEspada) {
      if (
        jogador.x < chefao.hitboxEspada.x + chefao.hitboxEspada.largura &&
        jogador.x + jogador.largura > chefao.hitboxEspada.x &&
        jogador.y < chefao.hitboxEspada.y + chefao.hitboxEspada.altura &&
        jogador.y + jogador.altura > chefao.hitboxEspada.y
      )
        tocouBoss = true;
    }
  }

  // Se tocou em algum dos dois e não está invulnerável, toma dano!
  if (tocouBoss && jogador.tempoInvulneravel <= 0 && jogador.hp > 0) {
    jogador.hp -= 20;
    jogador.tempoInvulneravel = 60;
    jogador.velocidadeY = -6; // Joga pra cima
    jogador.velocidadeX = jogador.x < chefao.x + chefao.largura / 2 ? -12 : 12; // Joga pro lado
  }

  // ==========================================
  // 4. ATAQUE DO JOGADOR
  // ==========================================
  if (jogador.hp > 0) {
    if (teclas.tiro && jogador.cooldownTiro <= 0 && jogador.armaAtual === 1) {
      atirar();
      jogador.cooldownTiro = 15;
    } else if (
      teclas.tiro &&
      jogador.tempoEspada <= 0 &&
      jogador.armaAtual === 2
    ) {
      baterComEspada();
      jogador.tempoEspada = 25;
      if (teclas.cima) jogador.direcaoAtaque = "cima";
      else if (teclas.baixo) jogador.direcaoAtaque = "baixo";
      else jogador.direcaoAtaque = "lado";
      jogador.ladoAtaque = jogador.direcao;
    }
  }

  // ==========================================
  // 5. FÍSICA E MOVIMENTAÇÃO DO JOGADOR
  // ==========================================

  if (jogador.cooldownDash > 0) jogador.cooldownDash--;

  if (teclas.dash && jogador.cooldownDash <= 0) {
    jogador.x += 80 * jogador.direcao;
    jogador.cooldownDash = 60;
  }

  if (teclas.esquerda) {
    jogador.velocidadeX = -jogador.velocidadeMaxima;
    jogador.direcao = -1;
  } else if (teclas.direita) {
    jogador.velocidadeX = jogador.velocidadeMaxima;
    jogador.direcao = 1;
  } else {
    jogador.velocidadeX = 0;
  }

  jogador.x += jogador.velocidadeX;

  if (teclas.cima && jogador.noChao) {
    jogador.velocidadeY = jogador.puloForca;
    jogador.noChao = false;
  }

  jogador.velocidadeY += gravidade;
  if (jogador.velocidadeY > 8) jogador.velocidadeY = 8;
  jogador.y += jogador.velocidadeY;

  jogador.noChao = false;
  for (let p of plataformas) {
    if (teclas.baixo && p.atravessavel) continue;
    let peAtual = jogador.y + jogador.altura;
    let peAnterior = peAtual - jogador.velocidadeY;

    if (
      jogador.velocidadeY >= 0 &&
      jogador.x < p.x + p.largura &&
      jogador.x + jogador.largura > p.x &&
      jogador.y + jogador.altura > p.y &&
      jogador.y + jogador.altura < p.y + p.altura + jogador.velocidadeY &&
      peAtual >= p.y &&
      peAnterior <= p.y + 1
    ) {
      jogador.noChao = true;
      jogador.velocidadeY = 0;
      jogador.y = p.y - jogador.altura;
    }
  }

  if (jogador.x < 0) jogador.x = 0;
  if (jogador.x + jogador.largura > canvas.width)
    jogador.x = canvas.width - jogador.largura;

  // ==========================================
  // 6. ATUALIZAÇÃO DOS TIROS DO JOGADOR
  // ==========================================
  for (let i = tiros.length - 1; i >= 0; i--) {
    let tiro = tiros[i];
    tiro.x += tiro.velocidadeX;
    tiro.y += tiro.velocidadeY;

    if (
      chefao.hp > 0 &&
      tiro.x < chefao.x + chefao.largura &&
      tiro.x + tiro.largura > chefao.x &&
      tiro.y < chefao.y + chefao.altura &&
      tiro.y + tiro.altura > chefao.y
    ) {
      chefao.hp -= 10;
      tiros.splice(i, 1);
      continue;
    }

    if (
      tiro.x > canvas.width ||
      tiro.x < 0 ||
      tiro.y > canvas.height ||
      tiro.y < 0
    ) {
      tiros.splice(i, 1);
    }
  }

  // ==========================================
  // 7. HITBOX DA ESPADA DO JOGADOR
  // ==========================================
  if (jogador.tempoEspada > 0) {
    let alcance = 40,
      espessura = 10;
    let ataqueX =
      jogador.ladoAtaque === 1
        ? jogador.x + jogador.largura
        : jogador.x - alcance;
    let ataqueY = jogador.y + 10;
    let ataqueLargura = alcance,
      ataqueAltura = espessura;

    if (jogador.direcaoAtaque === "cima") {
      ataqueX = jogador.x + 10;
      ataqueY = jogador.y - alcance;
      ataqueLargura = espessura;
      ataqueAltura = alcance;
    } else if (jogador.direcaoAtaque === "baixo") {
      ataqueX = jogador.x + 10;
      ataqueY = jogador.y + jogador.altura;
      ataqueLargura = espessura;
      ataqueAltura = alcance;
    }
    jogador.hitboxEspada = {
      x: ataqueX,
      y: ataqueY,
      largura: ataqueLargura,
      altura: ataqueAltura,
    };
  } else {
    jogador.hitboxEspada = null;
  }
}

function desenhar() {
  // Desenha o Jogador piscando se estiver invulnerável
  if (jogador.tempoInvulneravel === 0 || jogador.tempoInvulneravel % 10 > 5) {
    ctx.fillStyle = jogador.cor;
    ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);
  }

  // Limpa a tela frame a frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha Plataformas (Verdes)
  ctx.fillStyle = "#27ae60";
  for (let p of plataformas) {
    ctx.fillRect(p.x, p.y, p.largura, p.altura);
  }

  // Desenha o Chefão
  ctx.fillStyle = chefao.cor;
  ctx.fillRect(chefao.x, chefao.y, chefao.largura, chefao.altura);

  if (chefao.estado === "atacando" && chefao.hitboxEspada) {
    ctx.fillStyle = "darkorange"; // Cor da espada do boss
    ctx.fillRect(
      chefao.hitboxEspada.x,
      chefao.hitboxEspada.y,
      chefao.hitboxEspada.largura,
      chefao.hitboxEspada.altura,
    );
  }

  // Desenha o Jogador
  ctx.fillStyle = jogador.cor;
  ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

  if (jogador.tempoEspada > 0 && jogador.hitboxEspada) {
    ctx.fillStyle = "silver";
    ctx.fillRect(
      jogador.hitboxEspada.x,
      jogador.hitboxEspada.y,
      jogador.hitboxEspada.largura,
      jogador.hitboxEspada.altura,
    );
  }

  for (let tiro of tiros) {
    ctx.fillStyle = tiro.cor;
    ctx.fillRect(tiro.x, tiro.y, tiro.largura, tiro.altura);
  }

  ctx.font = "bold 16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 1. BARRA DE VIDA DO JOGADOR (Canto Superior Esquerdo)
  let larguraBarraJogador = 200;
  let alturaBarraJogador = 25;
  let posXJogador = 20; // 20 pixels de distância da borda esquerda
  let posYJogador = 20; // 20 pixels de distância do topo
  let porcentagemJogador = Math.max(0, jogador.hp / jogador.maxHp);

  // Fundo preto da barra do jogador
  ctx.fillStyle = "black";
  ctx.fillRect(
    posXJogador,
    posYJogador,
    larguraBarraJogador,
    alturaBarraJogador,
  );

  // Vida verde do jogador
  ctx.fillStyle = "#2ecc71";
  ctx.fillRect(
    posXJogador,
    posYJogador,
    larguraBarraJogador * porcentagemJogador,
    alturaBarraJogador,
  );

  // Texto HP do Jogador
  ctx.fillStyle = "white";
  ctx.fillText(
    `${jogador.hp} / ${jogador.maxHp}`,
    posXJogador + larguraBarraJogador / 2,
    posYJogador + alturaBarraJogador / 2,
  );

  // 2. BARRA DE VIDA DO CHEFÃO (No meio do chão)
  let larguraBarraChefao = 350; // Barra maior para dar ar de chefão
  let alturaBarraChefao = 25;
  let posXChefao = (canvas.width - larguraBarraChefao) / 2; // Calcula o centro exato da tela
  let posYChefao = 462; // Fica cravada dentro do bloco verde do chão principal
  let porcentagemChefao = Math.max(0, chefao.hp / chefao.maxHp);

  // Fundo preto da barra do chefão
  ctx.fillStyle = "black";
  ctx.fillRect(posXChefao, posYChefao, larguraBarraChefao, alturaBarraChefao);

  // Vida vermelha do chefão
  ctx.fillStyle = "#c0392b";
  ctx.fillRect(
    posXChefao,
    posYChefao,
    larguraBarraChefao * porcentagemChefao,
    alturaBarraChefao,
  );

  // Texto HP do Chefão
  ctx.fillStyle = "white";
  ctx.fillText(
    `${chefao.hp} / ${chefao.maxHp}`,
    posXChefao + larguraBarraChefao / 2,
    posYChefao + alturaBarraChefao / 2,
  );

  for (let f of foguetesChefao) {
    ctx.fillStyle = f.cor;
    ctx.fillRect(f.x, f.y, f.largura, f.altura);

    ctx.fillStyle = "red";
    ctx.fillRect(f.x + 4, f.y + 4, 7, 7);
  }
}

// O Loop principal do jogo (roda aprox. 60 vezes por segundo)
function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

// Inicia o jogo
loop();
