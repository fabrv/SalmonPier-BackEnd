﻿const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const sql = require("mssql");


// Database config
const config = {
    user: 'sa',
    password: '1234',
    server: 'localhost',
    database: 'ENCUESTAS'
};

http.listen(8080, ()=> {
    console.log("NODE PORT ON *:8080");

    process.argv.forEach((val, index, array)=> {
        if (val == "test"){
            console.log("Test result: Dependencies and server running.")
            //For future versions of the test (when the server is no longer local) it should also test the server connection
            process.exit();
        }
    });
});

//User IDs
let IDs = [];

io.on("connection", function (socket) {
    //Log connections and disconnects from Socket Server
    console.log("-connection-");
    socket.on('disconnect', ()=> {
        console.log("-end of connection-")
    });


    //GetForm event Handler
    socket.on('getForm', (queryVals, transactionID)=> {
        //Form the query from the values sent by the client
        query = "SELECT QUESTION.FORM_NAME, TYPE_ID, DATE_CREATED, QUESTION, OPTION_CAPTION, OPTION_VALUE, QUESTION.QUESTION_ID FROM QUESTION " +
        "INNER JOIN FORM ON QUESTION.FORM_NAME = FORM.FORM_NAME " +
        "LEFT JOIN OPTIONS ON QUESTION.QUESTION_ID = OPTIONS.QUESTION_ID " +
        "WHERE FORM_CODE =" + queryVals;

        //Log of transaction in a clear way
        console.log('-----------------getForm-----------------');
        console.log('id: ', transactionID);
        //Get current date and format it in YYYY-MM-DD HH:mm:SS
        let currentdate = new Date(); 
        let datetime = currentdate.getFullYear() + "-"
                        + (currentdate.getMonth()+1)  + "-"
                        + currentdate.getDate() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds() + "."
                        + currentdate.getMilliseconds();
        console.log('strated date:', datetime);
        
        transactioner(query, transactionID);
    });

    //Upload form(s) event handler
    socket.on('insertFilledForms', (queryVals, transactionID)=> {
        let query = "DECLARE @FILLED_ID INT ";
        for (let f = 0; f < queryVals.length; f++){
            query = query + "INSERT INTO FILLED_FORM (FORM_CODE, DATE_FILLED) " +
            "VALUES ("+ queryVals[f].CODE +", '"+ queryVals[f].FINISHED_DATE +"') " +            
            "SET @FILLED_ID = (SELECT TOP 1 FILLED_ID FROM FILLED_FORM ORDER BY DATE_FILLED) "

            for (let i = 0; i < queryVals[f].QUESTIONS.length; i++){

                query = query + "INSERT INTO ANSWER (VALUE, QUESTION_ID, FILLED_ID) " +
                "VALUES ('" + queryVals[f].QUESTIONS[i].ANSWER + "', " + queryVals[f].QUESTIONS[i].QUESTION_ID + ", @FILLED_ID) "
            }
        }        
        
        console.log('------------insertFilledForms-----------');
        console.log('id: ', transactionID)
        //Get current date and format it in YYYY-MM-DD HH:mm:SS
        let currentdate = new Date(); 
        let datetime = currentdate.getFullYear() + "-"
                        + (currentdate.getMonth()+1)  + "-"
                        + currentdate.getDate() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds() + "."
                        + currentdate.getMilliseconds();
        console.log('strated date:', datetime);
        
        transactioner(query, transactionID);
    });
});



function transactioner(query, transactionID) {
    //Standard MSSQL 4.1 new connection    
    const conn = new sql.ConnectionPool(config);
    
    //Start the connection
    conn.connect().then(()=> {
        //New request with query formed in the event listener
        let req = new sql.Request(conn);
        req.query(query).then(function (recordset) { 
            //If query returns a row then it will emit
            //the results with the TransactionID.
            //(TransactionID is generated randomly from
            //the client side when the transaction is requested)
            let currentdate = new Date(); 
            let datetime = currentdate.getFullYear() + "-"
                            + (currentdate.getMonth()+1)  + "-"
                            + currentdate.getDate() + " "
                            + currentdate.getHours() + ":"
                            + currentdate.getMinutes() + ":"
                            + currentdate.getSeconds() + "."
                            + currentdate.getMilliseconds();
            console.log('finished date:', datetime);
            //Log the transaction result
            console.log("SUCCESFULL TRANSACTION");
            console.log('-----------------------------------------')
            io.sockets.emit(transactionID, {"success": true, "data": recordset});            
            //And close the SQL connection once the transaction is over
            conn.close();
        })
        .catch(function (err) {
            //If there is a problem from the SQL server
            //then emit the error back to client
            io.sockets.emit(transactionID, {"success": false, "data": err});
            //Log the transaction result
            console.log("QUERY ERROR");
            //And close the SQL connection once the transaction is over
            conn.close();
        });
    })
    .catch((err)=> {
        //If sql connection error emit it back to client
        io.sockets.emit(transactionID, {"success": false, "data": err});
        //Log the transaction result
        console.log("CONNECTION ERROR");
        conn.close();
    });
}