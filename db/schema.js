const {  gql } = require('apollo-server');

// Schema
const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }
    
    type Token {
        token: String
    }

    type Producto {
        id: ID
        proveedor:Proveedor
        codigo:String
        nombre: String
        existencia: Int
        precio: Float
        precioCompra: Float
        ganancia: Float
        creado: String
    }

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
        creado:String
        #cedula:String
    }

    type Proveedor {
        id: ID
        nombre: String
        apellido: String
        direccion: String
        email: String
        telefono: String
    
    }
    
    
    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: Cliente
        vendedor: ID
        estado: EstadoPedido
        creado: String
    }

   

    type PedidoGrupo{
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type productosbajos {
       
        producto: [Producto]
    }

    type TopVendedor {
        total: Float
        vendedor: [Usuario]
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input AutenticarInput{
        email: String!
        password: String!
    }

    


    input ProductoInput {
        proveedor:ID!
        codigo:String!
        nombre: String!
        existencia: Int!
        precio: Float!
        precioCompra:Float!
        ganancia:Float!
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String
        #cedula:String
    }

    input ProveedorInput{
        nombre: String!
        apellido: String!
        direccion: String!
        email: String!
        telefono: String
    }

    input PedidoProductoInput {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
        cliente: ID
        estado: EstadoPedido
    }

    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    input CompraProductoInput{
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input CompraInput{
        compra:[CompraProductoInput]
        total:Float!

    }

    type Query {
        #Usuarios
        obtenerUsuario: Usuario

        # Productos
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!) : Producto

        #Clientes
        obtenerClientes: [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerCliente(id: ID!): Cliente

        # Pedidos
        obtenerPedidos: [Pedido]
        obtenerPedidosVendedor: [Pedido]
        obtenerPedido(id: ID!) : Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]


        # Busquedas Avanzadas
        mejoresClientes: [TopCliente]
        mejoresVendedores: [TopVendedor]
        buscarProducto(texto: String!) : [Producto]

        #BajoStock
        bajoStock:[Producto]

        #Proveedores
        obtenerProveedores:[Proveedor]
        obtenerProveedor(id:ID!):Proveedor


    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioInput) : Usuario
        autenticarUsuario(input: AutenticarInput) : Token

        # Productos
        nuevoProducto(input: ProductoInput) : Producto
        actualizarProducto( id: ID!, input : ProductoInput ) : Producto
        eliminarProducto( id: ID! ) : String

        # Clientes
        nuevoCliente(input: ClienteInput) : Cliente
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id: ID!) : String

        # Pedidos
        nuevoPedido(input: PedidoInput): Pedido
        actualizarPedido(id: ID!, input: PedidoInput ) : Pedido
        eliminarPedido(id: ID!) : String

        #Proveedores
        nuevoProveedor(input: ProveedorInput):Proveedor
        actualizarProveedor(id:ID!,input:ProveedorInput):Proveedor
        eliminarProveedor(id: ID!) : String

        #cedula
        #validarCI(input:ClienteInput):Cliente

      
    }
`;

module.exports = typeDefs;