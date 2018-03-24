module.exports = function loadData({ pipe, filename }) {
    if (pipe === true) {
        return new Promise((resolve, reject) => {
            let data = "";
            process.stdin.resume();
            process.stdin.setEncoding('utf8');
            process.stdin.on('data', (chunk) => (data += chunk));
            process.stdin.on('end', () => resolve(data));
            process.stdin.on('error', reject);
        });
    }

    return new Promise((resolve, reject) => {
        readFile(filename, 'utf-8', (err, data) => {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        })
    });
}
