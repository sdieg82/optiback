const mongoose=require('mongoose');

const ProductosSchema=mongoose.Schema({
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