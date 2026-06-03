import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function wikiEditorPlugin() {
  return {
    name: 'wiki-editor-plugin',
    configureServer(server: any) {
      // Body parsing middleware since Vite doesn't parse JSON body by default
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.method === 'POST' && req.url?.startsWith('/__wiki_api/')) {
          let body = '';
          req.on('data', (chunk: any) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            if (body) {
              try {
                req.body = JSON.parse(body);
              } catch (e) {
                console.error('Failed to parse body', e);
              }
            }
            next();
          });
        } else {
          next();
        }
      });

      // API: Save Page Markdown
      server.middlewares.use('/__wiki_api/save_page', (req: any, res: any) => {
        const { modpackId, pageId, markdown } = req.body || {};
        if (!modpackId || !pageId || markdown === undefined) {
          res.statusCode = 400;
          return res.end('Missing required fields');
        }

        try {
          const dirPath = path.resolve(__dirname, 'src/content', modpackId);
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          const filePath = path.resolve(dirPath, `${pageId}.md`);
          fs.writeFileSync(filePath, markdown, 'utf-8');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end('Server error');
        }
      });

      // API: Save Structure
      server.middlewares.use('/__wiki_api/save_structure', (req: any, res: any) => {
        const { structure } = req.body || {};
        if (!structure) {
          res.statusCode = 400;
          return res.end('Missing structure data');
        }

        try {
          const filePath = path.resolve(__dirname, 'src/content/structure.json');
          fs.writeFileSync(filePath, JSON.stringify(structure, null, 2), 'utf-8');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
        } catch (error) {
          console.error(error);
          res.statusCode = 500;
          res.end('Server error');
        }
      });
    },
    handleHotUpdate({ file }) {
      if (file.endsWith('structure.json')) {
        // Ignore HMR for structure.json to prevent the page from reloading
        // while the user is inside the Structure Editor
        return [];
      }
    }
  };
}

export default defineConfig({
  plugins: [wikiEditorPlugin()]
});
