export function fillRoundRect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.lineTo(x + w - r, y);
  g.quadraticCurveTo(x + w, y, x + w, y + r);
  g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  g.lineTo(x + r, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r);
  g.quadraticCurveTo(x, y, x + r, y);
  g.closePath();
}

const RED_SUITS = new Set(['♥', '♦']);

export function makeCardImg(label: string): HTMLCanvasElement {
  const suit = label.slice(-1);
  const rank = label.slice(0, -1);
  const isRed = RED_SUITS.has(suit);
  const ink = isRed ? '#c0110f' : '#111';

  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 480;
  const g = c.getContext('2d')!;

  const bg = g.createLinearGradient(0, 0, 0, 480);
  bg.addColorStop(0, '#fff');
  bg.addColorStop(1, '#f0f0f0');
  g.fillStyle = bg;
  fillRoundRect(g, 0, 0, 320, 480, 18);
  g.fill();

  g.strokeStyle = '#ccc';
  g.lineWidth = 3;
  fillRoundRect(g, 1.5, 1.5, 317, 477, 17);
  g.stroke();

  g.fillStyle = ink;
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.font = 'bold 80px Georgia, serif';
  g.fillText(rank, 14, 10);
  g.font = '70px Georgia, serif';
  g.fillText(suit, 16, 90);

  g.save();
  g.translate(306, 470);
  g.rotate(Math.PI);
  g.textAlign = 'left';
  g.textBaseline = 'top';
  g.font = 'bold 80px Georgia, serif';
  g.fillText(rank, 0, 0);
  g.font = '70px Georgia, serif';
  g.fillText(suit, 2, 80);
  g.restore();

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '200px Georgia, serif';
  g.fillText(suit, 160, 240);

  return c;
}

export function suitToSymbol(suit: string) {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    default:
      return suit;
  }
}

export function makeBackImg(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 320;
  c.height = 480;
  const g = c.getContext('2d')!;

  const bg = g.createLinearGradient(0, 0, 320, 480);
  bg.addColorStop(0, '#1a237e');
  bg.addColorStop(1, '#283593');
  g.fillStyle = bg;
  fillRoundRect(g, 0, 0, 320, 480, 4);
  g.fill();

  g.strokeStyle = 'rgba(255,255,255, 0.2)';
  g.lineWidth = 2;
  for (let x = 0; x <= 320; x += 15) {
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, 480);
    g.stroke();
  }
  for (let y = 0; y <= 480; y += 15) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(320, y);
    g.stroke();
  }

  g.strokeStyle = 'rgba(255,255,255,0.55)';
  g.lineWidth = 2;
  fillRoundRect(g, 3, 3, 314, 474, 3);
  g.stroke();

  return c;
}
