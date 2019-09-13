const axios = require('axios')
const fs = require('fs')
const { createObjectCsvWriter } = require('csv-writer')

var csvWriter
const BASE_URL = 'http://localhost:3000'

const getEstimations = async (filenames, label) => {
  const estimations = []
  for (const filename of filenames) {
    const { data: estimation } = await axios.get(
      `${BASE_URL}/estimate?url=${__dirname}\\images\\${label}\\${filename}`
    )
    estimation.push(label)
    estimations.push(estimation)
  }
  return estimations
}

const generateCsv = (rows, header) => {
  const data = rows.map(row => {
    const rowData = {}
    header.forEach((name, headerIndex) => {
      rowData[name] = row[headerIndex]
    })
    return rowData
  })
  csvWriter.writeRecords(data)
}

const emPe = fs.readdirSync('images/em-pe/')
const sentado = fs.readdirSync('images/sentado/')

const init = async () => {
  const { data: header } = await axios.get(BASE_URL + '/header')
  header.push('label')
  csvWriter = createObjectCsvWriter({
    path: 'pose-estimation-dataset.csv',
    header: header.map(h => ({ id: h, title: h })),
  })

  const emPeEstimations = await getEstimations(emPe, 'em-pe')
  const sentadoEstimations = await getEstimations(sentado, 'sentado')
  const estimations = emPeEstimations.concat(sentadoEstimations)
  generateCsv(estimations, header)
}

init()
