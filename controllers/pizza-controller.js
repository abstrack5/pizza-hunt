const { Pizza } = require("../models");

const pizzaController = {
  // get all pizzas
  getAllPizza(req, res) {
    Pizza.find({})
      .then((dbPizzaData) => res.json(dbPizzaData))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  //get pizza by id
  getPizzaById({ params }, res) {
    Pizza.findOne({ _id: params.id })
      .then((dbPizzaData) => {
        // if no pizza is found, send 404
        if (!dbPizzaData) {
          res.status(404).json({ message: "No pizza found by that id!" });
          return;
        } else {
          res.json(dbPizzaData);
        }
      })
      .catch((err) => res.status(400).json(err));
  },

  // create pizza
  createPizza({ body }, res) {
    Pizza.create(body)
      .then(dbPizzaData => res.json(dbPizzaData))
      .catch(err => res.status(400).json(err));
  },

  //update pizza by id
  //With Mongoose, the "where" clause is used first, 
  //then the updated data, then options for how the data should be returned.
  updatePizza({ params, body }, res) {
    Pizza.findOneAndUpdate({ _id: params.id }, body, { new: true })
      //f we don't set that third parameter, { new: true },
      // it will return the original document. By setting the parameter to true,
      // we're instructing Mongoose to return the new version of the document.
      .then((dbPizzaData) => {
        if (!dbPizzaData) {
          res.status(404).json({ message: "No pizza found by that id!" });
          return;
        } else {
          res.json(dbPizzaData);
        }
      })
      .catch((err) => res.status(400).json(err));
  },

  // There are also Mongoose and MongoDB methods called
  // .updateOne() and .updateMany(), which update documents without returning them.

  //delete pizza
  deletePizza({ params }, res) {
    Pizza.findOneAndDelete({ _id: params.id })
      .then((dbPizzaData) => {
        if (!dbPizzaData) {
          res.status(404).json({ message: "No pizza found by that id!" });
          return;
        } else {
          res.json(dbPizzaData);
        }
      })
      .catch((err) => res.status(400).json(err));
  },
};

module.exports = pizzaController;
