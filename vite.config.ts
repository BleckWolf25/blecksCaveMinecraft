/**
 * @file vite.config.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Vite build and development server configuration.
 *
 * @description
 * Configures the Vite bundler and development server, setting up custom backend middleware for live wiki editing in development builds, body parsing for API requests, path traversal sanitization, and hot module replacement filtering.
 *
 * @since 25/06/2026
 * @updated 05/07/2026
 */
// ---------- IMPORTS
import { defineConfig, Plugin, ViteDevServer, Connect } from 'vite';
import http from 'http';
import fs from 'fs';
import path from 'path';

// ---------- PLUGIN: WIKI LIVE EDITOR
function wikiEditorPlugin(): Plugin {
  return {
    name: 'wiki-editor-plugin',
    configureServer(server: ViteDevServer) {
      // Environment check: only enable API endpoints in development
      if (process.env.NODE_ENV === 'production') {
        return;
      }

      // Whitelist of allowed directories for file operations
      const ALLOWED_BASE_DIR = path.resolve(__dirname, 'src/content');
      const ALLOWED_FILES = ['structure.json'];

      // Validate that a path is within allowed directories
      function isPathAllowed(targetPath: string): boolean {
        const resolved = path.resolve(targetPath);
        const normalizedResolved = path.normalize(resolved);
        const normalizedBase = path.normalize(ALLOWED_BASE_DIR);

        // Check if path is within allowed base directory
        if (!normalizedResolved.startsWith(normalizedBase)) {
          return false;
        }

        // Additional check for structure.json specifically
        if (normalizedResolved.endsWith('structure.json')) {
          return ALLOWED_FILES.includes('structure.json');
        }

        return true;
      }

      // Body parsing middleware since Vite doesn't parse JSON body by default
      server.middlewares.use(
        (req: Connect.IncomingMessage, res: http.ServerResponse, next: Connect.NextFunction) => {
          if (req.method === 'POST' && req.url?.startsWith('/__wiki_api/')) {
            let body = '';
            req.on('data', (chunk: Buffer) => {
              body += chunk.toString();
            });
            req.on('end', () => {
              if (body) {
                try {
                  (req as { body?: unknown }).body = JSON.parse(body);
                } catch (e) {
                  console.error('Failed to parse body', e);
                }
              }
              next();
            });
          } else {
            next();
          }
        }
      );

      // API: Save Page Markdown
      server.middlewares.use(
        '/__wiki_api/save_page',
        (req: Connect.IncomingMessage, res: http.ServerResponse) => {
          const { modpackId, pageId, markdown } =
            (req as { body?: { modpackId?: string; pageId?: string; markdown?: string } }).body ||
            {};

          // Input validation
          if (!modpackId || !pageId || markdown === undefined) {
            res.statusCode = 400;
            res.end('Missing required fields');
            return;
          }

          // Sanitize inputs to prevent path traversal
          const sanitizedModpackId = modpackId.replace(/[^a-zA-Z0-9-_]/g, '');
          const sanitizedPageId = pageId.replace(/[^a-zA-Z0-9-_]/g, '');

          if (sanitizedModpackId !== modpackId || sanitizedPageId !== pageId) {
            res.statusCode = 400;
            res.end('Invalid characters in modpackId or pageId');
            return;
          }

          try {
            const dirPath = path.resolve(ALLOWED_BASE_DIR, sanitizedModpackId);
            const filePath = path.resolve(dirPath, `${sanitizedPageId}.md`);

            // Path traversal protection
            if (!isPathAllowed(filePath)) {
              res.statusCode = 403;
              res.end('Path not allowed');
              return;
            }

            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath, { recursive: true });
            }
            fs.writeFileSync(filePath, markdown, 'utf-8');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.end('Server error');
          }
        }
      );

      // API: Save Structure
      server.middlewares.use(
        '/__wiki_api/save_structure',
        (req: Connect.IncomingMessage, res: http.ServerResponse) => {
          const { structure } = (req as { body?: { structure?: unknown } }).body || {};

          if (!structure) {
            res.statusCode = 400;
            res.end('Missing structure data');
            return;
          }

          try {
            const filePath = path.resolve(ALLOWED_BASE_DIR, 'structure.json');

            // Path traversal protection
            if (!isPathAllowed(filePath)) {
              res.statusCode = 403;
              res.end('Path not allowed');
              return;
            }

            fs.writeFileSync(filePath, JSON.stringify(structure, null, 2), 'utf-8');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.end('Server error');
          }
        }
      );
    },
    handleHotUpdate({ file }: { file: string }) {
      if (file.endsWith('structure.json')) {
        // Ignore HMR for structure.json to prevent the page from reloading
        // while the user is inside the Structure Editor
        return [];
      }
      return;
    },
  };
}

// ---------- CONFIGURATION
export default defineConfig({
  plugins: [wikiEditorPlugin()],
});
