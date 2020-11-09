const { Router, response } = require("express");
const UserItemModel = require('../../models/UserItemModel');

const router = Router();

router.get('/', async (req,res) => {
    try {
        const UserItems = await UserItemModel.find();
        if ( !UserItems) throw new Error("No item");
        const sorted = UserItems.sort((a,b)=>{
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        res.status(200).json(sorted);
    } catch (error){
        res.status(500).json({ message: error.message });
    }

});

router.post('/', async (req,res ) =>{
    const newUserItem = new UserItemModel(req.body);
    try {
        const userItem = await newUserItem.save();
        if(!userItem) throw new Error("Something went wrong saving UserItem");
        res.status(200).json(userItem);
    } catch (error){
        res.status(500).json({ message: error.message });
    }
});


router.put('/:id', async ( req,res ) =>{
    const { id } = req.params;

    try{
        const response = await UserItemModel.findByIdAndUpdate(id, req.body );
        if(!response) throw Error("Something went wrong");
        const updated = { ...response._doc, ...req.body };
        res.status(200).json(updated);

    }catch(error){
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req,res)=>{
    const { id } = req.params
    try {
        const removed = await UserItemModel.findByIdAndDelete(id);
        if(!removed) throw Error('Something went wrong ');
        res.status(200).json(removed);
    } catch (error){
        res.status(500).json({ message: error.message });
    }
});

module.exports = router