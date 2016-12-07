var Todo = require('./models/todo');

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

module.exports = function(app) {

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function(req, res) {
        // use mongoose to get all todos in the database
        getTodos(res);
    });

    app.get('/api/todos/:todo_id', function(req, res) {
        getTodoById(req.params.todo_id, res);
        //res.json(JSON.parse('{ "name" : "eric"}'));
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
            done: false
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
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

    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
};
