const fs = require('fs')
const http = require('http')

const server = http.createServer((req, res) => {
  res.statusCode = 200
  switch (req.url) {
    case '/':
      res.setHeader('Content-Type', 'text/plain')
      res.end('hello nodejs')
      break
    case '/img':
      var thatDay =  new Date()
      res.setHeader('Content-Type', 'image/jpeg')
      thatDay.setDate(thatDay.getDate() + 7)
      res.setHeader('Last-Modified', thatDay.toUTCString())
      fs.createReadStream('./angel.png').pipe(res)
      break
    case '/tick':
      var count = 0
      res.setHeader('Content-Type', 'text/plain')
      res.write('*'. repeat(1000) + '\n')
      var tick = () => {
        count += 1
        res.write(`${count}: fight\n`)
        if (count == 10) {
          res.end()
        } else {
          setTimeout(tick, 500)
        }
      }
      setTimeout(tick, 500)
      break
    default:
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/html')
      res.end(`
      <html>
        <head><title>404 not found</title></head>
        <body>
          <h1 style="text-align: center; margin-top: 30px;">you are lost in void</h1>
        </body>
      </html>
      `)
  }
})

server.listen(3000, () => {
  console.log('server running at 3000...')
})
