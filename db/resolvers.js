const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');
const Proveedor = require('../models/Proveedor');

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });


const crearToken = (usuario, secreta, expiresIn) => {
    // console.log(usuario);
    const { id, email,nombre, apellido } = usuario;

    return jwt.sign( { id, email, nombre, apellido }, secreta, { expiresIn } )
}

// Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {}, ctx) => {
            return ctx.usuario;
        }, 
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({}).populate('proveedor');
             
                return productos;
            } catch (error) {
                console.log(error);
            }
        }, 
        obtenerProducto: async (_, { id }) => {
            // revisar si el producto existe o no
            const producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            return producto;
        },
        obtenerClientes: async () => {
            try {
                const clientes = await Cliente.find({});
                return clientes;
            } catch (error) {
                console.log(error);
            }
        }, 
        obtenerProveedores: async () => {
            try {
                const proveedores = await Proveedor.find({});
                return proveedores;
            } catch (error) {
                console.log(error);
            }
        }, 
        obtenerClientesVendedor: async (_, {}, ctx ) => {
            try {
                const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
                return clientes;
            } catch (error) {
                console.log(error);
            }
        }, 
        obtenerCliente: async (_, { id }, ctx) => {
            // Revisar si el cliente existe o no
            const cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Quien lo creo puede verlo
            if(cliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales');
            }

            return cliente;
        },
        obtenerProveedor: async (_, { id }, ctx) => {
            // Revisar si el cliente existe o no
            const proveedor = await Proveedor.findById(id);

            if(!proveedor) {
                throw new Error('Proveedor no encontrado');
            }

            

            return proveedor;
        },  
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        }, 
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({ vendedor: ctx.usuario.id }).populate('cliente');

                console.log(pedidos);
                console.log(ctx.usuario.id)
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        }, 
        obtenerPedido: async(_, {id}, ctx) => {
            // Si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // Solo quien lo creo puede verlo
            if(pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            // retornar el resultado
            return pedido;
        }, 
        obtenerPedidosEstado: async (_, { estado }, ctx) => {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

            return pedidos;
        },
        mejoresClientes: async () => {
            const clientes = await Pedido.aggregate([
                { $match : { estado : "COMPLETADO" } },
                { $group : {
                    _id : "$cliente", 
                    total: { $sum: '$total' }
                }}, 
                {
                    $lookup: {
                        from: 'clientes', 
                        localField: '_id',
                        foreignField: "_id",
                        as: "cliente"
                    }
                }, 
                {
                    $limit: 10
                }, 
                {
                    $sort : { total : -1 }
                }
            ]);

            return clientes;
        }, 
        bajoStock: async() => {
            const productos = await Producto.find({existencia:{$lt:25}}).sort({ existencia : 1 })

            return productos;
        },
       
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                { $match : { estado : "COMPLETADO"} },
                { $group : {
                    _id : "$vendedor", 
                    total: {$sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'usuarios', 
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                }, 
                {
                    $limit: 3
                }, 
                {
                    $sort: { total : -1 }
                }
            ]);

            return vendedores;
        },
        buscarProducto: async(_, { texto }) => {
            const productos = await Producto.find({ $text: { $search: texto  } }).limit(10).sort({ existencia : -1 })
          
            return productos;
        },
        
    }, 
    Mutation: {
        nuevoUsuario: async (_, { input } ) => {

            const { email, password } = input;
            
            // Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email});
            if (existeUsuario) {
                throw new Error('El usuario ya esta registrado');
            }

            // Hashear su password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                 // Guardarlo en la base de datos
                const usuario = new Usuario(input);
                usuario.save(); // guardarlo
                return usuario;
            } catch (error) {
                console.log(error);
            }
        }, 
        autenticarUsuario: async (_, {input}) => {

            const { email, password } = input;

            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password );
            if(!passwordCorrecto) {
                throw new Error('El Password es Incorrecto');
            }

            // Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '8h' ) 
            }
            
        },
        nuevoProducto: async (_, {input}) => {
           // Revisar si el codigo prodcuto ya esta registrado
           
           const { codigo } = input;
           const existeCodigo = await Producto.findOne({codigo});
           if (existeCodigo) {
               throw new Error('El código del producto ya está registrado');
           }
           
           
            try {
                const producto = new Producto(input);

                // almacenar en la bd
                const resultado = await producto.save();

                return resultado;
            } catch (error) {
                console.log(error);
            }
        }, 
        actualizarProducto: async (_, {id, input}) => {
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            // guardarlo en la base de datos
            producto = await Producto.findOneAndUpdate({ _id : id }, input, { new: true } );

            return producto;
        }, 
        eliminarProducto: async(_, {id}) => {
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            // Eliminar
            await Producto.findOneAndDelete({_id :  id});

            return "Producto Eliminado";
        },
        nuevoCliente: async (_, { input }, ctx) => {

            console.log(ctx);

            const { email } = input
            // Verificar si el cliente ya esta registrado
            // console.log(input);

            const cliente = await Cliente.findOne({ email });
            if(cliente) {
                throw new Error('Ese cliente ya esta registrado');
            }

            const nuevoCliente = new Cliente(input);

            // asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;

            // guardarlo en la base de datos

            try {
                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        nuevoProveedor: async (_, { input }, ctx) => {

            console.log(ctx);

            const { email } = input
            // Verificar si el proveedor ya esta registrado
            // console.log(input);

            const proveedor = await Proveedor.findOne({ email });
            if(proveedor) {
                throw new Error('Este proveedor ya esta registrado');
            }

            const nuevoProveedor = new Proveedor(input);

            
            // guardarlo en la base de datos

            try {
                const resultado = await nuevoProveedor.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        
        actualizarCliente: async (_, {id, input}, ctx) => {
            // Verificar si existe o no
            let cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Ese cliente no existe');
            }

            // Verificar si el vendedor es quien edita
            if(cliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales');
            }

            // guardar el cliente
            cliente = await Cliente.findOneAndUpdate({_id : id}, input, {new: true} );
            return cliente;
        },
        actualizarProveedor: async (_, {id, input}) => {
            // revisar si el producto existe o no
            let proveedor = await Proveedor.findById(id);

            if(!proveedor) {
                throw new Error('proveedor no encontrado');
            }

            // guardarlo en la base de datos
            proveedor = await Proveedor.findOneAndUpdate({ _id : id }, input, { new: true } );

            return proveedor;
        }, 
        eliminarCliente : async (_, {id}, ctx) => {
            // Verificar si existe o no
            let cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Ese cliente no existe');
            }

            // Verificar si el vendedor es quien edita
            if(cliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales');
            }

            // Eliminar Cliente
            await Cliente.findOneAndDelete({_id : id});
            return "Cliente Eliminado"
        },
        eliminarProveedor : async (_, {id}, ctx) => {
            // Verificar si existe o no
            let proveedor = await Proveedor.findById(id);

            if(!proveedor) {
                throw new Error('Ese proveedor no existe');
            }

    

            // Eliminar Cliente
            await Proveedor.findOneAndDelete({_id : id});
            return "Proveedor Eliminado"
        },
        nuevoPedido: async (_, {input}, ctx) => {

            const { cliente } = input
            
            // Verificar si existe o no
            let clienteExiste = await Cliente.findById(cliente);

            if(!clienteExiste) {
                throw new Error('Ese cliente no existe');
            }

            // Verificar si el cliente es del vendedor
            if(clienteExiste.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales');
            }

            // Revisar que el stock este disponible
            for await ( const articulo of input.pedido ) {
                const { id } = articulo;

                const producto = await Producto.findById(id);

                if(articulo.cantidad > producto.existencia) {
                    throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                } else {
                    // Restar la cantidad a lo disponible
                    producto.existencia = producto.existencia - articulo.cantidad;

                    await producto.save();
                }
            }

            // Crear un nuevo pedido
            const nuevoPedido = new Pedido(input);

            // asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

        
            // Guardarlo en la base de datos
            const resultado = await nuevoPedido.save();
            return resultado;

            
        },
        actualizarPedido: async(_, {id, input}, ctx) => {

            const { cliente } = input;

            // Si el pedido existe
            const existePedido = await Pedido.findById(id);
            if(!existePedido) {
                throw new Error('El pedido no existe');
            }

            // Si el cliente existe
            const existeCliente = await Cliente.findById(cliente);
            if(!existeCliente) {
                throw new Error('El Cliente no existe');
            }

            // Si el cliente y pedido pertenece al vendedor
            if(existeCliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales');
            }

            // Revisar el stock
            if( input.pedido ) {
                for await ( const articulo of input.pedido ) {
                    const { id } = articulo;
    
                    const producto = await Producto.findById(id);
    
                    if(articulo.cantidad > producto.existencia) {
                        throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                    } else {
                        // Restar la cantidad a lo disponible
                        producto.existencia = producto.existencia - articulo.cantidad;
    
                        await producto.save();
                    }
                }
            }



            // Guardar el pedido
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, { new: true });
            return resultado;

        },
        eliminarPedido: async (_, {id}, ctx) => {
            // Verificar si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('El pedido no existe')
            }

            // verificar si el vendedor es quien lo borra
            if(pedido.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales')
            }

            // eliminar de la base de datos
            await Pedido.findOneAndDelete({_id: id});
            return "Pedido Eliminado"
        },
//         validarCI: async(_,{id},ctx)=>{
        
//         const {cedula}=Cliente
//   /**
//      * Algoritmo para validar cedulas de Ecuador
//      * @Email  : vicmandlagasca@gmail.com
//      * @Pasos  del algoritmo
//      * 1.- Se debe validar que tenga 10 numeros
//      * 2.- Se extrae los dos primero digitos de la izquierda y compruebo que existan las regiones
//      * 3.- Extraigo el ultimo digito de la cedula
//      * 4.- Extraigo Todos los pares y los sumo
//      * 5.- Extraigo Los impares los multiplico x 2 si el numero resultante es mayor a 9 le restamos 9 al resultante
//      * 6.- Extraigo el primer Digito de la suma (sumaPares + sumaImpares)
//      * 7.- Conseguimos la decena inmediata del digito extraido del paso 6 (digito + 1) * 10
//      * 8.- restamos la decena inmediata - suma / si la suma nos resulta 10, el decimo digito es cero
//      * 9.- Paso 9 Comparamos el digito resultante con el ultimo digito de la cedula si son iguales todo OK sino existe error.     
//      */

//      var cedula =cedula ;

//      //Preguntamos si la cedula consta de 10 digitos
//      if(cedula.length == 10){
        
//         //Obtenemos el digito de la region que sonlos dos primeros digitos
//         var digito_region = cedula.substring(0,2);
        
//         //Pregunto si la region existe ecuador se divide en 24 regiones
//         if( digito_region >= 1 && digito_region <=24 ){
          
//           // Extraigo el ultimo digito
//           var ultimo_digito   = cedula.substring(9,10);

//           //Agrupo todos los pares y los sumo
//           var pares = parseInt(cedula.substring(1,2)) + parseInt(cedula.substring(3,4)) + parseInt(cedula.substring(5,6)) + parseInt(cedula.substring(7,8));

//           //Agrupo los impares, los multiplico por un factor de 2, si la resultante es > que 9 le restamos el 9 a la resultante
//           var numero1 = cedula.substring(0,1);
//           var numero1 = (numero1 * 2);
//           if( numero1 > 9 ){ var numero1 = (numero1 - 9); }

//           var numero3 = cedula.substring(2,3);
//           var numero3 = (numero3 * 2);
//           if( numero3 > 9 ){ var numero3 = (numero3 - 9); }

//           var numero5 = cedula.substring(4,5);
//           var numero5 = (numero5 * 2);
//           if( numero5 > 9 ){ var numero5 = (numero5 - 9); }

//           var numero7 = cedula.substring(6,7);
//           var numero7 = (numero7 * 2);
//           if( numero7 > 9 ){ var numero7 = (numero7 - 9); }

//           var numero9 = cedula.substring(8,9);
//           var numero9 = (numero9 * 2);
//           if( numero9 > 9 ){ var numero9 = (numero9 - 9); }

//           var impares = numero1 + numero3 + numero5 + numero7 + numero9;

//           //Suma total
//           var suma_total = (pares + impares);

//           //extraemos el primero digito
//           var primer_digito_suma = String(suma_total).substring(0,1);

//           //Obtenemos la decena inmediata
//           var decena = (parseInt(primer_digito_suma) + 1)  * 10;

//           //Obtenemos la resta de la decena inmediata - la suma_total esto nos da el digito validador
//           var digito_validador = decena - suma_total;

//           //Si el digito validador es = a 10 toma el valor de 0
//           if(digito_validador == 10)
//             var digito_validador = 0;

//           //Validamos que el digito validador sea igual al de la cedula
//           if(digito_validador == ultimo_digito){
//             console.log('la cedula:' + cedula + ' es correcta');
//           }else{
//             console.log('la cedula:' + cedula + ' es incorrecta');
//           }
          
//         }else{
//           // imprimimos en consola si la region no pertenece
//           console.log('Esta cedula no pertenece a ninguna region');
//         }
//      }else{
//         //imprimimos en consola si la cedula tiene mas o menos de 10 digitos
//         console.log('Esta cedula tiene menos de 10 Digitos');
//      }    

//         }
    }
}

module.exports = resolvers;