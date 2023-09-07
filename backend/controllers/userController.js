import User from "../models/User.js";
import generarJWT from "../helpers/generarJWT.js";

//Función para registrar
const registrar = async (req, res) => {
 const {email} = req.body; // req.body cuando se va a almacenar datos de un formulario

    //Prevenir usuarios duplicados
    //findOne permite buscar por los diferentes atributos de la BD, find se tre todos y findById se trae el registro por Id
    const existeUsuario = await User.findOne({email});
    if(existeUsuario){
       const error = new Error("Usuario ya registrado");
       return res.status(400).json({msg: error.message});
    }
    try{
        // Registrar un nuevo usuario
        const user = new User(req.body);
        //save() método de mongoose para almacenar o actualizar objetos en la base de datos
        const registrarUser = await user.save(); 

    res.json({registrarUser});


    }catch(error){
      console.log(error.message);
    }
 
};

//Función para mostrar perfin
const perfil = (req, res) => {
    res.json({msg: "Mostrando perfil"});
};

const confirmar = async (req, res) => {
    const {token} = req.params; // res.params() para leer el parámetro que se le envía desde la ruta
    const confirmarUsuario = await User.findOne({token}); // Buscar el usuario que tenga el token que se le pasa en la url
   
    if(!confirmarUsuario){
        const error = new Error('Token no válido');
        return res.status(404).json({msg: error.message});
    }

    try{

        confirmarUsuario.token = null;  //Eliminamos el token
        confirmarUsuario.confirmado = true; //cambiamos el estado del confirmado
        await confirmarUsuario.save();  //almacenamos los cambios

        res.json({msg: "Usuario confirmado correctamente"});


    }catch(error){
        console.log(error.message);
    }

};
 // Funcion para autenticar al usuario
const autenticar = async (req, res) =>{
    const { email, password } = req.body;

    //Comprobar si el usuario existe
    const usuario = await User.findOne({email});

    if(!usuario){
        const error = new Error('Usuario no existe');
        return res.status(403).json({msg: error.message})
    }

    //Comprobar si el usuario está confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});
    }

    //Revisar que la contraseña sea correcta
    if(await usuario.comprobarPassword(password)){
        //Autenticando
        try {
            const token = generarJWT(usuario.id); //Se le manda el id del usuario
            res.json({ token });
          } catch (error) {
            console.error('Error al generar el token:', error);
            res.status(500).json({ error: 'Error al generar el token' });
          }

    }else{
        const error = new Error('La contraseña es incorrecta');
        return res.status(403).json({msg: error.message});
    }


};

//Exportando métodos
export {
    registrar,
    perfil,
    confirmar,
    autenticar
}