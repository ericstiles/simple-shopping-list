var Todo = require('./models/todo');
var MetaList = require('./models/metalist');
var Numba = require('./models/number');
var currencyFormatter = require('currency-formatter');

function addMetaListTotal(res, price) {
    MetaList.find(function(err, metalist) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        metalist[0].update({ total: +price + +metalist[0].total },
            function(err, message) {
                if (err) {
                    res.send("There was a problem updating the information to the database: " + err);
                }
                console.log("metalist update response message:" + message);
                console.log("just updated metalist:" + JSON.stringify(metalist[0]));

                MetaList.find(function(err, metalist2) {

                    // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                    if (err) {
                        res.send(err);
                    }
                    metalist2[0].total = dollar(metalist2[0].total);
                    console.log("2nd pass on getting metalist:" + JSON.stringify(metalist2[0]));
                    res.json(metalist2[0]);
                });

            });
    });

};

function subtractMetaListTotal(res, id) {

    Todo.findById(id, function(err, todo) {
        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }


        MetaList.find(function(err, metalist) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }
            metalist[0].update({ total: +metalist[0].total - +todo.price },
                function(err, message) {
                    if (err) {
                        res.send("There was a problem updating the information to the database: " + err);
                    }
                    console.log("metalist update response message:" + message);
                    console.log("just updated metalist:" + JSON.stringify(metalist[0]));

                    MetaList.find(function(err, metalist2) {
                        var obj = metalist2[0].toObject()
                            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err) {
                            res.send(err);
                        }
                        metalist2[0].total = dollar(metalist2[0].total);
                        console.log("2nd pass on getting metalist:" + JSON.stringify(metalist2[0]));
                        res.json(metalist2[0]);
                    });

                });
        });

    });



};

function getMetaList(res) {
    MetaList.find(function(err, metalist) {
        var obj = metalist[0].toObject()
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        obj.cTotal = dollar(obj.total);
        console.log("getting following metalist object:" + JSON.stringify(obj));

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

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
            }

            console.log("number:" + (number[0].value - 1));
            if (todos.length < number[0].value) {
                res.json(todos[number[0].value - 1]); // return all todos in JSON format
            } else {
                res.send("no item found");
            }
        });
    })
}

module.exports = function(app) {

    // api ---------------------------------------------------------------------
    app.post('/api/metalist/total/add', function(req, res) {
        console.log("add total:" + JSON.stringify(req.body));
        addMetaListTotal(res, req.body.price);
    });
    app.post('/api/metalist/total/subtract', function(req, res) {
        console.log("subtract total from id:" + JSON.stringify(req.body));
        subtractMetaListTotal(res, req.body.id);
    });
    app.get('/api/metalist', function(req, res) {
        getMetaList(res);
    });
    // get all todos
    app.get('/api/todos', function(req, res) {
        // use mongoose to get all todos in the database
        getTodos(res);
    });

    app.get('/api/todos/:todo_id', function(req, res) {
        getTodoById(req.params.todo_id, res);
    });

    app.get('/api/todos/:todo_key/:todo_value', function(req, res) {
        console.log("key:" + req.params.todo_key);
        console.log("value:" + req.params.todo_value);
        getTodoByProperty(req.params.todo_key, req.params.todo_value, res);
    });

    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {
        // create a todo, information comes from AJAX request from Angular
        Todo.create({
            text: req.body.text,
            quantity: req.body.quantity,
            price: req.body.price,
            done: false
        }, function(err, todo) {
            if (err)
                res.send(err);
            //get all todos
            getTodos(res);
        });
    });

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

    app.get('/api/item/:order', function(req, res) {
        console.log("order:" + req.params.order);
        getItemAtOrder(req.params.order, res);
    });

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
