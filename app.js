const express = require('express')
var cors = require('cors')
const app = express()
const port = 5000

app.use(cors()) 

const w = require('./ages.json')

app.get('/age/:age', (req, res)=>{
  const{age} = req.params
  const word = w.words[`${age}대`]

  if(word){
    console.log(`나이대: ${age}대, 단어: ${word}`)
    res.json({'age':`${age}대`, 'word':word})
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
