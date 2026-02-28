import { renderToString } from 'react-dom/server';
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from 'react-router-dom';
import { ServerStyleSheet } from 'styled-components';
import { routes } from 'App';

/*
  About the argument of `Request`:
  - There's no need to modify it with "https", to add a port after "localhost", 
  or to replace "localhost" with the actual domain name.
  - React Router only cares about the path, not the protocol or the domain.
  - It just needed to look like a valid URL, instead of only providing the path.
*/
export async function render(url: string) {
  const { query, dataRoutes } = createStaticHandler(routes);
  const request = new Request(`http://localhost${url}`);
  const context = await query(request);

  if (context instanceof Response) throw context;

  const router = createStaticRouter(dataRoutes, context);
  const sheet = new ServerStyleSheet();

  try {
    const html = renderToString(
      sheet.collectStyles(
        <StaticRouterProvider router={router} context={context} />,
      ),
    );
    const styleTags = sheet.getStyleTags();
    return { html, styleTags };
  } finally {
    sheet.seal();
  }
}
