var Todo = require('./models/todo');
var MetaList = require('./models/metalist');
var Numba = require('./models/number');
var currencyFormatter = require('currency-formatter');
var mongoose = require('mongoose');

function addMetaListTotal(res, price) {
    MetaList.find(function(err, metalist) {
        if (err) {
            res.send(err);
        }
        metalist[0].update({ total: +price + +metalist[0].total, number: ++metalist[0].number },
            function(err, message) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                }
                // console.log("metalist update response message:" + message);
                // console.log("just updated metalist:" + JSON.stringify(metalist[0]));

                MetaList.find(function(err, metalist2) {
                    if (err) {
                        res.send(err);
                    }
                    var obj = metalist2[0].toObject();
                    obj.total = obj.total;
                    obj.cTotal = dollar(obj.total);
                    // console.log("2nd pass on getting metalist:" + JSON.stringify(metalist2[0]));
                    res.json(obj);
                });

            });
    });

};

function subtractMetaListTotal(res, id) {
    try {
        console.log("id:" + id);
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            Todo.findById(id, function(err, todo) {
                console.log("?=>" + todo);
                if (err) {
                    console.log("error in subtract");
                    console.log(err.message);
                    res.send(500, err.message);
                }
                MetaList.find(function(err, metalist) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                    }
                    metalist[0].update({ total: +metalist[0].total - +todo.price, number: --metalist[0].number },
                        function(err, message) {
                            if (err) {
                                res.status(500).json({ error: err.message });
                            }
                            console.log("metalist update response message:" + message);
                            console.log("just updated metalist:" + JSON.stringify(metalist[0]));
                            MetaList.find(function(err, metalist2) {
                                var obj = metalist2[0].toObject()
                                    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                                if (err) {
                                    res.send(err);
                                }
                                obj.cTotal = dollar(obj.total);
                                console.log("subtract: 2nd pass on getting metalist:" + JSON.stringify(obj));
                                res.json(obj);
                            });
                        });
                });
            });
        } else {
            throw new Error("Not a valid id:" + id);
        }
    } catch (err) {
        console.log("ERR in subtract:" + err.message);
        res.status(500).json({ error: err.message });
    }
};

function getMetaList(res) {
    MetaList.find(function(err, metalist) {
        //console.log(JSON.stringify(metalist[0]));
        var obj = metalist[0].toObject()
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        obj.cTotal = dollar(obj.total);
        //console.log("getting following metalist object:" + JSON.stringify(obj));

        //var tmp = {"_id":"584864c7291ebb3c247b1024","total":6.1899999999999995, "cTotal": "$11.99", "number":0,"name":"listone"}


        res.json(obj);
    });
};

function getTodos(res) {
    Todo.find(function(err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }

        res.json(todos); // return all todos in JSON format
    });
};

function getTodoById(id, res) {
    // get a user with ID of 1
    Todo.findById(id, function(err, todo) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        res.json(todo);
    });
};

function getTodoByProperty(key, value, res) {
    // get a user with ID of 1
    //Todo.find({ key: value }).exec(function(err, todo) {
    Todo.where(key, value).exec(function(err, todo) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        res.json(todo);
    });
};

function dollar(amount) {
    return currencyFormatter.format(amount, { code: 'USD' });
}

function getItemAtOrder(order, res) {
    console.log("getting ready to look for:" + order);
    Numba.where("order", order).exec(function(err, number) {
        if (err) {
            res.send(err);
        }
        console.log("found order:" + JSON.stringify(number))
        Todo.find(function(err, todos) {
            try {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err) {
                    res.send(err);
                }

                console.log("number:" + (number[0].value - 1));
                console.log("todos.length:" + todos.length);
                if (todos.length >= number[0].value && number[0].value > 0) {
                    res.json(todos[number[0].value - 1]);
                } else {
throw new Error("Order value not valid:" + JSON.stringify(number[0]));
                }
                // if (todos.length > number[0].value) {
                //     res.json(todos[number[0].value - 1]); // return all todos in JSON format
                // } else {
                //     res.send("no item found");
                // }
            } catch (err) {
        console.log("ERR in order request:" + err.message);
        res.status(500).json({ error: err.message });
            }
        });
    })
}

module.exports = function(app) {

    // api ---------------------------------------------------------------------
    app.route('/api/list/:item_id')
        .get(function(req, res) {
            console.log("order value:" + req.params.item_id);
            getItemAtOrder(req.params.item_id, res);
        });
    app.route('/api/list')
        .get(function(req, res) {
            //            console.log("In router.js: api/list GET");
            getTodos(res);
        }).post(function(req, res) {
            //            console.log("In router.js: api/list POST");
            //            console.log(req.body);
            var newTodo = new Todo(req.body);
            newTodo.save((err, newTodo) => {
                if (err) {
                    res.send(err);
                } else { //If no errors, send it back to the client
                    //res.json({ message: "Book successfully added!", book });
                    getTodos(res);
                }
            });
        });

    app.route('/api/metalist/add')
        .post(function(req, res) {
            console.log("add total:" + JSON.stringify(req.body));
            addMetaListTotal(res, req.body.price);
        });


    app.route('/api/metalist/subtract')
        .post(function(req, res) {
            console.log("subtract total from id:" + JSON.stringify(req.body));
            console.log("subtract total from id:" + req.body.id);
            subtractMetaListTotal(res, req.body.id);
        });

    app.route('/api/metalist')
        .get(function(req, res) {
            // console.log("In routes.js /api/metalist GET");
            getMetaList(res);
        });

    app.get('/api/item/:order', function(req, res) {
        console.log("order:" + req.params.order);
        getItemAtOrder(req.params.order, res);
    });




    app.get('/api/todos/:todo_key/:todo_value', function(req, res) {
        console.log("key:" + req.params.todo_key);
        console.log("value:" + req.params.todo_value);
        getTodoByProperty(req.params.todo_key, req.params.todo_value, res);
    });

    // create list item and send back all list items after creation
    // app.post('/api/list', function(req, res) {
    //     console.log("In api/list router.js");
    //     // create a todo, information comes from AJAX request from Angular
    //     Todo.create({
    //         text: req.body.text,
    //         quantity: req.body.quantity,
    //         price: req.body.price,
    //         done: false
    //     }, function(err, todo) {
    //         if (err)
    //             res.send(err);
    //         //get all todos
    //         getTodos(res);
    //     });
    // });

    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {
        Todo.remove({
            _id: req.params.todo_id
        }, function(err, todo) {
            if (err)
                res.send(err);

            getTodos(res);
        });
    });



    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
