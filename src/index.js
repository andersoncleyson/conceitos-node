const express = require('express');
const cors = require('cors');

const {v4: uuidv4} = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found"})
  }

  request.user = user;

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const user = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }

  const checksExistsUserAccount = users.some(
    (user) => user.username === username
  );

  if(checksExistsUserAccount) {
    return response.status(400).json({error: "Usuer already exists!"})
  }

  users.push(user);

  return response.status(201).json(user)
});


app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {title, deadline} = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find(todos => todos.id === id);

  if(!todo){

    return response.status(404).json({error: "Todo not found"});

  } else {
    todo.title = title
    todo.deadline = new Date(deadline);

    console.log(todo)

    return response.status(201).json(todo)
  };
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request

  const {id} = request.params

  const todo = user.todos.find(todo => todo.id = id);

  if(!todo){
    return response.status(404).json({error: "Todo not found"})
  } else {
    
    todo.done = true

    return response.json(todo)
  }

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request;
    const { id } = request.params

    const todo = user.todos.find(todos => todos.id === id);

    if(!todo){

      return response.status(404).json({error: "Todo not found"});

    } else {

      user.todos.splice(todo, 1)

      return response.status(204).send()
    }

    

});

module.exports = app;