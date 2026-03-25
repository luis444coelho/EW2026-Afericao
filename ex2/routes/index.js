var express = require('express');
var router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://127.0.0.1:16025';

router.get('/', (req, res) => {
  const d = new Date().toISOString().substring(0, 16);
  axios.get(`${API_URL}/repairs`)
    .then(response => {
      res.render('index', { title: 'AutoRepair', repairs: response.data, date: d, apiUrl: API_URL });
    })
    .catch(err => {
      res.render('error', { error: err, message: 'Erro ao obter reparações da API' });
    });
});

router.get('/:param', (req, res) => {
  const d = new Date().toISOString().substring(0, 16);
  const param = req.params.param;

  if (/^[a-fA-F0-9]{24}$/.test(param)) {
    axios.get(`${API_URL}/repairs/${encodeURIComponent(param)}`)
      .then(response => {
        res.render('repair', { title: 'Reparação', repair: response.data, date: d, apiUrl: API_URL });
      })
      .catch(err => {
        res.render('error', { error: err, message: 'Erro ao obter reparação da API' });
      });
  } else {
    const marca = param;
    axios.get(`${API_URL}/repairs`, { params: { marca } })
      .then(response => {
        const repairs = response.data || [];
        const modelosSet = new Set();
        for (const r of repairs) {
          const m = r.viatura?.modelo;
          if (m) modelosSet.add(m);
        }
        const modelos = Array.from(modelosSet).sort((a, b) => String(a).localeCompare(String(b), 'pt'));
        res.render('brand', { title: 'Marca', marca, modelos, repairs, date: d, apiUrl: API_URL });
      })
      .catch(err => {
        res.render('error', { error: err, message: 'Erro ao obter reparações da marca da API' });
      });
  }
});

module.exports = router;
