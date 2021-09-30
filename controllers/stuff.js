const Sauce = require('../models/sauce');
const User = require('../models/user');
const ObjectId = require('mongoose').Types.ObjectId;
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
    };

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
      .catch(error => res.status(400).json({ error }));
  };

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
  };

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};


exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    const filename = sauce.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
        .catch(error => res.status(400).json({ error }));
    });
  })
  .catch(error => res.status(500).json({ error }));
};



exports.likeSauce = async (req, res, next) => {

  // verify if sauce exists // 
  const sauceFound = await Sauce.findOne({ _id: req.params.id }) 
  console.log(sauceFound)
  if (!sauceFound){
    console.log("Sauce not found")
    res.status(400).json({ error: "Sauce does not exist"})
  }

  // verify if user exists // 
  const userId = req.body.userId; 
  if (!userId){
    res.status(400).json({ error: "A user id must be provided"})
  }
  if (!ObjectId.isValid(userId)){
    res.status(403).json({ error: "Unauthorized request"})
  }
  const userFound = await User.findOne({_id: userId})
  console.log(userFound)
  if (!userFound){
    res.status(404).json({ error: "User not found"})
  }

  // verify if like value is correct // 
  const like = req.body.like; 
    if (like !== -1 && like !== 0 && like !== 1){
      return res.status(400).json({error: "Like value must equal to 1, 0 or -1"});
    }
  
  // when sauce is liked //
  if(like == 1){
    Sauce.findOne({ _id: req.params.id })
    .then(sauce =>{
      if (sauce.usersLiked.includes(userFound._id)){
        return res.status(403).json({error: "You already liked this sauce"})
      }
      sauce.likes++;
      sauce.usersLiked.push(userFound._id);
      console.log('User is trying to like the sauce')

      Sauce.updateOne({ _id: req.params.id },sauce )
      .then(() => res.status(200).json({ message: "Like updated" })) 
      .catch((error) => res.status(500).json({ error }));
    })
    .catch(error => res.status(404).json({error}));

  }else 

    // when sauce is unliked // 
    if (like == 0){ 
      Sauce.findOne({ _id: req.params.id })
      .then(sauce => {

        if (sauce.usersLiked.indexOf(userFound._id) == -1){
          res.status(403).json({error: "Like this sauce first"})
        } 

        else{
        sauce.likes--;
        const index = sauce.usersLiked.indexOf(userFound._id); //splice method to remove like from array//
          if (index > -1) {
          sauce.usersLiked.splice(index, 1);
          }
        console.log('User is trying to unlike the sauce')
        }


        //if (sauce.usersDisliked.indexOf(userFound._id) == -1){
        //  res.status(403).json({error: "Dislike this sauce first"})
        //} 

        //else{
        //sauce.dislikes--;
        //const index = sauce.usersDisliked.indexOf(userFound._id); //splice method to remove like from array//
         // if (index > -1) {
         // sauce.usersDisliked.splice(index, 1);
         // }
        //console.log('User is trying to unlike the sauce')
        //}


        Sauce.updateOne({ _id: req.params.id },sauce )
        .then(() => res.status(200).json({ message: "Unlike updated" })) 
        .catch((error) => res.status(400).json({ error }));
      })
      .catch(error => res.status(404).json({error}));
    
    }else

      // when sauce is disliked //
      if (like == -1){
        Sauce.findOne({ _id: req.params.id })
        .then(sauce =>{
          if (sauce.usersDisliked.includes(userFound._id)){
            return res.status(403).json({error: "You already disliked this sauce"})
          }
          sauce.dislikes++;
          sauce.usersDisliked.push(userFound._id);
          console.log('User is trying to dislike the sauce')
    
          Sauce.updateOne({ _id: req.params.id },sauce )
          .then(() => res.status(200).json({ message: "Dislike updated" })) 
          .catch((error) => res.status(500).json({ error }));
        })
        .catch(error => res.status(404).json({error}));
      }

};