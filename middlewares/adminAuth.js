const authMiddleware = require("./auth"); // Reutiliza seu auth normal

// Este middleware VAI verificar se o usuário está logado E se é admin
const adminAuthMiddleware = (req, res, next) => {
  
  // 1. Executa o middleware de autenticação normal primeiro
  authMiddleware(req, res, () => {
    
    // 2. Se passou (está logado), verifica se é admin
    if (!req.usuario.isAdmin) {
      return res.status(403).json({ 
        mensagem: "Acesso negado. Requer privilégios de administrador." 
      });
    }

    // 3. Se for admin, continua para a rota
    next();
  });
};

module.exports = adminAuthMiddleware;