const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Espera o formato "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ mensagem: "Token não fornecido." });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodedToken; // Adiciona a informação do usuário à requisição
    next();
  } catch (err) {
    res.status(401).json({ mensagem: "Falha na autenticação: token inválido." });
  }
};

module.exports = authMiddleware;