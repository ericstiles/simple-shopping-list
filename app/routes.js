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
                MetaList.find(function(err, metalist2) {
                    if (err) {
                        res.send(err);
                    }
                    var obj = metalist2[0].toObject();
                    obj.total = obj.total;
                    obj.cTotal = dollar(obj.total);
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
        var obj = metalist[0].toObject()
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err) {
            res.send(err);
        }
        obj.cTotal = dollar(obj.total);
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
                    console.log(err.message)
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
//Shouldn't use exception for this, but needed a quick solution
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
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
            getTodos(res);
        }).post(function(req, res) {
            var jsonItem;
            if (!isJsonString(req.body)) {
                console.log("req.body is json");
                jsonItem = req.body;
            } else {
                console.log("req.body is not json");
                jsonItem = JSON.parse(req.body);
            }
            console.log("adding new item:" + JSON.stringify(jsonItem));
            var newTodo = new Todo(jsonItem);
            newTodo.save((err, newTodo) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
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
            getMetaList(res);
        });




    //------------------------
    //
    //  No Tests
    //  
    //------------------------
    app.get('/api/todos/:todo_key/:todo_value', function(req, res) {
        console.log("key:" + req.params.todo_key);
        console.log("value:" + req.params.todo_value);
        getTodoByProperty(req.params.todo_key, req.params.todo_value, res);
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

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
