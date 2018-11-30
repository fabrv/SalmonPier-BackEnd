import app from './App'

const port: any = process.env.PORT || 8080

app.server.listen(port, '0.0.0.0', (err: any) => {
  if (err) {
    return console.log(err);
  }
  return console.log(`Server is listening on ${port}`);
})
