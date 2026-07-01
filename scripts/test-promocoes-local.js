const { spawn } = require('child_process');

const HEALTH_URL = 'http://127.0.0.1:3001/health';
const SEARCH_URL = 'http://127.0.0.1:3001/api/buscar-promocoes';
const TIMEOUT_MS = 15000;

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(deadline) {
    while (Date.now() < deadline) {
        try {
            const response = await fetch(HEALTH_URL);
            if (response.ok) {
                return;
            }
        } catch (error) {
            // Backend ainda subindo.
        }

        await sleep(300);
    }

    throw new Error('Timeout aguardando backend local responder em /health');
}

async function run() {
    const backend = spawn(process.execPath, ['backend.js'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe']
    });

    let backendOutput = '';

    const appendOutput = (chunk) => {
        backendOutput += chunk.toString();
    };

    backend.stdout.on('data', appendOutput);
    backend.stderr.on('data', appendOutput);

    try {
        await waitForHealth(Date.now() + TIMEOUT_MS);

        const response = await fetch(SEARCH_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemName: 'Sofa',
                notes: 'cinza 3 lugares'
            })
        });

        const data = await response.json();

        console.log('Health check: OK');
        console.log(`Busca HTTP: ${response.status}`);
        console.log(`Consulta usada: ${data.query || 'n/a'}`);

        if (!response.ok) {
            throw new Error(data.message || data.error || `Busca falhou com status ${response.status}`);
        }

        if (!Array.isArray(data.sources)) {
            throw new Error('Resposta sem sources');
        }

        if (data.sources.length === 0) {
            console.log('Nenhuma fonte retornou resultados nesta execução.');
        } else {
            data.sources.forEach((source) => {
                const total = Array.isArray(source.results) ? source.results.length : 0;
                console.log(`${source.source}: ${total} resultado(s) | status=${source.status || 'n/a'} | busca=${source.searchUsed || 'n/a'}`);

                if (source.error) {
                    console.log(`  erro: ${source.error}`);
                }

                if (Array.isArray(source.attempts) && source.attempts.length > 0) {
                    source.attempts.forEach((attempt) => {
                        console.log(`  tentativa: ${attempt.query} | total=${attempt.total} | erro=${attempt.error || 'nenhum'}`);
                    });
                }
            });
        }
    } finally {
        backend.kill('SIGTERM');
        await sleep(300);

        if (backendOutput.trim()) {
            console.log('--- Backend local ---');
            console.log(backendOutput.trim());
        }
    }
}

run().catch((error) => {
    console.error('Teste local falhou:', error.message);
    process.exitCode = 1;
});