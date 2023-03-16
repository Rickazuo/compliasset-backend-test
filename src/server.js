const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
let cors = require('cors');


const app = express();
let mysql = require("mysql");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const saltRounds = 10;

let connection = mysql.createConnection({
    host: "localhost",
    user: "rickazuo",
    password: "password",
    database: "register",
});

app.get("/", (request, response) => {
    connection.query("SELECT * FROM users", (err, results) => {
        if (err) {
            return request.sendStatus(500);
        }
        response.send(results);
    });
});

app.post("/user", async (request, response) => {
    console.log(request.body)
    const email = request.body.email;
    const name = request.body.name;
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);

    connection.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        function (error, results) {
            if (results.length > 0) {
                response.send({ text: "Usuário já existe", success: false });
                response.end();
            } else {
                connection.query(
                    "INSERT INTO users (name, email, password) VALUES (?,?,?)",
                    [name, email, hashedPassword],
                    function (error) {
                        if (error) {
                            response.send({
                                text: "Erro ao inserir usuário",
                                success: false,
                            });
                        } else {
                            response.send({
                                text: "Usuário inserido com sucesso!",
                                success: true,
                            });
                        }

                        response.end();
                    }
                );
            }
        }
    );
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
