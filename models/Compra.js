const mongoose=require('mongoose');

const ComprasSchema=mongoose.Schema({
    compra:{
        type:Array,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    proveedor:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Proveedor'
    },
    producto:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Producto'
    },
    estado:{
        type:String,
        default:'COMPLETADO'
    },
    creado:{
        type:Date,
        default:Date.now()
    }
    


});
module.exports=mongoose.model('Compra',ComprasSchema)