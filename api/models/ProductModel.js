var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    name: String,
    code: String,
    price: Number,
    description: String,
    stock: Number,
    url: String,
    images: [String],
    categories: [ { _id: Schema.Types.ObjectId , name: String , sub_cat: [] } ],
    tags: [String],
    available_marketplace: Boolean,
    active: Boolean
});

module.exports = mongoose.model('Product', ProductSchema);