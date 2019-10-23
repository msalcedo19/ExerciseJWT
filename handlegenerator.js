let jwt = require( 'jsonwebtoken' );
let config = require( './config' );
const MongoClient = require("mongodb").MongoClient;
let conn=MongoClient.connect("mongodb+srv://tutoFinder_admin:tutoFinder_password@cluster0-j6ym9.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true});

// Clase encargada de la creación del token
class HandlerGenerator {

    login( req, res ) {

        // Extrae el usuario y la contraseña especificados en el cuerpo de la solicitud
        let username = req.body.username;
        let password = req.body.password;

        var hash = 0, i, chr;
        if (password.length === 0) return hash;
        for (i = 0; i < password.length; i++) {
            chr   = password.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        password = hash;

        // Este usuario y contraseña, en un ambiente real, deben ser traidos de la BD
        conn.then(client=>{
            client.db("JWT").collection("users").find({"username":username}).toArray((err,data)=>{
                if (data.length!=0) {
                    let mockedUsername = data[0].username;
                    let mockedPassword = data[0].password;

                    // Si se especifico un usuario y contraseña, proceda con la validación
                    // de lo contrario, un mensaje de error es retornado
                    if (username && password) {

                        // Si los usuarios y las contraseñas coinciden, proceda con la generación del token
                        // de lo contrario, un mensaje de error es retornado
                        if (username === mockedUsername && password === mockedPassword) {

                            // Se genera un nuevo token para el nombre de usuario el cuál expira en 24 horas
                            let token = jwt.sign({username: username},
                                config.secret, {expiresIn: '24h'});

                            // Retorna el token el cuál debe ser usado durante las siguientes solicitudes
                            res.json({
                                success: true,
                                message: 'Authentication successful!',
                                token: token
                            });

                        } else {

                            // El error 403 corresponde a Forbidden (Prohibido) de acuerdo al estándar HTTP
                            res.json({
                                success: false,
                                message: 'Incorrect username or password'
                            });

                        }

                    } else {

                        // El error 400 corresponde a Bad Request de acuerdo al estándar HTTP
                        res.json({
                            success: false,
                            message: 'Authentication failed! Please check the request'
                        });

                    }
                }
                else {

                    // El error 400 corresponde a Bad Request de acuerdo al estándar HTTP
                    res.json({
                        success: false,
                        message: 'Authentication failed! Please check the request'
                    });

                }
            })
        });

    }

    get_info( req, res ) {

        // Extrae el usuario y la contraseña especificados en el cuerpo de la solicitud
        let username = req.params.username;
        let user = req.body.username

        // Este usuario y contraseña, en un ambiente real, deben ser traidos de la BD
        conn.then(client=>{
            client.db("JWT").collection("users").find({"username":username}).toArray((err,data)=>{
                if (data.length!=0) {
                    if(data[0].role == 'A' || data[0].role == 'B'){
                        conn.then(client=> {
                            client.db("JWT").collection("users").find({"username": user}).toArray((err, data) => {
                                res.send(data);
                            })
                        });
                    }
                    else{
                        res.json( {
                            success: false,
                            message: 'No tienes los permisos para realizar esta acción'
                        } );
                    }
                }
            });
        });

    }

    register( req, res ) {

        // Extrae el usuario y la contraseña especificados en el cuerpo de la solicitud
        let username = req.body.username;
        let password = req.body.password;
        let role = req.body.role

        var hash = 0, i, chr;
        if (password.length === 0) return hash;
        for (i = 0; i < password.length; i++) {
            chr   = password.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        password = hash;

        conn.then(client=>{
            client.db("JWT").collection("users").insertOne({"username":username, "password": password, "role": role},(err,data)=>{
                if (err != null) throw err;
                res.send(data);
            })
        });
    }

    modify( req, res ) {

        let username = req.body.username;
        let password = req.body.password;

        var hash = 0, i, chr;
        if (password.length === 0) return hash;
        for (i = 0; i < password.length; i++) {
            chr   = password.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        password = hash;

        conn.then(client=>{
            client.db("JWT").collection("users").find({"username":username}).toArray((err,data)=>{
                if(data[0].role == 'A') {
                    conn.then(client => {
                        client.db("JWT").collection("users").updateOne({"username": username}, {
                            $set: {
                                "password": password
                            }
                        }, (err, data) => {
                            if (err != null) throw err;
                            res.send(data);
                        })
                    });
                }
                else{
                    res.json( {
                        success: false,
                        message: 'No tienes los permisos para realizar esta acción'
                    } );
                }
            });
        });
    }

}

module.exports = HandlerGenerator;
