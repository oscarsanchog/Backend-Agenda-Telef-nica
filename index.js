const express = require('express')
const app = express()
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const PORT = process.env.PORT

app
  .use(express.static('dist'))
  .use(express.json())
  .use(cors())
  .use(
    morgan((tokens, req, res) => {
      // Verifica si es una solicitud POST a /api/persons
      if (req.method === 'POST' && req.url === '/api/persons') {
        // Si es así, agrega el cuerpo de la solicitud a la salida
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
          JSON.stringify(req.body), // Agrega el cuerpo de la solicitud como JSON
        ].join(' ')
      } else {
        // De lo contrario, sigue el formato original sin el cuerpo de la solicitud
        return [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
        ].join(' ')
      }
    })
  )

let phonebook = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
]

app.get('/api/persons', (req, res) => {
  Person.find({}).then((result) => res.json(result))
  //res.json(phonebook)
})

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>`
  )
})

app.get('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findById(id)
    .then((note) => {
      note
        ? res.json(note)
        : res.status(404).json({ message: 'Person not found' })
    })
    .catch((error) => {
      next(error)
      /* console.error(error)
      res.status(400).send({ error: 'Malformatted id' }) */
    })
  /* const person = phonebook.find((person) => person.id === Number(id))
  if (!person) return res.status(404).json({ message: 'Not found' })
  res.json(person) */
})

app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findByIdAndDelete(id)
    .then((result) => {
      console.log('result =>', result)
      if (!result)
        res.status(409).json({ result: result, message: 'Person not found' })
      else res.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (req, res) => {
  const personInfo = req.body
  /* const repeatedName = phonebook.find(
    (person) => person.name === personInfo.name
  ) */
  /* const repeatedName = Person.findOne({ name: personInfo.name }, (err, document) => {
    if(err) return err
    else return document
  }) */

  if (!personInfo.name || !personInfo.number)
    return res.status(404).json({ message: 'Data is missing' })
  /* if (repeatedName)
    return res.status(404).json({ message: 'That person already exists' }) */

  const person = new Person({
    name: personInfo.name,
    number: personInfo.number,
  })

  person.save().then((savedNote) => {
    res.json(savedNote)
  })
})

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'Unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error(error.message)
  if (error.name === 'CastError')
    return res.status(400).json({ message: 'Malformatted id' })
  next(error)
}

app.use(unknownEndpoint).use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
