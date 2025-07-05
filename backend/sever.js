const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.use(cors({
  origin: 'https://ferias-api-rest-3.onrender.com'
}));

require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/usuariosdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Modelo de Usuário
const UsuarioSchema = new mongoose.Schema({
  nome: String,
  email: String,
  portfolio: [{ url: String }],
});
const Usuario = mongoose.model('Usuario', UsuarioSchema);


app.get('/usuarios/:id/portfolio', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  res.json(usuario.portfolio || []);
});

// algo
app.post('/upload', upload.single('foto'), async (req, res) => {
  if (!req.file) return res.status(400).json({ mensagem: 'Nenhuma foto enviada' });
  const fotoUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fotoUrl });
});

// Listar todos os usuários
app.get('/usuarios', async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
});

// Buscar usuário por ID
app.get('/usuarios/:id', async (req, res) => {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  res.json(usuario);
});

// Criar novo usuário
app.post('/usuarios', async (req, res) => {
  const { nome, email } = req.body;
  const novoUsuario = new Usuario({ nome, email });
  await novoUsuario.save();
  res.status(201).json(novoUsuario);
});

// Atualizar usuário
app.put('/usuarios/:id', async (req, res) => {
  const { nome, email } = req.body;
  const usuario = await Usuario.findByIdAndUpdate(
    req.params.id,
    { nome, email },
    { new: true }
  );
  if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  res.json(usuario);
});

// Deletar usuário
app.delete('/usuarios/:id', async (req, res) => {
  const usuario = await Usuario.findByIdAndDelete(req.params.id);
  if (!usuario) return res.status(404).json({ mensagem: 'Usuário não encontrado' });
  res.status(204).send();
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});