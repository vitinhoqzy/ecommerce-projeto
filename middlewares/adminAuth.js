const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ mensagem: "Token não fornecido." });
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decodedToken.id);

        if (!usuario || !usuario.isAdmin) {
            return res.status(403).json({ mensagem: "Acesso negado. Apenas administradores podem acessar esta rota." });
        }

        req.usuario = usuario;
        next();
    } catch (err) {
        res.status(401).json({ mensagem: "Falha na autenticação: token inválido." });
    }
};

module.exports = adminAuthMiddleware;