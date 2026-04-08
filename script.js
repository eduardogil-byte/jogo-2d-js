const canvas = document.getElementById("jogoCanvas");
const ctx = canvas.getContext("2d");

// Controles
const teclas = {
  esquerda: false,
  direita: false,
  cima: false,
  baixo: false,
};

window.addEventListener("keydown", (e) => {
  if (e.code === "ArrowLeft" || e.key === "a") teclas.esquerda = true;
  if (e.code === "ArrowRight" || e.key === "d") teclas.direita = true;
  if (e.code === "ArrowUp" || e.key === "w") teclas.cima = true;

  if (e.code === "ArrowDown" || e.key === "s" || e.key === "S")
    teclas.baixo = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.key === "a") teclas.esquerda = false;
  if (e.code === "ArrowRight" || e.key === "d") teclas.direita = false;
  if (e.code === "ArrowUp" || e.key === "w" || e.code === "Space")
    teclas.cima = false;

  if (e.code === "ArrowDown" || e.key === "s" || e.key === "S")
    teclas.baixo = false;
});

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
};

// O Chefão (Quadrado Vermelho no meio)
const chefao = {
  x: 350,
  y: 300,
  largura: 100,
  altura: 150,
  hp: 200,
  maxHp: 200,
  cor: "#c0392b",
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

function atualizar() {
  // Movimentação Horizontal
  if (teclas.esquerda) jogador.velocidadeX = -jogador.velocidadeMaxima;
  else if (teclas.direita) jogador.velocidadeX = jogador.velocidadeMaxima;
  else jogador.velocidadeX = 0;

  jogador.x += jogador.velocidadeX;

  // Pulo
  if (teclas.cima && jogador.noChao) {
    jogador.velocidadeY = jogador.puloForca;
    jogador.noChao = false;
  }

  // Aplicar Gravidade
  jogador.velocidadeY += gravidade;
  jogador.y += jogador.velocidadeY;

  // Colisão com as Plataformas
  jogador.noChao = false;
  for (let p of plataformas) {
    if (teclas.baixo && p.atravessavel) {
      continue;
    }

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
      // Checa se o pé do jogador está tocando o topo de alguma plataforma
      jogador.noChao = true;
      jogador.velocidadeY = 0;
      jogador.y = p.y - jogador.altura; // Crava o jogador em cima da plataforma
    }
  }

  // Limites da tela (paredes)
  if (jogador.x < 0) jogador.x = 0;
  if (jogador.x + jogador.largura > canvas.width)
    jogador.x = canvas.width - jogador.largura;
}

function desenhar() {
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

  // Desenha o Jogador
  ctx.fillStyle = jogador.cor;
  ctx.fillRect(jogador.x, jogador.y, jogador.largura, jogador.altura);

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

  //   let porcentagemChefao = Math.max(0, chefao.hp / chefao.maxHp);
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(chefao.x, chefao.y - 20, chefao.largura, 10);
  //   ctx.fillStyle = "#e74c3c";
  //   ctx.fillRect(chefao.x, chefao.y - 20, chefao.largura * porcentagemChefao, 10);

  //   let porcentagemJogador = Math.max(0, jogador.hp / jogador.maxHp);
  //   ctx.fillStyle = "black";
  //   ctx.fillRect(
  //     jogador.x,
  //     jogador.y - 15,
  //     jogador.largura * porcentagemJogador,
  //     6,
  //   );
  //   ctx.fillStyle = "#2ecc71";
  //   ctx.fillRect();
}

// O Loop principal do jogo (roda aprox. 60 vezes por segundo)
function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

// Inicia o jogo
loop();
