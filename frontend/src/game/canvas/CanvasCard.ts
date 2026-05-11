import { makeCardImg, makeBackImg, fillRoundRect } from './cardTextures';

let _backImg: HTMLCanvasElement | null = null;

function getBackImg() {
  return (_backImg ??= makeBackImg());
}

export class CanvasCard {
  id: string;
  label: string;
  flipped = false;
  hover = false;
  isWinner = false;
  rotation = 0;

  x: number;
  y: number;
  tx: number;
  ty: number;

  readonly w = 80;
  readonly h = 120;

  private frontImg: HTMLCanvasElement;

  constructor(id: string, label: string, x = 0, y = 0) {
    this.id = id;
    this.label = label;
    this.x = this.tx = x;
    this.y = this.ty = y;
    this.frontImg = makeCardImg(label);
  }

  // Xnext = (Xtarget - Xnow) * (1 - 0.001**dt)
  update(dt: number) {
    const k = 1 - Math.pow(0.001, dt);
    this.x += (this.tx - this.x) * k;
    this.y += (this.ty - this.y) * k;
  }

  draw(ctx: CanvasRenderingContext2D, isCurrent: boolean) {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation);
    ctx.translate(-cx, -cy);

    if (isCurrent) {
      ctx.shadowColor = 'rgba(255, 220, 40, 0.8)';
      ctx.strokeStyle = 'rgba(255, 220, 40, 0.6)';
      ctx.shadowBlur = 30;
      ctx.lineWidth = 3;
      fillRoundRect(ctx, this.x, this.y, this.w + 1, this.h + 1, 6);
      ctx.stroke();
    } else if (this.isWinner) {
      ctx.shadowColor = 'rgb(194, 38, 255)';
      ctx.strokeStyle = 'rgb(192, 34, 255)';
      ctx.shadowBlur = 30;
      ctx.lineWidth = 3;
      fillRoundRect(ctx, this.x, this.y, this.w + 1, this.h + 1, 6);
      ctx.stroke();
    }
    fillRoundRect(ctx, this.x, this.y, this.w, this.h, 6);
    ctx.clip();
    ctx.drawImage(
      this.flipped ? getBackImg() : this.frontImg,
      this.x,
      this.y,
      this.w,
      this.h,
    );
    ctx.restore();
  }
}
