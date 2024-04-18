const express = require('express')
const app = express()
app.use(express.json())

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
  res.json(phonebook)
})

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${phonebook.length} people</p>
    <p>${new Date()}</p>`
  )
})

app.get('/api/persons/:id', (req, res) => {
  const { id } = req.params
  const person = phonebook.find((person) => person.id === Number(id))
  if (!person) return res.status(404).json({ message: 'Not found' })
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  phonebook = phonebook.filter((person) => person.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const personInfo = req.body
  const repeatedName = phonebook.find(
    (person) => person.name === personInfo.name
  )

  if (!personInfo.name || !personInfo.number)
    return res.status(404).json({ message: 'Data is missing' })
  if (repeatedName)
    return res.status(404).json({ message: 'That person already exists' })

  const newPerson = {
    id: crypto.randomUUID(),
    name: personInfo.name,
    number: personInfo.number,
  }

  phonebook.push(newPerson)

  res.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
