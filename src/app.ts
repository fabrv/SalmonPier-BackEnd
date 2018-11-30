import express, { Router } from 'express'
import { createServer, Server } from 'http'
import cors from 'cors'
import mssql from 'mssql'
import chalk from 'chalk'
import path from 'path'

class App{
  public server: Server
  public app: express.Application
  // Database config
  config = {
    user: 'sa',
    password: '1234',
    server: 'localhost',
    database: 'ENCUESTAS'
  }

  constructor(){
    // App Express
    this.app = express()
    this.app.use(express.static(path.resolve(__dirname, '../client')))
    // Mount routes
    this.mountRoutes()
    // Http Server
    this.server = createServer(this.app)
  }

  private mountRoutes(): void {
    const router: any = express.Router()

    // CORS module to allow cross origin resource sharing
    router.use(cors())

    router.get('/forms/:form', async (req: express.Request, res: express.Response) => {
      console.log(chalk.cyan(`---FORM ${req.params.form} requested---`))
      const query = `
        SELECT QUESTION.FORM_NAME, TYPE_ID, DATE_CREATED, QUESTION, OPTION_CAPTION, OPTION_VALUE, QUESTION.QUESTION_ID FROM QUESTION 
        INNER JOIN FORM ON QUESTION.FORM_NAME = FORM.FORM_NAME 
        LEFT JOIN OPTIONS ON QUESTION.QUESTION_ID = OPTIONS.QUESTION_ID 
        WHERE FORM_CODE = ${req.params.form}`

      let currentdate = new Date(); 
      let datetime = currentdate.getFullYear() + "-"
                  + (currentdate.getMonth()+1)  + "-"
                  + currentdate.getDate() + " "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds() + "."
                  + currentdate.getMilliseconds()

      console.log(chalk.cyan('strated date:'), datetime)

      let result = await this.transcationer(query)
      res.status(200).json(result.data)
    })

    // Set router location
    this.app.use('/', router)
  }

  transcationer(query: string): Promise<{status: number, data: any}>{
    //Standard MSSQL 4.1 new connection    
    const conn: mssql.ConnectionPool = new mssql.ConnectionPool(this.config);

    //Start the connection and return a promise
    return new Promise(result => {
      conn.connect().then(()=> {
        //New request with query formed in the event listener
        let req: mssql.Request = new mssql.Request(conn)
        req.query(query).then((recordset)=> {
          let currentdate: Date = new Date() 
          let datetime = currentdate.getFullYear() + "-"
                      + (currentdate.getMonth()+1)  + "-"
                      + currentdate.getDate() + " "
                      + currentdate.getHours() + ":"
                      + currentdate.getMinutes() + ":"
                      + currentdate.getSeconds() + "."
                      + currentdate.getMilliseconds()
          console.log(chalk.cyan('finished date:'), datetime)
          //Log the transaction result
          console.log(chalk.cyan("SUCCESFULL TRANSACTION"))
          console.log(chalk.cyan('-----------------------------------------'))
          //And close the SQL connection once the transaction is over
          conn.close()

          //Return the query result
          result({"status": 200, "data": recordset.recordset})
        })
        .catch((err)=> {
          //Log the transaction result
          console.log(chalk.red('--Error--'))
          console.error(err);
          //And close the SQL connection once the transaction is over
          conn.close();
          //If there is a problem from the SQL server
          //return the error
          result({"status": 400, "data": err})
        })
      })
      .catch((err)=> {
        //Log the transaction result
        console.log(chalk.red('--Error--'))
        console.error(err);
        conn.close();
        //If there is a problem from the SQL server
        //return the error
        result({"status": 500, "data": err})
      })
    })
  }
}

// Export this class
export default new App();