import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { read } from 'utils/files';
import pool from 'database/db';
import { DatabaseError, HttpError } from 'error/error-classes';
import { errorHandler, listenUnhandledRejections } from 'error/error-handler';
import { initRequestLogger, enableLoggedResponses } from 'middleware/logs';
import { loggerLevel, LogLevel } from 'express-logger-functions';

loggerLevel(LogLevel.INFO);

listenUnhandledRejections();

const app = express();

app.use(cors());
app.use(express.json());

app.use(initRequestLogger);
app.use(enableLoggedResponses);

app.use((req, res, next) => {
    if (req.method !== 'POST' && req.method !== 'PUT') return next();
    if (!req.body) throw new HttpError(400, 'Nenhum dado para criação ou alteração foi fornecido!');
    next();
});

app.post('/register', async (req, res, next) => {
    const {nome, email} = req.body;

    if (!nome || !email)
        throw new HttpError(400, 'nome e email são obrigatórios');

    let result;
    try {
        result = await pool.query<any>(`
                INSERT INTO usuario (nome, email) VALUES ($1, $2)
                RETURNING *
            `,
            [nome, email]
        );
    } catch (err: unknown) {
        if (!(err instanceof Error)) throw new HttpError(500, 'Erro ao registrar usuário');

        if ('code' in err && err.code === '23505')
            throw new HttpError(409, 'Email já cadastrado');
        if (DatabaseError.isRawDatabaseError(err))
            throw HttpError.fromDatabaseError(err);
        if (err instanceof Error)
            throw err;
        return;
    }

    const user = result.rows[0];

    res.status(201).json(user);
});

app.get('/user', async (req, res, next) => {
    const result = await pool.query<any>(`SELECT * FROM usuario`);

    res.status(200).json(result.rows);
});


app.get('/task', async (req, res, next) => {
    const result = await pool.query<any>(`SELECT * FROM tarefa`);

    res.status(200).json(result.rows);
});

app.get('/test', async (req, res, next) => {
    try {
        await pool.query<any>(`
            INSERT INTO usuario (nome, email) VALUES ('Joao', 'joao@email.com')
        `);
        await pool.query<any>(`
                INSERT INTO tarefa 
                (id_usuario, descricao, nome_setor, prioridade, cadastro_epoch) VALUES 
                (2, 'Teste', 'TI', 2, 1234567890)
            `);
    } catch (err: unknown) {
        console.log(err);
    }
    res.status(200).json({message: 'Test data works'});
})

app.post('/task', async (req, res, next) => {
    let {usuario_id, descricao, nome_setor, prioridade, status} = req.body;

    if ([usuario_id, descricao, nome_setor, prioridade].reduce((acc, curr) => acc || curr == undefined, false))
        throw new HttpError(400, 'usuario_id, descricao, nome_setor e prioridade são obrigatórios');

    const cadastro_timestamp = Date.now();
    if (status == undefined) status = 0;
    let result;
    try {
        result = await pool.query<any>(`
                INSERT INTO tarefa 
                (usuario_id, descricao, nome_setor, prioridade, cadastro_epoch, status) 
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
            [usuario_id, descricao, nome_setor, prioridade, cadastro_timestamp, status]
        );
    } catch (err: unknown) {
        if (!(err instanceof Error)) throw new HttpError(500, 'Erro ao criar tarefa');

        if ('code' in err && err.code === '23503')
            throw new HttpError(404, `Usuário de id '${usuario_id}' não encontrado`);
        if (DatabaseError.isRawDatabaseError(err))
            throw HttpError.fromDatabaseError(err);
        if (err instanceof Error)
            throw err;
        return;
    }

    const task = result.rows[0];

    res.status(201).json(task);
})

app.put('/task/:id', async (req, res, next) => {
    const id = Number(req.params.id);
    const { prioridade, status } = req.body;

    if (!prioridade && !status)
        throw new HttpError(400, 'pelo menos um dos campos prioridade ou status deve ser fornecido para atualização');

    let result;
    try {
        result = await pool.query<any>(`
                UPDATE tarefa
                SET prioridade = COALESCE($1, prioridade),
                    status = COALESCE($2, status)
                WHERE id = $3
                RETURNING *
            `, [prioridade, status, id]);
    } catch (err: unknown) {
        if (!(err instanceof Error)) 
            throw new HttpError(500, 'Erro ao atualizar tarefa');

        if (DatabaseError.isRawDatabaseError(err))
            throw HttpError.fromDatabaseError(err);
        if (err instanceof Error)
            throw err;
        return;
    }

    const task = result.rows[0];
    res.status(200).json(task);
});


app.all('/{*path}', (req, _res, next) => {
	next(new HttpError(404, `Router with Path '${req.originalUrl}' Not Found`));
});


app.use(errorHandler);

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
	console.log(`Servidor rodando em http://localhost:${PORT}`);
});

(async () => {
	await pool.query(
		await read<string>('src/database/schema.sql', (x) => x)
	);
})();