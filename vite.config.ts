import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import { defineConfig, type Plugin } from 'vite'

// Anotações da casca vivem em annotations.json (raiz, versionado no git).
// Dev: GET/POST em /annotations.json. Build: o arquivo é copiado para dist/.
// Fica fora de public/ para gravar sem disparar reload da página.
const file = path.resolve(__dirname, 'annotations.json')
const annotationsApi = (): Plugin => ({
  name: 'annotations-api',
  configureServer(server) {
    server.watcher.unwatch(file)
    server.middlewares.use('/annotations.json', (req, res) => {
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
  },
  generateBundle() {
    this.emitFile({ type: 'asset', fileName: 'annotations.json', source: fs.existsSync(file) ? fs.readFileSync(file) : '[]' })
  },
})

export default defineConfig({
  base: './', // caminhos relativos: funciona no GitHub Pages em qualquer subpasta
  plugins: [react(), tailwindcss(), annotationsApi()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
