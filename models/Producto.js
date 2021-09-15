const mongoose=require('mongoose');

const ProductosSchema=mongoose.Schema({
    
    proveedor:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'Proveedor'
    },

    nombre:{
        type:String,
        required:true,
        trim:true
    },

    existencia:{
        type:Number,
        required:true
    },
    precio:{
        type:Number,
        required:true,
        trim:true
    },

    precioCompra:{
        type:Number,
        required:true,
        trim:true
    },
    ganancia:{
        type:Number,
        required:true,
        trim:true
    },

    codigo:{
        type:String,
        required:true,
        trim:true

    },
    creado:{
        type:String
    }

});

ProductosSchema.index({ nombre: 'text' });
module.exports=mongoose.model('Productos',ProductosSchema)