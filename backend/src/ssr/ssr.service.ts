import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SsrService {
  private template: string;

  constructor() {
    this.template = readFileSync(
      join(__dirname, '..', '..', 'client', 'dist', 'index.html'),
      'utf-8',
    );
  }

  async render(url: string): Promise<string> {
    const { render } = (await import(
      join(__dirname, '..', '..', 'client', 'dist-ssr', 'main-server.cjs')
    )) as {
      render: (url: string) => Promise<{ html: string; styleTags: string }>;
    };
    const { html, styleTags } = await render(url);
    return this.template
      .replace('<!--ssr-outlet-->', html)
      .replace('</head>', `${styleTags}</head>`);
  }
}
