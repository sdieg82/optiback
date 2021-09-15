const mongoose=require('mongoose');

const ProveedorSchema=mongoose.Schema({
    nombre:{
        type:String,
        required:true,
        trim:true
    },
    apellido:{
        type:String,
        required:true,
        trim:true
    },
    direccion:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    telefono:{
        type:String,
        trim:true
    },
    creado:{
        type:Date,
        default:Date.now()
    },
   
});
module.exports=mongoose.model('Proveedor',ProveedorSchema)