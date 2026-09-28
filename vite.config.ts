import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// Arquivos JSON editáveis pela casca (raiz do projeto, versionados no git).
// Dev: GET/POST em /<nome>.json. Build: copiados para dist/ (site publicado = só leitura).
// Ficam fora de public/ para gravar sem disparar reload da página.
const jsonFiles = ['annotations.json']
const jsonFilesApi = (): Plugin => ({
  name: 'json-files-api',
  configureServer(server) {
    for (const name of jsonFiles) {
      const file = path.resolve(__dirname, name)
      server.watcher.unwatch(file)
      server.middlewares.use(`/${name}`, (req, res) => {
        if (req.method === 'GET') {
          res.setHeader('content-type', 'application/json')
          return void res.end(fs.existsSync(file) ? fs.readFileSync(file) : '[]')
        }
        if (req.method !== 'POST') return void ((res.statusCode = 405), res.end())
        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', () => {
          fs.writeFileSync(file, JSON.stringify(JSON.parse(body), null, 2) + '\n')
          res.end('ok')
        })
      })
    }
  },
  generateBundle() {
    for (const name of jsonFiles) {
      const file = path.resolve(__dirname, name)
      this.emitFile({ type: 'asset', fileName: name, source: fs.existsSync(file) ? fs.readFileSync(file) : '[]' })
    }
  },
})

export default defineConfig({
  base: './', // caminhos relativos: funciona no GitHub Pages em qualquer subpasta
  plugins: [react(), tailwindcss(), jsonFilesApi()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
