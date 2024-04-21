const mongoose = require('mongoose')


const password = process.argv[2] || 'ZYGURbNHltk3AyLg'
const url = `mongodb+srv://oscarsanchogonzalez:${password}@phonebook.qvdpg7u.mongodb.net/phonebook?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

/* if(process.argv[3] && process.argv[4]) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  
  person.save().then(result => {
    console.log('Person saved!', result)
    mongoose.connection.close()
  })

} else {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
} */

module.exports = Person
