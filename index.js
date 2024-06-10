const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const validClientIds = ["123456789"];

const users = {
    "c123456": {
        "password": "password123456",
        "refresh_token": "116d2272-3bcb-4808-a6ca-49fbfa309081"
    }
};

// Função para simular a geração de um token JWT
function generateToken() {
    return uuid.v4();
}

// Função para simular a resposta de autenticação
function generateAuthResponse(refreshToken) {
    return {
        access_token: generateToken(),
        expires_in: 900,
        refresh_expires_in: 7200,
        refresh_token: refreshToken,
        token_type: "bearer",
        "not-before-policy": 1707933401,
        session_state: uuid.v4(),
        scope: ""
    };
}

// Endpoint de autenticação
app.post('/auth/realms/intranet/protocol/openid-connect/token', (req, res) => {
    const { client_id, username, password, grant_type } = req.body;

    if (!validClientIds.includes(client_id)) {
        return res.status(400).json({ error: 'Invalid client_id' });
    }

    if (grant_type === 'password') {
        if (username in users && users[username].password === password) {
            const refreshToken = users[username].refresh_token;
            res.json(generateAuthResponse(refreshToken));
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } else if (grant_type === 'refresh_token') {
        const { refresh_token } = req.body;
      
        const username = Object.keys(users).find(user => users[user].refresh_token === refresh_token);

        if (username) {
            console.log(username);
            res.json(generateAuthResponse(refresh_token));
        } else {
            res.status(401).json({ error: 'Invalid refresh token' });
            console.log(username);
        }
    } else {
        res.status(400).json({ error: 'Invalid grant_type' });
    }
});

// Endpoint de investimentos
app.get('/bank-fixed-incomes/v1/investments', (req, res) => {
    const filePath = path.join(__dirname, 'repository', 'bank-fixed-incomes-investments.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(JSON.parse(data));
    });
});

// Endpoint para detalhes do investimento
app.get('/bank-fixed-incomes/v1/investments/:investmentId', (req, res) => {
    const investmentId = req.params.investmentId;
    const filePath = path.join(__dirname, 'repository', 'bank-fixed-incomes-investments-detail.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const investmentDetails = JSON.parse(data);
        res.json(investmentDetails);
    });
});


// Endpoint para saldos do investimento
app.get('/bank-fixed-incomes/v1/investments/:investmentId/balances', (req, res) => {
    const investmentId = req.params.investmentId;
    const filePath = path.join(__dirname, 'repository', 'bank-fixed-incomes-investments-balance.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const balanceDetails = JSON.parse(data);

        res.json(balanceDetails);
    });
});

// Endpoint para transações do investimento
app.get('/bank-fixed-incomes/v1/investments/:investmentId/transactions', (req, res) => {
    const investmentId = req.params.investmentId;
    const filePath = path.join(__dirname, 'repository', 'bank-fixed-incomes-investments-transaction.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const transactionDetails = JSON.parse(data);

        res.json(transactionDetails);
    });
});

// Endpoint transações atuais do investimento
app.get('/bank-fixed-incomes/v1/investments/:investmentId/transactions-current', (req, res) => {
    const investmentId = req.params.investmentId;
    const filePath = path.join(__dirname, 'repository', 'bank-fixed-incomes-investments-transaction-current.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const transactionDetails = JSON.parse(data);        

        res.json(transactionDetails);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
