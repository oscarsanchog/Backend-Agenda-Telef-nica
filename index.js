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

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then((result) => res.json(result))
    .catch((error) => next(error))
  //res.json(phonebook)
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then((result) => {
      const word = result.length === 1 ? 'person' : 'people'
      res.send(
        `<p>Phonebook has info for ${result.length} ${word}</p>
      <p>${new Date()}</p>`
      )
    })
    .catch((error) => next(error))
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
    })
})

app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Person.findByIdAndDelete(id)
    .then((result) => {
      console.log('result =>', result)
      if (!result)
        res.status(409).json({ message: 'Person not found, please reload.' })
      else res.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const personInfo = req.body

  /* if (!personInfo.name || !personInfo.number)
    return res.status(404).json({ message: 'Data is missing' }) */

  const person = new Person({
    name: personInfo.name,
    number: personInfo.number,
  })

  person
    .save()
    .then((savedNote) => {
      res.json(savedNote)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body
  const { id } = req.params

  const updatingPerson = {
    name: name,
    number: number,
  }

  Person.findByIdAndUpdate(id, updatingPerson, {
    new: true,
    runValidators: true,
    context: 'query',
  }) // Agregamos el parámetro opcional { new: true }, que hará que nuestro controlador de eventos sea llamado con el nuevo documento modificado en lugar del original. run validators es para que corran las validaciones; no es por defecto.
    .then((updatedNote) => res.json(updatedNote))
    .catch((error) => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).json({ error: 'Unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  console.error('Error handler:', error.message)

  if (error.name === 'CastError')
    return res.status(400).json({ message: 'Malformatted id' })
  if (error.name == 'ValidationError')
    return res.status(400).json({ error: error.message })

  next(error)
}

app
  .use(unknownEndpoint)
  .use(errorHandler)
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
