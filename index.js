const { Worker } = require('worker_threads');

for (let i = 1; i < 65; i++) {
    const port = new Worker(require.resolve('./worker.js'), {
        workerData: {
            code: i,
        },
    });

    port.on('message', data => console.log(`${data} : ${i}`));
    port.on('error', e => console.log(e));
    port.on('exit', code => console.log(`Exit code: ${code}`));
}
