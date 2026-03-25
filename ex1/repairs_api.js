const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

app.use(function(req, res, next){
    var d = new Date().toISOString().substring(0, 16);
    console.log(req.method + " " + req.url + " " + d);
    next();
});

const nomeBD = "autoRepair";
const mongoHost = process.env.MONGO_URL || `mongodb://127.0.0.1:27017/${nomeBD}`;
mongoose.connect(mongoHost)
    .then(() => console.log(`MongoDB: liguei-me à base de dados ${nomeBD}.`))
    .catch(err => console.error('Erro:', err));

const repairSchema = new mongoose.Schema({}, { strict: false, collection: 'repairs', versionKey: false });
const Repair = mongoose.model('Repair', repairSchema);

app.get('/repairs', async (req, res) => {
    try {
        let queryObj = { ...req.query };
        let mongoQuery = {};

        if (queryObj.ano) {
            if (!/^\d{4}$/.test(queryObj.ano)) return res.status(400).json({ error: "Ano inválido" });
            mongoQuery.data = new RegExp(`^${queryObj.ano}-`);
        }

        if (queryObj.marca) {
            mongoQuery["viatura.marca"] = queryObj.marca;
        }

        const docs = await Repair.find(mongoQuery).exec();
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/repairs/matr%C3%ADculas', async (req, res) => {
    try {
        const mats = await Repair.distinct('viatura.matricula');
        mats.sort((a, b) => String(a).localeCompare(String(b), 'pt'));
        res.json(mats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/repairs/interv', async (req, res) => {
    try {
        const docs = await Repair.aggregate([
            { $unwind: "$intervencoes" },
            {
                $group: {
                    _id: {
                        codigo: "$intervencoes.codigo",
                        nome: "$intervencoes.nome",
                        descricao: "$intervencoes.descricao"
                    }
                }
            },
            { $sort: { "_id.codigo": 1 } },
            { $project: { _id: 0, codigo: "$_id.codigo", nome: "$_id.nome", descricao: "$_id.descricao" } }
        ]).exec();
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/repairs/:id', async (req, res) => {
    try {
        const doc = await Repair.findById(req.params.id);
        if (!doc) return res.status(404).json({ error: "Não encontrado" });
        res.json(doc);
    } catch (err) {
        res.status(400).json({ error: "ID inválido ou erro de sistema" });
    }
});

app.post('/repairs', async (req, res) => {
    try {
        const doc = { ...req.body };
        if (!Array.isArray(doc.intervencoes)) doc.intervencoes = [];
        doc.nr_intervencoes = doc.intervencoes.length;

        const saved = await new Repair(doc).save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/repairs/:id', async (req, res) => {
    try {
        const deleted = await Repair.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Não encontrado" });
        res.json({ message: "Eliminado com sucesso", id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(16025, () => console.log('API minimalista em http://localhost:16025/repairs'));
